import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const INITIAL_PORTAL_DATA = {
  stats: {
    studentsUsing: '[N]',
    officialAnswers: '[N]',
    topStuckTopic: '[TOPIC]',
  },
  modulesContent: [
    { id: 'm1', name: '[MODULE A]', stats: 'Past papers: [N] · Slides: [N]', status: 'LIVE' },
    { id: 'm2', name: '[MODULE B]', stats: 'Past papers: [N] · Slides: [N]', status: 'IN REVIEW' },
    { id: 'm3', name: '[MODULE C]', stats: 'Past papers: [N] · Slides: [N]', status: 'DRAFT' },
  ],
  assistant: {
    name: '[[DEPARTMENT] Study Buddy]',
    tone: 'Encouraging',
    guideOnly: true,
    hintsAfterDue: false,
    citeSources: true,
    flagLowConfidence: true,
    switchGuideOnlyDuringExams: true,
  },
  insights: [
    { id: 'i1', topic: '[TOPIC A] - weak', percent: 45 },
    { id: 'i2', topic: '[TOPIC B]', percent: 30 },
    { id: 'i3', topic: '[TOPIC C] - strong', percent: 12 },
  ],
  plans: [
    { id: 'p1', name: 'PILOT', desc: '1 department · up to [N] modules', price: '[PRICE]' },
    { id: 'p2', name: 'FACULTY', desc: 'All departments · branded assistant · insights', price: '[PRICE]' },
    { id: 'p3', name: 'UNIVERSITY-WIDE', desc: 'Everything · single sign-on · early-support alerts', price: '[PRICE]' },
  ],
};

export default function DepartmentPortal() {
  const [data, setData] = useState(INITIAL_PORTAL_DATA);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [assignModule, setAssignModule] = useState('[MODULE A]');
  const [contentType, setContentType] = useState('Past paper');
  const [visibility, setVisibility] = useState('Always');

  useEffect(() => {
    api.get('/department-portal')
      .then((d) => {
        if (d) setData((prev) => ({ ...prev, ...d }));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleUploadMaterial() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/department-portal/upload', { assignModule, contentType, visibility });
      setMessage(res?.message || 'Official material uploaded successfully and queued for processing.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handlePublishAssistant() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/department-portal/publish', data.assistant);
      setMessage(res?.message || 'Branded Assistant successfully published to students!');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRequestPilot() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/department-portal/pilot-request');
      setMessage(res?.message || 'Pilot request submitted successfully. Our team will contact your department.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Department Portal</h1>
      <p className="page-sub">
        Bring your department&apos;s official content into Study Lab, with a branded assistant for your modules. [DEPARTMENT] · [UNIVERSITY]
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      {/* Top 3 Stats Summary Cards */}
      <div className="dp-top-stats">
        <div className="dp-stat-card">
          <div className="dp-stat-kicker">SAMPLE · THIS MONTH</div>
          <div className="dp-stat-value">{data.stats.studentsUsing} STUDENTS USING [DEPARTMENT]&apos;S ASSISTANT</div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-kicker">SAMPLE</div>
          <div className="dp-stat-value">{data.stats.officialAnswers} ANSWERS BACKED BY OFFICIAL MATERIAL</div>
        </div>
        <div className="dp-stat-card">
          <div className="dp-stat-kicker">SAMPLE</div>
          <div className="dp-stat-value">{data.stats.topStuckTopic} MOST COMMON SPOT STUDENTS GET STUCK</div>
        </div>
      </div>

      {/* Main 2-Column Grid: Module Content & Your Assistant */}
      <div className="dp-grid-2">
        {/* Module Content */}
        <div>
          <h2 className="dp-section-title">Module <span style={{ fontWeight: 300 }}>Content</span></h2>
          <Card>
            <div className="dp-dropzone">
              <div style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 8 }}>
                UPLOAD OFFICIAL MATERIAL
              </div>
              <p className="dp-dropzone-text">
                Past papers, marking schemes, lecture slides, reading lists and assignment briefs (PDF, PPT, DOC).
              </p>
              <button className="pill solid" onClick={handleUploadMaterial} style={{ fontSize: '12px', padding: '10px 24px' }}>
                Choose files
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: 16 }}>
              <div>
                <label className="field" htmlFor="assign-mod">Assign to module</label>
                <select id="assign-mod" value={assignModule} onChange={(e) => setAssignModule(e.target.value)}>
                  <option value="[MODULE A]">[MODULE A]</option>
                  <option value="[MODULE B]">[MODULE B]</option>
                  <option value="[MODULE C]">[MODULE C]</option>
                </select>
              </div>
              <div>
                <label className="field" htmlFor="content-tp">Content type</label>
                <select id="content-tp" value={contentType} onChange={(e) => setContentType(e.target.value)}>
                  <option value="Past paper">Past paper</option>
                  <option value="Marking scheme">Marking scheme</option>
                  <option value="Lecture slides">Lecture slides</option>
                  <option value="Reading list">Reading list</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="field" style={{ marginBottom: 6 }}>When students see past papers</label>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>
                {['Always', 'After exam season', 'Staff approve each'].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paperVisibility"
                      checked={visibility === opt}
                      onChange={() => setVisibility(opt)}
                      style={{ accentColor: 'var(--blue)' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.modulesContent.map((mod) => (
                <div key={mod.id} className="dp-module-row">
                  <div className="dp-module-info">
                    <h4>{mod.name}</h4>
                    <div className="dp-module-sub">{mod.stats}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={`dp-status-badge ${mod.status.toLowerCase().replace(' ', '')}`}>
                      · {mod.status}
                    </span>
                    <button className="pill small" onClick={() => setMessage(`Managing module ${mod.name}`)}>
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Your Assistant Publisher */}
        <div>
          <h2 className="dp-section-title">Your <span style={{ fontWeight: 300 }}>Assistant</span></h2>
          <Card>
            <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '14px 16px', marginBottom: 16, fontSize: '13px', color: 'var(--navy)', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 900, marginBottom: 4 }}>[[ASSISTANT NAME] · [DEPARTMENT]]</div>
              Hi! I can help with [MODULE A]. Scan a question or ask me about the lecture.
            </div>

            <label className="field" htmlFor="asst-name">Assistant Name</label>
            <input
              id="asst-name"
              type="text"
              value={data.assistant.name}
              onChange={(e) => setData({ ...data, assistant: { ...data.assistant, name: e.target.value } })}
              style={{ marginBottom: 14 }}
            />

            <label className="field">Logo and colours</label>
            <div style={{ marginBottom: 16 }}>
              <button className="pill" onClick={() => setMessage('Logo uploader opened.')} style={{ fontSize: '12px', padding: '10px 20px' }}>
                Upload logo
              </button>
            </div>

            <label className="field" htmlFor="asst-tone">Tone</label>
            <select
              id="asst-tone"
              value={data.assistant.tone}
              onChange={(e) => setData({ ...data, assistant: { ...data.assistant, tone: e.target.value } })}
              style={{ marginBottom: 16 }}
            >
              <option value="Encouraging">Encouraging</option>
              <option value="Direct">Direct</option>
              <option value="Socratic">Socratic</option>
            </select>

            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 8 }}>
              Answer Style
            </div>

            <div className="check" style={{ borderTop: 'none', padding: '6px 0' }}>
              <input
                type="radio"
                name="ansStyle"
                checked={data.assistant.guideOnly}
                onChange={() => setData({ ...data, assistant: { ...data.assistant, guideOnly: true } })}
              />
              <label>Guide only: hints and method</label>
            </div>
            <div className="check" style={{ padding: '6px 0', marginBottom: 12 }}>
              <input
                type="radio"
                name="ansStyle"
                checked={!data.assistant.guideOnly}
                onChange={() => setData({ ...data, assistant: { ...data.assistant, guideOnly: false } })}
              />
              <label>Hints now, full solutions after the due date</label>
            </div>

            <div className="check" style={{ padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={data.assistant.citeSources}
                onChange={(e) => setData({ ...data, assistant: { ...data.assistant, citeSources: e.target.checked } })}
              />
              <label>Cite official sources in every answer</label>
            </div>
            <div className="check" style={{ padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={data.assistant.flagLowConfidence}
                onChange={(e) => setData({ ...data, assistant: { ...data.assistant, flagLowConfidence: e.target.checked } })}
              />
              <label>Flag low-confidence answers to staff</label>
            </div>
            <div className="check" style={{ padding: '6px 0', marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={data.assistant.switchGuideOnlyDuringExams}
                onChange={(e) => setData({ ...data, assistant: { ...data.assistant, switchGuideOnlyDuringExams: e.target.checked } })}
              />
              <label>Switch to guide-only during assessments</label>
            </div>

            <button
              className="pill solid"
              style={{ width: '100%', textAlign: 'center', textTransform: 'uppercase', fontSize: 13, padding: '12px' }}
              onClick={handlePublishAssistant}
            >
              Publish to students
            </button>
          </Card>
        </div>
      </div>

      {/* Bottom 2-Column Section: Student Insights & Department Plans */}
      <div className="dp-grid-2" style={{ marginBottom: 40 }}>
        {/* Student Insights */}
        <div>
          <h2 className="dp-section-title">Student <span style={{ fontWeight: 300 }}>Insights</span></h2>
          <Card>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 14 }}>
              ANONYMOUS · AGGREGATED · GROUPS OF 10 OR MORE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              {data.insights.map((ins) => (
                <div key={ins.id} className="barwrap" style={{ margin: 0 }}>
                  <div className="barlabel">
                    <span>{ins.topic}</span>
                    <span>{ins.percent}% struggling</span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${ins.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="muted" style={{ fontSize: '12px', lineHeight: 1.6 }}>
              Use this to adjust lectures and tutorials before the exam. No individual student is identified.
            </p>
          </Card>
        </div>

        {/* Department Plans */}
        <div>
          <h2 className="dp-section-title">Department <span style={{ fontWeight: 300 }}>Plans</span></h2>
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 50px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.plans.map((pl) => (
                <div key={pl.id} className="dp-plan-row">
                  <div className="dp-plan-info">
                    <h4>{pl.name}</h4>
                    <div className="dp-plan-sub">{pl.desc}</div>
                  </div>
                  <div className="dp-plan-price">{pl.price}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                className="pill solid"
                style={{ width: '100%', textAlign: 'center', textTransform: 'uppercase', fontSize: 13, padding: '12px' }}
                onClick={handleRequestPilot}
              >
                Request a pilot
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}