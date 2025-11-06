/**
 * Async utility functions.
 */

/**
 * Sleeps for the specified number of milliseconds.
 *
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async operation with exponential backoff.
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Initial delay in milliseconds
 * @returns Result of the operation
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const backoffDelay = delayMs * Math.pow(2, attempt);
        await sleep(backoffDelay);
      }
    }
  }

  throw lastError!;
}

/**
 * Wraps an async operation with a timeout.
 *
 * @param fn - Async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @returns Result of the operation
 * @throws Error if operation times out
 */
export async function timeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}
