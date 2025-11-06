/**
 * ID generation utilities.
 */
import { randomBytes } from 'crypto';

/**
 * Generates a random ID string.
 *
 * @param length - Length of the ID (default: 16)
 * @returns Random alphanumeric ID
 */
export function randomId(length: number = 16): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Generates a UUID v4.
 *
 * @returns UUID v4 string
 */
export function uuid(): string {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}
