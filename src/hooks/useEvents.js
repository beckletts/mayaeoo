import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEvents } from '../lib/api';
import { getCachedEvents, setCachedEvents, clearCache } from '../lib/cache';

/**
 * Cache-first data fetching hook.
 * 1. Reads cache immediately → fast initial render
 * 2. Fetches from GAS in background if cache is stale/missing
 * 3. On failure + stale cache → isStale = true (show warning banner)
 * 4. On failure + no cache → error state
 */
export function useEvents() {
  const [events, setEvents] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [staleTimestamp, setStaleTimestamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshCountRef = useRef(0);

  const load = useCallback(async (forceRefetch = false) => {
    setLoading(true);
    setError(null);

    // 1. Read cache
    const { events: cached, isStale: cacheStale, timestamp } = getCachedEvents();

    if (cached && !forceRefetch) {
      setEvents(cached);
      setLoading(false);

      if (!cacheStale) {
        // Cache is fresh — no network request needed
        return;
      }
      // Cache is stale — fall through to background refresh
    }

    // 2. Fetch from GAS
    try {
      const fresh = await fetchEvents();
      const eventsArray = Array.isArray(fresh) ? fresh : (fresh.events || fresh.data || []);
      setEvents(eventsArray);
      setIsStale(false);
      setStaleTimestamp(null);
      setCachedEvents(eventsArray);
    } catch (err) {
      if (cached) {
        // Show stale data with warning banner
        setIsStale(true);
        setStaleTimestamp(timestamp);
      } else {
        setError(err.message || 'Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const forceRefresh = useCallback(() => {
    clearCache();
    load(true);
  }, [load]);

  return { events, loading, error, isStale, staleTimestamp, forceRefresh };
}
