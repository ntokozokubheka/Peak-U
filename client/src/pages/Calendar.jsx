import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const INITIAL_CALENDAR_DATA = {
  days: {
    mon: [
      { id: 'm1', time: '8:00 Class', title: '[COURSE A]', type: 'class' },
      { id: 'm2', time: '11:00 Study', title: 'Deep work', type: 'study', sub: '11:00 Study' },
      { id: 'm3', time: '15:00 Recovery', title: 'Walk + lunch', type: 'recovery' },
    ],
    tue: [
      { id: 'tu1', time: '9:00 Class', title: '[COURSE B]', type: 'class' },
      { id: 'tu2', time: '13:00 Study', title: 'Problem sets', type: 'study' },
      { id: 'tu3', time: '17:00 Training', title: 'Gym or sport', type: 'study' },
    ],
    wed: [
      { id: 'w1', time: '8:00 Class', title: '[COURSE A]', type: 'class' },
      { id: 'w2', time: '10:30 Suggested', title: 'Moved study block', type: 'suggested' },
      { id: 'w3', time: '20:00 Wind down', title: 'Screens off 22:30', type: 'recovery' },
    ],
    thu: [
      { id: 'th1', time: '9:00 Class', title: '[COURSE B]', type: 'class' },
      { id: 'th2', time: '14:00 Study Lab', title: 'Assignment 3 prep', type: 'study' },
      { id: 'th3', time: '18:00 Meal prep', title: 'Rest', type: 'recovery' },
    ],
    fri: [
      { id: 'f1', time: '10:00 Class', title: '[COURSE C]', type: 'class' },
      { id: 'f2', time: '14:00 Film room', title: 'Review last quiz', type: 'study' },
      { id: 'f3', time: '17:00 Social', title: 'Protected', type: 'recovery' },
    ],
  },
  optimizer: {
    protectSleep: true,
    protectMeals: true,
    protectEvening: true,
    peakFocusTime: 'Morning',
  },
  conflicts: [
    { id: 'c1', text: 'Study ends after sleep time' },
    { id: 'c2', text: 'Work shift clashes with class' },
  ],
  countdowns: [
    { id: 'cd1', title: '[COURSE B] midterm', days: 5 },
    { id: 'cd2', title: 'Assignment 3 due', days: 3 },
  ],
};

export default function CalendarPage() {
  const [data, setData] = useState(INITIAL_CALENDAR_DATA);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/calendar/schedule')
      .then((d) => {
        if (d) setData((prev) => ({ ...prev, ...d }));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleReoptimize() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/calendar/reoptimize', { settings: data.optimizer });
      setMessage(res?.message || 'Calendar successfully re-optimized around your classes and recovery.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleFixConflict(conflictId) {
    setError('');
    setMessage('');
    try {
      const res = await api.post(`/calendar/conflicts/${conflictId}/resolve`);
      setMessage(res?.message || 'Conflict resolved successfully.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Calendar</h1>
      <p className="page-sub">
        A week built around your classes, your energy and your recovery. The coach re-optimizes when your form changes.
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      <div className="calendar-layout">
        {/* Main Weekly Schedule Grid */}
        <div className="cal-grid-view">
          <div className="legend-row">
            <div className="legend-item"><span className="legend-dot class" /> CLASS</div>
            <div className="legend-item"><span className="legend-dot study" /> STUDY / TRAINING</div>
          </div>

          <div className="days-grid">
            {Object.entries(data.days).map(([dayKey, events]) => (
              <div key={dayKey} className="day-column">
                <div className="day-header">{dayKey}</div>
                {events.map((ev) => (
                  <div key={ev.id} className={`cal-event-card ${ev.type}`}>
                    <div className="cal-time">{ev.time}</div>
                    <div className="cal-title">{ev.title}</div>
                    {ev.sub && <div className="cal-sub">{ev.sub}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Optimizer, Conflicts, Countdowns */}
        <div className="calendar-sidebar">
          {/* Optimizer Card */}
          <Card>
            <div className="sidebar-section-title">OPTIMIZER</div>
            <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 10, color: 'var(--navy)' }}>PROTECT</div>
            
            <div className="check" style={{ borderTop: 'none', padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={data.optimizer.protectSleep}
                onChange={(e) => setData({ ...data, optimizer: { ...data.optimizer, protectSleep: e.target.checked } })}
              />
              <label>Sleep: 22:30 to 06:30</label>
            </div>

            <div className="check" style={{ padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={data.optimizer.protectMeals}
                onChange={(e) => setData({ ...data, optimizer: { ...data.optimizer, protectMeals: e.target.checked } })}
              />
              <label>Meals and breaks</label>
            </div>

            <div className="check" style={{ padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={data.optimizer.protectEvening}
                onChange={(e) => setData({ ...data, optimizer: { ...data.optimizer, protectEvening: e.target.checked } })}
              />
              <label>One free evening</label>
            </div>

            <label className="field" style={{ marginTop: 16 }}>PEAK FOCUS TIME</label>
            <select
              value={data.optimizer.peakFocusTime}
              onChange={(e) => setData({ ...data, optimizer: { ...data.optimizer, peakFocusTime: e.target.value } })}
              style={{ marginBottom: 16 }}
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>

            <button
              className="pill solid"
              style={{ width: '100%', textAlign: 'center', textTransform: 'uppercase', fontSize: 13, padding: '12px' }}
              onClick={handleReoptimize}
            >
              Re-optimize week
            </button>
          </Card>

          {/* Conflicts Card */}
          <Card>
            <div className="sidebar-section-title">CONFLICTS · {data.conflicts.length}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.conflicts.map((con) => (
                <div key={con.id} className="conflict-row">
                  <span>{con.text}</span>
                  <button className="conflict-fix-btn" onClick={() => handleFixConflict(con.id)}>
                    FIX
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Countdown Card */}
          <Card>
            <div className="sidebar-section-title">COUNTDOWN</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.countdowns.map((cd) => (
                <div key={cd.id} className="countdown-row">
                  <span>{cd.title}</span>
                  <span className="countdown-days">[{cd.days}] DAYS</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}