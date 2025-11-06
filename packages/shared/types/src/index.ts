/**
 * Shared types used across the iAm monorepo.
 *
 * This package contains common TypeScript types, interfaces,
 * and type utilities that are used by multiple packages.
 */

/**
 * Generic result type for operations that can succeed or fail.
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Generic paginated response type.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Pagination input parameters.
 */
export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

/**
 * Generic ID types (branded for type safety)
 */
export type UserId = string & { readonly __brand: 'UserId' };
export type ProjectId = string & { readonly __brand: 'ProjectId' };
export type SurveyId = string & { readonly __brand: 'SurveyId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type SequenceId = string & { readonly __brand: 'SequenceId' };

/**
 * Helper to create branded IDs
 */
export function brandId<T extends string>(id: string): T {
  return id as T;
}

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Removes specified keys from a type
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Makes specified keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specified keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract async function return type
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : never;

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Common error codes
 */
export enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Structured error interface
 */
export interface AppError {
  code: ErrorCode | string;
  message: string;
  statusCode?: number;
  details?: Record<string, any>;
  stack?: string;
}
