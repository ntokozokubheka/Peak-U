import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const TABS = [
  { id: 'support', label: '1. Support Levels' },
  { id: 'captains', label: '2. 1-on-1 Captains' },
  { id: 'groups', label: '3. Study Groups' },
  { id: 'book', label: '4. Book a Session' },
  { id: 'become', label: '5. Become a Captain' },
];

const SUPPORT_LEVELS = [
  {
    id: 'solo',
    kicker: 'ALWAYS FREE',
    name: 'GO SOLO',
    desc: 'Peak Coach only: scans, practice papers, your plan and the community. No captain needed.',
    btnText: 'STAY SOLO',
  },
  {
    id: 'peer',
    kicker: 'FREE · POINTS · SWAP',
    name: 'PEER CAPTAIN',
    desc: 'Matched by the system. Pay with reward points, or swap by helping a first-year later. Slots are limited. So join the waitlist.',
    btnText: 'JOIN THE DRAFT',
  },
  {
    id: 'pro',
    kicker: 'PAID',
    name: 'PRO CAPTAIN',
    desc: 'Book any captain you like. [RATE] per session, cheaper in bundles of 5 or 10, or split a squad pass with your group.',
    btnText: 'SEE PRICES',
  },
  {
    id: 'sponsored',
    kicker: 'FUNDED BY YOUR DEPARTMENT OR BURSARY',
    name: 'SPONSORED',
    desc: 'A captain paid for you if you qualify, so money never decides who gets support.',
    btnText: 'CHECK ELIGIBILITY',
  },
];

const CLUB_MECHANICS = [
  { id: 'c1', title: 'SCOUTING REPORT', desc: 'The coach recommends captains by your weak topics, your free hours and how you like to learn.' },
  { id: 'c2', title: 'FREE TRIAL', desc: 'A 15-minute trial with any captain before you commit.' },
  { id: 'c3', title: 'DRAFT DAY', desc: 'At the start of term, open captain spots are matched to students in one go.' },
  { id: 'c4', title: 'TRANSFER WINDOW', desc: 'Switch captain once per term, no questions asked.' },
  { id: 'c5', title: 'TIME-OUT', desc: 'A 10-minute quick question to a captain, for [PRICE] or points.' },
  { id: 'c6', title: 'SEASON PASS', desc: 'Unlimited group sessions for the term for one price.' },
  { id: 'c7', title: 'SQUAD PASS', desc: 'Split a captain’s fee between everyone in your study group.' },
  { id: 'c8', title: 'PAY WITH POINTS', desc: 'Redeem the points you earn from study and healthy habits.' },
];

const STUDY_GROUPS = [
  { id: 'sg1', name: '[MODULE A] revision group', mentor: 'Led by a 3rd-year mentor · Tue 17:00 · 60 min', seats: '5 / 8 SEATS', price: 'FREE' },
  { id: 'sg2', name: '[MODULE B] problem clinic', mentor: 'Led by a 2nd-year mentor · Thu 14:00 · 90 min', seats: '2 / 6 SEATS', price: '[PRICE]' },
  { id: 'sg3', name: '[MODULE C] exam crunch', mentor: 'Led by a 3rd-year mentor · Fri 16:00 · 2 h', seats: '7 / 10 SEATS', price: '[PRICE]' },
];

const DEFAULT_CAPTAINS = [
  {
    id: 'cap1',
    name: '[CAPTAIN NAME]',
    year: 2,
    degree: '[DEGREE]',
    moduleCode: '[MODULE CODE]',
    verifiedGrade: '[VERIFIED GRADE]',
    rating: '[RATING]',
    sessionsCount: '[N]',
    priceType: 'FREE · PEER',
    nextSlot: 'Tue 17:00',
    hasTrial: true,
  },
  {
    id: 'cap2',
    name: '[CAPTAIN NAME]',
    year: 2,
    degree: '[DEGREE]',
    moduleCode: '[MODULE CODE]',
    verifiedGrade: '[VERIFIED GRADE]',
    rating: '[RATING]',
    sessionsCount: '[N]',
    priceType: '[RATE] / HOUR',
    nextSlot: 'Wed 15:30',
    hasTrial: false,
  },
  {
    id: 'cap3',
    name: '[CAPTAIN NAME]',
    year: 4,
    degree: '[DEGREE]',
    moduleCode: '[MODULE CODE]',
    verifiedGrade: '[VERIFIED GRADE]',
    rating: '[RATING]',
    sessionsCount: '[N]',
    priceType: '[RATE] / HOUR',
    nextSlot: 'Thu 10:00',
    hasTrial: false,
  },
];

export default function Captains() {
  const [activeTab, setActiveTab] = useState('support');
  const [modules, setModules] = useState([{ id: 'm1', name: '[MODULE A]' }]);
  const [moduleId, setModuleId] = useState('[MODULE A]');
  const [captainYear, setCaptainYear] = useState('Any');
  const [format, setFormat] = useState('1-on-1');
  const [priceFilter, setPriceFilter] = useState('Free (peer)');
  const [captainsList, setCaptainsList] = useState(DEFAULT_CAPTAINS);
  
  // Booking state
  const [selectedTime, setSelectedTime] = useState('Tue 17:00');
  const [helpText, setHelpText] = useState('');
  const [attachScanned, setAttachScanned] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    api.get('/study/modules')
      .then((d) => {
        if (d?.modules?.length > 0) {
          setModules(d.modules);
          setModuleId(d.modules[0].id);
        }
      })
      .catch(() => {
        setModules([{ id: 'm1', name: '[MODULE A]' }, { id: 'm2', name: '[MODULE B]' }]);
      });
  }, []);

  async function handleSearch() {
    setError('');
    setBusy('search');
    try {
      const res = await api.get(`/captains?moduleId=${moduleId}&year=${captainYear}&format=${format}&price=${priceFilter}`);
      if (res?.captains) setCaptainsList(res.captains);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  async function handleSupportAction(levelId) {
    setError('');
    try {
      const res = await api.post('/captains/support-level', { levelId });
      setMessage(res?.message || `Successfully updated support level to ${levelId}.`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleJoinGroup(groupId) {
    setError('');
    try {
      const res = await api.post('/captains/group/join', { groupId });
      setMessage(res?.message || 'Successfully joined study group!');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleConfirmBooking() {
    setError('');
    try {
      const res = await api.post('/captains/book', { moduleId, time: selectedTime, helpText, attachScanned });
      setMessage(res?.message || 'Session confirmed and added to calendar! Attending earns +20 points.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleBook(captainId, isTrial = false) {
    setError('');
    try {
      const endpoint = isTrial ? '/captains/book-trial' : '/captains/book';
      const res = await api.post(endpoint, { captainId, moduleId });
      setMessage(res?.message || (isTrial ? 'Free 15-min trial booked successfully!' : 'Captain session booked successfully!'));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleBecomeCaptain() {
    setError('');
    try {
      const res = await api.post('/captains/apply');
      setMessage(res?.message || 'Captain application submitted successfully!');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1 className="page-title">Captains</h1>
      <p className="page-sub">Helping you cross the line. Book a 2nd, 3rd or 4th-year captain, or join a study group, for the exact module you are stuck on.</p>

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
      {message && <p className="note">{message}</p>}

      {/* TAB 1: SUPPORT LEVELS */}
      {activeTab === 'support' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            CHOOSE YOUR SUPPORT LEVEL
          </h2>
          <div className="grid" style={{ marginBottom: '24px' }}>
            {SUPPORT_LEVELS.map((lvl) => (
              <Card key={lvl.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>{lvl.kicker}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{lvl.name}</div>
                  <p className="muted" style={{ marginBottom: '16px' }}>{lvl.desc}</p>
                </div>
                <button
                  className="pill"
                  style={{ width: '100%', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.85rem', padding: '10px' }}
                  onClick={() => handleSupportAction(lvl.id)}
                >
                  {lvl.btnText}
                </button>
              </Card>
            ))}
          </div>

          <div className="note" style={{ marginBottom: '24px', fontWeight: 600 }}>
            <b>No captain free right now?</b> Peak Coach covers you straight away and holds your place on the waitlist. Group sessions led by a TA or lecturer are the backup.
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            HOW IT WORKS, LIKE A CLUB
          </h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {CLUB_MECHANICS.map((club) => (
              <Card key={club.id} style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px', letterSpacing: '0.5px' }}>{club.title}</div>
                <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{club.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 1-ON-1 CAPTAINS */}
      {activeTab === 'captains' && (
        <div>
          <Card title="Find support for a module" style={{ marginBottom: '24px' }}>
            <div className="flex">
              <div>
                <label className="field" htmlFor="mod-select">Module</label>
                <select id="mod-select" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
                  {modules.map((m) => (
                    <option key={m.id || m.name} value={m.name || m.id}>{m.name || m.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field" htmlFor="yr-select">Captain Year</label>
                <select id="yr-select" value={captainYear} onChange={(e) => setCaptainYear(e.target.value)}>
                  <option value="Any">Any</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div>
                <label className="field" htmlFor="fmt-select">Format</label>
                <select id="fmt-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="1-on-1">1-on-1</option>
                  <option value="Group">Study Group</option>
                </select>
              </div>
              <div>
                <label className="field" htmlFor="price-select">Price</label>
                <select id="price-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                  <option value="Free (peer)">Free (peer)</option>
                  <option value="Paid">Paid</option>
                  <option value="Sponsored">Sponsored</option>
                </select>
              </div>
              <div>
                <button className="pill solid" style={{ width: '100%', padding: '12px 20px', marginTop: '16px' }} onClick={handleSearch} disabled={busy === 'search'}>
                  {busy === 'search' ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </Card>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            1-ON-1 CAPTAINS AVAILABLE
          </h2>
          <div className="grid">
            {captainsList.map((c) => (
              <Card key={c.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0070f3', flexShrink: 0 }} />
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{c.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{c.year}th year · {c.degree}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#334155', padding: '8px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '12px' }}>
                    Module: {c.moduleCode} · Grade: <b>{c.verifiedGrade}</b>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
                    <span>★ {c.rating} ({c.sessionsCount} sessions)</span>
                    <span style={{ color: '#0070f3' }}>{c.priceType}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px', color: '#64748b' }}>
                    <span>Next free slot</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{c.nextSlot}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="pill solid" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '8px' }} onClick={() => handleBook(c.id, false)}>
                    Book
                  </button>
                  {c.hasTrial && (
                    <button className="pill" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '8px', border: '2px solid #0070f3', color: '#0070f3' }} onClick={() => handleBook(c.id, true)}>
                      Free Trial
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STUDY GROUPS */}
      {activeTab === 'groups' && (
        <Card title="Study Group Sessions" style={{ maxWidth: '700px' }}>
          <p className="muted" style={{ marginBottom: '16px' }}>Join collaborative group sessions led by senior mentors or start your own.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {STUDY_GROUPS.map((sg) => (
              <div key={sg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{sg.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{sg.mentor}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0070f3' }}>{sg.seats} · {sg.price}</div>
                  <button className="pill solid" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => handleJoinGroup(sg.id)}>
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '20px' }}>
            <button className="pill" style={{ border: '2px solid #0070f3', color: '#0070f3' }} onClick={() => handleSupportAction('start-group')}>
              + Start a group for my module
            </button>
          </p>
        </Card>
      )}

      {/* TAB 4: BOOK A SESSION */}
      {activeTab === 'book' && (
        <Card title="Book a Session" style={{ maxWidth: '600px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            With [CAPTAIN NAME] · [MODULE A]
          </div>

          <label className="field">Pick a time</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            {['Tue 17:00', 'Wed 15:30', 'Thu 10:00'].map((timeOpt) => (
              <label key={timeOpt} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, background: selectedTime === timeOpt ? '#eff6ff' : '#fff' }}>
                <input
                  type="radio"
                  name="bookingTime"
                  checked={selectedTime === timeOpt}
                  onChange={() => setSelectedTime(timeOpt)}
                  style={{ accentColor: '#0070f3' }}
                />
                {timeOpt}
              </label>
            ))}
          </div>

          <label className="field" htmlFor="help-txt">What do you need help with?</label>
          <textarea
            id="help-txt"
            rows="3"
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            placeholder="Briefly describe what you are stuck on..."
            style={{ marginBottom: '16px' }}
          />

          <label className="check" style={{ marginBottom: '16px' }}>
            <input
              type="checkbox"
              checked={attachScanned}
              onChange={(e) => setAttachScanned(e.target.checked)}
            />
            <label>Attach my last scanned problem from Study Lab</label>
          </label>

          <div className="note" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>✓ Fits your week, no clash</span>
            <span style={{ fontWeight: 800, color: '#0070f3' }}>[FREE / PRICE]</span>
          </div>

          <button className="pill solid" style={{ width: '100%', textAlign: 'center', padding: '12px' }} onClick={handleConfirmBooking}>
            Confirm - Add to calendar
          </button>
          <p className="muted" style={{ fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
            Paid sessions: payment is held until session completion. Attending earns +20 points.
          </p>
        </Card>
      )}

      {/* TAB 5: BECOME A CAPTAIN */}
      {activeTab === 'become' && (
        <div className="grid wide" style={{ alignItems: 'start' }}>
          <Card title="Become a Captain">
            <p className="muted" style={{ marginBottom: '16px' }}>
              2nd, 3rd and 4th years: share what you know and get paid or earn points. Pick your modules, your hours and your rate, or teach for free.
            </p>
            <div className="row">
              <span>Eligibility: module grade of [GRADE] or above, verified</span>
              <span style={{ fontWeight: 900, color: '#0070f3' }}>✓</span>
            </div>
            <div className="row" style={{ marginBottom: '20px' }}>
              <span>Earn: money, points, volunteer hours or a CV certificate</span>
              <span style={{ fontWeight: 900, color: '#0070f3' }}>✓</span>
            </div>
            <button className="pill solid" onClick={handleBecomeCaptain}>
              Apply to be a captain
            </button>
          </Card>

          <Card title="Safe and Trusted">
            <div className="row">
              <span>University email verified</span>
              <span style={{ fontWeight: 900, color: '#0070f3' }}>✓</span>
            </div>
            <div className="row">
              <span>Module grade checked</span>
              <span style={{ fontWeight: 900, color: '#0070f3' }}>✓</span>
            </div>
            <div className="row">
              <span>Rated after every session</span>
              <span style={{ fontWeight: 900, color: '#0070f3' }}>✓</span>
            </div>
            <div className="row">
              <span>Report a problem in one tap</span>
              <span style={{ fontWeight: 900, color: '#0070f3' }}>✓</span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}