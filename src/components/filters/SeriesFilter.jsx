import './SeriesFilter.css';

export default function SeriesFilter({ availableSeries, activeSeries, onChange }) {
  return (
    <div className="series-filter">
      <label className="series-filter__label" htmlFor="series-select">Series</label>
      <select
        id="series-select"
        className="series-filter__select"
        value={activeSeries}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">All series</option>
        {availableSeries.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
