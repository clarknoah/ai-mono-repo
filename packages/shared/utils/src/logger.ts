/**
 * Structured logging utilities using Pino.
 *
 * Provides consistent logging across the application with
 * structured output suitable for log aggregation services.
 */
import pino from 'pino';
import type { LogLevel } from '@iam/shared-types';

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  level?: LogLevel;
  name?: string;
  pretty?: boolean;
}

/**
 * Creates a logger instance with the specified options.
 *
 * @param options - Logger configuration
 * @returns Configured Pino logger
 */
export function createLogger(options: LoggerOptions = {}): pino.Logger {
  const { level = 'info', name = 'iam', pretty = process.env.NODE_ENV !== 'production' } = options;

  return pino({
    name,
    level,
    ...(pretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
  });
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Logger interface for dependency injection
 */
export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}
