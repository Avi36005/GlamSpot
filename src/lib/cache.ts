// Lightweight in-memory TTL cache. Stands in for Redis until REDIS_URL is wired.
const store = new Map<string, { value: unknown; expires: number }>();

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}
