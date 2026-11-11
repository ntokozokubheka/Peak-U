import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui.jsx';

export default function Home({
  heroGraphicUrl,
  captainImageUrl,
  deptGraphicUrl
}) {
  return (
    <div className="home-page">
      {/* Hero Header */}
      <header className="hero-header">
        <div className="wrap">
          <div className="bar-row">
            <div className="logo">peak u</div>
            <nav aria-label="Main Navigation">
              <Link to="/" className="active">Dashboard</Link>
              <Link to="/study">Study Lab</Link>
              <Link to="/season">Season</Link>
              <Link to="/captains">Captains</Link>
            </nav>
            <div className="who">
              <Link to="/login" className="pill small" style={{ textDecoration: 'none' }}>Join the team</Link>
              <Link to="/login" className="pill small" style={{ borderColor: 'var(--bright)', color: '#fff', textDecoration: 'none' }}>Log in</Link>
            </div>
          </div>

          <div className="hero-content grid wide" style={{ alignItems: 'center', marginTop: 40, paddingBottom: 40 }}>
            <div>
              <h1 className="page-title" style={{ fontSize: 52, lineHeight: 1.1 }}>
                Train like<br />an athlete.
              </h1>
              <p className="page-sub" style={{ fontSize: 18, marginTop: 14 }}>
                Helping you cross the line.<br />
                Study, health and money in one game plan.
              </p>
              <Link to="/login" className="pill solid" style={{ marginTop: 10, display: 'inline-block', textDecoration: 'none' }}>Find out more</Link>
            </div>

            {/* Circular Hero Graphic Frame */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div className="graphic-circle-wrap" style={{ display: 'inline-block', position: 'relative', borderRadius: '50%', padding: 12, border: '2px dashed var(--bright)' }}>
                {heroGraphicUrl ? (
                  <img src={heroGraphicUrl} alt="Train like an athlete" style={{ width: 320, height: 320, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 320, height: 320, borderRadius: '50%', background: 'var(--pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: 800 }}>
                    [ Hero Illustration Placeholder ]
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="wrap">
        {/* Section 1: Your whole season, one app */}
        <section style={{ margin: '60px 0 80px' }}>
          <div className="grid wide" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="section" style={{ color: 'var(--navy)', marginTop: 0 }}>Your whole season, one app</h2>
              <p style={{ color: 'var(--navy)', opacity: 0.9, lineHeight: 1.6, marginBottom: 20 }}>
                <b>Peak is your coach. Your captain is a student who has been there.</b>
                <br /><br />
                Track study hours and study habits. Get study advice, create flashcards, upload past exam papers and test your prep. Scan a problem, generate a practice paper, create flashcards for your module, and answer context questions when your plan changes in the field. Join a team to get guidance or prep with your peer.
              </p>
              <Link to="/season" className="pill solid" style={{ display: 'inline-block', textDecoration: 'none' }}>Learn more</Link>
            </div>

            <div className="grid">
              <Card className="feature-card" style={{ background: 'var(--teal)', color: '#fff', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="tag" style={{ color: '#fff', opacity: 0.8 }}>⚡ Feature</div>
                <h3 style={{ fontSize: 24, margin: 0 }}>Study Lab and Coach</h3>
                <Link to="/study" style={{ fontSize: 13, fontWeight: 800, textDecoration: 'underline', color: '#fff' }}>Learn more &rarr;</Link>
              </Card>

              <Card className="feature-card" style={{ background: 'var(--purple)', color: '#fff', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="tag" style={{ color: '#fff', opacity: 0.8 }}>👥 Support</div>
                <h3 style={{ fontSize: 24, margin: 0 }}>Your Captain</h3>
                <Link to="/captains" style={{ fontSize: 13, fontWeight: 800, textDecoration: 'underline', color: '#fff' }}>Learn more &rarr;</Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 2: Cross the line with a captain */}
        <section className="card" style={{ background: 'var(--navy)', color: '#fff', padding: '60px 40px', borderRadius: 32, marginBottom: 80 }}>
          <div className="grid wide" style={{ alignItems: 'center' }}>
            {/* Captain Circle Frame */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', position: 'relative', borderRadius: '50%', padding: 10, border: '2px dashed var(--bright)' }}>
                {captainImageUrl ? (
                  <img src={captainImageUrl} alt="Captain" style={{ width: 280, height: 280, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 280, height: 280, borderRadius: '50%', background: '#fff', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    [ Captain Photo Placeholder ]
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="section" style={{ color: '#fff', marginTop: 0 }}>Cross the line with a captain</h2>
              <blockquote style={{ margin: '16px 0', fontSize: 16, lineHeight: 1.6, opacity: 0.9 }}>
                "Our captain is your senior peer at Peak and this captain helped me cross the line."
              </blockquote>
              <p style={{ fontWeight: 800, letterSpacing: '.06em', margin: '16px 0 24px', textTransform: 'uppercase', color: 'var(--bright)' }}>
                NTOGOZO KUBHEKA, ELECTRICAL ENGINEERING & MATHS, WITS & UJ
              </p>
              <Link to="/captains" className="pill solid" style={{ display: 'inline-block', textDecoration: 'none' }}>Meet your team</Link>
            </div>
          </div>
        </section>

        {/* Section 3: Featured in Peak */}
        <section style={{ marginBottom: 80 }}>
          <h2 className="section" style={{ textAlign: 'center', color: 'var(--navy)', marginBottom: 30 }}>Featured in Peak</h2>
          <div className="grid">
            <Card style={{ background: 'var(--teal)', color: '#fff' }}>
              <div className="tag" style={{ color: '#fff', opacity: 0.8 }}>LATEST</div>
              <h3 style={{ fontSize: 18, margin: '10px 0' }}>Scan any problem</h3>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>Upload photos, get instant solutions.</p>
              <Link to="/study" style={{ fontSize: 13, fontWeight: 800, textDecoration: 'underline', color: '#fff' }}>Read more &rarr;</Link>
            </Card>

            <Card style={{ background: 'var(--purple)', color: '#fff' }}>
              <div className="tag" style={{ color: '#fff', opacity: 0.8 }}>LATEST</div>
              <h3 style={{ fontSize: 18, margin: '10px 0' }}>Course Start Pack</h3>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>Direct to 20 page PDF prep module.</p>
              <Link to="/study" style={{ fontSize: 13, fontWeight: 800, textDecoration: 'underline', color: '#fff' }}>Read more &rarr;</Link>
            </Card>

            <Card style={{ background: 'var(--blue)', color: '#fff' }}>
              <div className="tag" style={{ color: '#fff', opacity: 0.8 }}>LATEST</div>
              <h3 style={{ fontSize: 18, margin: '10px 0' }}>Free, paid or solo</h3>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>Create customized plan support.</p>
              <Link to="/season" style={{ fontSize: 13, fontWeight: 800, textDecoration: 'underline', color: '#fff' }}>Read more &rarr;</Link>
            </Card>

            <Card style={{ background: 'var(--pink)', color: '#fff' }}>
              <div className="tag" style={{ color: '#fff', opacity: 0.8 }}>LATEST</div>
              <h3 style={{ fontSize: 18, margin: '10px 0' }}>Points for healthy habits</h3>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>Earn rewards while studying.</p>
              <Link to="/dashboard" style={{ fontSize: 13, fontWeight: 800, textDecoration: 'underline', color: '#fff' }}>Read more &rarr;</Link>
            </Card>
          </div>
        </section>

        {/* Section 4: A message for Departments */}
        <section className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 32, border: '2px solid var(--pale)', marginBottom: 80 }}>
          <div className="grid wide" style={{ alignItems: 'center' }}>
            <div style={{ background: 'var(--blue)', color: '#fff', padding: '50px 40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="section" style={{ color: '#fff', marginTop: 0 }}>A message for Departments</h2>
              <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: 24 }}>
                Bring your syllabus, past papers, slides and annotated past solutions into Peak, and see where students get stuck before exam time.
              </p>
              <div>
                <Link to="/login" className="pill small" style={{ borderColor: '#fff', color: '#fff', textDecoration: 'none' }}>▶ See the portal</Link>
              </div>
            </div>

            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ display: 'inline-block', position: 'relative', borderRadius: '50%', padding: 10, border: '2px dashed var(--blue)' }}>
                {deptGraphicUrl ? (
                  <img src={deptGraphicUrl} alt="Departments" style={{ width: 260, height: 260, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 260, height: 260, borderRadius: '50%', background: 'var(--pale)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    [ Department Jersey Illustration ]
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Works with your campus */}
        <section style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 className="section" style={{ color: 'var(--navy)', marginTop: 0, marginBottom: 24 }}>Works with your campus</h2>
          <div className="flex" style={{ justifyContent: 'center', gap: 12 }}>
            <span className="pill small" style={{ color: 'var(--navy)', borderColor: 'var(--pale)', background: 'var(--pale)' }}>[UNIVERSITY SIGN-IN]</span>
            <span className="pill small" style={{ color: 'var(--navy)', borderColor: 'var(--pale)', background: 'var(--pale)' }}>[LMS]</span>
            <span className="pill small" style={{ color: 'var(--navy)', borderColor: 'var(--pale)', background: 'var(--pale)' }}>[GOOGLE / OUTLOOK CALENDAR]</span>
            <span className="pill small" style={{ color: 'var(--navy)', borderColor: 'var(--pale)', background: 'var(--pale)' }}>[PAYMENTS]</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--navy)', color: '#fff', padding: '50px 0 30px' }}>
        <div className="wrap grid wide">
          <div>
            <div className="logo" style={{ display: 'inline-block', marginBottom: 16 }}>peak u</div>
            <p style={{ fontWeight: 800 }}>[PHONE]</p>
            <p style={{ fontWeight: 800 }}>[EMAIL]</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, fontSize: 13 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/study" style={{ color: '#fff' }}>Study Lab</Link>
              <Link to="/captains" style={{ color: '#fff' }}>Your Team</Link>
              <Link to="/captains" style={{ color: '#fff' }}>Captains</Link>
              <Link to="/login" style={{ color: '#fff' }}>Feedback</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/login" style={{ color: '#fff' }}>For Departments</Link>
              <Link to="/dashboard" style={{ color: '#fff' }}>Community</Link>
              <Link to="/login" style={{ color: '#fff' }}>Log in</Link>
              <Link to="/login" style={{ color: '#fff' }}>Join the team</Link>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 900 }}>Helping you cross the line.</p>
            </div>
          </div>
        </div>

        <div className="wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 40, paddingTop: 20 }}>
          <p style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.5 }}>
            Access to higher education + Problem statement: How might technology help young South Africans find suitable study pathways, secure funding options, complete applications, and receive support from application through graduation? Flexi-Learn System: Adaptations, Semester and Modules guidance, evaluated ratings based on student performance, connectivity, and interactive learning.
          </p>
        </div>
      </footer>
    </div>
  );
}