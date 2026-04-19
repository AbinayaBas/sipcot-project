import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import IndustryDashboard from './pages/IndustryDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyIndustry from './pages/MyIndustry';
import SubmitData from './pages/SubmitData';
import MyData from './pages/MyData';
import IndustrySipcotInfo from './pages/IndustrySipcotInfo';
import IndustryUpdates from './pages/IndustryUpdates';
import IndustryGuideSubmissionCycle from './pages/IndustryGuideSubmissionCycle';
import IndustryGuideTargeting from './pages/IndustryGuideTargeting';
import IndustryGuideWorkflow from './pages/IndustryGuideWorkflow';
import IndustryGuideDownloads from './pages/IndustryGuideDownloads';
import IndustryWalkthroughStep from './pages/IndustryWalkthroughStep';
import IndustryReturnDomain from './pages/IndustryReturnDomain';
import AdminRecords from './pages/AdminRecords';
import AdminIndustries from './pages/AdminIndustries';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import ExportReport from './pages/ExportReport';
import AdminSipcotInfo from './pages/AdminSipcotInfo';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminSchedule from './pages/AdminSchedule';
import AdminDocuments from './pages/AdminDocuments';
import AdminAboutDomain from './pages/AdminAboutDomain';
import AdminStackConcept from './pages/AdminStackConcept';
import AdminAuditLogs from './pages/AdminAuditLogs';
import IndustryActivity from './pages/IndustryActivity';
import TenderSelection from './pages/TenderSelection';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">

        {isAdmin ? (
          <div className="admin-control-strip" role="banner">

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/assets/logo.png" alt="logo" style={{ width: "35px", height: "35px" }} />

              <div>
                <span className="admin-control-strip-title">Admin Control Panel</span>
                <span className="admin-control-strip-sub">
                  Logged in as <strong>{user?.name || 'Administrator'}</strong>
                </span>
              </div>
            </div>

            <span className="badge badge-admin-role">ADMIN</span>
          </div>
        ) : (
          <div className="industry-control-strip" role="banner">

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/assets/logo.png" alt="logo" style={{ width: "35px", height: "35px" }} />

              <div>
                <span className="industry-control-strip-title">Industry User Portal</span>
                <span className="industry-control-strip-sub">
                  Logged in as <strong>{user?.name || 'Industry user'}</strong>
                </span>
              </div>
            </div>

            <span className="badge badge-industry-role">INDUSTRY</span>
          </div>
        )}

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const defaultPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={defaultPath} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<ProtectedRoute><Layout><IndustryDashboard /></Layout></ProtectedRoute>} />
      <Route path="/industry" element={<ProtectedRoute><Layout><MyIndustry /></Layout></ProtectedRoute>} />
      <Route path="/data/submit" element={<ProtectedRoute><Layout><SubmitData /></Layout></ProtectedRoute>} />
      <Route path="/data/my" element={<ProtectedRoute><Layout><MyData /></Layout></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/industries" element={<ProtectedRoute adminOnly><Layout><AdminIndustries /></Layout></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? defaultPath : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}