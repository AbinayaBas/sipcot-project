import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getMyIndustry, registerIndustry, updateMyIndustry, getMyData } from '../utils/api';

/** Aligned with server Industry model `type` enum */
const TYPES = ['Manufacturing', 'Textile', 'Chemical', 'Pharmaceutical', 'Electronics', 'Food Processing', 'Engineering', 'IT/ITES', 'Other'];
const CATEGORIES = ['Large', 'Medium', 'Small', 'Micro'];
/** Aligned with admin targeting / seed park names */
const PARKS = [
  'Hosur I',
  'Hosur II',
  'Perundurai',
  'Oragadam',
  'Sriperumbudur',
  'Ranipet',
  'Gummidipoondi',
  'Irrungattukottai',
  'Cuddalore',
  'Tuticorin',
  'Other',
];
const STATUSES = ['Active', 'Inactive', 'Under Construction', 'Closed'];

/** Optional hint: district when city is known (Tamil Nadu) */
const CITY_TO_DISTRICT = {
  hosur: 'Krishnagiri',
  chennai: 'Chennai',
  coimbatore: 'Coimbatore',
  erode: 'Erode',
  tiruppur: 'Tiruppur',
  salem: 'Salem',
  trichy: 'Tiruchirappalli',
  madurai: 'Madurai',
  perundurai: 'Erode',
  oragadam: 'Kanchipuram',
  sriperumbudur: 'Kanchipuram',
  cuddalore: 'Cuddalore',
  tuticorin: 'Thoothukudi',
  ranipet: 'Ranipet',
  gummidipoondi: 'Tiruvallur',
};

const empty = {
  name: '',
  type: 'Manufacturing',
  category: 'Medium',
  sipcotPark: '',
  commencementYear: new Date().getFullYear(),
  status: 'Active',
  location: { address: '', city: '', district: '', state: 'Tamil Nadu', pincode: '' },
  contactPerson: {
    name: '',
    email: '',
    phone: '',
    designation: '',
    alternateName: '',
    alternatePhone: '',
    alternateEmail: '',
  },
  allottedArea: { value: '', unit: 'acres' },
};

function setByPath(prev, path, value) {
  const keys = path.split('.');
  if (keys.length === 1) return { ...prev, [keys[0]]: value };
  const [head, ...rest] = keys;
  const child = prev[head] && typeof prev[head] === 'object' ? { ...prev[head] } : {};
  return { ...prev, [head]: setByPath(child, rest.join('.'), value) };
}

function validateIndustryForm(form, { isRegister }) {
  const e = {};
  const y = new Date().getFullYear();
  const cy = Number(form.commencementYear);
  if (form.commencementYear !== '' && form.commencementYear != null && Number.isFinite(cy)) {
    if (cy > y) e.commencementYear = 'Commencement year cannot be in the future.';
    if (cy < 1900) e.commencementYear = 'Enter a realistic commencement year.';
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const em = (form.contactPerson?.email || '').trim();
  if (em && !emailRe.test(em)) e.contactEmail = 'Enter a valid email address.';
  const ph = String(form.contactPerson?.phone || '').replace(/\D/g, '');
  if (ph && ph.length !== 10) e.contactPhone = 'Phone must be 10 digits.';
  if (ph && !/^[6-9]\d{9}$/.test(ph)) e.contactPhone = 'Enter a valid 10-digit Indian mobile number.';
  const pin = String(form.location?.pincode || '').replace(/\s/g, '');
  if (pin && !/^\d{6}$/.test(pin)) e.pincode = 'Pincode must be exactly 6 digits.';
  const altE = (form.contactPerson?.alternateEmail || '').trim();
  if (altE && !emailRe.test(altE)) e.altEmail = 'Enter a valid alternate email.';
  const altP = String(form.contactPerson?.alternatePhone || '').replace(/\D/g, '');
  if (altP && (altP.length !== 10 || !/^[6-9]\d{9}$/.test(altP))) {
    e.altPhone = 'Alternate phone must be a valid 10-digit mobile number.';
  }
  if (isRegister && !String(form.sipcotPark || '').trim()) {
    e.sipcotPark = 'Select your SIPCOT park.';
  }
  return e;
}

export default function MyIndustry() {
  const [industry, setIndustry] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [records, setRecords] = useState([]);
  const msgRef = useRef(null);
  const isEdit = !!industry;

  useEffect(() => {
    getMyIndustry()
      .then((res) => {
        if (res.data.data) {
          const d = res.data.data;
          setIndustry(d);
          setForm({
            ...empty,
            ...d,
            location: { ...empty.location, ...(d.location || {}) },
            contactPerson: { ...empty.contactPerson, ...(d.contactPerson || {}) },
            allottedArea: { ...empty.allottedArea, ...(d.allottedArea || {}) },
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!industry) {
      setRecords([]);
      return;
    }
    getMyData()
      .then((r) => setRecords(r.data.data || []))
      .catch(() => setRecords([]));
  }, [industry]);

  useEffect(() => {
    if (msg?.type === 'success' && msgRef.current) {
      msgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [msg]);

  const set =
    (path) =>
    (e) => {
      const v = e.target.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value;
      setForm((prev) => setByPath(prev, path, v));
    };

  const onCityBlur = () => {
    const c = String(form.location?.city || '').trim().toLowerCase();
    if (!c) return;
    const hint = CITY_TO_DISTRICT[c];
    if (!hint) return;
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        state: prev.location?.state || 'Tamil Nadu',
        district: prev.location?.district || hint,
      },
    }));
  };

  const linked = useMemo(() => {
    const submitted = records.map((r) => r.submittedAt).filter(Boolean);
    const ts = submitted.map((d) => new Date(d).getTime());
    const last = ts.length ? new Date(Math.max(...ts)) : null;
    return {
      total: records.length,
      last: last ? last.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
    };
  }, [records]);

  const parkOptions = useMemo(() => {
    const p = form.sipcotPark;
    if (p && !PARKS.includes(p)) return [...PARKS, p];
    return PARKS;
  }, [form.sipcotPark]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const errs = validateIndustryForm(form, { isRegister: !industry });
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setMsg({ type: 'error', text: 'Please fix the highlighted fields and try again.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        location: { ...form.location, state: 'Tamil Nadu' },
      };
      if (!industry) {
        delete payload.registrationNumber;
      }
      const res = industry ? await updateMyIndustry(payload) : await registerIndustry(payload);
      setIndustry(res.data.data);
      setForm((prev) => ({
        ...prev,
        ...res.data.data,
        location: { ...empty.location, ...(res.data.data.location || {}) },
        contactPerson: { ...empty.contactPerson, ...(res.data.data.contactPerson || {}) },
        allottedArea: { ...empty.allottedArea, ...(res.data.data.allottedArea || {}) },
      }));
      setFieldErrors({});
      setMsg({
        type: 'success',
        text: industry ? 'Profile updated successfully. Your details are saved.' : 'Industry registered successfully. Your estate registration number has been assigned.',
      });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="fade-in portal-page">
      <header className="portal-hero">
        <div className="portal-hero__eyebrow">{isEdit ? 'Estate registration' : 'First-time setup'}</div>
        <h1>{isEdit ? 'My Industry' : 'Register Industry'}</h1>
        <p className="portal-hero__lead">
          {isEdit
            ? 'Official unit profile on the SIPCOT portal — keep it aligned with your operations and licensing so targeting, returns, and notices stay correct.'
            : 'Create your industrial unit record once. It unlocks statutory data returns, park-based updates, and document downloads.'}
        </p>
        <div className="portal-hero__chips">
          <span className="portal-chip">Tamil Nadu · SIPCOT</span>
          <span className="portal-chip">Updates & MIS targeting</span>
          <span className="portal-chip">Auditor-friendly fields</span>
        </div>
      </header>

      <div className="portal-info-panel">
        <strong style={{ color: 'var(--text)' }}>Why this profile matters:</strong> your industry record decides which announcements, schedules, and documents appear in the
        Updates Center. Park and sector drive targeting — inaccuracies here look like “missing mail” even when the system is working.
      </div>

      {msg && (
        <div ref={msgRef} className={`alert alert-${msg.type}`} role={msg.type === 'success' ? 'status' : 'alert'}>
          {msg.text}
        </div>
      )}

      {isEdit && (
        <div className="portal-linked-grid">
          <div className="portal-linked-tile">
            <div className="portal-linked-tile__label">Total submissions</div>
            <div className="portal-linked-tile__value">{linked.total}</div>
            <div className="portal-linked-tile__hint">All reporting years on file</div>
          </div>
          <div className="portal-linked-tile">
            <div className="portal-linked-tile__label">Last filed return</div>
            <div className="portal-linked-tile__value" style={{ fontSize: '1.05rem' }}>
              {linked.last}
            </div>
            <div className="portal-linked-tile__hint">Latest submitted date</div>
          </div>
          <div className="portal-linked-tile">
            <div className="portal-linked-tile__label">Industry status</div>
            <div className="portal-linked-tile__value" style={{ fontSize: '1.1rem' }}>
              {form.status || industry?.status || '—'}
            </div>
            <div className="portal-linked-tile__hint">As declared to the estate</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="card portal-form-block">
          <div className="portal-section-head">
            <span className="portal-section-head__step">1</span>
            <span>Basic information</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Industry Name</label>
              <input className="form-input" value={form.name || ''} onChange={set('name')} required placeholder="e.g. TechFab Industries" />
            </div>
            <div className="form-group">
              <label className="form-label">Registration number</label>
              {isEdit && form.registrationNumber ? (
                <>
                  <div className="portal-readonly-box" style={{ cursor: 'default' }}>
                    {form.registrationNumber}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned by the system — cannot be changed here.</span>
                </>
              ) : (
                <>
                  <div className="portal-readonly-box" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                    Assigned when you register
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You will receive a SIPCOT estate registration number after the first successful save.</span>
                </>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Industry Type</label>
              <select className="form-select" value={form.type || ''} onChange={set('type')}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category || ''} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">SIPCOT Park</label>
              <select
                className="form-select"
                value={form.sipcotPark || ''}
                onChange={set('sipcotPark')}
                required={!isEdit}
                disabled={isEdit}
                style={isEdit ? { opacity: 0.9, cursor: 'not-allowed' } : undefined}
              >
                <option value="">{isEdit ? '' : 'Select park'}</option>
                {parkOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {fieldErrors.sipcotPark ? <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{fieldErrors.sipcotPark}</span> : null}
              {isEdit ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Park is fixed after registration because it drives announcement and schedule targeting. For corrections, contact SIPCOT admin.
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose carefully — this field cannot be changed after registration.</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Commencement Year</label>
              <input
                className="form-input"
                type="number"
                value={form.commencementYear ?? ''}
                onChange={set('commencementYear')}
                min={1900}
                max={new Date().getFullYear()}
              />
              {fieldErrors.commencementYear ? <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{fieldErrors.commencementYear}</span> : null}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status || ''} onChange={set('status')}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Allotted Area</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  type="number"
                  value={form.allottedArea?.value ?? ''}
                  onChange={set('allottedArea.value')}
                  placeholder="Area"
                  style={{ flex: 2 }}
                />
                <select className="form-select" value={form.allottedArea?.unit || 'acres'} onChange={set('allottedArea.unit')} style={{ flex: 1 }}>
                  <option>acres</option>
                  <option>sqft</option>
                  <option>sqm</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card portal-form-block">
          <div className="portal-section-head">
            <span className="portal-section-head__step">2</span>
            <span>Location</span>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" value={form.location?.address || ''} onChange={set('location.address')} placeholder="Street address" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.location?.city || ''} onChange={set('location.city')} onBlur={onCityBlur} placeholder="City" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>District may auto-fill for common industrial towns (Tamil Nadu).</span>
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input className="form-input" value={form.location?.district || ''} onChange={set('location.district')} placeholder="District" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">State</label>
              <input className="form-input" readOnly value="Tamil Nadu" style={{ background: 'var(--bg3)', cursor: 'default', opacity: 0.95 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-input" inputMode="numeric" value={form.location?.pincode || ''} onChange={set('location.pincode')} placeholder="600001" maxLength={6} />
              {fieldErrors.pincode ? <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{fieldErrors.pincode}</span> : null}
            </div>
          </div>
        </div>

        <div className="card portal-form-block">
          <div className="portal-section-head">
            <span className="portal-section-head__step">3</span>
            <span>Contact person</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.contactPerson?.name || ''} onChange={set('contactPerson.name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" autoComplete="email" value={form.contactPerson?.email || ''} onChange={set('contactPerson.email')} />
              {fieldErrors.contactEmail ? <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{fieldErrors.contactEmail}</span> : null}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" inputMode="numeric" maxLength={10} value={form.contactPerson?.phone || ''} onChange={set('contactPerson.phone')} placeholder="10-digit mobile" />
              {fieldErrors.contactPhone ? <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{fieldErrors.contactPhone}</span> : null}
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input className="form-input" value={form.contactPerson?.designation || ''} onChange={set('contactPerson.designation')} />
            </div>
          </div>
          <div className="portal-subsection-title">
            Alternate contact <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.contactPerson?.alternateName || ''} onChange={set('contactPerson.alternateName')} placeholder="Secondary contact name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                inputMode="numeric"
                maxLength={10}
                value={form.contactPerson?.alternatePhone || ''}
                onChange={set('contactPerson.alternatePhone')}
                placeholder="10-digit mobile"
              />
              {fieldErrors.altPhone ? <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{fieldErrors.altPhone}</span> : null}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={form.contactPerson?.alternateEmail || ''}
              onChange={set('contactPerson.alternateEmail')}
              placeholder="alternate@company.com"
            />
            {fieldErrors.altEmail ? <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{fieldErrors.altEmail}</span> : null}
          </div>
        </div>

        <div className="portal-form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save profile changes' : 'Register industry'}
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isEdit ? 'Changes apply to targeting and future correspondence.' : 'You can refine details later from this same page.'}
          </span>
        </div>
      </form>
    </div>
  );
}
