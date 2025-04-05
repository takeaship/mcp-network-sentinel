declare module 'node-hook' {
  export function hook(extension: string, callback: (content: string, filename: string) => string): void;
  export function unhook(extension: string): void;
} 