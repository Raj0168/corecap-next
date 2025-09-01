const rateMap = new Map<string, { count: number; last: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  const entry = rateMap.get(key) || { count: 0, last: now };

  if (now - entry.last > windowMs) {
    entry.count = 0;
    entry.last = now;

    for (const [k, v] of rateMap.entries()) {
      if (now - v.last > windowMs * 2) {
        rateMap.delete(k);
      }
    }
  }

  entry.count += 1;
  rateMap.set(key, entry);

  if (entry.count > limit) throw new Error("Rate limit exceeded");
}
