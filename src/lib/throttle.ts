// Best-effort per-IP throttle (in-memory, per warm instance) so the public
// demo can't be spammed into burning API tokens. Shared across this app's routes.
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
}

export function throttled(ip: string, max = 10): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) return true;
  recent.push(now);
  HITS.set(ip, recent);
  return false;
}
