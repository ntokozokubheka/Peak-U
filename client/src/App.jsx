import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudyLab from './pages/StudyLab.jsx';
import Season from './pages/Season.jsx';
import Captains from './pages/Captains.jsx';

// CUSTOMIZE: add a page by creating src/pages/YourPage.jsx, then add one line here and one in <Routes>.
const NAV = [
  ['/', 'Dashboard'],
  ['/study', 'Study Lab'],
  ['/season', 'Season'],
  ['/captains', 'Captains'],
];

function Layout({ children }) {
  const { user, signOut } = useAuth();
  return (
    <>
      <header className="hero-header">
        <div className="wrap bar-row">
          <Link to="/" className="logo">peak u</Link>
          <nav aria-label="Main">
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
            ))}
          </nav>
          <div className="who">
            <span>{user.name}</span>
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
  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/study" element={<StudyLab />} />
        <Route path="/season" element={<Season />} />
        <Route path="/captains" element={<Captains />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
