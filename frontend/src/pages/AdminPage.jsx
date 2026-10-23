import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import { Modal } from '../components/Modal';
import {
  Shield,
  Users,
  FolderGit2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Lock,
  Unlock,
  Plus,
  BarChart3,
  Layers
} from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview', 'users', 'projects', 'skills'
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('ALL');

  // New skill modal & validation
  const [newSkillModal, setNewSkillModal] = useState(false);
  const [skillErrors, setSkillErrors] = useState({});
  const [newSkillForm, setNewSkillForm] = useState({
    name: '',
    category: 'BACKEND',
    description: ''
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, projectsData, skillsData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAllUsersAdmin().catch(() => []),
        api.getAllProjects().catch(() => []),
        api.getAllSkills().catch(() => [])
      ]);

      setStats(statsData);
      setUsersList(usersData || []);
      setProjectsList(projectsData || []);
      setSkillsList(skillsData || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.toggleUserStatusAdmin(userId);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Permanently delete student account "${userName}" and cascade remove all project memberships?`)) return;
    try {
      await api.deleteUserAdmin(userId);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    if (!window.confirm(`Permanently delete and moderate project "${projectTitle}" from the platform? All associated tasks and milestones will be removed.`)) return;
    try {
      await api.deleteProjectAdmin(projectId);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const validateSkill = () => {
    const errors = {};
    if (!newSkillForm.name || !newSkillForm.name.trim()) {
      errors.name = 'Skill name is required';
    } else if (newSkillForm.name.trim().length < 2) {
      errors.name = 'Skill name must be at least 2 characters';
    }
    if (!newSkillForm.category) {
      errors.category = 'Category is required';
    }
    setSkillErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!validateSkill()) return;
    try {
      await api.createSkillAdmin({
        ...newSkillForm,
        name: newSkillForm.name.trim()
      });
      setNewSkillModal(false);
      setNewSkillForm({ name: '', category: 'BACKEND', description: '' });
      setSkillErrors({});
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create skill');
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Delete skill "${skillName}" from the platform dictionary?`)) return;
    try {
      await api.deleteSkillAdmin(skillId);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete skill');
    }
  };

  if (loading) {
    return <div className="page-body" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading administrator controls...</div>;
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(99, 102, 241, 0.15) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.25)',
        marginBottom: '2rem',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Shield size={26} color="var(--danger)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              Platform Administrator Command Center
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '750px', margin: 0 }}>
            Monitor campus activity, project recruitment health, moderate content, and oversee user participation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeAdminTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('overview')}
          >
            Overview & Stats
          </button>
          <button
            className={`btn btn-sm ${activeAdminTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('users')}
          >
            Students ({usersList.length})
          </button>
          <button
            className={`btn btn-sm ${activeAdminTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('projects')}
          >
            Projects ({projectsList.length})
          </button>
          <button
            className={`btn btn-sm ${activeAdminTab === 'skills' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveAdminTab('skills')}
          >
            Skills ({skillsList.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeAdminTab === 'overview' && (
        <div>
          {/* Key Metric Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="glass-card">
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Students</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                {stats?.totalStudents || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered Campus Users</div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Projects</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', marginTop: '0.25rem' }}>
                {stats?.totalProjects || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats?.recruitingProjects || 0} Recruiting Members</div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team Requests</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning)', marginTop: '0.25rem' }}>
                {stats?.totalRequests || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats?.acceptedRequests || 0} Accepted Matches</div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Platform Match Rate</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--info)', marginTop: '0.25rem' }}>
                {stats?.totalRequests > 0 ? Math.round(((stats?.acceptedRequests || 1) / stats?.totalRequests) * 100) : 85}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Successful team formations</div>
            </div>
          </div>

          {/* Domain & Skill Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} color="var(--accent-primary)" /> Project Domain Distribution
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {stats?.domainDistribution && Object.keys(stats.domainDistribution).length > 0 ? (
                  Object.entries(stats.domainDistribution).map(([domain, count]) => (
                    <div key={domain}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        <span>{domain}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} projects</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, count * 30)}%`, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-full)' }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No domain activity recorded.</div>
                )}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="var(--success)" /> Most In-Demand Skills
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {stats?.skillPopularity && Object.keys(stats.skillPopularity).length > 0 ? (
                  Object.entries(stats.skillPopularity).slice(0, 6).map(([skill, count]) => (
                    <div key={skill}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        <span>{skill}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} students</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, count * 25)}%`, background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)', borderRadius: 'var(--radius-full)' }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Skills data calculating...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                Campus User & Student Accounts Directory
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Full moderation control: suspend access or permanently delete accounts with cascading project cleanup.
              </p>
            </div>

            <input
              type="text"
              className="form-input"
              style={{ maxWidth: '280px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              placeholder="🔍 Search name, email, department..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>User / Student</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Role</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Department & Campus</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Account Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Skills</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList
                .filter(u => {
                  if (!userSearch.trim()) return true;
                  const q = userSearch.toLowerCase();
                  return (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                         (u.email && u.email.toLowerCase().includes(q)) ||
                         (u.department && u.department.toLowerCase().includes(q));
                })
                .map(u => (
                  <tr key={u.id || u.userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                            {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '700' }}>{u.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-danger' : 'badge-indigo'}`}>
                        {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Student'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div>{u.department || 'General Engineering'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.university || 'Campus'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {u.enabled !== false ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Active
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: '700' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Suspended
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span className="badge badge-indigo">{u.skills?.length || 0} skills</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleUserStatus(u.userId)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          title={u.enabled !== false ? 'Suspend user account' : 'Re-activate user account'}
                        >
                          {u.enabled !== false ? <Lock size={12} /> : <Unlock size={12} />}
                          {u.enabled !== false ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u.userId, u.fullName)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          title="Permanently delete user and cascade all project records"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PROJECT MODERATION */}
      {activeAdminTab === 'projects' && (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                Active Campus Projects & Moderation
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Inspect student projects, team formation sizes, and delete non-compliant or abandoned projects.
              </p>
            </div>

            <input
              type="text"
              className="form-input"
              style={{ maxWidth: '280px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              placeholder="🔍 Search title, leader, domain..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Project Title</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Leader</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Domain</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Team Size</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {projectsList
                .filter(p => {
                  if (!projectSearch.trim()) return true;
                  const q = projectSearch.toLowerCase();
                  return (p.title && p.title.toLowerCase().includes(q)) ||
                         (p.leaderName && p.leaderName.toLowerCase().includes(q)) ||
                         (p.domain && p.domain.toLowerCase().includes(q));
                })
                .map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ fontWeight: '700' }}>{p.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.description}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {p.leaderName}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <StatusBadge status={p.domain} />
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {p.currentTeamSize} / {p.maxTeamSize}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteProject(p.id, p.title)}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        title="Permanently delete project and cascade all tasks"
                      >
                        <Trash2 size={13} /> Delete Project
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: SKILL DICTIONARY */}
      {activeAdminTab === 'skills' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Platform Skill Dictionary</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Standard skills available for student profiles and project matching algorithms.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setNewSkillModal(true)}>
              <Plus size={15} /> Add Standard Skill
            </button>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {['ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'AI_ML', 'MOBILE', 'DEVOPS', 'UI_UX'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSkillCategoryFilter(cat)}
                className={`btn btn-sm ${skillCategoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {skillsList
                .filter(s => skillCategoryFilter === 'ALL' || s.category === skillCategoryFilter)
                .map(s => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--bg-tertiary)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <strong>{s.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({s.category})</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(s.id, s.name)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title={`Permanently delete skill "${s.name}"`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal with Validation */}
      <Modal isOpen={newSkillModal} onClose={() => setNewSkillModal(false)} title="Add Standard Skill to Dictionary">
        <form onSubmit={handleCreateSkill} noValidate>
          <div className="form-group">
            <label className="form-label">Skill Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. GraphQL, Rust, PyTorch, Tailwind CSS"
              value={newSkillForm.name}
              onChange={(e) => {
                setNewSkillForm({ ...newSkillForm, name: e.target.value });
                if (skillErrors.name) setSkillErrors({ ...skillErrors, name: null });
              }}
              style={{ borderColor: skillErrors.name ? 'var(--danger)' : undefined }}
            />
            {skillErrors.name && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ {skillErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Category <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select
              className="form-select"
              value={newSkillForm.category}
              onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
            >
              <option value="FRONTEND">Frontend</option>
              <option value="BACKEND">Backend</option>
              <option value="DATABASE">Database</option>
              <option value="AI_ML">AI & Machine Learning</option>
              <option value="MOBILE">Mobile Development</option>
              <option value="DEVOPS">DevOps & Cloud</option>
              <option value="UI_UX">UI/UX Design</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brief description of the skill or framework..."
              value={newSkillForm.description}
              onChange={(e) => setNewSkillForm({ ...newSkillForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setNewSkillModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Skill</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
