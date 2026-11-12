import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Card, Bar, Ring, LABELS, ErrorNote } from '../components/ui.jsx';

const CATS = { study: 'Study', health: 'Health', money: 'Money', team: 'Money and Team' };
const PILLARS = { mind: 'Mind', class: 'Class', body: 'Body', money: 'Money' };

export default function Dashboard() {
  const { user } = useAuth();
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
    <div className="dashboard-page">
      <h1 className="page-title" style={{ display: 'none' }}>Dashboard</h1>
      <ErrorNote error={error} />

      {/* Top Banner Card */}
      <div className="card" style={{ background: 'var(--navy)', color: '#fff', padding: '36px', borderRadius: 28, marginBottom: 30 }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>
          GOOD MORNING, {user?.name ? user.name.toUpperCase() : 'NTOKOZO'} · SAMPLE DATA
        </div>
        <div className="flex" style={{ alignItems: 'center', gap: 30 }}>
          <div style={{ flex: '0 0 170px' }}><Ring score={score.score} /></div>
          <div style={{ flex: '1 1 320px' }}>
            <div className="big" style={{ fontSize: 38 }}>YOUR FORM: {LABELS[score.label] || 'STEADY'}</div>
            <p style={{ margin: '10px 0', fontWeight: 800, fontSize: 15 }}>
              {score.score != null ? `${score.score} / 100` : 'Need 4 days of activity and 2 pillars'}
              {score.trend != null && ` · ${score.trend >= 0 ? '▲' : '▼'} ${Math.abs(score.trend)} vs last week`}
              {score.partial && score.score != null && ' · partial score'}
            </p>
            <p className="muted" style={{ color: '#eef3fb', opacity: 0.9, lineHeight: 1.5 }}>
              Sleep 8 hours over nights this week and your quiz average improved within. Your coach notes 8 Wed morning study blocks by 10.00 — scout past week here.
            </p>
            <p className="muted" style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>
              Streak: {sum.streak} days · Points: {sum.balance} · Today: {done} of {items.length} done
            </p>
          </div>
        </div>
      </div>

      {/* 4 Pillar Cards */}
      <div className="grid" style={{ marginBottom: 30 }}>
        <Card title="MIND" tag="74% of your score">
          <div className="big" style={{ fontSize: 32, marginBottom: 2 }}>74%</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--navy)', marginBottom: 8 }}>▼ DECLINING · GRADE AVERAGE</div>
          <Bar label="" value={74} note="" />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Down from a peak of 86% three weeks ago</p>
        </Card>

        <Card title="CLASS" tag="92% of your score">
          <div className="big" style={{ fontSize: 32, marginBottom: 2 }}>92%</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--blue)', marginBottom: 8 }}>▲ PEAK · ATTENDANCE</div>
          <Bar label="" value={92} note="" />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>11 of 12 sessions attended this fortnight</p>
        </Card>

        <Card title="BODY" tag="6.1h">
          <div className="big" style={{ fontSize: 32, marginBottom: 2 }}>6.1h</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--navy)', marginBottom: 8 }}>▼ LOW · AVERAGE SLEEP</div>
          <Bar label="" value={61} note="" />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Target 7.5h · stress check-in due today</p>
        </Card>

        <Card title="MONEY" tag="[AMOUNT]">
          <div className="big" style={{ fontSize: 26, marginBottom: 2 }}>[AMOUNT]</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--navy)', marginBottom: 8 }}>● STEADY · LEFT THIS MONTH</div>
          <Bar label="" value={55} note="" />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>On track: 55% of budget used, 18 days to go</p>
        </Card>
      </div>

      {/* Semester Status Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 40, background: 'var(--pale)', border: '1px solid #d4e6f5' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--blue)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Semester 1 · Quarter 2 · Week 5 of 6
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginTop: 4 }}>
            View term 2: [00] OSC [01] [04] [05] – Quarter average 62% in range 65%
          </p>
        </div>
        <button className="pill solid" style={{ padding: '8px 18px', fontSize: 12 }}>SEEN AN UNEXCUSED MARK</button>
      </div>

      {/* Today's Training Section with Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        <h2 className="section" style={{ color: 'var(--navy)', margin: 0 }}>Today&#8217;s training</h2>
        <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--navy)' }}>
          ▲ 9-DAY STREAK · 5 OF 12 DONE · 40 / 145 PTS TODAY
        </span>
      </div>

      {/* Progress Bar for Training */}
      <div className="barwrap" style={{ marginBottom: 24 }}>
        <div className="bar" style={{ height: 12, background: '#d4e6f5' }}>
          <i style={{ width: `${(5 / 12) * 100}%`, background: 'var(--blue)' }} />
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 40 }}>
        {Object.entries(CATS).map(([cat, name]) => (
          <Card key={cat} title={name}>
            {items.filter((i) => i.category === cat || (cat === 'money' && i.category === 'team')).map((i) => (
              <div className="check" key={i.id}>
                <input type="checkbox" id={`h${i.id}`} checked={i.done} onChange={() => toggle(i.id)} />
                <label htmlFor={`h${i.id}`}>{i.title}</label><b>+{i.points}</b>
              </div>
            ))}
            {items.filter((i) => i.category === cat || (cat === 'money' && i.category === 'team')).length === 0 && (
              <p className="muted" style={{ padding: '10px 0' }}>All clear for today in this category.</p>
            )}
          </Card>
        ))}
      </div>
      
      {/* Today's Training Section */}
      <h2 className="section" style={{ color: 'var(--navy)' }}>Today&#8217;s training</h2>
      <div className="grid" style={{ marginBottom: 40 }}>
        {Object.entries(CATS).map(([cat, name]) => (
          <Card key={cat} title={name}>
            {items.filter((i) => i.category === cat || (cat === 'money' && i.category === 'team')).map((i) => (
              <div className="check" key={i.id}>
                <input type="checkbox" id={`h${i.id}`} checked={i.done} onChange={() => toggle(i.id)} />
                <label htmlFor={`h${i.id}`}>{i.title}</label><b>+{i.points}</b>
              </div>
            ))}
            {items.filter((i) => i.category === cat || (cat === 'money' && i.category === 'team')).length === 0 && (
              <p className="muted" style={{ padding: '10px 0' }}>All clear for today in this category.</p>
            )}
          </Card>
        ))}
      </div>

      {/* How Your Form Score Works */}
      <h2 className="section" style={{ color: 'var(--navy)' }}>How your form score works</h2>
      <div className="grid wide" style={{ marginBottom: 40 }}>
        <Card title="The formula">
          {Object.entries(score.weights).map(([k, w]) => (
            <div className="row" key={k}><span>{PILLARS[k]}</span><b>{Math.round(w * 100)}%</b></div>
          ))}
        </Card>
        <Card title="Rules">
          <p className="muted">
            Rolling {score.rules.windowDays}-day window. Needs {score.rules.minDaysWithData} days of activity and {score.rules.minPillars} pillars, otherwise it shows &#8220;building&#8221;. Missing pillars share their weight.
          </p>
        </Card>
        <Card title="Labels">
          <p className="muted">
            <b>Peak:</b> {score.rules.peakScore}+ and trend no worse than {score.rules.peakTrendFloor}.<br />
            <b>Declining:</b> trend {score.rules.decliningTrend} or worse, or under {score.rules.decliningScore}.<br />
            <b>Steady:</b> everything else.
          </p>
        </Card>
      </div>

      {/* The Whole Picture & Coach Insight */}
      <div className="grid wide" style={{ marginBottom: 40 }}>
        <Card title="The whole picture">
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            {/* SVG Trend Graph Mockup */}
            <svg viewBox="0 0 400 120" width="100%" height="110" style={{ overflow: 'visible' }}>
              <path d="M 20 80 Q 100 40, 180 60 T 340 90" fill="none" stroke="var(--blue)" strokeWidth="3" />
              <path d="M 20 100 Q 100 70, 180 85 T 340 105" fill="none" stroke="var(--bright)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="180" cy="60" r="5" fill="var(--navy)" />
              <text x="170" y="45" fontSize="11" fontWeight="900" fill="var(--navy)">▲ PEAK</text>
              <circle cx="340" cy="90" r="5" fill="var(--navy)" />
              <text x="325" y="115" fontSize="11" fontWeight="900" fill="var(--navy)">▼ DIP</text>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, opacity: 0.7, marginTop: 10 }}>
              <span>WEEK 1</span><span>WEEK 3</span><span>WEEK 5</span><span>WEEK 7</span>
            </div>
          </div>
        </Card>

        <Card title="Coach insight">
          <p className="muted" style={{ lineHeight: 1.6, marginBottom: 20 }}>
            When sleep dips below 6 hours in active weeks, mood scores trend down 18%. Activity is only one part of the game plan; preserve the sleep, and the grades follow.
          </p>
          <p className="muted" style={{ fontWeight: 800, marginBottom: 16 }}>
            Streak: 9 days when due tomorrow. Next milestone: 12 conv.
          </p>
          <button className="pill solid" style={{ width: '100%', textAlign: 'center' }}>FIX MY WEEK</button>
        </Card>
      </div>

      {/* Optimized Week Schedule */}
      <h2 className="section" style={{ color: 'var(--navy)' }}>Optimized week</h2>
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, textAlign: 'center' }}>
          {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, idx) => (
            <div key={day} style={{ background: 'var(--pale)', borderRadius: 12, padding: '10px 6px' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--navy)', marginBottom: 8 }}>{day}</div>
              <div style={{ background: 'var(--navy)', color: '#fff', borderRadius: 8, padding: '8px 4px', fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
                0800 Class<br /><span style={{ fontSize: 9, opacity: 0.8 }}>[00] Math 101</span>
              </div>
              <div style={{ background: idx === 2 ? 'var(--bright)' : 'var(--blue)', color: '#fff', borderRadius: 8, padding: '8px 4px', fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
                1000 Study<br /><span style={{ fontSize: 9, opacity: 0.8 }}>Past paper review</span>
              </div>
              <div style={{ background: '#d4e6f5', color: 'var(--navy)', borderRadius: 8, padding: '8px 4px', fontSize: 11, fontWeight: 800 }}>
                1500 Rowing<br /><span style={{ fontSize: 9, opacity: 0.8 }}>Session plan</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '2px solid var(--pale)', flexWrap: 'wrap', gap: 14 }}>
          <p className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
            Suggested: Move Wednesday's study block to 10:30, 90 minutes of sleep prior. Down proof Friday's quiz slot.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pill solid" style={{ padding: '8px 18px', fontSize: 12 }}>ACCEPT</button>
            <button className="pill" style={{ padding: '8px 18px', fontSize: 12 }}>HELP MY PLAN</button>
          </div>
        </div>
      </div>

      {/* Quick Check-in Section */}
      <h2 className="section" style={{ color: 'var(--navy)' }}>Quick check-in</h2>
      <Card style={{ marginBottom: 40 }}>
        <form onSubmit={saveCheckin} className="flex">
          <div>
            <label className="field" htmlFor="mood">Mood (1 low, 5 great)</label>
            <select id="mood" value={checkin.mood} onChange={num('mood')}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="field" htmlFor="stress">Stress (1 calm, 5 high)</label>
            <select id="stress" value={checkin.stress} onChange={num('stress')}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="field" htmlFor="sleep">Sleep last night (hours)</label>
            <input id="sleep" type="number" step="0.5" min="0" max="24" value={checkin.sleepHours} onChange={num('sleepHours')} />
          </div>
          <div>
            <label className="field" htmlFor="move">Movement today (minutes)</label>
            <input id="move" type="number" min="0" max="600" value={checkin.movementMinutes} onChange={num('movementMinutes')} />
          </div>
          <div><button className="pill solid" style={{ marginTop: 22 }}>Save check-in</button></div>
        </form>
        {saved && <p className="note">Saved. Your score has been updated.</p>}
      </Card>

      {/* Bottom 3 Action Cards */}
      <div className="grid" style={{ marginBottom: 60 }}>
        <Card title="Health check-in">
          <p className="muted" style={{ marginBottom: 14 }}>Track energy, sleep, and fitness variables to keep student form at peak output.</p>
          <button className="pill small" style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>CONTINUE</button>
        </Card>
        <Card title="Money plan">
          <p className="muted" style={{ marginBottom: 14 }}>Budget tracking and loan disbursements are planned alongside classes and exams.</p>
          <button className="pill small" style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>OPEN BUDGET</button>
        </Card>
        <Card title="Your support team">
          <p className="muted" style={{ marginBottom: 14 }}>Connect with senior student captains and academic advisors whenever you get stuck.</p>
          <button className="pill small" style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>MESSAGE CAPTAIN</button>
        </Card>
      </div>
    </div>
  );
}