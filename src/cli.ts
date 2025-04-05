#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { NetworkInterceptor } from './interceptor';
import { LogWriter } from './logWriter';

interface CommandOptions {
  output?: string;
}

// Create the program
const program = new Command();

program
  .name('mcp-network-sentinel')
  .description('Monitor network activity of MCP servers')
  .version('1.0.0')
  .argument('<mcp-server-command>', 'MCP server command to run and monitor')
  .option('-o, --output <file>', 'Save network logs to a file')
  .action((mcpCommand: string, options: CommandOptions) => {
    console.log(chalk.blue('🔍 MCP Network Sentinel'));
    console.log(chalk.yellow(`Starting monitoring for command: ${mcpCommand}`));
    
    // Parse the MCP command into command and arguments
    const cmdParts = mcpCommand.trim().split(/\s+/);
    const cmd = cmdParts[0];
    const args = cmdParts.slice(1);
    
    // Initialize the log writer
    const logWriter = new LogWriter(options.output || null);
    
    // Install the network interceptors
    const interceptor = new NetworkInterceptor(logWriter);
    interceptor.install();
    
    console.log(chalk.green('Network monitoring active...'));
    
    // Launch the MCP server
    const mcpProcess = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
    
    // Handle process exit
    mcpProcess.on('exit', (code: number | null) => {
      logWriter.close();
      console.log(chalk.yellow(`MCP server process exited with code ${code}`));
      
      if (options.output) {
        console.log(chalk.green(`Network logs saved to ${options.output}`));
      }
      
      process.exit(code || 0);
    });
    
    // Handle signals
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nInterrupted by user, shutting down...'));
      logWriter.close();
      mcpProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log(chalk.yellow('Termination signal received, shutting down...'));
      logWriter.close();
      mcpProcess.kill('SIGTERM');
    });
  });

// Parse arguments
program.parse(process.argv); 