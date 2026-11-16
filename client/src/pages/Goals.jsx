import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const DEFAULT_GOALS = {
  study: [
    { id: 's1', title: 'Study 12 hours this week', current: 8, target: 12, unit: 'HOURS', pts: 50, trend: null },
    { id: 's2', title: 'Attend every class', current: 11, target: 12, unit: 'OF 12', pts: 40, trend: null },
    { id: 's3', title: 'Reach 75% average by [DATE]', current: 74, target: 75, unit: 'NOW', pts: 100, trend: '▼ DECLINING', declining: true },
  ],
  health: [
    { id: 'h1', title: 'Sleep 7.5h, 5 nights', current: 2, target: 5, unit: 'NIGHTS', pts: 40, trend: null },
    { id: 'h2', title: 'Train 3 times', current: 1, target: 3, unit: 'OF 3', pts: 45, trend: null },
    { id: 'h3', title: 'Daily check-in streak', current: 9, target: 10, unit: 'DAYS', pts: 30, trend: '▲ PEAK', peak: true },
  ],
  finance: [
    { id: 'f1', title: 'Stay within weekly budget', current: 1, target: 1, unit: 'LEFT', pts: 25 },
    { id: 'f2', title: 'Save [AMOUNT] by [DATE]', current: 40, target: 100, unit: 'DONE', pts: 60 },
    { id: 'f3', title: 'Log every expense', current: 6, target: 7, unit: 'DAYS', pts: 20 },
  ],
  templates: [
    { id: 't1', name: 'Exam season: study + sleep + budget' },
    { id: 't2', name: 'Fresh start: build 3 habits' },
    { id: 't3', name: 'Money reset: bills, savings, spending' },
  ],
  balanceWarning: 'WARNING · STUDY GOAL + SLEEP GOAL CONFLICT ON WEDNESDAY',
  balanceDescription: "Goals compete for the same hours. Your coach checks that study goals aren't eating your sleep, and that work hours still leave room for class.",
};

export default function Goals() {
  const [data, setData] = useState(DEFAULT_GOALS);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/goals')
      .then((d) => {
        if (d) setData((prev) => ({ ...prev, ...d }));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleAddGoal(category) {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/goals/add', { category });
      setMessage(res?.message || `New ${category} goal added successfully!`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddTemplate(templateId) {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/goals/template', { templateId });
      setMessage(res?.message || 'Template goals added successfully!');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleResolveConflict() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/goals/resolve-conflict');
      setMessage(res?.message || 'Conflict resolved in calendar.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Goals</h1>
      <p className="page-sub">
        Study, health and money goals in one place, balanced so none of them starves the others.
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      {/* Main 3-Column Goals Grid */}
      <div className="goals-main-grid">
        {/* STUDY */}
        <div className="goal-column">
          <div className="goal-column-title">STUDY</div>
          <Card className="goal-card-flex">
            <div>
              {data.study.map((goal) => {
                const pct = Math.min(100, Math.max(0, Math.round((goal.current / goal.target) * 100)));
                return (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header-row">
                      <span className="goal-title">{goal.title}</span>
                      <span className="goal-pts">+{goal.pts} PTS</span>
                    </div>
                    <div className="goal-stats-row">
                      <span>{goal.current} OF {goal.target} {goal.unit.replace('OF ', '')}</span>
                      {goal.trend && (
                        <span className={`goal-status-trend ${goal.declining ? 'declining' : ''}`}>
                          {goal.trend}
                        </span>
                      )}
                    </div>
                    <div className="goal-track">
                      <div className="goal-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="pill add-goal-btn" onClick={() => handleAddGoal('study')}>
              + Add goal
            </button>
          </Card>
        </div>

        {/* HEALTH */}
        <div className="goal-column">
          <div className="goal-column-title">HEALTH</div>
          <Card className="goal-card-flex">
            <div>
              {data.health.map((goal) => {
                const pct = Math.min(100, Math.max(0, Math.round((goal.current / goal.target) * 100)));
                return (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header-row">
                      <span className="goal-title">{goal.title}</span>
                      <span className="goal-pts">+{goal.pts} PTS</span>
                    </div>
                    <div className="goal-stats-row">
                      <span>{goal.current} OF {goal.target} {goal.unit}</span>
                      {goal.trend && (
                        <span className="goal-status-trend" style={{ color: goal.peak ? '#108552' : 'inherit' }}>
                          {goal.trend}
                        </span>
                      )}
                    </div>
                    <div className="goal-track">
                      <div className="goal-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="pill add-goal-btn" onClick={() => handleAddGoal('health')}>
              + Add goal
            </button>
          </Card>
        </div>

        {/* FINANCE */}
        <div className="goal-column">
          <div className="goal-column-title">FINANCE</div>
          <Card className="goal-card-flex">
            <div>
              {data.finance.map((goal, idx) => {
                const pct = Math.min(100, Math.max(0, Math.round((goal.current / goal.target) * 100)));
                return (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header-row">
                      <span className="goal-title">{goal.title}</span>
                      <span className="goal-pts">+{goal.pts} PTS</span>
                    </div>
                    <div className="goal-stats-row">
                      <span>{idx === 0 ? '[AMOUNT] LEFT' : idx === 1 ? '40% DONE' : '6 OF 7 DAYS'}</span>
                    </div>
                    <div className="goal-track">
                      <div className="goal-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="pill add-goal-btn" onClick={() => handleAddGoal('finance')}>
              + Add goal
            </button>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Templates & Balance Check */}
      <div className="goals-bottom-grid">
        {/* Start from a template */}
        <div>
          <h2 className="split-heading">
            <span>START FROM</span> <strong>A TEMPLATE</strong>
          </h2>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <ul className="template-list">
              {data.templates.map((tpl) => (
                <li key={tpl.id} className="template-item">
                  <span>{tpl.name}</span>
                  <button className="add-link-btn" onClick={() => handleAddTemplate(tpl.id)}>
                    ADD
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Balance Check */}
        <div>
          <h2 className="split-heading">
            <span>BALANCE</span> <strong>CHECK</strong>
          </h2>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p className="balance-desc">{data.balanceDescription}</p>
              <div className="balance-warning">{data.balanceWarning}</div>
            </div>
            <button
              className="pill solid"
              style={{ textTransform: 'uppercase', fontSize: 13, padding: '11px 22px', alignSelf: 'flex-start' }}
              onClick={handleResolveConflict}
            >
              Resolve in calendar
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}