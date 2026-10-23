import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import { Modal } from '../components/Modal';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Users,
  Send,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  Layers,
  Sparkles,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProjectsPage = ({ onNavigate, onSelectProject }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Project Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    domain: 'WEB_DEVELOPMENT',
    maxTeamSize: 4,
    githubRepo: '',
    demoUrl: '',
    requiredSkills: [
      { skillId: '', minProficiency: 'INTERMEDIATE', mandatory: true }
    ]
  });

  // Join Request Modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedProjectForJoin, setSelectedProjectForJoin] = useState(null);
  const [joinPitchMessage, setJoinPitchMessage] = useState('');
  const [joinRole, setJoinRole] = useState('MEMBER');
  const [joinSending, setJoinSending] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getAllProjects({
        query: searchQuery,
        domain: domainFilter,
        status: statusFilter
      });
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [searchQuery, domainFilter, statusFilter]);

  useEffect(() => {
    api.getAllSkills().then(res => setAllSkills(res || [])).catch(() => {});
  }, []);

  // Validation error states
  const [createErrors, setCreateErrors] = useState({});
  const [joinErrors, setJoinErrors] = useState({});

  const handleAddSkillRow = () => {
    setCreateForm({
      ...createForm,
      requiredSkills: [
        ...createForm.requiredSkills,
        { skillId: '', minProficiency: 'INTERMEDIATE', mandatory: true }
      ]
    });
  };

  const handleRemoveSkillRow = (index) => {
    if (createForm.requiredSkills.length === 1) {
      setCreateForm({
        ...createForm,
        requiredSkills: [{ skillId: '', minProficiency: 'INTERMEDIATE', mandatory: true }]
      });
    } else {
      const updated = createForm.requiredSkills.filter((_, i) => i !== index);
      setCreateForm({ ...createForm, requiredSkills: updated });
    }
  };

  const handleSkillRowChange = (index, field, value) => {
    const updated = [...createForm.requiredSkills];
    updated[index][field] = value;
    setCreateForm({ ...createForm, requiredSkills: updated });
  };

  const validateCreateForm = () => {
    const errs = {};
    if (!createForm.title || createForm.title.trim().length < 5) {
      errs.title = 'Project title must be at least 5 characters.';
    }
    if (!createForm.description || createForm.description.trim().length < 20) {
      errs.description = 'Please provide a detailed description (at least 20 characters) describing the project scope.';
    }
    const teamSize = Number(createForm.maxTeamSize);
    if (isNaN(teamSize) || teamSize < 2 || teamSize > 10) {
      errs.maxTeamSize = 'Max team size must be between 2 and 10.';
    }
    const validSkills = createForm.requiredSkills.filter(s => s.skillId);
    if (validSkills.length === 0) {
      errs.skills = 'Please add at least one required technical skill.';
    }
    const skillIds = validSkills.map(s => String(s.skillId));
    if (new Set(skillIds).size !== skillIds.length) {
      errs.skills = 'Duplicate skills selected. Please select distinct required skills.';
    }
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;
    try {
      const validSkills = createForm.requiredSkills
        .filter(s => s.skillId)
        .map(s => ({
          skillId: Number(s.skillId),
          minProficiency: s.minProficiency,
          mandatory: s.mandatory
        }));

      await api.createProject({
        ...createForm,
        maxTeamSize: Number(createForm.maxTeamSize),
        requiredSkills: validSkills
      });

      setCreateModalOpen(false);
      setCreateErrors({});
      setCreateForm({
        title: '',
        description: '',
        domain: 'WEB_DEVELOPMENT',
        maxTeamSize: 4,
        githubRepo: '',
        demoUrl: '',
        requiredSkills: [{ skillId: '', minProficiency: 'INTERMEDIATE', mandatory: true }]
      });
      await loadProjects();
    } catch (err) {
      alert(err.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? All associated tasks, milestones, requests, and discussions will be removed.')) return;
    try {
      await api.deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const handleOpenJoinModal = (project) => {
    setSelectedProjectForJoin(project);
    setJoinPitchMessage(`Hi ${project.leaderName}, I would love to contribute to ${project.title}. My skills align directly with your required roadmap.`);
    setJoinSuccess('');
    setJoinErrors({});
    setJoinModalOpen(true);
  };

  const validateJoinForm = () => {
    const errs = {};
    if (!joinPitchMessage || joinPitchMessage.trim().length < 10) {
      errs.message = 'Please provide a pitch with at least 10 characters explaining your contribution.';
    }
    setJoinErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!selectedProjectForJoin) return;
    if (!validateJoinForm()) return;
    setJoinSending(true);
    try {
      await api.sendTeamRequest({
        projectId: selectedProjectForJoin.id,
        receiverId: selectedProjectForJoin.leaderId,
        requestType: 'JOIN_REQUEST',
        proposedRole: joinRole,
        message: joinPitchMessage
      });

      setJoinSuccess(`Join request submitted to ${selectedProjectForJoin.leaderName}!`);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      setTimeout(() => {
        setJoinModalOpen(false);
        setJoinSuccess('');
      }, 1800);
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setJoinSending(false);
    }
  };

  return (
    <div className="page-body">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FolderGit2 size={24} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              Academic Projects & Team Recruitment
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Browse open projects or launch your own to assemble high-caliber student teammates
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} /> Create New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search projects by title, description or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-select"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="">All Domains</option>
            <option value="WEB_DEVELOPMENT">Web Development</option>
            <option value="AI_MACHINE_LEARNING">AI & Machine Learning</option>
            <option value="MOBILE_APPS">Mobile Applications</option>
            <option value="CLOUD_DEVOPS">Cloud & DevOps</option>
            <option value="BLOCKCHAIN">Blockchain & Web3</option>
            <option value="CYBERSECURITY">Cybersecurity</option>
            <option value="IOT_EMBEDDED">IoT & Embedded</option>
          </select>
        </div>

        <div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="RECRUITING">Recruiting Only</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading active project directory...
        </div>
      ) : projects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {projects.map(p => {
            const isMember = p.members?.some(m => m.userId === user?.id) || p.leaderId === user?.id;
            const isLeader = p.leaderId === user?.id;

            return (
              <div key={p.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <StatusBadge status={p.domain} />
                  <StatusBadge status={p.status} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: 1.25, margin: '0 0 0.35rem 0' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    <span>Sprint Progress</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{p.progressPercentage}%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.progressPercentage}%`, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Team Roster Snippet & Slots */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={15} color="var(--text-muted)" />
                    <span>Leader: <strong>{p.leaderName}</strong></span>
                  </div>
                  <span style={{ fontWeight: '700', color: p.openSlots > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                    {p.currentTeamSize} / {p.maxTeamSize} Members ({p.openSlots} open)
                  </span>
                </div>

                {/* Required Skills */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Required Technical Roles
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {p.requiredSkills && p.requiredSkills.length > 0 ? (
                      p.requiredSkills.map(rs => (
                        <SkillTag key={rs.id} name={rs.skillName} proficiency={rs.minProficiency} />
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open to all engineering backgrounds</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  {isMember ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        onSelectProject(p.id);
                        onNavigate('team');
                      }}
                    >
                      <Users size={15} /> Enter Team Workspace
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleOpenJoinModal(p)}
                      disabled={p.openSlots <= 0 || p.status !== 'RECRUITING'}
                    >
                      <Send size={15} /> {p.status === 'IN_PROGRESS' ? 'Project In Progress' : (p.openSlots > 0 ? 'Request to Join Team' : 'Team is Full')}
                    </button>
                  )}

                  {(isLeader || user?.role === 'ROLE_ADMIN') && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.45rem 0.65rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(p.id);
                      }}
                      title="Permanently delete this project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No projects found matching your search criteria.
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Project Team" maxWidth="680px">
        <form onSubmit={handleCreateProject} noValidate>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: createErrors.title ? '#ef4444' : undefined }}
              placeholder="e.g. AI-Powered Medical Diagnosis Assistant"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
            {createErrors.title && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{createErrors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description & Scope (min 20 chars) *</label>
            <textarea
              className="form-textarea"
              rows={3}
              style={{ borderColor: createErrors.description ? '#ef4444' : undefined }}
              placeholder="Explain the project scope, technical challenges, and what you aim to achieve..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              required
            />
            {createErrors.description && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{createErrors.description}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Project Domain *</label>
              <select
                className="form-select"
                value={createForm.domain}
                onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
              >
                <option value="WEB_DEVELOPMENT">Web Development</option>
                <option value="AI_MACHINE_LEARNING">AI & Machine Learning</option>
                <option value="MOBILE_APPS">Mobile Applications</option>
                <option value="CLOUD_DEVOPS">Cloud & DevOps</option>
                <option value="BLOCKCHAIN">Blockchain & Web3</option>
                <option value="CYBERSECURITY">Cybersecurity</option>
                <option value="IOT_EMBEDDED">IoT & Embedded</option>
                <option value="DATA_SCIENCE">Data Science & Analytics</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Team Size (2-10) *</label>
              <input
                type="number"
                min={2}
                max={10}
                className="form-input"
                style={{ borderColor: createErrors.maxTeamSize ? '#ef4444' : undefined }}
                value={createForm.maxTeamSize}
                onChange={(e) => setCreateForm({ ...createForm, maxTeamSize: Number(e.target.value) })}
                required
              />
              {createErrors.maxTeamSize && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{createErrors.maxTeamSize}</div>}
            </div>
          </div>

          {/* Required Skills Builder */}
          <div style={{ margin: '1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Required Technical Skills (Used for Teammate Matching) *</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddSkillRow}
                style={{ fontSize: '0.75rem' }}
              >
                + Add Skill
              </button>
            </div>

            {createErrors.skills && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{createErrors.skills}</div>}

            {createForm.requiredSkills.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr auto auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <select
                  className="form-select"
                  value={row.skillId}
                  onChange={(e) => handleSkillRowChange(idx, 'skillId', e.target.value)}
                  required
                >
                  <option value="">-- Select Skill --</option>
                  {allSkills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>

                <select
                  className="form-select"
                  value={row.minProficiency}
                  onChange={(e) => handleSkillRowChange(idx, 'minProficiency', e.target.value)}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={row.mandatory}
                    onChange={(e) => handleSkillRowChange(idx, 'mandatory', e.target.checked)}
                  />
                  Required
                </label>

                <button
                  type="button"
                  onClick={() => handleRemoveSkillRow(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem', fontSize: '1.1rem' }}
                  title="Remove skill row"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Project</button>
          </div>
        </form>
      </Modal>

      {/* Join Request Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title={`Request to Join ${selectedProjectForJoin?.title}`}
      >
        {joinSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Request Submitted!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{joinSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleSendJoinRequest} noValidate>
            <div className="form-group">
              <label className="form-label">Proposed Role in Team</label>
              <select
                className="form-select"
                value={joinRole}
                onChange={(e) => setJoinRole(e.target.value)}
              >
                <option value="FRONTEND_DEV">Frontend Developer</option>
                <option value="BACKEND_DEV">Backend Developer</option>
                <option value="FULLSTACK_DEV">Full Stack Developer</option>
                <option value="AI_ML_ENGINEER">AI / Machine Learning Engineer</option>
                <option value="UI_UX_DESIGNER">UI / UX Designer</option>
                <option value="MOBILE_DEV">Mobile Developer</option>
                <option value="DEVOPS_ENGINEER">DevOps / Cloud Engineer</option>
                <option value="RESEARCHER">Researcher / Analyst</option>
                <option value="MEMBER">General Contributor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Your Pitch to the Project Leader *</label>
              <textarea
                className="form-textarea"
                rows={4}
                style={{ borderColor: joinErrors.message ? '#ef4444' : undefined }}
                value={joinPitchMessage}
                onChange={(e) => setJoinPitchMessage(e.target.value)}
                placeholder="Describe what you can build and why you're enthusiastic about this project..."
                required
              />
              {joinErrors.message && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{joinErrors.message}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setJoinModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={joinSending}
              >
                {joinSending ? 'Submitting...' : 'Send Join Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
