// Compare a mark with the benchmarks that matter. CUSTOMIZE the wording/thresholds here.
export function compare({ mark, target, last = null, pass = 50 }) {
  if (mark == null) return { status: 'upcoming', delta: null };
  const status = mark < pass ? 'below_pass' : mark >= target ? 'on_target' : 'below_target';
  return { status, delta: last == null ? null : Math.round((mark - last) * 10) / 10 };
}
