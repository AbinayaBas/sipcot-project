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

            {/* ✅ LOGO ADDED HERE */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/assets/logo.png" alt="logo" style={{ width: "35px", height: "35px" }} />

                <div className="admin-control-strip-left">
                  <span className="admin-control-strip-title">Admin Control Panel</span>
                  <span className="admin-control-strip-sub">
                    Logged in as <strong>{user?.name || 'Administrator'}</strong>
                  </span>
                </div>
              </div>

              <span className="badge badge-admin-role">
                ADMIN
              </span>

            </div>
          </div>
        ) : (
          <div className="industry-control-strip" role="banner">

            {/* ✅ LOGO ADDED HERE */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/assets/logo.png" alt="logo" style={{ width: "35px", height: "35px" }} />

                <div className="industry-control-strip-left">
                  <span className="industry-control-strip-title">Industry User Portal</span>
                  <span className="industry-control-strip-sub">
                    Logged in as <strong>{user?.name || 'Industry user'}</strong>
                  </span>
                </div>
              </div>

              <span className="badge badge-industry-role">
                INDUSTRY
              </span>

            </div>
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
      <Route path="/about-sipcot" element={<ProtectedRoute><Layout><IndustrySipcotInfo /></Layout></ProtectedRoute>} />
      <Route path="/updates" element={<ProtectedRoute><Layout><IndustryUpdates /></Layout></ProtectedRoute>} />
      <Route path="/guide/submission-cycle" element={<ProtectedRoute><Layout><IndustryGuideSubmissionCycle /></Layout></ProtectedRoute>} />
      <Route path="/guide/targeting" element={<ProtectedRoute><Layout><IndustryGuideTargeting /></Layout></ProtectedRoute>} />
      <Route path="/guide/workflow" element={<ProtectedRoute><Layout><IndustryGuideWorkflow /></Layout></ProtectedRoute>} />
      <Route path="/guide/downloads" element={<ProtectedRoute><Layout><IndustryGuideDownloads /></Layout></ProtectedRoute>} />
      <Route path="/guide/walkthrough/:slug" element={<ProtectedRoute><Layout><IndustryWalkthroughStep /></Layout></ProtectedRoute>} />
      <Route path="/guide/returns/:slug" element={<ProtectedRoute><Layout><IndustryReturnDomain /></Layout></ProtectedRoute>} />
      <Route path="/industry" element={<ProtectedRoute><Layout><MyIndustry /></Layout></ProtectedRoute>} />
      <Route path="/data/submit" element={<ProtectedRoute><Layout><SubmitData /></Layout></ProtectedRoute>} />
      <Route path="/data/my" element={<ProtectedRoute><Layout><MyData /></Layout></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><Layout><IndustryActivity /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/industries" element={<ProtectedRoute adminOnly><Layout><AdminIndustries /></Layout></ProtectedRoute>} />
      <Route path="/admin/tender-selection" element={<ProtectedRoute adminOnly><Layout><TenderSelection /></Layout></ProtectedRoute>} />
      <Route path="/admin/records" element={<ProtectedRoute adminOnly><Layout><AdminRecords /></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><AdminUsers /></Layout></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute adminOnly><Layout><AdminAuditLogs /></Layout></ProtectedRoute>} />
      <Route path="/admin/export" element={<ProtectedRoute adminOnly><Layout><ExportReport /></Layout></ProtectedRoute>} />
      <Route path="/admin/about-sipcot" element={<ProtectedRoute adminOnly><Layout><AdminSipcotInfo /></Layout></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute adminOnly><Layout><AdminAnnouncements /></Layout></ProtectedRoute>} />
      <Route path="/admin/schedule" element={<ProtectedRoute adminOnly><Layout><AdminSchedule /></Layout></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute adminOnly><Layout><AdminDocuments /></Layout></ProtectedRoute>} />
      <Route path="/admin/guide/review/:slug" element={<ProtectedRoute adminOnly><Layout><AdminAboutDomain /></Layout></ProtectedRoute>} />
      <Route path="/admin/guide/stack/:slug" element={<ProtectedRoute adminOnly><Layout><AdminStackConcept /></Layout></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user ? defaultPath : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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