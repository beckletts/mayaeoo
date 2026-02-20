import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Qualification type groupings matching the legacy script.js
 */
const TYPE_GROUPS = {
  general: [
    'A-Level', 'AS-Level', 'GCSE', 'Advanced Extension Award',
    'UK General Qualifications',
  ],
  vocational: [
    'BTEC', 'BTEC Tech Award', 'BTEC National', 'BTEC Higher National',
    'T-Level', 'NVQ', 'Higher National Certificate', 'Vocational Qualifications',
  ],
  international: [
    'International Qualifications', 'International A-Level', 'International AS-Level',
    'International GCSE', 'iPrimary', 'iLowerSecondary', 'PTE Academic',
    'BTEC International', 'International BTEC Level 2',
  ],
};

export function getQualGroup(type) {
  if (!type) return 'other';
  if (TYPE_GROUPS.general.includes(type)) return 'general';
  if (TYPE_GROUPS.vocational.includes(type)) return 'vocational';
  if (TYPE_GROUPS.international.includes(type)) return 'international';
  return 'other';
}

export function useFilters(events) {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTypes = useMemo(() => {
    const raw = searchParams.get('type');
    if (!raw) return [];
    return raw.split(',').filter(Boolean);
  }, [searchParams]);

  const activeSeries = searchParams.get('series') || '';
  const searchQuery = searchParams.get('q') || '';
  const hideWeekends = searchParams.get('hideWeekends') === '1';

  function setType(types) {
    const next = new URLSearchParams(searchParams);
    if (types.length === 0) next.delete('type');
    else next.set('type', types.join(','));
    setSearchParams(next, { replace: true });
  }

  function toggleType(type) {
    const next = activeTypes.includes(type)
      ? activeTypes.filter(t => t !== type)
      : [...activeTypes, type];
    setType(next);
  }

  function setSeries(series) {
    const next = new URLSearchParams(searchParams);
    if (!series) next.delete('series');
    else next.set('series', series);
    setSearchParams(next, { replace: true });
  }

  function setSearch(q) {
    const next = new URLSearchParams(searchParams);
    if (!q) next.delete('q');
    else next.set('q', q);
    setSearchParams(next, { replace: true });
  }

  function setHideWeekends(val) {
    const next = new URLSearchParams(searchParams);
    if (!val) next.delete('hideWeekends');
    else next.set('hideWeekends', '1');
    setSearchParams(next, { replace: true });
  }

  // All available series values (from unfiltered dataset)
  const availableSeries = useMemo(() => {
    if (!events) return [];
    const series = new Set();
    events.forEach(e => { if (e.series) series.add(e.series); });
    return Array.from(series).sort();
  }, [events]);

  // Filtered event list
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      const group = getQualGroup(event.type);
      if (activeTypes.length > 0 && !activeTypes.includes(group)) return false;
      if (activeSeries && event.series !== activeSeries) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(q);
        const descMatch = event.description?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });
  }, [events, activeTypes, activeSeries, searchQuery]);

  return {
    activeTypes, activeSeries, searchQuery, hideWeekends,
    toggleType, setSeries, setSearch, setHideWeekends,
    filteredEvents, availableSeries,
  };
}
