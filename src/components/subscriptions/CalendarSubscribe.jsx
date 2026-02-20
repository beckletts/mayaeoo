import { useState } from 'react';
import './CalendarSubscribe.css';

// These are the ICS feed URLs from the original script.js
const FEEDS = [
  {
    type: 'general',
    label: 'UK General Qualifications',
    dotClass: 'event-dot--general',
    url: 'https://calendar.google.com/calendar/ical/pearsonquals%40gmail.com/public/basic.ics',
  },
  {
    type: 'vocational',
    label: 'Vocational Qualifications',
    dotClass: 'event-dot--vocational',
    url: 'https://calendar.google.com/calendar/ical/pearsonquals2%40gmail.com/public/basic.ics',
  },
  {
    type: 'international',
    label: 'International Qualifications',
    dotClass: 'event-dot--international',
    url: 'https://calendar.google.com/calendar/ical/pearsonquals3%40gmail.com/public/basic.ics',
  },
];

export default function CalendarSubscribe() {
  const [copied, setCopied] = useState(null);

  async function handleCopy(url, type) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  return (
    <div className="cal-subscribe">
      <h3 className="cal-subscribe__title">Subscribe to calendar feeds</h3>
      <div className="cal-subscribe__feeds">
        {FEEDS.map(feed => (
          <div key={feed.type} className="cal-subscribe__feed">
            <div className="cal-subscribe__feed-header">
              <span className={`event-dot ${feed.dotClass}`} aria-hidden="true" />
              <span className="cal-subscribe__feed-label">{feed.label}</span>
            </div>
            <div className="cal-subscribe__feed-actions">
              <a
                href={feed.url.replace('https://', 'webcal://')}
                className="cal-subscribe__btn cal-subscribe__btn--subscribe"
              >
                Subscribe
              </a>
              <button
                className="cal-subscribe__btn cal-subscribe__btn--copy"
                onClick={() => handleCopy(feed.url, feed.type)}
              >
                {copied === feed.type ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
