const CACHE_KEY = 'mkd_events_cache';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * @returns {{ events: Array, isStale: boolean, timestamp: number|null }}
 */
export function getCachedEvents() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { events: null, isStale: false, timestamp: null };

    const { events, timestamp } = JSON.parse(raw);
    const isStale = Date.now() - timestamp > CACHE_TTL_MS;
    return { events, isStale, timestamp };
  } catch {
    return { events: null, isStale: false, timestamp: null };
  }
}

export function setCachedEvents(events) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ events, timestamp: Date.now() }));
  } catch {
    // Silently fail if storage is full
  }
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
}
