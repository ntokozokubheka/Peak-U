import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const INITIAL_SETUP = {
  stepsDone: 1,
  totalSteps: 3,
  calendarSummary: 'Found: 5 classes · 2 exams · 1 work shift',
  calendarVerified: true,
  sleepTarget: '7.5h',
  trainingDays: '3',
  budgetSummary: 'Income [AMOUNT] · Budget auto-split',
  reminders: {
    weeklyReset: true,
    monthlyMoney: true,
  },
};

export default function QuickSetup() {
  const [setup, setSetup] = useState(INITIAL_SETUP);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/quick-setup')
      .then((d) => {
        if (d) setSetup((prev) => ({ ...prev, ...d }));
      })
      .catch((e) => setError(e.message));
  }, []);

  const progressPct = Math.round((setup.stepsDone / setup.totalSteps) * 100);

  async function triggerAction(endpoint, fallbackMsg, stepIncrement = false) {
    setError('');
    setMessage('');
    try {
      const res = await api.post(endpoint, setup);
      setMessage(res?.message || fallbackMsg);
      if (stepIncrement && setup.stepsDone < setup.totalSteps) {
        setSetup((prev) => ({ ...prev, stepsDone: prev.stepsDone + 1 }));
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleFinish() {
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await api.post('/quick-setup/finish', setup);
      setSetup((prev) => ({ ...prev, stepsDone: prev.totalSteps }));
      setMessage(res?.message || 'Setup complete! +30 PTS added to your form score.');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Quick Setup</h1>
      <p className="page-sub">
        Calendar, health and money in about a minute. Pre-filled, scan-first, no forms.
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      {/* Top Progress Banner Card */}
      <Card className="qs-banner-card">
        <div style={{ flex: '1 1 380px' }}>
          <h2 className="qs-banner-title">3 STEPS · ABOUT 60 SECONDS</h2>
          <p className="muted">
            Weekly reset on Sunday evening. Money once a month. Everything is pre-filled; you only confirm or tweak.
          </p>
        </div>

        <div style={{ flex: '1 1 260px' }}>
          <div className="barwrap" style={{ margin: 0 }}>
            <div className="barlabel">
              <span>SETUP PROGRESS</span>
              <span>{setup.stepsDone} OF {setup.totalSteps} DONE</span>
            </div>
            <div className="bar">
              <i style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* 3 Steps Grid */}
      <div className="qs-steps-grid">
        {/* STEP 1: CALENDAR */}
        <Card className="qs-step-card">
          <div>
            <div className="qs-step-kicker">STEP 1 · ~20 SEC · WEEKLY</div>
            <div className="qs-step-title">CALENDAR</div>
            <p className="muted">Photo of your timetable, or sync it. No typing.</p>

            <div className="qs-btn-stack">
              <button
                className="pill solid"
                onClick={() => triggerAction('/quick-setup/scan-timetable', 'Timetable scanner ready.')}
              >
                Scan timetable
              </button>
              <button
                className="pill"
                onClick={() => triggerAction('/quick-setup/sync-calendar', 'Google / Outlook calendar synced.')}
              >
                Sync Google / Outlook
              </button>
              <button
                className="pill"
                onClick={() => triggerAction('/quick-setup/repeat-week', 'Last week schedule repeated.')}
              >
                Repeat last week
              </button>
            </div>
          </div>

          <div className="qs-step-footer">
            <span>{setup.calendarSummary}</span>
            {setup.calendarVerified && <span className="qs-ok-badge">✓ OK</span>}
          </div>
        </Card>

        {/* STEP 2: HEALTH */}
        <Card className="qs-step-card">
          <div>
            <div className="qs-step-kicker">STEP 2 · ~15 SEC · WEEKLY</div>
            <div className="qs-step-title">HEALTH</div>

            <div className="qs-group-label">SLEEP TARGET</div>
            <div className="qs-radio-row">
              {['7h', '7.5h', '8h'].map((val) => (
                <label
                  key={val}
                  className={`qs-radio-box ${setup.sleepTarget === val ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="sleepTarget"
                    value={val}
                    checked={setup.sleepTarget === val}
                    onChange={(e) => setSetup({ ...setup, sleepTarget: e.target.value })}
                  />
                  {val}
                </label>
              ))}
            </div>

            <div className="qs-group-label">TRAINING DAYS</div>
            <div className="qs-radio-row">
              {['1', '2', '3', '4+'].map((val) => (
                <label
                  key={val}
                  className={`qs-radio-box ${setup.trainingDays === val ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="trainingDays"
                    value={val}
                    checked={setup.trainingDays === val}
                    onChange={(e) => setSetup({ ...setup, trainingDays: e.target.value })}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>

          <div className="qs-btn-stack" style={{ marginBottom: 0 }}>
            <button
              className="pill"
              onClick={() => triggerAction('/quick-setup/sync-health', 'Watch / Phone Health synced.', true)}
            >
              Sync Watch / Phone Health
            </button>
          </div>
        </Card>

        {/* STEP 3: MONEY */}
        <Card className="qs-step-card">
          <div>
            <div className="qs-step-kicker">STEP 3 · ~25 SEC · MONTHLY</div>
            <div className="qs-step-title">MONEY</div>
            <p className="muted">Same as last month? One tap. Receipts by photo.</p>

            <div className="qs-btn-stack">
              <button
                className="pill solid"
                onClick={() => triggerAction('/quick-setup/last-budget', 'Last month’s budget applied.', true)}
              >
                Use last month&apos;s budget
              </button>
              <button
                className="pill"
                onClick={() => triggerAction('/quick-setup/scan-receipt', 'Receipt scanner opened.')}
              >
                Scan a receipt
              </button>
              <button
                className="pill"
                onClick={() => triggerAction('/quick-setup/connect-bank', 'Bank connection started.')}
              >
                Connect bank (optional)
              </button>
            </div>
          </div>

          <div className="qs-step-footer">
            <span>{setup.budgetSummary}</span>
            <button
              className="qs-review-btn"
              onClick={() => triggerAction('/quick-setup/review-budget', 'Opening budget breakdown...')}
            >
              REVIEW
            </button>
          </div>
        </Card>
      </div>

      {/* Bottom 2-Column Section */}
      <div className="qs-bottom-grid">
        {/* Then Peak Does The Rest */}
        <Card>
          <div className="qs-step-title" style={{ marginBottom: 10 }}>THEN PEAK DOES THE REST</div>
          <ul className="qs-auto-list">
            <li className="qs-auto-item">
              <span>Builds your optimized week</span>
              <span className="qs-auto-tag">AUTO</span>
            </li>
            <li className="qs-auto-item">
              <span>Sets health and money goals</span>
              <span className="qs-auto-tag">AUTO</span>
            </li>
            <li className="qs-auto-item">
              <span>Nudges you only when something slips</span>
              <span className="qs-auto-tag">AUTO</span>
            </li>
          </ul>
        </Card>

        {/* Reminders */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="qs-step-title" style={{ marginBottom: 10 }}>REMINDERS</div>
            <div className="check" style={{ borderTop: 'none', padding: '6px 0' }}>
              <input
                id="rem-weekly"
                type="checkbox"
                checked={setup.reminders.weeklyReset}
                onChange={(e) =>
                  setSetup({
                    ...setup,
                    reminders: { ...setup.reminders, weeklyReset: e.target.checked },
                  })
                }
              />
              <label htmlFor="rem-weekly">Weekly reset: Sunday 18:00</label>
            </div>

            <div className="check" style={{ borderTop: 'none', padding: '6px 0' }}>
              <input
                id="rem-monthly"
                type="checkbox"
                checked={setup.reminders.monthlyMoney}
                onChange={(e) =>
                  setSetup({
                    ...setup,
                    reminders: { ...setup.reminders, monthlyMoney: e.target.checked },
                  })
                }
              />
              <label htmlFor="rem-monthly">Monthly money: 1st of the month</label>
            </div>
          </div>

          <button
            className="pill solid"
            style={{ alignSelf: 'flex-start', marginTop: 16, textTransform: 'uppercase', fontSize: 13, padding: '10px 22px' }}
            onClick={handleFinish}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Finish · +30 pts'}
          </button>
        </Card>
      </div>
    </>
  );
}