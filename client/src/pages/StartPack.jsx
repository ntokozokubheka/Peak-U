import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card, ErrorNote } from '../components/ui.jsx';

const PACK_PAGES = [
  { id: 1, title: 'Cover and how to use', desc: 'Module name, lecturer, how this pack works.' },
  { id: 2, title: 'Module at a glance', desc: 'Credits, assessment weights, key dates, office hours.' },
  { id: 3, title: 'Topic map', desc: 'Week-by-week topics and how they connect.' },
  { id: '4-6', title: 'Topic cheat sheets', desc: 'Key ideas, formulas, common mistakes, videos.' },
  { id: 7, title: 'Worked examples', desc: 'One solved and one similar problem to try.' },
  { id: 8, title: 'Exams and assignments', desc: 'Format, past paper pointers, marking tips.' },
  { id: 9, title: 'Study plan', desc: 'Weekly plan synced to your calendar.' },
  { id: 10, title: 'Glossary and help', desc: 'Key terms, mentors, groups, who to ask.' },
];

export default function StartPack() {
  const [modules, setModules] = useState([{ id: 'm1', name: '[MODULE A]' }]);
  const [selectedModule, setSelectedModule] = useState('[MODULE A]');
  const [sources, setSources] = useState({
    officialContent: true,
    syllabus: true,
    slides: true,
    youtube: true,
    passedTips: true,
  });
  const [lengthPages, setLengthPages] = useState('8 pages');
  const [purpose, setPurpose] = useState('Starting the module');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/study/modules')
      .then((d) => {
        if (d?.modules?.length > 0) {
          setModules(d.modules);
          setSelectedModule(d.modules[0].name || d.modules[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setGenerating(true);
    try {
      const res = await api.post('/start-pack/generate', {
        module: selectedModule,
        sources,
        length: lengthPages,
        purpose,
      });
      setMessage(res?.message || 'Course Start Pack generated successfully! +20 PTS added.');
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadPDF() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/start-pack/download');
      setMessage(res?.message || 'Downloading PDF cheat sheet...');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddToCalendar() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/start-pack/calendar');
      setMessage(res?.message || 'Study plan added to your calendar!');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleShareWithGroup() {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/start-pack/share');
      setMessage(res?.message || 'Pack link copied and shared with your study group.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1 className="page-title" style={{ textTransform: 'uppercase' }}>Course Start Pack</h1>
      <p className="page-sub">
        A 6 to 10 page cheat sheet for any module: topics, key ideas, videos, exam guide and a study plan, in one PDF.
      </p>

      <ErrorNote error={error} />
      {message && <p className="note">{message}</p>}

      <div className="sp-layout">
        {/* Left Sidebar: Build My Pack Form */}
        <div className="sp-sidebar">
          <Card>
            <div className="community-filter-title" style={{ marginBottom: 12 }}>BUILD MY PACK</div>
            <form onSubmit={handleGenerate}>
              <label className="field" htmlFor="pack-mod">Module</label>
              <select
                id="pack-mod"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                style={{ marginBottom: 14 }}
              >
                {modules.map((m) => (
                  <option key={m.id || m.name} value={m.name || m.id}>{m.name || m.id}</option>
                ))}
              </select>

              <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 8 }}>
                BUILT FROM
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {[
                  { key: 'officialContent', label: "Department's official content" },
                  { key: 'syllabus', label: 'Module outline and syllabus' },
                  { key: 'slides', label: 'Lecture slides' },
                  { key: 'youtube', label: 'Vetted YouTube videos for each topic' },
                  { key: 'passedTips', label: 'Top tips from students who passed' },
                ].map((src) => (
                  <label key={src.key} className="community-check-label" style={{ fontSize: '12px', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={sources[src.key]}
                      onChange={(e) => setSources({ ...sources, [src.key]: e.target.checked })}
                    />
                    {src.label}
                  </label>
                ))}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 8 }}>
                LENGTH
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: 16, fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>
                {['6 pages', '8 pages', '10 pages'].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="packLength"
                      checked={lengthPages === opt}
                      onChange={() => setLengthPages(opt)}
                      style={{ accentColor: 'var(--blue)' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 8 }}>
                FOR
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: 20, fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>
                {['Starting the module', 'Exam revision'].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="packPurpose"
                      checked={purpose === opt}
                      onChange={() => setPurpose(opt)}
                      style={{ accentColor: 'var(--blue)' }}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="pill solid"
                style={{ width: '100%', textAlign: 'center', textTransform: 'uppercase', fontSize: 13, padding: '12px' }}
                disabled={generating}
              >
                {generating ? 'Generating Pack...' : 'Generate Start Pack'}
              </button>

              <p className="muted" style={{ fontSize: '11px', marginTop: 10, textAlign: 'center', lineHeight: 1.4 }}>
                Takes about a minute. Rebuilt automatically when the syllabus changes.
              </p>
            </form>
          </Card>
        </div>

        {/* Right Main Content: Pack Overview & Page Breakdown */}
        <div className="sp-main-content">
          <Card>
            <div className="sp-action-bar">
              <button className="pill solid" onClick={handleDownloadPDF} style={{ textTransform: 'uppercase', fontSize: '12px', padding: '10px 20px' }}>
                Download PDF
              </button>
              <button className="pill" onClick={handleAddToCalendar} style={{ textTransform: 'uppercase', fontSize: '12px', padding: '10px 20px', borderColor: 'var(--blue)', color: 'var(--blue)' }}>
                Add plan to calendar
              </button>
              <button className="pill" onClick={handleShareWithGroup} style={{ textTransform: 'uppercase', fontSize: '12px', padding: '10px 20px', borderColor: 'var(--blue)', color: 'var(--blue)' }}>
                Share with group
              </button>
            </div>

            <div className="sp-pages-grid">
              {PACK_PAGES.map((pg) => (
                <div key={pg.id} className="sp-page-box">
                  <div>
                    <div className="sp-page-num">PAGE {pg.id}</div>
                    <div className="sp-page-heading">{pg.title}</div>
                  </div>
                  <div className="sp-page-desc">{pg.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sample Page 4 Preview */}
          <h2 className="sp-section-title" style={{ marginTop: 10 }}>
            Sample <span style={{ fontWeight: 300 }}>Page 4</span>
          </h2>
          <Card style={{ borderColor: 'var(--blue)', borderWidth: '2px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 4 }}>
              [MODULE A] · TOPIC 1 OF [N] · WEEK [N]
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 12 }}>
              [TOPIC NAME]
            </div>

            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 6 }}>
              KEY IDEAS
            </div>
            <ul style={{ margin: '0 0 16px 18px', fontSize: '12px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.6 }}>
              <li>[Core idea in one line]</li>
              <li>[Second idea]</li>
              <li>[Third idea]</li>
            </ul>

            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 6 }}>
              KEY FORMULAS / RULES
            </div>
            <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontWeight: 800, color: 'var(--navy)', marginBottom: 16 }}>
              [Formula or rule]
            </div>

            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 6 }}>
              COMMON MISTAKES
            </div>
            <p className="muted" style={{ fontSize: '12px', marginBottom: 16 }}>
              ◆ [Mistake students make] → [How to avoid it]
            </p>

            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 6 }}>
              WATCH
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, fontSize: '12px', fontWeight: 800, color: 'var(--navy)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>▶ [VIDEO TITLE] · [CHANNEL] · [LENGTH]</span>
                <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => setMessage('Opening video link...')}>[LINK]</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>▶ [SECOND VIDEO TITLE] · [CHANNEL] · [LENGTH]</span>
                <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => setMessage('Opening video link...')}>[LINK]</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 6 }}>
              TRY IT
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, color: 'var(--navy)' }}>
              <span>Scan a similar problem in Study Lab:</span>
              <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => setMessage('Opening Study Lab scanner...')}>[GENERATE SIMILAR PROBLEM]</span>
            </div>
          </Card>

          {/* Bottom 2-Column Section: How Links Are Chosen & Why Students Use It */}
          <div className="sp-bottom-grid" style={{ marginBottom: 40 }}>
            <div>
              <h2 className="sp-section-title">How Links <span style={{ fontWeight: 300 }}>Are Chosen</span></h2>
              <Card>
                <div className="sp-check-row">
                  <span>Videos your department recommends come first</span>
                  <span className="sp-check-mark">✓</span>
                </div>
                <div className="sp-check-row">
                  <span>Others are checked for topic match, length and quality</span>
                  <span className="sp-check-mark">✓</span>
                </div>
                <div className="sp-check-row">
                  <span>Every link is tested when the pack is built</span>
                  <span className="sp-check-mark">✓</span>
                </div>
                <div className="sp-check-row">
                  <span>Broken or wrong link? Report it in one tap</span>
                  <span className="sp-check-mark">✓</span>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="sp-section-title">Why Students <span style={{ fontWeight: 300 }}>Use It</span></h2>
              <Card style={{ height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p className="muted" style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: 12 }}>
                  One document replaces a week of hunting for the syllabus, slides and videos.
                </p>
                <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--blue)', textTransform: 'uppercase' }}>
                  Finishing your pack&apos;s study plan earns +20 points.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}