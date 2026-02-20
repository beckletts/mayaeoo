import { useMemo } from 'react';
import EventDot from './EventDot';
import { getQualGroup } from '../../hooks/useFilters';

export default function CalendarDay({ date, events, isToday, isEmpty, onClick }) {
  if (isEmpty) {
    return <div className="calendar-day calendar-day--empty" aria-hidden="true" />;
  }

  // Group events by qual type to show one dot per type
  const dotGroups = useMemo(() => {
    const groups = {};
    events.forEach(e => {
      const g = getQualGroup(e.type);
      if (!groups[g]) groups[g] = { type: e.type, group: g, count: 0 };
      groups[g].count++;
    });
    return Object.values(groups);
  }, [events]);

  const maxDots = 3;
  const visibleDots = dotGroups.slice(0, maxDots);
  const hiddenCount = events.length - dotGroups.slice(0, maxDots).reduce((sum, g) => sum + g.count, 0);

  const hasEvents = events.length > 0;

  return (
    <button
      className={`calendar-day ${isToday ? 'calendar-day--today' : ''} ${hasEvents ? 'calendar-day--has-events' : ''}`}
      onClick={() => hasEvents && onClick(date, events)}
      aria-label={`${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}${hasEvents ? `, ${events.length} event${events.length > 1 ? 's' : ''}` : ''}`}
      disabled={!hasEvents}
    >
      <span className="day-number">{date.getDate()}</span>
      {hasEvents && (
        <div className="day-dots">
          {visibleDots.map(g => (
            <EventDot key={g.group} type={g.type} count={g.count} />
          ))}
          {hiddenCount > 0 && (
            <span className="day-more">+{hiddenCount}</span>
          )}
        </div>
      )}
    </button>
  );
}
