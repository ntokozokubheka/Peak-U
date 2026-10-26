// FORM SCORE: pure functions, no database or network. Easy to test and tweak.
// CUSTOMIZE: change WEIGHTS and RULES below. Everything else follows from them.
export const WEIGHTS = { mind: 0.35, class: 0.2, body: 0.25, money: 0.2 };
export const RULES = {
  windowDays: 7,         // rolling window
  minDaysWithData: 4,    // need activity on at least this many of the last 7 days
  minPillars: 2,         // and at least this many pillars with data
  peakScore: 80,         // PEAK needs this score...
  peakTrendFloor: -2,    // ...and a trend no worse than this
  decliningTrend: -8,    // DECLINING if trend is this bad or worse...
  decliningScore: 55,    // ...or the score is under this
};

const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
// Weighted mean of the parts that exist. parts = [[value|null, weight], ...]
function blend(parts) {
  const ok = parts.filter(([v]) => v != null && !Number.isNaN(v));
  if (!ok.length) return null;
  const w = ok.reduce((s, [, x]) => s + x, 0);
  return ok.reduce((s, [v, x]) => s + v * x, 0) / w;
}

// Each pillar returns 0..100, or null when there is no data.
export function mindScore({ gradeAvg = null, blocksDone = 0, blocksPlanned = 0, lateCount = 0 } = {}) {
  const blocks = blocksPlanned > 0 ? clamp((blocksDone / blocksPlanned) * 100) : null;
  const base = blend([[gradeAvg, 0.7], [blocks, 0.3]]);
  return base == null ? null : clamp(base - Math.min(15, lateCount * 5));
}
export function classScore({ attended = 0, total = 0 } = {}) {
  return total > 0 ? clamp((attended / total) * 100) : null;
}
export function bodyScore({ sleepAvg = null, sleepTarget = 7.5, movementAvg = null, moodAvg = null, stressAvg = null } = {}) {
  const sleep = sleepAvg == null ? null : clamp((sleepAvg / sleepTarget) * 100);
  const move = movementAvg == null ? null : clamp((movementAvg / 30) * 100);
  const mood = moodAvg == null || stressAvg == null ? null
    : (((moodAvg - 1) / 4) * 100 + ((5 - stressAvg) / 4) * 100) / 2;
  return blend([[sleep, 0.5], [move, 0.25], [mood, 0.25]]);
}
export function moneyScore({ spent = null, budget = null, daysElapsed = 0, daysInPeriod = 30, billsOnTime = null } = {}) {
  if (spent == null || !budget || daysElapsed <= 0) return null;
  const pace = spent / (budget * (daysElapsed / daysInPeriod)); // 1 = exactly on budget pace
  const paceScore = pace <= 1 ? 100 : clamp(100 - (pace - 1) * 100);
  return blend([[paceScore, 0.8], [billsOnTime == null ? null : billsOnTime * 100, 0.2]]);
}

export function labelFor(score, trend, rules = RULES) {
  if ((trend != null && trend <= rules.decliningTrend) || score < rules.decliningScore) return 'declining';
  if (score >= rules.peakScore && (trend == null || trend >= rules.peakTrendFloor)) return 'peak';
  return 'steady';
}

// pillars: { mind, class, body, money } each 0..100 or null
export function computeFormScore({ pillars, daysWithData, paused = [], prevScore = null, weights = WEIGHTS, rules = RULES }) {
  const used = Object.keys(weights).filter((k) => pillars[k] != null && !paused.includes(k));
  const missing = Object.keys(weights).filter((k) => !used.includes(k));
  if (daysWithData < rules.minDaysWithData || used.length < rules.minPillars) {
    return { score: null, raw: null, trend: null, label: 'building', partial: true, used, missing };
  }
  const wsum = used.reduce((s, k) => s + weights[k], 0); // weights of missing pillars are shared out
  const raw = used.reduce((s, k) => s + pillars[k] * weights[k], 0) / wsum;
  const score = Math.round(raw);
  const trend = prevScore == null ? null : score - prevScore;
  return { score, raw: Math.round(raw * 10) / 10, trend, label: labelFor(score, trend, rules), partial: missing.length > 0, used, missing };
}
