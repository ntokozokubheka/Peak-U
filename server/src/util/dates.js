// All "days" are strings like 2026-10-21 in the app's time zone (APP_TZ).
const TZ = process.env.APP_TZ || 'Africa/Johannesburg';
export const ymd = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: TZ });
export const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const daysInMonth = (s) => { const [y, m] = s.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
