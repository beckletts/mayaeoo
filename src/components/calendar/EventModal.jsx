import { useEffect } from 'react';
import { getQualGroup } from '../../hooks/useFilters';

export default function EventModal({ date, events, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!date || !events) return null;

  const displayDate = date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Events on ${displayDate}`}
    >
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__date">{displayDate}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {events.map((event, i) => {
          const group = getQualGroup(event.type);
          return (
            <div key={event.id || i} className={`event-card event-card--${group}`}>
              <div className="event-card__type">{event.type}</div>
              <div className="event-card__title">{event.title}</div>
              {event.description && (
                <div className="event-card__desc">{event.description}</div>
              )}
              {event.series && (
                <div className="event-card__desc">Series: {event.series}</div>
              )}
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-card__link"
                >
                  More info →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
