import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, Bar, Ring, LABELS, ErrorNote } from '../components/ui.jsx';

const CATS = { study: 'Study', health: 'Health', money: 'Money', team: 'Team' };
const PILLARS = { mind: 'Mind', class: 'Class', body: 'Body', money: 'Money' };

export default function Dashboard() {
  const [score, setScore] = useState(null);
  const [items, setItems] = useState([]);
  const [sum, setSum] = useState(null);
  const [error, setError] = useState('');
  const [checkin, setCheckin] = useState({ mood: 3, stress: 3, sleepHours: 7, movementMinutes: 30 });
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [s, h, m] = await Promise.all([api.get('/score'), api.get('/habits/today'), api.get('/habits/summary')]);
    setScore(s); setItems(h.items); setSum(m);
  }, []);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  const toggle = (id) => api.post(`/habits/${id}/toggle`).then(load).catch((e) => setError(e.message));
  async function saveCheckin(e) {
    e.preventDefault(); setSaved(false);
    try { await api.post('/checkins', checkin); setSaved(true); await load(); } catch (err) { setError(err.message); }
  }
  const num = (k) => (e) => setCheckin({ ...checkin, [k]: e.target.value });

  if (!score || !sum) return <><h1 className="page-title">Dashboard</h1><ErrorNote error={error} /></>;
  const done = items.filter((i) => i.done).length;

  return (
    <>
      <h1 className="page-title">Your form</h1>
      <p className="page-sub">One score for the whole student: study, class, body and money, over the last 7 days.</p>
      <ErrorNote error={error} />

      <div className="card" style={{ background: 'var(--navy)', color: '#fff' }}>
        <div className="flex" style={{ alignItems: 'center', gap: 30 }}>
          <div style={{ flex: '0 0 170px' }}><Ring score={score.score} /></div>
          <div style={{ flex: '1 1 320px' }}>
            <div className="big">{LABELS[score.label]}</div>
            <p style={{ margin: '8px 0', fontWeight: 800 }}>
              {score.score != null ? `${score.score} / 100` : 'Need 4 days of activity and 2 pillars'}
              {score.trend != null && ` · ${score.trend >= 0 ? '▲' : '▼'} ${Math.abs(score.trend)} vs last week`}
              {score.partial && score.score != null && ' · partial score'}
            </p>
            <p className="muted">Streak: {sum.streak} days · Points: {sum.balance} · Today: {done} of {items.length} done</p>
          </div>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 20 }}>
        {Object.entries(PILLARS).map(([k, name]) => (
          <Card key={k} title={name} tag={`${Math.round(score.weights[k] * 100)}% of your score`}>
            <div className="big">{score.pillars[k] ?? '–'}</div>
            <Bar label="This week" value={score.pillars[k]} />
          </Card>
        ))}
      </div>

      <h2 className="section">Today&#8217;s training</h2>
      <div className="grid">
        {Object.entries(CATS).map(([cat, name]) => (
          <Card key={cat} title={name}>
            {items.filter((i) => i.category === cat).map((i) => (
              <div className="check" key={i.id}>
                <input type="checkbox" id={`h${i.id}`} checked={i.done} onChange={() => toggle(i.id)} />
                <label htmlFor={`h${i.id}`}>{i.title}</label><b>+{i.points}</b>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <h2 className="section">Quick check-in</h2>
      <Card>
        <form onSubmit={saveCheckin} className="flex">
          <div><label className="field" htmlFor="mood">Mood (1 low, 5 great)</label><select id="mood" value={checkin.mood} onChange={num('mood')}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></div>
          <div><label className="field" htmlFor="stress">Stress (1 calm, 5 high)</label><select id="stress" value={checkin.stress} onChange={num('stress')}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></div>
          <div><label className="field" htmlFor="sleep">Sleep last night (hours)</label><input id="sleep" type="number" step="0.5" min="0" max="24" value={checkin.sleepHours} onChange={num('sleepHours')} /></div>
          <div><label className="field" htmlFor="move">Movement today (minutes)</label><input id="move" type="number" min="0" max="600" value={checkin.movementMinutes} onChange={num('movementMinutes')} /></div>
          <div><button className="pill solid">Save check-in</button></div>
        </form>
        {saved && <p className="note">Saved. Your score has been updated.</p>}
      </Card>

      <h2 className="section">How the score works</h2>
      <div className="grid">
        <Card title="Formula">
          {Object.entries(score.weights).map(([k, w]) => <div className="row" key={k}><span>{PILLARS[k]}</span><b>{Math.round(w * 100)}%</b></div>)}
        </Card>
        <Card title="Rules">
          <p className="muted">Rolling {score.rules.windowDays}-day window. Needs {score.rules.minDaysWithData} days of activity and {score.rules.minPillars} pillars, otherwise it shows &#8220;building&#8221;. Missing pillars share their weight.</p>
        </Card>
        <Card title="Labels">
          <p className="muted"><b>Peak:</b> {score.rules.peakScore}+ and trend no worse than {score.rules.peakTrendFloor}.<br /><b>Declining:</b> trend {score.rules.decliningTrend} or worse, or under {score.rules.decliningScore}.<br /><b>Steady:</b> everything else.</p>
        </Card>
      </div>
    </>
  );
}
