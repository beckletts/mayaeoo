import './TypeFilter.css';

const TYPES = [
  { id: 'general',       label: 'UK General',    dotClass: 'event-dot--general' },
  { id: 'international', label: 'International', dotClass: 'event-dot--international' },
  { id: 'vocational',    label: 'Vocational',    dotClass: 'event-dot--vocational' },
];

export default function TypeFilter({ activeTypes, onToggle }) {
  return (
    <div className="type-filter">
      {TYPES.map(t => (
        <button
          key={t.id}
          className={`type-filter__btn ${activeTypes.includes(t.id) ? 'active' : ''}`}
          onClick={() => onToggle(t.id)}
          aria-pressed={activeTypes.includes(t.id)}
        >
          <span className={`event-dot ${t.dotClass}`} aria-hidden="true" />
          {t.label}
        </button>
      ))}
    </div>
  );
}
