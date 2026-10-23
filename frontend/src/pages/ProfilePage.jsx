import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SkillTag } from '../components/SkillTag';
import { Modal } from '../components/Modal';
import {
  User,
  GraduationCap,
  Clock,
  Code2,
  Link2,
  Globe,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Code,
  FolderGit2,
  CheckCircle2
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [addSkillModal, setAddSkillModal] = useState(false);
  const [addProjectModal, setAddProjectModal] = useState(false);

  // Edit profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    bio: '',
    university: '',
    department: '',
    degreeLevel: '',
    graduationYear: 2026,
    availableHoursPerWeek: 15,
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    avatarUrl: '',
    preferredDomains: ''
  });

  // Add skill form
  const [allAvailableSkills, setAllAvailableSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'FRONTEND',
    proficiencyLevel: 'INTERMEDIATE',
    yearsOfExperience: 1.0
  });

  // Add past project form
  const [pastProjectForm, setPastProjectForm] = useState({
    title: '',
    description: '',
    technologiesUsed: '',
    repoUrl: '',
    demoUrl: '',
    projectDate: ''
  });

  // Validation error states
  const [profileErrors, setProfileErrors] = useState({});
  const [skillErrors, setSkillErrors] = useState({});
  const [projectErrors, setProjectErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName || user?.fullName || '',
        bio: profile.bio || '',
        university: profile.university || '',
        department: profile.department || '',
        degreeLevel: profile.degreeLevel || 'B.Tech',
        graduationYear: profile.graduationYear || 2026,
        availableHoursPerWeek: profile.availableHoursPerWeek || 15,
        githubUrl: profile.githubUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
        avatarUrl: profile.avatarUrl || '',
        preferredDomains: profile.preferredDomains || 'WEB_DEVELOPMENT'
      });
    }
  }, [profile, user]);

  useEffect(() => {
    api.getAllSkills().then(res => setAllAvailableSkills(res || [])).catch(() => {});
  }, []);

  const validateProfileForm = () => {
    const errs = {};
    if (!profileForm.fullName || profileForm.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    }
    if (!profileForm.university || !profileForm.university.trim()) {
      errs.university = 'University is required.';
    }
    if (!profileForm.department || !profileForm.department.trim()) {
      errs.department = 'Department / Major is required.';
    }
    const gradYear = Number(profileForm.graduationYear);
    if (!gradYear || gradYear < 2020 || gradYear > 2035) {
      errs.graduationYear = 'Graduation year must be between 2020 and 2035.';
    }
    const hours = Number(profileForm.availableHoursPerWeek);
    if (isNaN(hours) || hours < 1 || hours > 80) {
      errs.availableHoursPerWeek = 'Available hours must be between 1 and 80 hrs/week.';
    }
    if (!profileForm.bio || profileForm.bio.trim().length < 10) {
      errs.bio = 'Bio must be at least 10 characters long.';
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (profileForm.githubUrl && !urlPattern.test(profileForm.githubUrl)) {
      errs.githubUrl = 'Must be a valid URL starting with http:// or https://';
    }
    if (profileForm.linkedinUrl && !urlPattern.test(profileForm.linkedinUrl)) {
      errs.linkedinUrl = 'Must be a valid URL starting with http:// or https://';
    }
    if (profileForm.portfolioUrl && !urlPattern.test(profileForm.portfolioUrl)) {
      errs.portfolioUrl = 'Must be a valid URL starting with http:// or https://';
    }
    if (profileForm.avatarUrl && !urlPattern.test(profileForm.avatarUrl)) {
      errs.avatarUrl = 'Must be a valid image URL starting with http:// or https://';
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;
    setLoading(true);
    try {
      await api.updateProfile(profileForm);
      await refreshProfile();
      setEditProfileModal(false);
      setProfileErrors({});
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const validateSkillForm = () => {
    const errs = {};
    if (!skillForm.name || !skillForm.name.trim()) {
      errs.name = 'Skill name is required.';
    }
    const exp = Number(skillForm.yearsOfExperience);
    if (isNaN(exp) || exp < 0) {
      errs.yearsOfExperience = 'Years of experience must be 0 or higher.';
    }
    setSkillErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!validateSkillForm()) return;
    setLoading(true);
    try {
      await api.addSkill(skillForm);
      await refreshProfile();
      setAddSkillModal(false);
      setSkillForm({ name: '', category: 'FRONTEND', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: 1.0 });
      setSkillErrors({});
    } catch (err) {
      alert(err.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await api.removeSkill(skillId);
      await refreshProfile();
    } catch (err) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  const validatePastProjectForm = () => {
    const errs = {};
    if (!pastProjectForm.title || pastProjectForm.title.trim().length < 3) {
      errs.title = 'Project title must be at least 3 characters.';
    }
    if (!pastProjectForm.description || pastProjectForm.description.trim().length < 10) {
      errs.description = 'Please describe the project (at least 10 characters).';
    }
    if (!pastProjectForm.technologiesUsed || !pastProjectForm.technologiesUsed.trim()) {
      errs.technologiesUsed = 'Mention the tools/tech used (e.g. React, Python).';
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (pastProjectForm.repoUrl && !urlPattern.test(pastProjectForm.repoUrl)) {
      errs.repoUrl = 'Must be a valid URL starting with http:// or https://';
    }
    if (pastProjectForm.demoUrl && !urlPattern.test(pastProjectForm.demoUrl)) {
      errs.demoUrl = 'Must be a valid URL starting with http:// or https://';
    }
    setProjectErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!validatePastProjectForm()) return;
    setLoading(true);
    try {
      await api.addPastProject(pastProjectForm);
      await refreshProfile();
      setAddProjectModal(false);
      setPastProjectForm({ title: '', description: '', technologiesUsed: '', repoUrl: '', demoUrl: '', projectDate: '' });
      setProjectErrors({});
    } catch (err) {
      alert(err.message || 'Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project from your showcase?')) return;
    try {
      await api.deletePastProject(projectId);
      await refreshProfile();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="page-body">
      {/* Profile Header Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          height: '110px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(236, 72, 153, 0.3) 100%)',
          margin: '-1.5rem -1.5rem 0 -1.5rem',
          borderBottom: '1px solid var(--border-color)'
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginTop: '-45px', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem' }}>
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-card)', boxShadow: 'var(--shadow-md)' }} />
            ) : (
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--accent-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '2rem', border: '4px solid var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
                {user?.fullName ? user.fullName[0] : 'U'}
              </div>
            )}

            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
                {profile?.fullName || user?.fullName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                <GraduationCap size={16} />
                <span>{profile?.degreeLevel || 'B.Tech'} in {profile?.department || 'Computer Science'} • {profile?.university || 'Campus'}</span>
                <span>• Class of {profile?.graduationYear || 2026}</span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setEditProfileModal(true)}>
            <Edit3 size={15} />
            Edit Profile
          </button>
        </div>

        {/* Bio & Details */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              About & Interests
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {profile?.bio || "Add a bio describing your technical background, projects you're interested in building, and what makes you a great collaborator."}
            </p>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {profile?.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>
                  <Code2 size={16} /> GitHub <ExternalLink size={12} />
                </a>
              )}
              {profile?.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>
                  <Link2 size={16} /> LinkedIn <ExternalLink size={12} />
                </a>
              )}
              {profile?.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>
                  <Globe size={16} /> Portfolio <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Collaboration Preferences
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Clock size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.85rem' }}>Availability: <strong>{profile?.availableHoursPerWeek || 15} hours / week</strong></span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Preferred Domains: <br />
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {profile?.preferredDomains ? profile.preferredDomains.split(',').map(d => d.replace('_', ' ')).join(', ') : 'Web & AI'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Skills & Proficiency System */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Technical Skills & Proficiency</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              These skills are evaluated by the matching algorithm when forming project teams
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setAddSkillModal(true)}>
            <Plus size={15} /> Add Skill
          </button>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          {profile?.skills && profile.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {profile.skills.map(s => (
                <SkillTag
                  key={s.skillId || s.id || s.name}
                  name={s.name}
                  proficiency={s.proficiencyLevel}
                  onRemove={() => handleRemoveSkill(s.skillId || s.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No skills listed yet. Click "+ Add Skill" to add React, Python, Java, PyTorch, Figma, etc.
            </div>
          )}
        </div>
      </section>

      {/* Module 2: Past Projects Showcase */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Past Academic & Personal Projects</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Showcase previous coursework or hackathon submissions to prospective teammates
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setAddProjectModal(true)}>
            <Plus size={15} /> Add Past Project
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {profile?.pastProjects && profile.pastProjects.length > 0 ? (
            profile.pastProjects.map(p => (
              <div key={p.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>{p.title}</h3>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(p.id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}
                    title="Delete project from showcase"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {p.description}
                </p>

                {p.technologiesUsed && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    🛠️ {p.technologiesUsed}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                  {p.repoUrl && (
                    <a href={p.repoUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      <Code2 size={14} /> Repository
                    </a>
                  )}
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No past showcase projects yet. Click "+ Add Past Project" to demonstrate your technical ability.
            </div>
          )}
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Modal isOpen={editProfileModal} onClose={() => setEditProfileModal(false)} title="Edit Student Profile">
        <form onSubmit={handleUpdateProfile} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: profileErrors.fullName ? '#ef4444' : undefined }}
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              required
            />
            {profileErrors.fullName && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.fullName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">About & Technical Interests *</label>
            <textarea
              className="form-textarea"
              rows={3}
              style={{ borderColor: profileErrors.bio ? '#ef4444' : undefined }}
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Tell prospective teammates about your interests and experience..."
            />
            {profileErrors.bio && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.bio}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">University *</label>
              <input
                type="text"
                className="form-input"
                style={{ borderColor: profileErrors.university ? '#ef4444' : undefined }}
                value={profileForm.university}
                onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
              />
              {profileErrors.university && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.university}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Department / Major *</label>
              <input
                type="text"
                className="form-input"
                style={{ borderColor: profileErrors.department ? '#ef4444' : undefined }}
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
              />
              {profileErrors.department && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.department}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Graduation Year *</label>
              <input
                type="number"
                className="form-input"
                style={{ borderColor: profileErrors.graduationYear ? '#ef4444' : undefined }}
                value={profileForm.graduationYear}
                onChange={(e) => setProfileForm({ ...profileForm, graduationYear: Number(e.target.value) })}
              />
              {profileErrors.graduationYear && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.graduationYear}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Weekly Hours Available *</label>
              <input
                type="number"
                className="form-input"
                style={{ borderColor: profileErrors.availableHoursPerWeek ? '#ef4444' : undefined }}
                value={profileForm.availableHoursPerWeek}
                onChange={(e) => setProfileForm({ ...profileForm, availableHoursPerWeek: Number(e.target.value) })}
              />
              {profileErrors.availableHoursPerWeek && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.availableHoursPerWeek}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Image URL</label>
            <input
              type="url"
              className="form-input"
              style={{ borderColor: profileErrors.avatarUrl ? '#ef4444' : undefined }}
              placeholder="https://images.unsplash.com/..."
              value={profileForm.avatarUrl}
              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
            />
            {profileErrors.avatarUrl && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.avatarUrl}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Profile URL</label>
            <input
              type="url"
              className="form-input"
              style={{ borderColor: profileErrors.githubUrl ? '#ef4444' : undefined }}
              placeholder="https://github.com/yourhandle"
              value={profileForm.githubUrl}
              onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
            />
            {profileErrors.githubUrl && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.githubUrl}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input
              type="url"
              className="form-input"
              style={{ borderColor: profileErrors.linkedinUrl ? '#ef4444' : undefined }}
              placeholder="https://linkedin.com/in/yourhandle"
              value={profileForm.linkedinUrl}
              onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
            />
            {profileErrors.linkedinUrl && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{profileErrors.linkedinUrl}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditProfileModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Skill Modal */}
      <Modal isOpen={addSkillModal} onClose={() => setAddSkillModal(false)} title="Add Technical Skill">
        <form onSubmit={handleAddSkill} noValidate>
          <div className="form-group">
            <label className="form-label">Skill Name *</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: skillErrors.name ? '#ef4444' : undefined }}
              placeholder="e.g. React, Python, PyTorch, Docker, Figma"
              value={skillForm.name}
              onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
              list="suggested-skills"
              required
            />
            <datalist id="suggested-skills">
              {allAvailableSkills.map(s => <option key={s.id} value={s.name} />)}
            </datalist>
            {skillErrors.name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{skillErrors.name}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
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
              <label className="form-label">Proficiency Level</label>
              <select
                className="form-select"
                value={skillForm.proficiencyLevel}
                onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
              >
                <option value="BEGINNER">Beginner (1/4)</option>
                <option value="INTERMEDIATE">Intermediate (2/4)</option>
                <option value="ADVANCED">Advanced (3/4)</option>
                <option value="EXPERT">Expert (4/4)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              step="0.5"
              min="0"
              className="form-input"
              style={{ borderColor: skillErrors.yearsOfExperience ? '#ef4444' : undefined }}
              value={skillForm.yearsOfExperience}
              onChange={(e) => setSkillForm({ ...skillForm, yearsOfExperience: parseFloat(e.target.value) })}
            />
            {skillErrors.yearsOfExperience && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{skillErrors.yearsOfExperience}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddSkillModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Past Project Modal */}
      <Modal isOpen={addProjectModal} onClose={() => setAddProjectModal(false)} title="Add Past Academic/Personal Project">
        <form onSubmit={handleAddProject} noValidate>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: projectErrors.title ? '#ef4444' : undefined }}
              placeholder="e.g. Distributed Key-Value Store"
              value={pastProjectForm.title}
              onChange={(e) => setPastProjectForm({ ...pastProjectForm, title: e.target.value })}
              required
            />
            {projectErrors.title && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{projectErrors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description & Outcomes *</label>
            <textarea
              className="form-textarea"
              rows={3}
              style={{ borderColor: projectErrors.description ? '#ef4444' : undefined }}
              placeholder="What problem did you solve and what did you achieve?"
              value={pastProjectForm.description}
              onChange={(e) => setPastProjectForm({ ...pastProjectForm, description: e.target.value })}
            />
            {projectErrors.description && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{projectErrors.description}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Technologies Used *</label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: projectErrors.technologiesUsed ? '#ef4444' : undefined }}
              placeholder="e.g. React, Node.js, Docker, PostgreSQL"
              value={pastProjectForm.technologiesUsed}
              onChange={(e) => setPastProjectForm({ ...pastProjectForm, technologiesUsed: e.target.value })}
            />
            {projectErrors.technologiesUsed && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{projectErrors.technologiesUsed}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub Repo URL</label>
              <input
                type="url"
                className="form-input"
                style={{ borderColor: projectErrors.repoUrl ? '#ef4444' : undefined }}
                placeholder="https://github.com/username/project"
                value={pastProjectForm.repoUrl}
                onChange={(e) => setPastProjectForm({ ...pastProjectForm, repoUrl: e.target.value })}
              />
              {projectErrors.repoUrl && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{projectErrors.repoUrl}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Live Demo URL</label>
              <input
                type="url"
                className="form-input"
                style={{ borderColor: projectErrors.demoUrl ? '#ef4444' : undefined }}
                placeholder="https://demo-site.com"
                value={pastProjectForm.demoUrl}
                onChange={(e) => setPastProjectForm({ ...pastProjectForm, demoUrl: e.target.value })}
              />
              {projectErrors.demoUrl && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{projectErrors.demoUrl}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddProjectModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
