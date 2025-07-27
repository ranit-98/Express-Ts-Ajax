/**
 * Application logging utility
 */
import fs from 'fs';
import path from 'path';

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private logLevel: LogLevel;
  private logDir: string;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
  }

  private writeToFile(filename: string, message: string): void {
    const filepath = path.join(this.logDir, filename);
    fs.appendFileSync(filepath, message + '\n');
  }

  error(message: string, meta?: any): void {
    if (this.logLevel >= LogLevel.ERROR) {
      const formatted = this.formatMessage('error', message, meta);
      console.error(formatted);
      this.writeToFile('error.log', formatted);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.logLevel >= LogLevel.WARN) {
      const formatted = this.formatMessage('warn', message, meta);
      console.warn(formatted);
      this.writeToFile('app.log', formatted);
    }
  }

  info(message: string, meta?: any): void {
    if (this.logLevel >= LogLevel.INFO) {
      const formatted = this.formatMessage('info', message, meta);
      console.log(formatted);
      this.writeToFile('app.log', formatted);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      const formatted = this.formatMessage('debug', message, meta);
      console.log(formatted);
    }
  }
}

export const logger = new Logger();