import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Sparkles,
  FolderGit2,
  Users,
  Kanban,
  Shield,
  Layers,
  GraduationCap
} from 'lucide-react';

export const Sidebar = ({ activeTab, onNavigate }) => {
  const { user, isAdmin, profile } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & Highlights' },
    { id: 'profile', label: 'Profile & Skills', icon: User, desc: 'Portfolio & Proficiency' },
    { id: 'match', label: 'Teammate Finder', icon: Sparkles, badge: 'AI Match', desc: 'Skill-based matching' },
    { id: 'projects', label: 'Explore Projects', icon: FolderGit2, desc: 'Open project listings' },
    { id: 'team', label: 'Team Workspace', icon: Users, desc: 'Roster & Discussions' },
    { id: 'progress', label: 'Project Kanban', icon: Kanban, desc: 'Milestones & Tasks' }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '800',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
          flexShrink: 0
        }}>
          <GraduationCap size={22} />
        </div>
        <div className="brand-title">
          <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ProjectPartner
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Student Collaboration
          </div>
        </div>
      </div>

      {/* Nav Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Menu Modules
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--accent-gradient-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.88rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={19} color={isActive ? 'var(--accent-primary)' : 'currentColor'} style={{ flexShrink: 0 }} />
              <span className="nav-label" style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className={`badge ${item.badge === 'Admin' ? 'badge-danger' : 'badge-indigo'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      {user && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', margin: '0.5rem' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="User" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
