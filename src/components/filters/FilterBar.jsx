import TypeFilter from './TypeFilter';
import SeriesFilter from './SeriesFilter';
import SearchBox from './SearchBox';
import './FilterBar.css';

export default function FilterBar({
  activeTypes, activeSeries, searchQuery, hideWeekends,
  availableSeries,
  onToggleType, onSetSeries, onSetSearch, onSetHideWeekends,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__row">
        <TypeFilter activeTypes={activeTypes} onToggle={onToggleType} />
        <div className="filter-bar__right">
          <SeriesFilter
            availableSeries={availableSeries}
            activeSeries={activeSeries}
            onChange={onSetSeries}
          />
          <SearchBox value={searchQuery} onChange={onSetSearch} />
        </div>
      </div>
      <div className="filter-bar__row filter-bar__row--options">
        <label className="filter-bar__toggle">
          <input
            type="checkbox"
            checked={hideWeekends}
            onChange={e => onSetHideWeekends(e.target.checked)}
          />
          Hide weekends
        </label>
      </div>
    </div>
  );
}
