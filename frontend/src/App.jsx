import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { MatchFinderPage } from './pages/MatchFinderPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TeamWorkspacePage } from './pages/TeamWorkspacePage';
import { ProjectProgressPage } from './pages/ProjectProgressPage';
import { AdminPage } from './pages/AdminPage';
import { Shield, Sun, Moon, LogOut, Activity } from 'lucide-react';

export function App() {
  const { user, isAdmin, isAuthenticated, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99,102,241,0.2)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '1rem', fontWeight: '600' }}>Initializing ProjectPartner...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // ISOLATED ADMIN SYSTEM: If user is an Administrator, render dedicated Admin Console
  if (isAdmin || user?.role === 'ROLE_ADMIN') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        {/* Dedicated Admin Header */}
        <header className="navbar" style={{
          borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
          background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-secondary) 100%)',
          padding: '0.85rem 2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                  ProjectPartner <span style={{ color: 'var(--danger)' }}>Admin Console</span>
                </h1>
                <span className="badge badge-danger" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                  SUPERADMIN
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                System Administration • Platform Governance & Moderation (Isolated from Student Users)
              </span>
            </div>
          </div>

          {/* Admin Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.78rem',
              color: '#10b981',
              fontWeight: '700'
            }}>
              <Activity size={13} />
              <span>Platform Online</span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={toggleTheme}
              style={{ padding: '0.5rem', borderRadius: '50%', width: '38px', height: '38px' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{user.fullName}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: '600' }}>Platform Administrator</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                title="Sign out of Administrator Console"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Dedicated Admin Body */}
        <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <AdminPage />
        </main>
      </div>
    );
  }

  // STANDARD STUDENT APPLICATION WORKFLOW
  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProject = (projId) => {
    setSelectedProjectId(projId);
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onNavigate={handleNavigate} />

      <div className="main-content">
        <Navbar
          onOpenNotifications={() => handleNavigate('team')}
          onNavigate={handleNavigate}
        />

        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <DashboardPage onNavigate={handleNavigate} />
          )}

          {activeTab === 'profile' && (
            <ProfilePage />
          )}

          {activeTab === 'match' && (
            <MatchFinderPage onNavigate={handleNavigate} />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage
              onNavigate={handleNavigate}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeTab === 'team' && (
            <TeamWorkspacePage
              selectedProjectId={selectedProjectId}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'progress' && (
            <ProjectProgressPage
              selectedProjectId={selectedProjectId}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
