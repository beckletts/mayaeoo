import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading events…' }) {
  return (
    <div className="spinner-wrap" role="status" aria-label={message}>
      <div className="spinner" />
      <p className="spinner-label">{message}</p>
    </div>
  );
}
