import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, Sparkles, CheckCircle2, Shield, User, Lock, Mail, Building, Award, AlertTriangle } from 'lucide-react';

export const AuthPage = () => {
  const { login, register, demoLogin } = useAuth();
  const [portalMode, setPortalMode] = useState('student'); // 'student' | 'admin'
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authErrors, setAuthErrors] = useState({});

  // Student Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    university: 'Stanford University',
    department: 'Computer Science',
    degreeLevel: 'B.Tech',
    graduationYear: 2026,
    availableHoursPerWeek: 15,
    preferredDomains: 'WEB_DEVELOPMENT,AI_MACHINE_LEARNING'
  });

  // Admin Form Data
  const [adminForm, setAdminForm] = useState({
    email: 'admin@projectpartner.com',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authErrors[e.target.name]) {
      setAuthErrors({ ...authErrors, [e.target.name]: null });
    }
  };

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
    if (authErrors[e.target.name]) {
      setAuthErrors({ ...authErrors, [e.target.name]: null });
    }
  };

  const validateStudentForm = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim()) {
      errs.email = 'Campus email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid campus email address (e.g. user@campus.edu)';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (isRegister) {
      if (!formData.fullName || !formData.fullName.trim()) {
        errs.fullName = 'Full name is required';
      } else if (formData.fullName.trim().length < 2) {
        errs.fullName = 'Full name must be at least 2 characters';
      }

      if (!formData.department || !formData.department.trim()) {
        errs.department = 'Academic department is required';
      }

      const gradYr = Number(formData.graduationYear);
      if (!gradYr || gradYr < 2020 || gradYr > 2035) {
        errs.graduationYear = 'Graduation year must be between 2020 and 2035';
      }

      const hrs = Number(formData.availableHoursPerWeek);
      if (!hrs || hrs < 1 || hrs > 80) {
        errs.availableHoursPerWeek = 'Hours must be between 1 and 80 per week';
      }
    }

    setAuthErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAdminForm = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminForm.email || !adminForm.email.trim()) {
      errs.email = 'Administrator email is required';
    } else if (!emailRegex.test(adminForm.email.trim())) {
      errs.email = 'Please enter a valid administrator email';
    }

    if (!adminForm.password) {
      errs.password = 'Password is required';
    }
    setAuthErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateStudentForm()) return;
    setLoading(true);
    try {
      if (isRegister) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateAdminForm()) return;
    setLoading(true);
    try {
      await login(adminForm.email, adminForm.password);
    } catch (err) {
      setError(err.message || 'Administrator authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Student personas only (Admin is completely isolated)
  const studentDemoAccounts = [
    { name: 'Sarah Jenkins', email: 'sarah@campus.edu', role: 'AI Specialist & Project Leader', color: '#ec4899', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { name: 'Alex Chen', email: 'alex@campus.edu', role: 'Full Stack & CampusPay Lead', color: '#6366f1', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { name: 'Priya Patel', email: 'priya@campus.edu', role: 'UI/UX Lead & HealthSync', color: '#8b5cf6', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'Elena Rostova', email: 'elena@campus.edu', role: 'NLP Candidate (Teammate Search)', color: '#06b6d4', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: portalMode === 'admin'
        ? 'radial-gradient(ellipse at 50% -20%, rgba(239, 68, 68, 0.2), transparent 70%), var(--bg-primary)'
        : 'radial-gradient(ellipse at 50% -20%, rgba(99, 102, 241, 0.25), transparent 70%), var(--bg-primary)'
    }}>
      {/* Top Portal Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem', width: '100%' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)',
          display: 'inline-flex',
          gap: '0.4rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <button
            type="button"
            onClick={() => { setPortalMode('student'); setError(''); setAuthErrors({}); }}
            className={`btn btn-sm ${portalMode === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <GraduationCap size={16} /> Student Campus Portal
          </button>
          <button
            type="button"
            onClick={() => { setPortalMode('admin'); setError(''); setAuthErrors({}); }}
            className={`btn btn-sm ${portalMode === 'admin' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <Shield size={16} /> Administrator Portal
          </button>
        </div>
      </div>

      {/* MODE 1: STUDENT PORTAL */}
      {portalMode === 'student' && (
        <div style={{ width: '100%', maxWidth: '1050px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
          
          {/* Left: Value Proposition & Student Demo Switchers */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'var(--accent-gradient-subtle)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: '1.25rem' }}>
              <Sparkles size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                Intelligent Academic Teammate Matching
              </span>
            </div>

            <h1 style={{ fontSize: '2.75rem', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Find the perfect teammates for your <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>next academic project</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Connect with students who have complementary skills, aligned domain interests, and matching availability schedules. Build teams that win.
            </p>

            {/* Quick Demo 1-Click Login Cards for Students */}
            <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  ⚡ 1-Click Student Demo Personas
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                  Instant Student Access
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {studentDemoAccounts.map(demo => (
                  <div
                    key={demo.email}
                    onClick={() => demoLogin(demo.email)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={demo.avatar} alt={demo.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{demo.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{demo.role}</div>
                      </div>
                    </div>
                    <span className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                      Sign in →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Student Auth Form */}
          <div className="glass-card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                  {isRegister ? 'Join ProjectPartner' : 'Student Portal Sign In'}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  {isRegister ? 'Create your student profile and discover teammates' : 'Enter your campus credentials to continue'}
                </p>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid var(--danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleStudentSubmit} noValidate>
              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="e.g. Alex Chen"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={{ borderColor: authErrors.fullName ? 'var(--danger)' : undefined }}
                  />
                  {authErrors.fullName && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      ⚠️ {authErrors.fullName}
                    </span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Campus Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="student@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ borderColor: authErrors.email ? 'var(--danger)' : undefined }}
                />
                {authErrors.email && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    ⚠️ {authErrors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ borderColor: authErrors.password ? 'var(--danger)' : undefined }}
                />
                {authErrors.password && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    ⚠️ {authErrors.password}
                  </span>
                )}
              </div>

              {isRegister && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">University</label>
                      <input
                        type="text"
                        name="university"
                        className="form-input"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder="e.g. Stanford"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input
                        type="text"
                        name="department"
                        className="form-input"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science"
                        style={{ borderColor: authErrors.department ? 'var(--danger)' : undefined }}
                      />
                      {authErrors.department && (
                        <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          ⚠️ {authErrors.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Graduation Year</label>
                      <input
                        type="number"
                        name="graduationYear"
                        className="form-input"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        style={{ borderColor: authErrors.graduationYear ? 'var(--danger)' : undefined }}
                      />
                      {authErrors.graduationYear && (
                        <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          ⚠️ {authErrors.graduationYear}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weekly Hours</label>
                      <input
                        type="number"
                        name="availableHoursPerWeek"
                        className="form-input"
                        value={formData.availableHoursPerWeek}
                        onChange={handleChange}
                        style={{ borderColor: authErrors.availableHoursPerWeek ? 'var(--danger)' : undefined }}
                      />
                      {authErrors.availableHoursPerWeek && (
                        <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          ⚠️ {authErrors.availableHoursPerWeek}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isRegister ? 'Create Account & Profile' : 'Sign In as Student')}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {isRegister ? (
                <span>
                  Already have a student account?{' '}
                  <button
                    onClick={() => { setIsRegister(false); setAuthErrors({}); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New to ProjectPartner?{' '}
                  <button
                    onClick={() => { setIsRegister(true); setAuthErrors({}); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Create Student Account
                  </button>
                </span>
              )}
            </div>
          </div>

        </div>
      )}

      {/* MODE 2: ISOLATED ADMINISTRATOR PORTAL */}
      {portalMode === 'admin' && (
        <div style={{ width: '100%', maxWidth: '960px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
          
          {/* Left: Security notice & Admin info */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', marginBottom: '1.25rem' }}>
              <Shield size={16} color="var(--danger)" />
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--danger)', letterSpacing: '0.05em' }}>
                RESTRICTED ACCESS PORTAL
              </span>
            </div>

            <h1 style={{ fontSize: '2.6rem', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Platform Administrator <span style={{ color: 'var(--danger)' }}>Control Console</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Dedicated management interface for academic moderators and campus platform administrators. Not integrated with student persona data.
            </p>

            <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(239, 68, 68, 0.25)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={17} /> Security Notice
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                All actions in this console (suspending users, removing projects, altering skill taxonomy) take immediate platform-wide effect.
              </p>

              <button
                type="button"
                onClick={() => demoLogin('admin@projectpartner.com')}
                className="btn btn-danger"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Shield size={16} /> ⚡ Launch Platform Admin Console
              </button>
            </div>
          </div>

          {/* Right: Administrator Login Form */}
          <div className="glass-card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-xl)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Shield size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>
                  Administrator Login
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Enter master administrative credentials
                </p>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid var(--danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAdminSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Admin Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="admin@projectpartner.com"
                  value={adminForm.email}
                  onChange={handleAdminChange}
                  style={{ borderColor: authErrors.email ? 'var(--danger)' : undefined }}
                />
                {authErrors.email && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    ⚠️ {authErrors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Admin Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="admin123"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  style={{ borderColor: authErrors.password ? 'var(--danger)' : undefined }}
                />
                {authErrors.password && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    ⚠️ {authErrors.password}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Default admin credentials: <code>admin@projectpartner.com</code> / <code>admin123</code>
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Are you a student looking for teams?{' '}
              <button
                onClick={() => { setPortalMode('student'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', cursor: 'pointer' }}
              >
                Switch to Student Portal
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
