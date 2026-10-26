import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const LEVELS = [['peer', 'Peer captain (free or points)'], ['pro', 'Pro captain (paid)'], ['sponsored', 'Sponsored'], ['solo', 'Go solo (coach only)']];

export default function Captains() {
  const [modules, setModules] = useState([]);
  const [moduleId, setModuleId] = useState('');
  const [level, setLevel] = useState('peer');
  const [budget, setBudget] = useState(150);
  const [list, setList] = useState(null);
  const [note, setNote] = useState('');
  const [slots, setSlots] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { api.get('/study/modules').then((d) => { setModules(d.modules); setModuleId(d.modules[0]?.id ?? ''); }).catch((e) => setError(e.message)); }, []);

  async function search() {
    setError(''); setMessage('');
    try {
      const d = await api.get(`/captains?moduleId=${moduleId}&level=${level}&budgetCents=${Math.round(budget * 100)}`);
      setList(d.captains); setNote(d.note || '');
    } catch (e) { setError(e.message); }
  }
  async function showSlots(id) {
    const d = await api.get(`/captains/${id}/slots`).catch((e) => { setError(e.message); return null; });
    if (d) setSlots({ ...slots, [id]: d.slots });
  }
  async function book(captainId, slotId) {
    setError('');
    try { const d = await api.post('/captains/book', { captainId, moduleId, slotId }); setMessage(`Booked for ${new Date(d.startsAt).toLocaleString()}.`); search(); setSlots({}); }
    catch (e) { setError(e.message); }
  }
  const price = (c) => (c.freePeer ? 'Free peer captain' : `R${(c.rateCents / 100).toFixed(0)} per session`);

  return (
    <>
      <h1 className="page-title">Find your captain</h1>
      <p className="page-sub">A 2nd, 3rd or 4th-year student who passed your module. Free, paid, sponsored, or go solo with your coach.</p>
      <ErrorNote error={error} />
      <Card>
        <div className="flex">
          <div><label className="field" htmlFor="m">Module</label><select id="m" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>{modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div><label className="field" htmlFor="l">Support level</label><select id="l" value={level} onChange={(e) => setLevel(e.target.value)}>{LEVELS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></div>
          {level === 'pro' && <div><label className="field" htmlFor="b">Budget per session (R)</label><input id="b" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>}
          <div><button className="pill solid" onClick={search} disabled={!moduleId}>Find captains</button></div>
        </div>
      </Card>
      {message && <p className="note">{message}</p>}
      {note && <p className="note">{note}</p>}
      {list && !note && list.length === 0 && <p className="note">No captain is free for that module and level right now. Your coach covers you, and you can join the waitlist.</p>}
      <div className="grid" style={{ marginTop: 20 }}>
        {list?.map((c) => (
          <Card key={c.id} title={c.name} tag={`${c.year}th year · match ${c.match.score}`}>
            <p className="muted">{c.bio}</p>
            <div className="row"><span>Grade in module</span><b>{Math.round(c.verifiedGrade)}%</b></div>
            <div className="row"><span>Rating</span><b>★ {c.rating}</b></div>
            <div className="row"><span>Price</span><b>{price(c)}</b></div>
            <p className="muted">Why: {c.match.reasons.join(' · ')}</p>
            {slots[c.id]
              ? slots[c.id].map((s) => <p key={s.id}><button className="pill" onClick={() => book(c.id, s.id)}>{new Date(s.starts_at).toLocaleString()}</button></p>)
              : <button className="pill solid" onClick={() => showSlots(c.id)}>See times</button>}
          </Card>
        ))}
      </div>
    </>
  );
}
