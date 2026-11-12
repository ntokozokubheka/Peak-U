import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ui.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: 'demo@peaku.test',
    year: 'First year',
    major: '',
    goal: 'Raise my grades',
    password: 'demo1234',
    keepLoggedIn: false,
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: val });
  };

  const switchMode = (nextMode) => {
    setError('');
    setMode(nextMode);
    if (nextMode === 'register' && form.email === 'demo@peaku.test') {
      setForm((prev) => ({ ...prev, email: '', password: '' }));
    }
  };

  function validate() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.(edu|ac\.[a-z]{2}|test)$/i;
    if (!emailPattern.test(form.email.trim())) {
      return 'Please enter a valid university email address (e.g., .edu or .ac.za).';
    }
    if (form.password.length < 8 || !/\d/.test(form.password)) {
      return 'Password must be at least 8 characters and include at least one number.';
    }
    if (mode === 'register') {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        return 'First name and last name are required.';
      }
      if (!form.major.trim()) {
        return 'Please enter your position (major).';
      }
      if (!form.agreeTerms) {
        return 'You must agree to the terms and privacy policy to start your season.';
      }
    }
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email: form.email.trim(), password: form.password }
          : {
              name: `${form.firstName.trim()} ${form.lastName.trim()}`,
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              email: form.email.trim(),
              year: form.year,
              major: form.major.trim(),
              goal: form.goal,
              password: form.password,
            };

      signIn(await api.post(endpoint, payload));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-split">
      {/* Left Navy Branding Panel */}
      <aside className="auth-banner">
        <div>
          <Link to="/" className="logo" style={{ display: 'inline-block' }}>peak u</Link>
        </div>
        <div className="auth-banner-content">
          <h2>Train like<br />an athlete.</h2>
          <p>
            Your semester is a season. Build the game plan, show up for every session, recover on purpose.
          </p>
        </div>
      </aside>

      {/* Right Form Panel */}
      <section className="auth-form-side">
        <div className="auth-box">
          <h1>{mode === 'login' ? 'Welcome back' : 'Join the team'}</h1>
          <p className="muted" style={{ marginBottom: 18 }}>
            {mode === 'login'
              ? 'Log in to see today’s training plan.'
              : 'Two minutes to set up your season.'}
          </p>

          <form onSubmit={submit} noValidate>
            {mode === 'register' && (
              <div className="auth-row-2">
                <div>
                  <label className="field" htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={set('firstName')}
                    required
                  />
                </div>
                <div>
                  <label className="field" htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={set('lastName')}
                    required
                  />
                </div>
              </div>
            )}

            <label className="field" htmlFor="email">University email</label>
            <input
              id="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={set('email')}
              required
            />

            {mode === 'register' && (
              <>
                <div className="auth-row-2">
                  <div>
                    <label className="field" htmlFor="year">Year</label>
                    <select id="year" value={form.year} onChange={set('year')}>
                      <option value="First year">First year</option>
                      <option value="Second year">Second year</option>
                      <option value="Third year">Third year</option>
                      <option value="Fourth year / Honours">Fourth year / Honours</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="field" htmlFor="major">Your position (Major)</label>
                    <input
                      id="major"
                      type="text"
                      placeholder="e.g. Engineering"
                      value={form.major}
                      onChange={set('major')}
                      required
                    />
                  </div>
                </div>

                <label className="field" htmlFor="goal">Season goal</label>
                <select id="goal" value={form.goal} onChange={set('goal')}>
                  <option value="Raise my grades">Raise my grades</option>
                  <option value="Build a consistent study routine">Build a consistent study routine</option>
                  <option value="Pass all modules">Pass all modules</option>
                  <option value="Balance study, health and finances">Balance study, health and finances</option>
                </select>
              </>
            )}

            <label className="field" htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              placeholder={mode === 'login' ? 'Password' : 'Min. 8 characters with a number'}
              value={form.password}
              onChange={set('password')}
              minLength={8}
              required
            />

            {mode === 'login' ? (
              <div className="auth-meta">
                <label className="auth-check" style={{ marginTop: 0 }}>
                  <input
                    type="checkbox"
                    checked={form.keepLoggedIn}
                    onChange={set('keepLoggedIn')}
                  />
                  <span>Keep me logged in</span>
                </label>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setError('Password reset instructions can be requested via your university support admin.')}
                >
                  Forgot password?
                </button>
              </div>
            ) : (
              <label className="auth-check">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={set('agreeTerms')}
                />
                <span>I agree to the terms and privacy policy</span>
              </label>
            )}

            <ErrorNote error={error} />

            <p style={{ marginTop: 22 }}>
              <button className="pill solid full" disabled={busy}>
                {busy
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Log in'
                  : 'Start my season'}
              </button>
            </p>
          </form>

          <p className="muted" style={{ marginTop: 18 }}>
            {mode === 'login' ? 'New to the team? ' : 'Already on the team? '}
            <button
              type="button"
              className="link-btn"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Join Peak U' : 'Log in'}
            </button>
          </p>

          {mode === 'login' && (
            <p className="muted" style={{ marginTop: 10 }}>
              Demo account is pre-filled. Run <code>npm run db:setup</code> first.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}