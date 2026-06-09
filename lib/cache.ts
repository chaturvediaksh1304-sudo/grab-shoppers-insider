// Tiny in-memory TTL cache — satisfies the spec's 5-minute response-cache
// requirement (§9) without depending on Next's request-scoped cache, so it
// also works cleanly in unit tests. Single-process only (fine for local dev).

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();

export const FIVE_MIN = 5 * 60 * 1000;

/**
 * Returns the cached value for `key` if still fresh, otherwise runs `fn`,
 * caches its result for `ttl` ms, and returns it. Concurrent callers for the
 * same key share the in-flight promise to avoid duplicate upstream calls.
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = FIVE_MIN,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<Promise<T> | T> | undefined;
  if (hit && hit.expires > now) {
    return hit.value as T;
  }

  const promise = fn();
  store.set(key, { value: promise, expires: now + ttl });
  try {
    const value = await promise;
    store.set(key, { value, expires: Date.now() + ttl });
    return value;
  } catch (err) {
    // Don't cache failures.
    store.delete(key);
    throw err;
  }
}

/** Clears the cache — used in tests. */
export function clearCache(): void {
  store.clear();
}
