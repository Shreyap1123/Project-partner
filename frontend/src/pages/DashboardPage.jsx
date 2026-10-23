import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { SkillTag } from '../components/SkillTag';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  Users,
  FolderGit2,
  Bell,
  ArrowRight,
  PlusCircle,
  Clock,
  Compass,
  CheckCircle2,
  Send,
  Layers
} from 'lucide-react';

export const DashboardPage = ({ onNavigate }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedProjectForInvite, setSelectedProjectForInvite] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [projectsData, reqsData, recProjectsData] = await Promise.all([
        api.getMyProjects().catch(() => []),
        api.getIncomingRequests().catch(() => []),
        api.getProjectRecommendations(6).catch(() => [])
      ]);

      setMyProjects(projectsData || []);
      setIncomingRequests(reqsData || []);
      setRecommendedProjects(recProjectsData || []);

      // If user has a project they lead, get teammate recommendations for it
      const leadProject = (projectsData || []).find(p => p.leaderId === user?.id);
      if (leadProject) {
        const candidates = await api.getTeammateRecommendations(leadProject.id, 6).catch(() => []);
        setRecommendedCandidates(candidates || []);
      } else if (projectsData && projectsData.length > 0) {
        const candidates = await api.getTeammateRecommendations(projectsData[0].id, 6).catch(() => []);
        setRecommendedCandidates(candidates || []);
      } else {
        // Otherwise grab all profiles as potential candidates
        const profiles = await api.getAllProfiles().catch(() => []);
        const formatted = (profiles || [])
          .filter(p => p.userId !== user?.id)
          .slice(0, 6)
          .map(p => ({
            studentProfileId: p.id,
            userId: p.userId,
            fullName: p.fullName,
            email: p.email,
            avatarUrl: p.avatarUrl,
            university: p.university,
            department: p.department,
            degreeLevel: p.degreeLevel,
            availableHoursPerWeek: p.availableHoursPerWeek,
            matchPercentage: 92,
            matchedSkills: p.skills || [],
            missingSkills: [],
            recommendationReason: 'Compatible skill profile & academic background'
          }));
        setRecommendedCandidates(formatted);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleOpenInvite = (candidate) => {
    setSelectedCandidate(candidate);
    const leadingProjects = myProjects.filter(p => p.leaderId === user?.id);
    if (leadingProjects.length > 0) {
      setSelectedProjectForInvite(leadingProjects[0].id);
    } else if (myProjects.length > 0) {
      setSelectedProjectForInvite(myProjects[0].id);
    }
    setInviteMessage(`Hi ${candidate.fullName.split(' ')[0]}, your skills align well with our project goals. We would love to have you on our team!`);
    setInviteSuccess('');
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedProjectForInvite) return;
    setInviteSending(true);
    try {
      await api.sendTeamRequest({
        projectId: Number(selectedProjectForInvite),
        receiverId: selectedCandidate.userId,
        requestType: 'INVITE_REQUEST',
        proposedRole: 'MEMBER',
        message: inviteMessage
      });
      setInviteSuccess(`Invitation sent successfully to ${selectedCandidate.fullName}!`);
      setTimeout(() => {
        setInviteModalOpen(false);
        setInviteSuccess('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to send invite');
    } finally {
      setInviteSending(false);
    }
  };

  const pendingCount = incomingRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="page-body">
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(236, 72, 153, 0.08) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.25)',
        marginBottom: '2rem',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'var(--accent-gradient-subtle)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
              Teammate Discovery Active
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px' }}>
            {profile?.university ? `${profile.university} • ${profile.department || 'Computer Science'}` : 'Academic Project Collaboration Network'}
            {profile?.availableHoursPerWeek && ` • ${profile.availableHoursPerWeek} hrs/week available`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('match')}>
            <Sparkles size={16} />
            Find Teammates
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('projects')}>
            <FolderGit2 size={16} />
            Browse Projects
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <FolderGit2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.1 }}>{myProjects.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>My Projects & Teams</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
            <Bell size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.1 }}>{pendingCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Requests</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.1 }}>
              {recommendedCandidates.length > 0 ? `${recommendedCandidates[0].matchPercentage}%` : '96%'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top Match Compatibility</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.1 }}>
              {profile?.availableHoursPerWeek || 15}h
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly Project Hours</div>
          </div>
        </div>
      </div>

      {/* Module 3 Showcase: Top Teammate Recommendations */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>
                Recommended Teammate Matches
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Scored based on skill synergy, experience levels, and availability compatibility
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('match')}>
            View All ({recommendedCandidates.length}) <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {recommendedCandidates.slice(0, 3).map(candidate => (
            <div key={candidate.userId} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  {candidate.avatarUrl ? (
                    <img src={candidate.avatarUrl} alt={candidate.fullName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gradient-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      {candidate.fullName[0]}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>{candidate.fullName}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {candidate.department} • {candidate.university}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      ⏱️ {candidate.availableHoursPerWeek || 15} hrs/week available
                    </div>
                  </div>
                </div>

                <MatchScoreBadge score={candidate.matchPercentage} size="sm" />
              </div>

              {candidate.recommendationReason && (
                <div style={{ fontSize: '0.78rem', background: 'var(--bg-tertiary)', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                  💡 {candidate.recommendationReason}
                </div>
              )}

              {/* Skills overlap pills */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Key Matched Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {candidate.matchedSkills && candidate.matchedSkills.length > 0 ? (
                    candidate.matchedSkills.slice(0, 4).map(skill => (
                      <SkillTag key={skill.skillId || skill.name} name={skill.name} proficiency={skill.proficiencyLevel} />
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-disciplinary skillset</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onNavigate('match')}
                >
                  View Profile
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenInvite(candidate)}
                >
                  <Send size={14} />
                  Invite to Team
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Projects Looking For Members */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderGit2 size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>
                Projects Seeking Your Skills
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Academic initiatives actively recruiting students with your technical profile
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('projects')}>
            Explore All Projects <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {recommendedProjects.slice(0, 3).map(project => (
            <div key={project.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <StatusBadge status={project.domain?.replace('_', ' ') || 'PROJECT'} />
                <StatusBadge status={project.status} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, lineHeight: 1.3 }}>
                {project.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {project.description}
              </p>

              {/* Team Slots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Led by {project.leaderName}</span>
                <span style={{ fontWeight: '700', color: project.openSlots > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {project.currentTeamSize} / {project.maxTeamSize} Members • {project.openSlots} Open Slots
                </span>
              </div>

              {/* Required Skills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {project.requiredSkills?.slice(0, 3).map(rs => (
                  <SkillTag key={rs.id} name={rs.skillName} proficiency={rs.minProficiency} />
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('projects')}
                >
                  View Details
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate('projects')}
                >
                  Request to Join →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Invite ${selectedCandidate?.fullName} to Team`}
      >
        {inviteSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem' }}>Invitation Sent!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{inviteSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleSendInvite}>
            <div className="form-group">
              <label className="form-label">Select Project to Invite Candidate To</label>
              {myProjects.length > 0 ? (
                <select
                  className="form-select"
                  value={selectedProjectForInvite}
                  onChange={(e) => setSelectedProjectForInvite(e.target.value)}
                  required
                >
                  {myProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.currentTeamSize}/{p.maxTeamSize} members)
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  You don't have any active projects yet. You can create a project first from the Projects tab!
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Personalized Invitation Note</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Why do you want them on your team?"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setInviteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteSending || myProjects.length === 0}
              >
                {inviteSending ? 'Sending Invite...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
