import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const TIERS = [
  { name: 'ROOKIE', min: 0 },
  { name: 'STARTER', min: 500 },
  { name: 'CAPTAIN', min: 2000 },
  { name: 'LEGEND', min: 4000 },
];

const DEFAULT_DATA = {
  points: 1240,
  status: 'STARTER',
  nextTier: 'CAPTAIN',
  pointsToNext: 760,
  progressPercent: 62,
  earnRules: [
    { id: 1, label: 'Attend a class', points: 10 },
    { id: 2, label: 'Finish a study block', points: 20 },
    { id: 3, label: 'Sleep 7.5h or more', points: 15 },
    { id: 4, label: 'Stay within weekly budget', points: 25 },
    { id: 5, label: 'Complete a Study Lab session', points: 40 },
    { id: 6, label: 'Daily check-in', points: 5 },
  ],
  weeklyPillars: [
    { id: 'mind', label: 'MIND · STUDY', current: 180, target: 250 },
    { id: 'class', label: 'CLASS', current: 90, target: 100 },
    { id: 'body', label: 'BODY · HEALTH', current: 75, target: 150 },
    { id: 'money', label: 'MONEY', current: 25, target: 50 },
  ],
  coachTip: 'Balanced weeks earn a bonus. Body is lagging, so the coach suggests an early night for +15.',
  challenge: {
    title: 'Whole-athlete week:',
    description: 'hit at least 60% of your target in all four pillars for a +100 bonus. 3 days left.',
  },
  storeItems: [
    { id: 'coffee', title: '[PARTNER] COFFEE', subtitle: 'Fuel for the study block', cost: null },
    { id: 'gym', title: 'GYM / SPORT PASS', subtitle: 'One free session on campus', cost: null },
    { id: 'captain', title: 'CAPTAIN SESSION', subtitle: 'Spend points on a 1-on-1 with a captain', cost: null },
  ],
};

export default function Rewards() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    api.get('/rewards')
      .then((d) => {
        if (d) setData((prev) => ({ ...prev, ...d }));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function redeem(item) {
    setError('');
    setMessage('');
    setRedeemingId(item.id);
    try {
      const res = await api.post('/rewards/redeem', { itemId: item.id });
      setMessage(res?.message || `Redeemed ${item.title}!`);
      if (typeof res?.remainingPoints === 'number') {
        setData((prev) => ({ ...prev, points: res.remainingPoints }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setRedeemingId(null);
    }
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Rewards</h1>
      <p className="page-sub">
        Every healthy, on-time habit earns points. Climb from Rookie to Legend and unlock rewards.
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      {/* Status & Tier Progress Card */}
      <Card>
        <div className="flex" style={{ alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: '0 0 240px' }}>
            <div className="tag">SAMPLE · YOUR STATUS</div>
            <div className="big">{data.status}</div>
            <p className="muted" style={{ marginTop: 6 }}>
              {data.points.toLocaleString()} points. {data.pointsToNext.toLocaleString()} to reach {data.nextTier.charAt(0) + data.nextTier.slice(1).toLowerCase()}.
            </p>
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <div className="barwrap" style={{ margin: 0 }}>
              <div className="barlabel">
                <span>PROGRESS TO {data.nextTier}</span>
                <span>{data.progressPercent}%</span>
              </div>
              <div className="bar">
                <i style={{ width: `${Math.min(100, Math.max(0, data.progressPercent))}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tier Stepper */}
        <div className="tier-grid">
          {TIERS.map((tier) => {
            const unlocked = data.points >= tier.min;
            return (
              <div key={tier.name} className={`tier-box ${unlocked ? 'unlocked' : ''}`}>
                <div className="tier-name">{tier.name}</div>
                <div className="tier-pts">{tier.min.toLocaleString()} PTS</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Earn Points & This Week's Points */}
      <div className="grid wide" style={{ marginTop: 12 }}>
        <div>
          <h2 className="section" style={{ marginTop: 30 }}>
            <span style={{ fontWeight: 400 }}>EARN</span> POINTS
          </h2>
          <Card>
            {data.earnRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="row"
                style={idx === 0 ? { borderTop: 'none', paddingTop: 2 } : undefined}
              >
                <span>{rule.label}</span>
                <b style={{ color: 'var(--blue)' }}>+{rule.points}</b>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <h2 className="section" style={{ marginTop: 30 }}>
            <span style={{ fontWeight: 400 }}>THIS WEEK&apos;S</span> POINTS
          </h2>
          <Card>
            {data.weeklyPillars.map((pillar, idx) => {
              const pct = Math.min(100, Math.round((pillar.current / pillar.target) * 100));
              return (
                <div
                  key={pillar.id}
                  className="barwrap"
                  style={idx === 0 ? { marginTop: 0 } : undefined}
                >
                  <div className="barlabel">
                    <span>{pillar.label}</span>
                    <span>{pillar.current} / {pillar.target}</span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="muted" style={{ marginTop: 14 }}>{data.coachTip}</p>
          </Card>
        </div>
      </div>

      {/* Weekly Challenge */}
      <h2 className="section">
        <span style={{ fontWeight: 400 }}>WEEKLY</span> CHALLENGE
      </h2>
      <Card>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          <b>{data.challenge.title}</b> {data.challenge.description}
        </p>
      </Card>

      {/* Rewards Store */}
      <h2 className="section">
        <span style={{ fontWeight: 400 }}>REWARDS</span> STORE
      </h2>
      <div className="grid">
        {data.storeItems.map((item) => {
          const canAfford = item.cost == null || data.points >= item.cost;
          return (
            <Card key={item.id}>
              <h3 style={{ textTransform: 'uppercase', fontSize: 15 }}>{item.title}</h3>
              <p className="muted" style={{ marginBottom: 14 }}>{item.subtitle}</p>
              <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 14 }}>
                {item.cost != null ? `${item.cost.toLocaleString()} PTS` : '[COST] PTS'}
              </div>
              <button
                className="pill"
                style={{ textTransform: 'uppercase', padding: '8px 24px', fontSize: 13 }}
                onClick={() => redeem(item)}
                disabled={!canAfford || redeemingId === item.id}
              >
                {redeemingId === item.id ? 'Redeeming...' : 'Redeem'}
              </button>
            </Card>
          );
        })}
      </div>
    </>
  );
}