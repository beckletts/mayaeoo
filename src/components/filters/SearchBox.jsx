import { useState, useEffect } from 'react';
import './SearchBox.css';

export default function SearchBox({ value, onChange }) {
  const [local, setLocal] = useState(value);

  // Sync external value changes (e.g. URL navigation)
  useEffect(() => { setLocal(value); }, [value]);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(t);
  }, [local, onChange, value]);

  return (
    <div className="search-box">
      <span className="search-box__icon" aria-hidden="true">🔍</span>
      <input
        className="search-box__input"
        type="search"
        placeholder="Search events…"
        value={local}
        onChange={e => setLocal(e.target.value)}
        aria-label="Search events"
      />
      {local && (
        <button
          className="search-box__clear"
          onClick={() => { setLocal(''); onChange(''); }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
