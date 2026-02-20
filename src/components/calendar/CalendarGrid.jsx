import { useMemo, useState } from 'react';
import CalendarDay from './CalendarDay';
import EventModal from './EventModal';

const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WEEKDAYS_NO_WEEKEND = ['Mon','Tue','Wed','Thu','Fri'];

export default function CalendarGrid({ events, year, month, hideWeekends }) {
  const [modalState, setModalState] = useState(null); // { date, events }

  // Build a map of date-string → events[]
  const eventsByDate = useMemo(() => {
    const map = {};
    if (!events) return map;
    events.forEach(event => {
      if (!event.date) return;
      const key = event.date.slice(0, 10); // YYYY-MM-DD
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  // Build the grid cells for this month
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Monday-first: 0=Mon … 6=Sun
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const result = [];

    // Leading empty cells
    for (let i = 0; i < startDow; i++) {
      result.push({ isEmpty: true, key: `empty-start-${i}` });
    }

    // Day cells
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay(); // 0=Sun, 6=Sat
      if (hideWeekends && (dow === 0 || dow === 6)) continue;

      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      result.push({
        key: dateStr,
        date,
        dateStr,
        events: eventsByDate[dateStr] || [],
        isToday: dateStr === todayStr,
        isEmpty: false,
      });
    }

    // Trailing empty cells to fill last row
    const total = result.filter(c => !c.isEmpty).length + startDow;
    const cols = hideWeekends ? 5 : 7;
    const remainder = total % cols;
    if (remainder !== 0) {
      for (let i = 0; i < cols - remainder; i++) {
        result.push({ isEmpty: true, key: `empty-end-${i}` });
      }
    }

    return result;
  }, [year, month, eventsByDate, hideWeekends]);

  function handleDayClick(date, dayEvents) {
    setModalState({ date, events: dayEvents });
  }

  const weekdays = hideWeekends ? WEEKDAYS_NO_WEEKEND : WEEKDAYS;

  return (
    <>
      <div className="calendar-grid">
        <div className={`calendar-weekdays${hideWeekends ? ' calendar-weekdays--hide-weekends' : ''}`}>
          {weekdays.map(d => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
        </div>
        <div className={`calendar-days${hideWeekends ? ' calendar-days--hide-weekends' : ''}`}>
          {cells.map(cell => (
            cell.isEmpty
              ? <div key={cell.key} className="calendar-day calendar-day--empty" aria-hidden="true" />
              : <CalendarDay
                  key={cell.key}
                  date={cell.date}
                  events={cell.events}
                  isToday={cell.isToday}
                  isEmpty={false}
                  onClick={handleDayClick}
                />
          ))}
        </div>
      </div>

      {modalState && (
        <EventModal
          date={modalState.date}
          events={modalState.events}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  );
}
