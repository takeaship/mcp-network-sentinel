import * as fs from 'fs';
import * as path from 'path';

export class LogWriter {
  private outputFile: string | null;
  private logs: any[] = [];
  private writeStream: fs.WriteStream | null = null;

  constructor(outputFile: string | null = null) {
    this.outputFile = outputFile;
    
    if (this.outputFile) {
      // Create directory if it doesn't exist
      const dir = path.dirname(this.outputFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create or open the output file
      this.writeStream = fs.createWriteStream(this.outputFile, { flags: 'a' });
      
      // Write the opening bracket for JSON array
      this.writeStream.write('[\n');
    }
  }

  public writeLog(logEntry: any): void {
    this.logs.push(logEntry);
    
    // Print to console
    console.log(JSON.stringify(logEntry, null, 2));
    
    // Write to file if output file is specified
    if (this.writeStream) {
      const logString = JSON.stringify(logEntry);
      this.writeStream.write(
        (this.logs.length > 1 ? ',' : '') + logString + '\n'
      );
    }
  }

  public close(): void {
    if (this.writeStream) {
      // Write the closing bracket for JSON array
      this.writeStream.write(']\n');
      this.writeStream.end();
    }
  }
} 