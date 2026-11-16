import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

// Phone photos are big. Shrink to 1600px JPEG in the browser before sending.
function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = img.width * scale; c.height = img.height * scale;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const url = c.toDataURL('image/jpeg', 0.85);
      resolve({ preview: url, mediaType: 'image/jpeg', base64: url.split(',')[1] });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const TYPES = [['', 'Detect it for me'], ['maths', 'Mathematics'], ['physics', 'Physics and sciences'], ['lab', 'Lab practical'], ['writing', 'Research and writing'], ['coding', 'Coding']];

const TABS = [
  { id: 'scan', label: '1. Scan & Breakdown' },
  { id: 'prompts', label: '2. Smart Search Prompts' },
  { id: 'community', label: '3. How Other Students Got There' },
  { id: 'paper', label: '4. Past Paper Generator' },
  { id: 'playbook', label: '5. Coach AI Playbook' },
];

export default function StudyLab() {
  const [activeTab, setActiveTab] = useState('paper');
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [taskType, setTaskType] = useState('');
  const [helpMode, setHelpMode] = useState('hints');
  const [attempt, setAttempt] = useState('');
  const [result, setResult] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [difficulty, setDifficulty] = useState('same');
  const [showAnswer, setShowAnswer] = useState(false);
  const [modules, setModules] = useState([]);
  const [moduleName, setModuleName] = useState('');
  const [lengthHours, setLengthHours] = useState('2');
  const [paper, setPaper] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  
  // Interactive preview state for Playbook action demo
  const [actionInput, setActionInput] = useState('');
  const [actionSubmitted, setActionSubmitted] = useState(false);

  // Playbook 6th card (Similar Problem) local state
  const [playbookDiff, setPlaybookDiff] = useState('same');
  const [playbookHintShown, setPlaybookHintShown] = useState(false);
  const [playbookAnswerShown, setPlaybookAnswerShown] = useState(false);

  useEffect(() => { 
    api.get('/study/modules')
      .then((d) => { setModules(d.modules); setModuleName(d.modules[0]?.name || '[COURSE B]'); })
      .catch(() => {
        setModules([{ id: 1, name: '[COURSE B]' }, { id: 2, name: '[COURSE A]' }]);
        setModuleName('[COURSE B]');
      }); 
  }, []);

  async function run(kind, fn) {
    setError(''); setBusy(kind);
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  const onFile = (e) => { const f = e.target.files[0]; if (f) shrink(f).then(setImage).catch(() => setError('Could not read that image')); };

  const scan = () => run('scan', async () => {
    setSimilar(null); setShowAnswer(false);
    const res = await api.post('/study/scan', { imageBase64: image?.base64, mediaType: image?.mediaType, text, taskType, helpMode: helpMode === 'check' ? 'check' : 'hints', attempt });
    setResult(res);
  });
  
  const makeSimilar = () => run('similar', async () => {
    setShowAnswer(false);
    setSimilar(await api.post('/study/similar', { topic: result?.topic || 'algebra', taskType: result?.taskType || 'maths', difficulty }));
  });

  const makePaper = () => run('paper', async () => { 
    setShowGuide(false); 
    const res = await api.post('/study/paper', { moduleName, minutes: Number(lengthHours) * 60 }); 
    setPaper(res);
  });

  return (
    <>
      <h1 className="page-title">Study Lab</h1>
      <p className="page-sub">Scan a problem. Your coach teaches the method, asks the right question and sets a drill. It never writes your work for you.</p>
      
      {/* Sub-section Navigation Links */}
      <div className="study-subnav" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '20px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '12px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`pill ${activeTab === tab.id ? 'solid' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ErrorNote error={error} />

      {/* TAB 1: SCAN & BREAKDOWN */}
      {activeTab === 'scan' && (
        <div className="grid wide" style={{ alignItems: 'start' }}>
          <Card title="Scan any problem">
            <div className="dropzone">
              <input type="file" accept="image/*" capture="environment" onChange={onFile} aria-label="Take or choose a photo of the problem" />
              {image && <img className="preview" src={image.preview} alt="Your problem" />}
            </div>
            <label className="field" htmlFor="q">Or type the question</label>
            <textarea id="q" rows="3" value={text} onChange={(e) => setText(e.target.value)} />
            <label className="field" htmlFor="tt">Task type</label>
            <select id="tt" value={taskType} onChange={(e) => setTaskType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <label className="field" htmlFor="hm">How much help</label>
            <select id="hm" value={helpMode} onChange={(e) => setHelpMode(e.target.value)}><option value="hints">Guide me: hints first</option><option value="check">Check my working</option></select>
            {helpMode === 'check' && (<><label className="field" htmlFor="at">Your attempt</label><textarea id="at" rows="3" value={attempt} onChange={(e) => setAttempt(e.target.value)} /></>)}
            <p style={{ marginTop: 16 }}><button className="pill solid" onClick={scan} disabled={busy === 'scan' || (!image && !text)}>{busy === 'scan' ? 'Coach is thinking...' : 'Break it down'}</button></p>
          </Card>

          <div className="stack">
            {result ? (
              <Card title={result.topic} tag={`${result.taskType} · ${result.difficulty} · about ${result.estimatedMinutes} min`}>
                {result.demo && <div className="demo">Demo mode: add GEMINI_API_KEY on the server for real coaching.</div>}
                {result.steps?.map((s, i) => <div className="row" key={i} style={{ display: 'block' }}><b>{i + 1}. {s.title}</b><p className="muted">{s.guidance}</p></div>)}
                {result.hints?.map((h, i) => <details key={i} style={{ margin: '8px 0' }}><summary><b>Hint {i + 1}</b></summary><p className="muted">{h}</p></details>)}
                <div className="note"><b>Drill:</b> {result.drill}</div>
                <div className="note"><b>Coach asks:</b> {result.coachQuestion}</div>
                <p className="muted"><b>{result.celebrate}</b></p>
              </Card>
            ) : <Card title="Your breakdown"><p className="muted">Scan or type a problem and the coach&#8217;s steps, hints and drill appear here.</p></Card>}

            {result && (
              <Card title="Similar problem">
                <div className="flex">
                  <div><label className="field" htmlFor="df">Difficulty</label><select id="df" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="easier">Easier</option><option value="same">Same</option><option value="harder">Harder</option></select></div>
                  <div><button className="pill solid" onClick={makeSimilar} disabled={busy === 'similar'}>{busy === 'similar' ? 'Writing...' : 'Generate'}</button></div>
                </div>
                {similar && (<div className="note"><b>Try this:</b> {similar.problem}
                  <details style={{ marginTop: 8 }}><summary>Hint</summary>{similar.hint}</details>
                  {showAnswer ? <p><b>Answer to check against:</b> {similar.answerForSelfCheck}</p> : <p><button className="pill" onClick={() => setShowAnswer(true)}>I&#8217;ve tried it, show the answer</button></p>}
                </div>)}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SMART SEARCH PROMPTS */}
      {activeTab === 'prompts' && (
        <Card title="Smart Search Prompts">
          <p className="muted">Ready-made starter searches derived from your problem, for the 4 core search engines:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
              <code>Find guided proof steps for matrix rank</code>
              <button className="pill" onClick={() => navigator.clipboard.writeText('Find guided proof steps for matrix rank')}>Copy & Search</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
              <code>Why does the null test fail when generalized?</code>
              <button className="pill" onClick={() => navigator.clipboard.writeText('Why does the null test fail when generalized?')}>Copy & Search</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
              <code>Find invariant scalar matrices 2nd level</code>
              <button className="pill" onClick={() => navigator.clipboard.writeText('Find invariant scalar matrices 2nd level')}>Copy & Search</button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: HOW OTHER STUDENTS GOT THERE */}
      {activeTab === 'community' && (
        <Card title="How Other Students Got There">
          <p className="muted">Peer hints and insights that anonymous students found helpful for similar problems:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div className="note">
              <p><b>Anonymous student solved a similar problem week 4</b></p>
              <p className="muted">"I used substitution first to isolate the variable before applying limits."</p>
              <button className="pill" style={{ marginTop: '8px' }}>Helpful (14)</button>
            </div>
            <div className="note">
              <p><b>Top peer approach: Check bounds and initial limits first</b></p>
              <button className="pill" style={{ marginTop: '8px' }}>Helpful (28)</button>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: PAST PAPER GENERATOR */}
      {activeTab === 'paper' && (
        <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.5px' }}>
            PAST PAPER GENERATOR
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
            One click builds a full practice paper in exam format.
          </p>

          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '0.5px', marginBottom: '8px' }} htmlFor="course-select">
            COURSE
          </label>
          <select 
            id="course-select" 
            value={moduleName} 
            onChange={(e) => setModuleName(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #0070f3', backgroundColor: '#fff', fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '20px', cursor: 'pointer' }}
          >
            {modules.map((m) => <option key={m.id || m.name} value={m.name}>{m.name}</option>)}
          </select>

          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '0.5px', marginBottom: '10px' }}>
            LENGTH
          </label>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            {['1', '2', '3'].map((hrs) => (
              <label key={hrs} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                <input 
                  type="radio" 
                  name="paperLength" 
                  value={hrs} 
                  checked={lengthHours === hrs} 
                  onChange={(e) => setLengthHours(e.target.value)}
                  style={{ accentColor: '#0070f3', width: '18px', height: '18px' }}
                />
                {hrs} hour{hrs > 1 ? 's' : ''}
              </label>
            ))}
          </div>

          <button 
            className="pill solid" 
            onClick={makePaper} 
            disabled={busy === 'paper'}
            style={{ width: '100%', backgroundColor: '#0070f3', color: '#fff', fontWeight: 700, padding: '14px', borderRadius: '28px', border: 'none', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px', letterSpacing: '0.5px' }}
          >
            {busy === 'paper' ? 'BUILDING PAPER...' : 'GENERATE PAPER'}
          </button>

          <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '0.95rem' }}>
              {moduleName} · PRACTICE PAPER (SAMPLE)
            </div>
            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
              <div>Section A: short questions - [N] marks</div>
              <div>Section B: problems · [N] marks</div>
              <div>Section C: extended · [N] marks</div>
            </div>
            
            {paper && !paper.demo && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #cbd5e1' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{paper.title} ({paper.durationMinutes} mins)</h4>
                {paper.sections?.map((s, idx) => (
                  <p key={idx} style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>{s.name} - {s.marks} marks</p>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button 
              className="pill solid" 
              onClick={() => alert('Starting timed exam session...')}
              style={{ backgroundColor: '#0070f3', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              START TIMED
            </button>
            <button 
              className="pill" 
              onClick={() => window.print()}
              style={{ backgroundColor: '#fff', color: '#0070f3', border: '2px solid #0070f3', fontWeight: 700, padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              DOWNLOAD PDF
            </button>
            <button 
              className="pill" 
              onClick={() => setShowGuide(!showGuide)}
              style={{ backgroundColor: '#fff', color: '#0070f3', border: '2px solid #0070f3', fontWeight: 700, padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              MARKING SCHEME
            </button>
          </div>

          {showGuide && paper && (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
              <b>Marking Scheme / Guide:</b>
              {paper.markingGuide?.map((g, i) => (
                <p key={i} className="muted">{g.n}. {g.points?.join('; ')}</p>
              ))}
            </div>
          )}

          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
            Built from your syllabus and topics you scored weakest on. Each paper is new.
          </p>
        </Card>
      )}

      {/* TAB 5: COACH AI PLAYBOOK */}
      {activeTab === 'playbook' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            COACH AI <span style={{ color: '#2563eb' }}>PLAYBOOK</span>
          </h2>
          <p className="page-sub" style={{ marginBottom: '24px' }}>
            Your coach adapts to the kind of work you are doing. It is your trainer and sparring partner, never a ghostwriter: no final essays, no full assignment code, no made-up lab data.
          </p>

          {/* Grid of 5 Playbook Sub-cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            {/* 1. Mathematics */}
            <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>STRENGTH AND CONDITIONING</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>MATHEMATICS</div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Problem sets that get harder as you get stronger</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Error Log: algebra slip or concept gap? Then targeted drills</p>
              </div>
            </Card>

            {/* 2. Physics & Sciences */}
            <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>TACTICAL MECHANICS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>PHYSICS AND SCIENCES</div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Map knowns, unknowns and governing laws before any maths</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Free-body diagram and boundary check</p>
              </div>
            </Card>

            {/* 3. Lab Practicals */}
            <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>GAME-DAY EXECUTION</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>LAB PRACTICALS</div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Pre-lab checklist, timing plan and safety micro-quiz</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>In-lab troubleshooting tree when results look wrong</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Post-lab: outliers, systematic vs random error, no masking</p>
              </div>
            </Card>

            {/* 4. Research and Writing */}
            <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>GAME FILM REVIEW</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>RESEARCH AND WRITING</div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Pressure-test your thesis with Socratic questions</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Style and structure audit: you rewrite in your own voice</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Citation check: APA, MLA or Chicago</p>
              </div>
            </Card>

            {/* 5. Coding */}
            <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>SCRIMMAGE AND PAIR PROGRAMMING</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>CODING</div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Pseudo-code and flowchart before syntax</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Socratic debugging: questions, not pasted fixes</p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>Big-O drills once it works</p>
              </div>
            </Card>

            {/* 6. Similar Problem Card (Added as requested) */}
            <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                SIMILAR PROBLEM
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
                One tap gives you a fresh problem on the same skill.
              </p>

              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '0.5px', marginBottom: '8px' }}>
                DIFFICULTY
              </label>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                {['Easier', 'Same', 'Harder'].map((diff) => (
                  <label key={diff} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                    <input 
                      type="radio" 
                      name="similarDifficulty" 
                      value={diff.toLowerCase()} 
                      checked={playbookDiff === diff.toLowerCase()} 
                      onChange={(e) => setPlaybookDiff(e.target.value)}
                      style={{ accentColor: '#0070f3', width: '16px', height: '16px' }}
                    />
                    {diff}
                  </label>
                ))}
              </div>

              <button 
                className="pill solid" 
                onClick={() => alert('Generating similar problem...')}
                style={{ width: '100%', backgroundColor: '#0070f3', color: '#fff', fontWeight: 700, padding: '12px', borderRadius: '24px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '0.5px' }}
              >
                GENERATE SIMILAR PROBLEM
              </button>

              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '14px', marginBottom: '16px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Q (SAMPLE): [new problem on [TOPIC]]
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="pill" 
                    onClick={() => setPlaybookHintShown(!playbookHintShown)}
                    style={{ flex: 1, backgroundColor: '#fff', color: '#0070f3', border: '2px solid #0070f3', fontWeight: 700, padding: '8px', borderRadius: '18px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    SHOW HINT
                  </button>
                  <button 
                    className="pill" 
                    onClick={() => setPlaybookAnswerShown(!playbookAnswerShown)}
                    style={{ flex: 1, backgroundColor: '#fff', color: '#0070f3', border: '2px solid #0070f3', fontWeight: 700, padding: '8px', borderRadius: '18px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    CHECK ANSWER
                  </button>
                </div>
                {playbookHintShown && <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '8px' }}>Hint: Break down the equation into simpler components.</p>}
                {playbookAnswerShown && <p style={{ fontSize: '0.8rem', color: '#059669', marginTop: '8px' }}>Answer: Sample solved solution for verification.</p>}
              </div>
            </Card>

          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            COACH AI <span style={{ color: '#2563eb' }}>IN ACTION</span>
          </h2>

          <Card style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              SAMPLE · CODING SCRIMMAGE
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>You:</span> <span style={{ color: '#334155' }}>My loop crashes with an index error.</span>
            </div>

            <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <span style={{ fontWeight: 700, color: '#2563eb' }}>Coach AI:</span> <span style={{ color: '#334155' }}>Good, that error is a clue. What happens to your array index when the loop hits n-1?</span>
            </div>

            <label className="field" style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px', display: 'block' }} htmlFor="action-ans">YOUR ANSWER</label>
            <textarea 
              id="action-ans" 
              rows="3" 
              value={actionInput} 
              onChange={(e) => setActionInput(e.target.value)} 
              placeholder="Type your response to the coach here..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px' }}
            />

            <button 
              className="pill solid" 
              onClick={() => setActionSubmitted(true)}
              style={{ backgroundColor: '#0070f3', color: '#fff', fontWeight: 600, padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}
            >
              ANSWER THE COACH
            </button>

            {actionSubmitted && (
              <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                Response sent! Good job engaging with the coach.
              </div>
            )}

            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
              <b>Next drill:</b> trace the loop by hand for n = 3. Clean protocol execution gets +10 pts.
            </div>
          </Card>

          <p className="muted" style={{ marginTop: '24px', fontSize: '0.85rem', textAlign: 'center' }}>
            Study Lab teaches the method so you can do the work yourself. Follow your university’s AI policy.
          </p>
        </div>
      )}
    </>
  );
}