import { useState } from 'react';
import { useFilters } from '../hooks/useFilters';
import FilterBar from '../components/filters/FilterBar';
import CalendarGrid from '../components/calendar/CalendarGrid';
import MonthNav from '../components/calendar/MonthNav';
import CalendarSubscribe from '../components/subscriptions/CalendarSubscribe';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import './CalendarPage.css';

export default function CalendarPage({ events, loading, error, isStale, staleTimestamp }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [staleDismissed, setStaleDismissed] = useState(false);

  const {
    activeTypes, activeSeries, searchQuery, hideWeekends,
    availableSeries, filteredEvents,
    toggleType, setSeries, setSearch, setHideWeekends,
  } = useFilters(events);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const staleLabel = staleTimestamp
    ? new Date(staleTimestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'unknown time';

  if (error) {
    return (
      <div className="container cal-page">
        <div className="cal-page__error">
          <h2>Unable to load events</h2>
          <p>{error}</p>
          <p>Please check your connection and try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cal-page">
      {isStale && !staleDismissed && (
        <div className="stale-banner">
          <span>⚠ Data may be out of date. Last updated: {staleLabel}</span>
          <button className="stale-banner__dismiss" onClick={() => setStaleDismissed(true)} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="container">
        <div className="cal-page__main">
          <FilterBar
            activeTypes={activeTypes}
            activeSeries={activeSeries}
            searchQuery={searchQuery}
            hideWeekends={hideWeekends}
            availableSeries={availableSeries}
            onToggleType={toggleType}
            onSetSeries={setSeries}
            onSetSearch={setSearch}
            onSetHideWeekends={setHideWeekends}
          />

          {loading && !events ? (
            <LoadingSpinner />
          ) : (
            <>
              <MonthNav year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />
              <CalendarGrid
                events={filteredEvents}
                year={year}
                month={month}
                hideWeekends={hideWeekends}
              />
            </>
          )}

          {/* Search results list when query is active */}
          {searchQuery && filteredEvents && filteredEvents.length > 0 && (
            <div className="cal-page__search-results">
              <h3 className="cal-page__search-title">
                {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} for "{searchQuery}"
              </h3>
              <div className="search-result-list">
                {filteredEvents
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((event, i) => (
                    <div key={event.id || i} className="search-result-item">
                      <span className="search-result-item__date">{event.date}</span>
                      <span className="search-result-item__title">{event.title}</span>
                      <span className="search-result-item__type">{event.type}</span>
                      {event.url && (
                        <a href={event.url} target="_blank" rel="noopener noreferrer" className="search-result-item__link">
                          More info →
                        </a>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          <CalendarSubscribe />
        </div>
      </div>
    </div>
  );
}
