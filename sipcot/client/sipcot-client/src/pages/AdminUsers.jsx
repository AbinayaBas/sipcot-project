import React, { useEffect, useMemo, useState } from 'react';
import { getAllUsers, toggleUserActive } from '../utils/api';

function roleLabel(role) {
  if (role === 'admin') return 'Administrator';
  return 'Industry User';
}

function formatLastLogin(lastLogin) {
  if (!lastLogin) return 'No login activity';
  return new Date(lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('industry');
  const [profileUser, setProfileUser] = useState(null);

  const params = useMemo(() => {
    const p = { role: roleFilter };
    if (statusFilter === 'active') p.status = 'active';
    if (statusFilter === 'inactive') p.status = 'inactive';
    if (search.trim()) p.q = search.trim();
    return p;
  }, [search, statusFilter, roleFilter]);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers(params)
      .then((res) => setUsers(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [params]);

  const toggle = async (u) => {
    if (u.role === 'admin') return;
    if (u.isActive) {
      if (!window.confirm('Are you sure you want to deactivate this user account?')) return;
    } else if (!window.confirm('Activate this account and restore portal access?')) {
      return;
    }

    setToggling(u._id);
    try {
      const res = await toggleUserActive(u._id);
      setUsers((prev) => prev.map((row) => (row._id === u._id ? { ...row, isActive: res.data.data.isActive } : row)));
      setProfileUser((pu) =>
        pu && pu._id === u._id ? { ...pu, isActive: res.data.data.isActive } : pu
      );
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setToggling(null);
    }
  };

  const hasFilters = Boolean(search.trim() || statusFilter || roleFilter !== 'industry');

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Users</h1>
        <p style={{ maxWidth: 720 }}>
          {roleFilter === 'industry' ? (
            <>
              Displays all registered industry users. Administrators can monitor user activity and manage account access.
            </>
          ) : (
            <>
              Shows accounts for the selected role(s). Use filters to focus on industry users, administrators, or all
              roles—then review profiles and manage access where permitted.
            </>
          )}
        </p>
        <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 300 }}>
          {users.length} account{users.length === 1 ? '' : 's'} listed
          {hasFilters ? ' matching your filters' : ''}.
        </p>
      </div>

      <div className="filters" style={{ flexWrap: 'wrap', gap: 10 }}>
        <input
          className="search-input"
          type="search"
          placeholder="Search by name, email, or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by account status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter by role"
        >
          <option value="industry">Industry users</option>
          <option value="admin">Administrators</option>
          <option value="all">All roles</option>
        </select>
      </div>

      <p
        style={{
          margin: '12px 0 0',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 20px',
          alignItems: 'center',
        }}
      >
        <span>
          <span className="badge badge-success" style={{ marginRight: 6 }}>Active</span>
          Access granted — user may sign in.
        </span>
        <span>
          <span className="badge badge-danger" style={{ marginRight: 6 }}>Inactive</span>
          Access suspended — login blocked until reactivated.
        </span>
      </p>

      <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 900, lineHeight: 1.55 }}>
        Deactivated users will not be able to log in or access the system until reactivated.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>No users match your criteria.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Designation</th>
                  <th>Last login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--bg)',
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td>{u.companyName || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                      {u.industry?.name || '—'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{roleLabel(u.role)}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.designation || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatLastLogin(u.lastLogin)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setProfileUser(u)}>
                          View Profile
                        </button>
                        {u.role !== 'admin' ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            disabled={toggling === u._id}
                            onClick={() => toggle(u)}
                          >
                            {toggling === u._id ? 'Please wait…' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {profileUser ? (
        <div className="modal-overlay" role="presentation" onClick={() => setProfileUser(null)}>
          <div className="modal" role="dialog" aria-labelledby="user-profile-title" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="user-profile-title">User profile</h3>
              <button type="button" className="modal-close" aria-label="Close" onClick={() => setProfileUser(null)}>
                ×
              </button>
            </div>
            <div style={{ maxHeight: '58vh', overflow: 'auto', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 800, fontFamily: 'var(--font-head)', marginBottom: 12 }}>{profileUser.name}</div>
              <dl style={{ margin: 0, display: 'grid', gap: 12 }}>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Email</dt>
                  <dd style={{ margin: '4px 0 0' }}>{profileUser.email}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Role / access level</dt>
                  <dd style={{ margin: '4px 0 0' }}>{roleLabel(profileUser.role)}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Account status</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    <span className={`badge ${profileUser.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {profileUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Company</dt>
                  <dd style={{ margin: '4px 0 0' }}>{profileUser.companyName || '—'}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Designation</dt>
                  <dd style={{ margin: '4px 0 0' }}>{profileUser.designation || '—'}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Phone</dt>
                  <dd style={{ margin: '4px 0 0' }}>{profileUser.phone || '—'}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Linked industry</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {profileUser.industry?.name ? (
                      <>
                        {profileUser.industry.name}
                        {profileUser.industry.sipcotPark ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                            {' '}
                            · {profileUser.industry.sipcotPark}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Last login</dt>
                  <dd style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
                    {formatLastLogin(profileUser.lastLogin)}
                  </dd>
                </div>
                <div>
                  <dt style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Account created</dt>
                  <dd style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
                    {profileUser.createdAt
                      ? new Date(profileUser.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </dd>
                </div>
              </dl>
            </div>
            <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
              {profileUser.role !== 'admin' ? (
                <button
                  type="button"
                  className={`btn btn-sm ${profileUser.isActive ? 'btn-danger' : 'btn-success'}`}
                  disabled={toggling === profileUser._id}
                  onClick={() => toggle(profileUser)}
                >
                  {toggling === profileUser._id
                    ? 'Please wait…'
                    : profileUser.isActive
                      ? 'Deactivate account'
                      : 'Activate account'}
                </button>
              ) : null}
              <button type="button" className="btn btn-secondary" onClick={() => setProfileUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
