import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', phone: '', designation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <h1>SIPCOT</h1>
          <p>Create your industry account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="Your Company Ltd" value={form.companyName} onChange={set('companyName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Designation</label>
            <input className="form-input" placeholder="e.g. Managing Director" value={form.designation} onChange={set('designation')} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-divider">Already have an account?</div>
        <Link to="/login">
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</button>
        </Link>
      </div>
    </div>
  );
}
