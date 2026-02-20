/**
 * Parse pasted TSV or CSV text into an array of event objects.
 * Expected columns (in order):
 *   date | title | type | series | description | url
 * Accepts tab-separated or comma-separated input.
 * Ignores header row if first cell looks like a header word.
 */
export function parsePaste(text) {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  // Detect delimiter: if the first line has tabs, use TSV, else CSV
  const delimiter = lines[0].includes('\t') ? '\t' : ',';

  const rows = lines.map(line => splitLine(line, delimiter));

  // Skip header row if columns look like text labels
  const headerPatterns = /^(date|title|type|series|description|url|event|qual)/i;
  const startIdx = headerPatterns.test(rows[0][0]) ? 1 : 0;

  const events = [];
  for (let i = startIdx; i < rows.length; i++) {
    const [date, title, type, series, description, url] = rows[i].map(c => c.trim());
    if (!date || !title) continue; // Skip empty rows

    const parsedDate = parseDate(date);
    if (!parsedDate) continue; // Skip rows with unparseable dates

    events.push({
      date: parsedDate,
      title: title || '',
      type: type || '',
      series: series || '',
      description: description || '',
      url: url || '',
    });
  }

  return events;
}

function splitLine(line, delimiter) {
  if (delimiter === '\t') return line.split('\t');

  // CSV: handle quoted fields
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse various date formats to ISO string (YYYY-MM-DD).
 * Handles: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, "D Month YYYY", "Month D YYYY"
 */
function parseDate(str) {
  if (!str) return null;
  str = str.trim();

  // Already ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }

  // Natural language: "15 January 2025" or "January 15 2025"
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}
