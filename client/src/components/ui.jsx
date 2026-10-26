// Small building blocks used by every page.
export const Card = ({ title, tag, children, className = '' }) => (
  <section className={'card ' + className}>
    {tag && <div className="tag">{tag}</div>}
    {title && <h3>{title}</h3>}
    {children}
  </section>
);

export const Bar = ({ label, value, max = 100, note }) => (
  <div className="barwrap">
    <div className="barlabel"><span>{label}</span><span>{note ?? (value == null ? 'no data' : Math.round(value) + '%')}</span></div>
    <div className="bar" role="img" aria-label={`${label}: ${value == null ? 'no data' : Math.round(value)} out of ${max}`}>
      <i style={{ width: value == null ? 0 : Math.min(100, (value / max) * 100) + '%' }} />
    </div>
  </div>
);

// The score ring from the designs. Shows a dash when there is not enough data yet.
export function Ring({ score }) {
  const C = 2 * Math.PI * 54;
  return (
    <svg width="170" height="170" viewBox="0 0 140 140" role="img" aria-label={score == null ? 'Form score is still building' : `Form score ${score} out of 100`}>
      <circle cx="70" cy="70" r="54" fill="none" stroke="#0d3f82" strokeWidth="14" />
      {score != null && <circle cx="70" cy="70" r="54" fill="none" stroke="#fff" strokeWidth="14" strokeDasharray={`${(score / 100) * C} ${C}`} transform="rotate(-90 70 70)" />}
      <text x="70" y="80" textAnchor="middle" fontSize="34" fontWeight="900" fill="#fff">{score ?? '–'}</text>
    </svg>
  );
}

export const LABELS = {
  peak: '▲ PEAK', steady: '● STEADY', declining: '▼ DECLINING', building: 'BUILDING YOUR SCORE',
  on_target: '● ON TARGET', below_target: '▼ BELOW TARGET', below_pass: '▼ BELOW PASS MARK', upcoming: 'UPCOMING',
};

export const ErrorNote = ({ error }) => (error ? <p className="error" role="alert">{error}</p> : null);
