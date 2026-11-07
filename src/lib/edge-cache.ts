/**
 * A short-lived copy of public data, so a page does not wait for the database abroad on every visit (that round
 * trip is ~0.3s of the server's response time). Kept in Cloudflare's cache in the visitor's city and in memory.
 *
 * Used only while a page is rendered on the server, and only for data every visitor sees the same way: published
 * site content, published articles, products, FAQ. In the browser (admin included) it simply loads, so the admin
 * always works on live data. A failed load is never kept. Where no edge cache exists, only the memory copy is used.
 */
type EdgeCache = { match(url: string): Promise<Response | undefined>; put(url: string, res: Response): Promise<void> };

const memory = new Map<string, { until: number; value: unknown }>();

export async function edgeCached<T>(key: string, seconds: number, load: () => Promise<T>): Promise<T> {
  if (typeof window !== "undefined") return load();
  const now = Date.now();
  const hit = memory.get(key);
  if (hit && hit.until > now) return hit.value as T;

  const cache = (globalThis as { caches?: { default?: EdgeCache } }).caches?.default;
  const url = `https://edge-cache.internal/${encodeURIComponent(key)}`;
  if (cache) {
    try {
      const res = await cache.match(url);
      if (res) {
        const value = (await res.json()) as T;
        memory.set(key, { until: now + seconds * 1000, value });
        return value;
      }
    } catch {
      // No usable copy: load below.
    }
  }

  const value = await load();
  memory.set(key, { until: now + seconds * 1000, value });
  if (cache) {
    try {
      await cache.put(url, new Response(JSON.stringify(value), { headers: { "content-type": "application/json", "cache-control": `public, max-age=${seconds}` } }));
    } catch {
      // Keeping a copy is only an optimisation.
    }
  }
  return value;
}
