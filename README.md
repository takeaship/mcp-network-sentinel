# MCP Network Sentinel

A network monitoring tool for MCP servers that logs all network activities to help identify potential security issues.

## Background

When using third-party MCP servers to access confidential data, there's a risk that the MCP server might transmit your data or access keys to external sources. This tool monitors all network communications from the MCP server to help identify any suspicious activities.

## Installation

```bash
npm install -g @takeaship/mcp-network-sentinel
```

## Usage

```bash
npx @takeaship/mcp-network-sentinel "your-mcp-server-package arg1 arg2" --output=network-logs.json
```

## Features

- Monitors all network activity from MCP servers
- Logs connection attempts, HTTP/HTTPS requests, and DNS lookups
- Writes logs to console and optionally to a JSON file
- Runs your MCP server within a monitored environment

## How It Works

MCP Network Sentinel uses Node.js module interception to hook into the network-related modules and log all outgoing connections. It works by:

1. Intercepting calls to network modules (net, tls, http, https, dns)
2. Logging connection details including destination, port, and protocol
3. Running your MCP server command in a monitored environment
4. Saving logs to a JSON file if specified

## Options

- `-o, --output <file>` - Save network logs to a specified JSON file

## License

MIT 