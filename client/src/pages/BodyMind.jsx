import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const INITIAL_DATA = {
  checkin: {
    feeling: 'Okay',
    stressLevel: 50,
  },
  bodyWeekly: [
    { id: 'sleep', label: 'SLEEP', current: '6.1h', target: '7.5h', percent: 80, tip: 'Low sleep is the weakest link in your form this week.' },
    { id: 'movement', label: 'MOVEMENT', current: '1', target: '3 sessions', percent: 33 },
    { id: 'meals', label: 'MEALS LOGGED', current: '9', target: '21', percent: 42 },
  ],
  support: {
    text: 'Counsellors and peer coaches are available any time. Sharing with your coach is always your choice.',
  },
  money: {
    monthlyLeft: '[AMOUNT]',
    breakdown: [
      { id: 'rent', label: 'RENT AND BILLS', amount: '[AMOUNT]', percent: 75 },
      { id: 'food', label: 'FOOD', amount: '[AMOUNT]', percent: 50 },
      { id: 'transport', label: 'TRANSPORT', amount: '[AMOUNT]', percent: 30 },
      { id: 'study', label: 'STUDY MATERIAL', amount: '[AMOUNT]', percent: 15 },
    ],
    comingUp: [
      { id: 'b1', name: '[BILL NAME]', date: '[DATE]' },
      { id: 'b2', name: '[FEE / RENT]', date: '[DATE]' },
      { id: 'b3', name: 'Savings goal', date: '40%' },
    ],
    workVsStudy: '[N] work hours this week. Above [N] hours, grades in your cohort tend to dip, so Peak flags it before it bites.',
  },
};

export default function BodyMoney() {
  const [data, setData] = useState(INITIAL_DATA);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/body-money')
      .then((d) => {
        if (d) setData((prev) => ({ ...prev, ...d }));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleSaveCheckin() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/body-money/checkin', data.checkin);
      setMessage(res?.message || 'Daily check-in saved successfully! +5 PTS');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleContactSupport() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/body-money/support');
      setMessage(res?.message || 'Support request sent. A peer coach will reach out.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAdjustWorkHours() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/body-money/work-hours');
      setMessage(res?.message || 'Work hours adjustment opened.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Body & Money</h1>
      <p className="page-sub">
        Pre-filled from your weekly Quick Setup, so you only tweak what changed.
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      {/* --- BODY SECTION --- */}
      <h2 className="bm-section-title">Body</h2>

      <div className="bm-grid-3" style={{ marginBottom: 40 }}>
        {/* Daily Check-in Card */}
        <div className="bm-card">
          <div>
            <div className="bm-card-title">Daily Check-In</div>
            <div className="bm-sub-label">How are you feeling?</div>
            <div className="feeling-options">
              {['Low', 'Tired', 'Okay', 'Good', 'Great'].map((opt) => (
                <label key={opt} className="feeling-option">
                  <input
                    type="radio"
                    name="feeling"
                    value={opt}
                    checked={data.checkin.feeling === opt}
                    onChange={(e) => setData({ ...data, checkin: { ...data.checkin, feeling: e.target.value } })}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className="bm-sub-label" style={{ marginTop: 22 }}>Stress Level</div>
            <input
              type="range"
              min="0"
              max="100"
              value={data.checkin.stressLevel}
              onChange={(e) => setData({ ...data, checkin: { ...data.checkin, stressLevel: Number(e.target.value) } })}
              className="stress-slider"
            />
          </div>

          <button
            className="pill solid"
            style={{ textTransform: 'uppercase', fontSize: 13, padding: '10px 20px', alignSelf: 'flex-start', marginTop: 14 }}
            onClick={handleSaveCheckin}
          >
            Save · +5 pts
          </button>
        </div>

        {/* This Week Card */}
        <div className="bm-card">
          <div>
            <div className="bm-card-title">This Week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
              {data.bodyWeekly.map((item) => (
                <div key={item.id} className="barwrap" style={{ margin: 0 }}>
                  <div className="barlabel">
                    <span>{item.label}</span>
                    <span>{item.current} / {item.target}</span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {data.bodyWeekly[0]?.tip && (
              <p className="muted" style={{ marginTop: 16 }}>{data.bodyWeekly[0].tip}</p>
            )}
          </div>
        </div>

        {/* Need to Talk Card */}
        <div className="bm-card">
          <div>
            <div className="bm-card-title">Need to Talk?</div>
            <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
              {data.support.text}
            </p>
          </div>
          <button
            className="pill solid"
            style={{ textTransform: 'uppercase', fontSize: 13, padding: '10px 20px', alignSelf: 'flex-start', marginTop: 20 }}
            onClick={handleContactSupport}
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* --- MONEY SECTION --- */}
      <h2 className="bm-section-title">Money</h2>

      <div className="bm-grid-2" style={{ marginBottom: 24 }}>
        {/* Monthly Budget Card */}
        <div className="bm-card">
          <div className="bm-card-title">Monthly Budget</div>
          <div className="big" style={{ fontSize: '32px', margin: '4px 0 16px' }}>
            {data.money.monthlyLeft} LEFT
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.money.breakdown.map((row) => (
              <div key={row.id} className="budget-row">
                <div className="budget-row-head">
                  <span>{row.label}</span>
                  <span className="budget-amount">{row.amount}</span>
                </div>
                <div className="bar" style={{ margin: '4px 0 0' }}>
                  <i style={{ width: `${row.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Up Card */}
        <div className="bm-card">
          <div className="bm-card-title" style={{ marginBottom: 18 }}>Coming Up</div>
          <div className="coming-list">
            {data.money.comingUp.map((bill) => (
              <div key={bill.id} className="coming-item">
                <span>{bill.name}</span>
                <span className="coming-date">{bill.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Work vs Study Card */}
      <Card style={{ padding: '24px 30px' }}>
        <div className="bm-card-title" style={{ marginBottom: 8 }}>Work vs Study</div>
        <p className="muted" style={{ marginBottom: 18, lineHeight: 1.6 }}>
          {data.money.workVsStudy}
        </p>
        <button
          className="pill solid"
          style={{ textTransform: 'uppercase', fontSize: 13, padding: '10px 20px' }}
          onClick={handleAdjustWorkHours}
        >
          Adjust work hours
        </button>
      </Card>
    </>
  );
}