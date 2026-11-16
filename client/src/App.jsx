import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudyLab from './pages/StudyLab.jsx';
import Season from './pages/Season.jsx';
import Captains from './pages/Captains.jsx';
import Home from './pages/Home.jsx';
import Rewards from './pages/Rewards.jsx'
import Goals from './pages/Goals.jsx'
import Calendar from './pages/Calendar.jsx'
import BodyMind from './pages/BodyMind.jsx'
import QuickSetup from './pages/QuickSetup.jsx';
import Community from './pages/Community.jsx';
import DepartmentPortal from './pages/DepartmentPortal.jsx';
import StartPack from './pages/StartPack.jsx';

// Import your assets
import heroGraphic from './assets/Serve Toward Brighter Futures.png';
import captainImg from './assets/With_Peako.jpg';
import deptGraphic from './assets/zungu.jpg';

// 1. ADD MISSING LINKS HERE
const NAV = [
  ['/', 'Dashboard'],
  ['/pathways', 'Pathways'],
  ['/season', 'My Team'],
  ['/study', 'Study Lab'],
  ['/start-pack', 'Start Pack'],
  ['/captains', 'Captains'],
  ['/community', 'Community'],
  ['/quick-setup', 'Quick Setup'],
  ['/calendar', 'Calendar'],
  ['/goals', 'Goals'],
  ['/body-money', 'Body & Money'],
  ['/rewards', 'Rewards'],
  ['/department-portal','Department Portal']
];

// Simple placeholder view for pages not built yet
function PlaceholderPage({ title }) {
  return (
    <div className="card" style={{ padding: '48px 24px', textAlign: 'center', marginTop: 20 }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--navy)', marginBottom: 10 }}>
        {title}
      </h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Placeholder page for {title}. Content coming soon.
      </p>
      <Link to="/" className="pill solid">Back to Dashboard</Link>
    </div>
  );
}

function Layout({ children }) {
  const { user, signOut } = useAuth();
  return (
    <>
      <header className="hero-header">
        <div className="wrap bar-row">
          <Link to="/" className="logo">peak u</Link>
          <nav aria-label="Main">
            {NAV.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="who">
            <span>{user?.name}</span>
            <button className="pill small" onClick={signOut}>Log out</button>
          </div>
        </div>
      </header>
      <main className="wrap">{children}</main>
      <footer>
        <div className="wrap bar-row">
          <Link to="/" className="logo">peak u</Link>
          <strong>Helping you cross the line.</strong>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Loading...</p>;

  if (!user) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Home
              heroGraphicUrl={heroGraphic}
              captainImageUrl={captainImg}
              deptGraphicUrl={deptGraphic}
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Existing Pages */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/study" element={<StudyLab />} />
        <Route path="/season" element={<Season />} />
        <Route path="/captains" element={<Captains />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/goals" element={< Goals />} />
        <Route path="/calendar" element={< Calendar />} />
        <Route path="/body-money" element={< BodyMind  />} />
         <Route path="/community" element={<Community />} />
         <Route path="/quick-setup" element={<QuickSetup/>} />
         <Route path="/department-portal" element={<DepartmentPortal/>} />
           <Route path="/start-pack" element={<StartPack />} />

        {/* 2. ADD MATCHING PLACEHOLDER ROUTES HERE */}
        <Route path="/pathways" element={<PlaceholderPage title="Pathways" />} />
      
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}