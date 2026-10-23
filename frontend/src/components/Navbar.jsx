import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, LogOut, Sparkles, User, Shield, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export const Navbar = ({ onOpenNotifications, onNavigate }) => {
  const { user, profile, logout, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [incomingCount, setIncomingCount] = useState(0);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    const checkNotifications = async () => {
      if (user) {
        try {
          const reqs = await api.getIncomingRequests();
          const pending = reqs.filter(r => r.status === 'PENDING').length;
          setIncomingCount(pending);
        } catch (e) {
          // ignore background notification poll errors
        }
      }
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 12000);
    return () => clearInterval(interval);
  }, [user]);

  const demoAccounts = [
    { name: 'Sarah Jenkins', email: 'sarah@campus.edu', role: 'AI Lead & Project Creator', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { name: 'Alex Chen', email: 'alex@campus.edu', role: 'Full Stack & CampusPay Lead', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { name: 'Priya Patel', email: 'priya@campus.edu', role: 'UI/UX & HealthSync Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'Elena Rostova', email: 'elena@campus.edu', role: 'NLP Researcher & Teammate Candidate', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { name: 'Platform Admin', email: 'admin@projectpartner.com', role: 'System Governance & Moderation', avatar: null }
  ];

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '800',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            P
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              ProjectPartner
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1 }}>
              Academic Teammate Hub
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Demo Quick Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'var(--accent-gradient-subtle)' }}
            title="Switch demo student/admin personas"
          >
            <Sparkles size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)' }}>Switch Persona</span>
          </button>

          {showDemoMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: '280px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.6rem',
                zIndex: 60
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', padding: '0.4rem 0.6rem', textTransform: 'uppercase' }}>
                Instant Switch Persona
              </div>
              {demoAccounts.map(demo => (
                <div
                  key={demo.email}
                  onClick={() => {
                    demoLogin(demo.email);
                    setShowDemoMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    background: user?.email === demo.email ? 'var(--accent-gradient-subtle)' : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = user?.email === demo.email ? 'var(--accent-gradient-subtle)' : 'transparent'}
                >
                  {demo.avatar ? (
                    <img src={demo.avatar} alt={demo.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={16} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {demo.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {demo.role}
                    </div>
                  </div>
                  {user?.email === demo.email && (
                    <CheckCircle size={15} color="var(--accent-primary)" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenNotifications}
          style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%', width: '38px', height: '38px' }}
          title="Team Requests & Alerts"
        >
          <Bell size={18} />
          {incomingCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: '800',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)'
            }}>
              {incomingCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={toggleTheme}
          style={{ padding: '0.5rem', borderRadius: '50%', width: '38px', height: '38px' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Info & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => onNavigate('profile')}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ display: 'none', mdDisplay: 'block' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', lineHeight: 1.2 }}>{user.fullName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user.role === 'ROLE_ADMIN' ? 'Admin' : (profile?.department || 'Student')}
                </div>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={logout}
              style={{ padding: '0.45rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
