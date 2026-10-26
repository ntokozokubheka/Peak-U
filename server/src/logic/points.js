// Points and streak rules. CUSTOMIZE: DAILY_CAP and the streak threshold.
export const DAILY_CAP = 200;      // stops points being farmed in one day
export const STREAK_MIN_ITEMS = 7; // a day counts toward the streak with 7 of 12 items done

export function allowedPoints(todayTotal, pts, cap = DAILY_CAP) {
  return Math.max(0, Math.min(pts, cap - todayTotal));
}

const prev = (ymd) => { const d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };

// daysDone: [{ day: 'YYYY-MM-DD', done: number }]. Today gets a grace: an unfinished
// today does not break the streak, it just is not counted yet.
export function streak(daysDone, today, min = STREAK_MIN_ITEMS) {
  const m = new Map(daysDone.map((d) => [d.day, Number(d.done)]));
  let day = (m.get(today) ?? 0) >= min ? today : prev(today);
  let n = 0;
  while ((m.get(day) ?? 0) >= min) { n += 1; day = prev(day); }
  return n;
}
