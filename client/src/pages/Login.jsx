import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ui.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'demo@peaku.test', password: 'demo1234' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { signIn(await api.post(mode === 'login' ? '/auth/login' : '/auth/register', form)); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="login card">
      <div className="logo" style={{ display: 'inline-block', marginBottom: 18 }}>peak u</div>
      <h1>{mode === 'login' ? 'Welcome back' : 'Join the team'}</h1>
      <p className="muted">Helping you cross the line.</p>
      <form onSubmit={submit}>
        {mode === 'register' && (<><label className="field" htmlFor="name">Name</label><input id="name" type="text" value={form.name} onChange={set('name')} required /></>)}
        <label className="field" htmlFor="email">University email</label>
        <input id="email" type="email" value={form.email} onChange={set('email')} required />
        <label className="field" htmlFor="pw">Password</label>
        <input id="pw" type="password" value={form.password} onChange={set('password')} minLength={8} required />
        <ErrorNote error={error} />
        <p style={{ marginTop: 18 }}><button className="pill solid" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create account'}</button></p>
      </form>
      <p className="muted" style={{ marginTop: 16 }}>
        {mode === 'login' ? 'New here? ' : 'Already on the team? '}
        <button className="pill small" style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Join Peak U' : 'Log in'}
        </button>
      </p>
      {mode === 'login' && <p className="muted">Demo account is pre-filled. Run <code>npm run db:setup</code> first.</p>}
    </div>
  );
}
