import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../utils/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <h1>SIPCOT</h1>
          <p>Industrial Data Management System</p>
        </div>
        <h2 style={{ marginBottom: 10, fontSize: '1.1rem' }}>Sign in to your account</h2>
        <p style={{ marginBottom: 18, color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.6 }}>
          Industry users can submit periodic returns and track approval status. Admin users monitor park-wise analytics, publish circulars, and schedule inspections.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-divider">Don't have an account?</div>
        <Link to="/register">
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Create Account</button>
        </Link>
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(99,179,237,0.06)', borderRadius: 8, border: '1px solid rgba(99,179,237,0.15)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Demo Credentials</div>
          <div style={{ fontSize: '0.8rem', lineHeight: 1.8 }}>
            <div><span style={{ color: 'var(--accent)' }}>Admin:</span> admin@sipcot.com / Admin@123</div>
            <div><span style={{ color: 'var(--accent2)' }}>Industry:</span> rajesh@techfab.com / Pass@123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
