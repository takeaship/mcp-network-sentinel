import * as moduleHook from 'node-hook';
import * as path from 'path';
import * as fs from 'fs';
import { LogWriter } from './logWriter';

export class NetworkInterceptor {
  private logWriter: LogWriter;

  constructor(logWriter: LogWriter) {
    this.logWriter = logWriter;
  }

  public install(): void {
    // Store original requires to restore later if needed
    const originalRequire = module.require;
    const self = this;
    
    // Create our own require function that intercepts network modules
    (module as any).require = function(modulePath: string) {
      const result = originalRequire.apply(this, [modulePath]);
      
      // Only intercept core network modules
      if (modulePath === 'net') {
        self.interceptNetModule(result);
      } else if (modulePath === 'http') {
        self.interceptHttpModule(result);
      } else if (modulePath === 'https') {
        self.interceptHttpsModule(result);
      } else if (modulePath === 'dns') {
        self.interceptDnsModule(result);
      } else if (modulePath === 'tls') {
        self.interceptTlsModule(result);
      }
      
      return result;
    };
  }

  private interceptNetModule(netModule: any): void {
    const originalCreateConnection = netModule.Socket.prototype.connect;
    const self = this;

    // Monkey patch the Socket's connect method
    netModule.Socket.prototype.connect = function(...args: any[]): any {
      const options = typeof args[0] === 'object' ? args[0] : { port: args[0], host: args[1] };
      
      self.logWriter.writeLog({
        type: 'connect',
        timestamp: Date.now(),
        target: options.host || 'localhost',
        port: options.port,
        protocol: 'tcp'
      });
      
      return originalCreateConnection.apply(this, args);
    };
  }

  private interceptTlsModule(tlsModule: any): void {
    const originalConnect = tlsModule.connect;
    const self = this;

    // Monkey patch the connect method
    tlsModule.connect = function(...args: any[]): any {
      const options = typeof args[0] === 'object' ? args[0] : { port: args[0], host: args[1] };
      
      self.logWriter.writeLog({
        type: 'connect',
        timestamp: Date.now(),
        target: options.host || 'localhost',
        port: options.port,
        protocol: 'tls'
      });
      
      return originalConnect.apply(this, args);
    };
  }

  private interceptHttpModule(httpModule: any): void {
    const originalRequest = httpModule.request;
    const self = this;

    // Monkey patch the request method
    httpModule.request = function(...args: any[]): any {
      const options = typeof args[0] === 'object' ? args[0] : args[1] || {};
      const url = typeof args[0] === 'string' ? args[0] : null;
      
      const host = options.host || options.hostname || (url ? new URL(url).hostname : 'localhost');
      const port = options.port || (url ? new URL(url).port : '80');
      
      self.logWriter.writeLog({
        type: 'request',
        timestamp: Date.now(),
        target: host,
        port: parseInt(port, 10) || 80,
        protocol: 'http',
        method: options.method || 'GET',
        headers: options.headers
      });
      
      return originalRequest.apply(this, args);
    };
  }

  private interceptHttpsModule(httpsModule: any): void {
    const originalRequest = httpsModule.request;
    const self = this;

    // Monkey patch the request method
    httpsModule.request = function(...args: any[]): any {
      const options = typeof args[0] === 'object' ? args[0] : args[1] || {};
      const url = typeof args[0] === 'string' ? args[0] : null;
      
      const host = options.host || options.hostname || (url ? new URL(url).hostname : 'localhost');
      const port = options.port || (url ? new URL(url).port : '443');
      
      self.logWriter.writeLog({
        type: 'request',
        timestamp: Date.now(),
        target: host,
        port: parseInt(port, 10) || 443,
        protocol: 'https',
        method: options.method || 'GET',
        headers: options.headers
      });
      
      return originalRequest.apply(this, args);
    };
  }

  private interceptDnsModule(dnsModule: any): void {
    const originalLookup = dnsModule.lookup;
    const self = this;

    // Monkey patch the lookup method
    dnsModule.lookup = function(hostname: string, options: any, callback: any): any {
      self.logWriter.writeLog({
        type: 'dns',
        timestamp: Date.now(),
        target: hostname
      });
      
      // Handle different parameter patterns
      if (typeof options === 'function') {
        return originalLookup.call(this, hostname, options);
      } else {
        return originalLookup.call(this, hostname, options, callback);
      }
    };
  }
} 