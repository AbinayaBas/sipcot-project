import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ name }) => {
  const icons = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    industry: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v14M7 7v14M11 7v14M15 7v14M19 7v14M3 7l9-4 9 4"/></svg>,
    data: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    records: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    report: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>,
    info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    announce: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11v2a2 2 0 0 0 2 2h2l3 6h2l-1-6h6l5 3V6l-5 3H5a2 2 0 0 0-2 2z"/><path d="M15 9v6"/></svg>,
    schedule: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h2"/><path d="M8 18h2"/><path d="M14 14h2"/><path d="M14 18h2"/></svg>,
    docs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return <span className="icon">{icons[name] || null}</span>;
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminNav = [
    { label: 'About SIPCOT', path: '/admin/about-sipcot', icon: 'info' },
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Announcements', path: '/admin/announcements', icon: 'announce' },
    { label: 'Schedule', path: '/admin/schedule', icon: 'schedule' },
    { label: 'Documents', path: '/admin/documents', icon: 'docs' },
    { label: 'Industries', path: '/admin/industries', icon: 'industry' },
    { label: 'Tender Selection', path: '/admin/tender-selection', icon: 'target' },
    { label: 'Data Records', path: '/admin/records', icon: 'records' },
    { label: 'Audit logs', path: '/admin/audit-logs', icon: 'report' },
    { label: 'Users', path: '/admin/users', icon: 'users' },
    { label: 'Export Report', path: '/admin/export', icon: 'report' },
  ];

  const industryNav = [
    { label: 'About SIPCOT', path: '/about-sipcot', icon: 'info' },
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Updates Center', path: '/updates', icon: 'announce' },
    { label: 'My Industry', path: '/industry', icon: 'industry' },
    { label: 'Submit Data', path: '/data/submit', icon: 'data' },
    { label: 'My Submissions', path: '/data/my', icon: 'records' },
    { label: 'Activity history', path: '/activity', icon: 'schedule' },
  ];

  const nav = user?.role === 'admin' ? adminNav : industryNav;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>SIPCOT</h2>
        <span>Industrial Data Management</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">{user?.role === 'admin' ? 'Admin Control Panel' : 'Industry Portal'}</div>
          {nav.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="nav-section">
          <div className="nav-label">Account</div>
          <button
            className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            <Icon name="profile" />
            Profile
          </button>
          <button className="nav-item" onClick={() => { logout(); navigate('/login'); }}>
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">
              {user?.role === 'admin' ? (
                <span className="sidebar-role-badge">Administrator</span>
              ) : (
                'Industry user'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
