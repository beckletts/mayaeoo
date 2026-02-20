import { useEffect } from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function MonthNav({ year, month, onPrev, onNext }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPrev, onNext]);

  return (
    <div className="month-nav">
      <button
        className="month-nav__btn"
        onClick={onPrev}
        aria-label="Previous month"
      >
        ← Prev
      </button>
      <h2 className="month-nav__title">
        {MONTHS[month]} {year}
      </h2>
      <button
        className="month-nav__btn"
        onClick={onNext}
        aria-label="Next month"
      >
        Next →
      </button>
    </div>
  );
}
