import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, Bar, LABELS, ErrorNote } from '../components/ui.jsx';

export default function Season() {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState('');
  const [calc, setCalc] = useState({ courseMark: 62, caWeight: 40, examWeight: 60, target: 65 });
  const [needed, setNeeded] = useState(null);
  const [targets, setTargets] = useState({});

  const load = () => api.get('/season').then((d) => setModules(d.modules)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setCalc({ ...calc, [k]: e.target.value });
  const runCalc = (e) => { e.preventDefault(); setError(''); api.post('/season/exam-needed', calc).then(setNeeded).catch((err) => setError(err.message)); };
  const saveTarget = (m) => api.post('/season/target', { moduleId: m.moduleId, target: Number(targets[m.moduleId] ?? m.target) }).then(load).catch((e) => setError(e.message));
  const needText = (n) => (!n ? 'No marks yet' : n.secured ? 'Already secured' : n.achievable ? `${n.needed}% in the exam` : `${n.needed}%: not reachable, talk to your coach`);

  return (
    <>
      <h1 className="page-title">Season and benchmarks</h1>
      <p className="page-sub">Quarter tests, assignments and semester exams, compared with your target and the pass mark.</p>
      <ErrorNote error={error} />

      <Card title="What do I need in the exam?" tag="Calculator">
        <p className="muted">needed = (target − course mark × tests weight) ÷ exam weight</p>
        <form onSubmit={runCalc} className="flex">
          <div><label className="field" htmlFor="c1">Course mark so far (%)</label><input id="c1" type="number" value={calc.courseMark} onChange={set('courseMark')} /></div>
          <div><label className="field" htmlFor="c2">Tests and assignments weight (%)</label><input id="c2" type="number" value={calc.caWeight} onChange={set('caWeight')} /></div>
          <div><label className="field" htmlFor="c3">Exam weight (%)</label><input id="c3" type="number" value={calc.examWeight} onChange={set('examWeight')} /></div>
          <div><label className="field" htmlFor="c4">My target (%)</label><input id="c4" type="number" value={calc.target} onChange={set('target')} /></div>
          <div><button className="pill solid">Calculate</button></div>
        </form>
        {needed && <div className="note"><div className="big">{needText(needed)}</div></div>}
      </Card>

      <h2 className="section">Your modules</h2>
      <div className="grid wide">
        {modules?.map((m) => (
          <Card key={m.moduleId} title={m.module} tag={`Tests ${m.caWeight}% · Exam ${m.examWeight}%`}>
            <div className="big">{m.courseMark ?? '–'}{m.courseMark != null && '%'}</div>
            <Bar label="Course mark" value={m.courseMark} />
            <Bar label={`Target ${m.target}%`} value={m.target} />
            <Bar label={`Pass mark ${m.pass}%`} value={m.pass} />
            <div className="row"><span>To reach your target</span><b>{needText(m.neededForTarget)}</b></div>
            <div className="row"><span>To pass</span><b>{needText(m.neededToPass)}</b></div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>Assessment</th><th>Due</th><th>Mark</th><th>Status</th></tr></thead>
                <tbody>{m.assessments.map((a) => (
                  <tr key={a.id}><td>{a.title} ({a.weight}%)</td><td>{a.dueOn}</td><td>{a.pct ?? '–'}</td><td>{LABELS[a.status]}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <div className="flex" style={{ marginTop: 12 }}>
              <div><label className="field" htmlFor={`t${m.moduleId}`}>Change my target (%)</label><input id={`t${m.moduleId}`} type="number" defaultValue={m.target} onChange={(e) => setTargets({ ...targets, [m.moduleId]: e.target.value })} /></div>
              <div><button className="pill" onClick={() => saveTarget(m)}>Save target</button></div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
