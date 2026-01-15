import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network as NetworkIcon, FileText, Users, Activity, Settings, User } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import Papers from './pages/Papers';
import Authors from './pages/Authors';
import Network from './pages/Network';
import Profile from './pages/Profile';
import './index.css';

const SidebarItem = ({ icon: Icon, label, path }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
        background: isActive ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s',
        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
      }}
    >
      <Icon size={20} />
      <span style={{ fontWeight: isActive ? 600 : 400 }}>{label}</span>
    </Link>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh', maxWidth: '100%', padding: 0 }}>
      {/* Sidebar Navigation */}
      <aside className="glass-panel" style={{
        width: '260px',
        height: '100vh',
        borderRadius: 0,
        borderRight: '1px solid var(--border)',
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem'
      }}>
        <div className="brand" style={{ marginBottom: '3rem' }}>
          CORTEX <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>V2.0</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" />
          <SidebarItem icon={User} label="My Profile" path="/profile" />
          <SidebarItem icon={Activity} label="Topics & Trends" path="/topics" />
          <SidebarItem icon={FileText} label="Papers" path="/papers" />
          <SidebarItem icon={Users} label="Authors" path="/authors" />
          <SidebarItem icon={NetworkIcon} label="Network Graph" path="/network" />
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <SidebarItem icon={Settings} label="Settings" path="/settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/network" element={<Network />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
