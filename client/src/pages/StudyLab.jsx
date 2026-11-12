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

export default function StudyLab() {
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
  const [minutes, setMinutes] = useState(120);
  const [paper, setPaper] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { api.get('/study/modules').then((d) => { setModules(d.modules); setModuleName(d.modules[0]?.name || ''); }).catch(() => {}); }, []);

  async function run(kind, fn) {
    setError(''); setBusy(kind);
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  const onFile = (e) => { const f = e.target.files[0]; if (f) shrink(f).then(setImage).catch(() => setError('Could not read that image')); };

  const scan = () => run('scan', async () => {
    setSimilar(null); setShowAnswer(false);
    setResult(await api.post('/study/scan', { imageBase64: image?.base64, mediaType: image?.mediaType, text, taskType, helpMode: helpMode === 'check' ? 'check' : 'hints', attempt }));
  });
  const makeSimilar = () => run('similar', async () => {
    setShowAnswer(false);
    setSimilar(await api.post('/study/similar', { topic: result.topic, taskType: result.taskType, difficulty }));
  });
  const makePaper = () => run('paper', async () => { setShowGuide(false); setPaper(await api.post('/study/paper', { moduleName, minutes })); });

  return (
    <>
      <h1 className="page-title">Study Lab</h1>
      <p className="page-sub">Scan a problem. Your coach teaches the method, asks the right question and sets a drill. It never writes your work for you.</p>
      <ErrorNote error={error} />

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
              {result.demo && <div className="demo">Demo mode: add ANTHROPIC_API_KEY on the server for real coaching.</div>}
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

      <h2 className="section">Practice paper</h2>
      <Card>
        <div className="flex">
          <div><label className="field" htmlFor="pm">Module</label><select id="pm" value={moduleName} onChange={(e) => setModuleName(e.target.value)}>{modules.map((m) => <option key={m.id}>{m.name}</option>)}</select></div>
          <div><label className="field" htmlFor="pl">Length</label><select id="pl" value={minutes} onChange={(e) => setMinutes(e.target.value)}><option value="60">1 hour</option><option value="120">2 hours</option><option value="180">3 hours</option></select></div>
          <div><button className="pill solid" onClick={makePaper} disabled={busy === 'paper'}>{busy === 'paper' ? 'Building...' : 'Generate paper'}</button></div>
        </div>
        {paper && (
          <div style={{ marginTop: 16 }}>
            {paper.demo && <div className="demo">Demo mode paper. Add ANTHROPIC_API_KEY for a real one.</div>}
            <h3>{paper.title} · {paper.durationMinutes} min</h3>
            {paper.sections?.map((s, i) => (<div key={i}><p style={{ fontWeight: 800, marginTop: 12 }}>{s.name} ({s.marks} marks)</p>{s.questions?.map((q) => <p className="muted" key={q.n}>{q.n}. {q.text} [{q.marks}]</p>)}</div>))}
            <p style={{ marginTop: 14 }}><button className="pill" onClick={() => window.print()}>Print</button> <button className="pill" onClick={() => setShowGuide(!showGuide)}>{showGuide ? 'Hide' : 'I\u2019m done: show'} marking guide</button></p>
            {showGuide && paper.markingGuide?.map((g) => <p className="muted" key={g.n}><b>{g.n}.</b> {g.points?.join('; ')}</p>)}
          </div>
        )}
      </Card>
    </>
  );
}