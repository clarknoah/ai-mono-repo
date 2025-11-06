/**
 * Application-wide constants.
 */

/**
 * Cache TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  API: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  REGISTRATION: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Token expiry times
 */
export const TOKEN_EXPIRY = {
  ACCESS: '15m',
  REFRESH: '7d',
  EMAIL_VERIFICATION: '24h',
  PASSWORD_RESET: '1h',
} as const;

/**
 * Password constraints
 */
export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 100,
  BCRYPT_ROUNDS: 10,
} as const;

/**
 * File upload constraints
 */
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

/**
 * HTTP status codes (for reference)
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
