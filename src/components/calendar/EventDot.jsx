import { getQualGroup } from '../../hooks/useFilters';

export default function EventDot({ type, count }) {
  const group = getQualGroup(type);
  return (
    <span
      className={`event-dot event-dot--${group}`}
      title={`${type}${count > 1 ? ` (${count})` : ''}`}
      aria-hidden="true"
    />
  );
}
