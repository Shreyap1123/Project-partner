import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { SkillTag } from '../components/SkillTag';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  Search,
  Filter,
  Send,
  CheckCircle2,
  Clock,
  GraduationCap,
  FolderGit2,
  AlertCircle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MatchFinderPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [minHoursFilter, setMinHoursFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Load user's projects to drive recommendation engine
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await api.getMyProjects();
        setMyProjects(projects || []);
        if (projects && projects.length > 0) {
          // Default to first project where user is leader
          const leaderProj = projects.find(p => p.leaderId === user?.id) || projects[0];
          setSelectedProjectId(leaderProj.id);
        }
      } catch (err) {
        console.error('Error fetching user projects:', err);
      }
    };
    fetchProjects();
  }, [user]);

  // Fetch recommendations whenever selected project changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedProjectId) return;
      setLoading(true);
      try {
        const data = await api.getTeammateRecommendations(selectedProjectId, 20);
        setCandidates(data || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedProjectId]);

  const handleOpenInvite = (candidate) => {
    setSelectedCandidate(candidate);
    const proj = myProjects.find(p => p.id === Number(selectedProjectId));
    setInviteMessage(`Hi ${candidate.fullName.split(' ')[0]}, we are building ${proj?.title || 'our project'} and your skillset is an exceptional match. We'd love to have you join our team!`);
    setInviteSuccess('');
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedCandidate) return;
    setSendingInvite(true);
    try {
      await api.sendTeamRequest({
        projectId: Number(selectedProjectId),
        receiverId: selectedCandidate.userId,
        requestType: 'INVITE_REQUEST',
        proposedRole: 'MEMBER',
        message: inviteMessage
      });
      setInviteSuccess(`Invitation sent to ${selectedCandidate.fullName}!`);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      setTimeout(() => {
        setInviteModalOpen(false);
        setInviteSuccess('');
      }, 1800);
    } catch (err) {
      alert(err.message || 'Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    if (departmentFilter && !c.department?.toLowerCase().includes(departmentFilter.toLowerCase())) {
      return false;
    }
    if (minHoursFilter > 0 && (c.availableHoursPerWeek || 0) < minHoursFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.fullName?.toLowerCase().includes(q);
      const matchSkills = c.matchedSkills?.some(s => s.name?.toLowerCase().includes(q));
      if (!matchName && !matchSkills) return false;
    }
    return true;
  });

  const currentProject = myProjects.find(p => p.id === Number(selectedProjectId));

  return (
    <div className="page-body">
      {/* Header Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        marginBottom: '2rem',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Sparkles size={24} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
            Skill Matching & Teammate Recommendation Hub
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '750px', lineHeight: 1.5 }}>
          Our algorithmic matching engine evaluates skill proficiency weights, domain affinities, and availability schedules to rank the best candidate teammates for your project.
        </p>

        {/* Project Selector Bar */}
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Matching For Project:
          </span>
          {myProjects.length > 0 ? (
            <select
              className="form-select"
              style={{ maxWidth: '380px', fontWeight: '600' }}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {myProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.currentTeamSize}/{p.maxTeamSize} members)
                </option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You have no active projects yet.
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('projects')}>
                Create Project First
              </button>
            </div>
          )}

          {currentProject && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span>Domain: <strong>{currentProject.domain?.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>Open Slots: <strong style={{ color: 'var(--success)' }}>{currentProject.openSlots}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Required Skills summary of current project */}
      {currentProject && currentProject.requiredSkills && currentProject.requiredSkills.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '1.75rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Target Required Skills:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {currentProject.requiredSkills.map(rs => (
              <SkillTag key={rs.id} name={rs.skillName} proficiency={rs.minProficiency} />
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search candidate name or specific skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Filter Department (e.g. CS, AI)..."
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-select"
            value={minHoursFilter}
            onChange={(e) => setMinHoursFilter(Number(e.target.value))}
          >
            <option value={0}>Any Availability</option>
            <option value={10}>≥ 10 hrs / week</option>
            <option value={15}>≥ 15 hrs / week</option>
            <option value={20}>≥ 20 hrs / week</option>
          </select>
        </div>
      </div>

      {/* Candidates Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>
            Running skill matching algorithm across student profiles...
          </p>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredCandidates.map(c => (
            <div
              key={c.userId}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: c.matchPercentage >= 85 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)'
              }}
            >
              {/* Top Row: Avatar, Info, Match Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt={c.fullName} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
                  ) : (
                    <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--accent-gradient-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                      {c.fullName[0]}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>{c.fullName}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {c.department} • {c.university}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      ⏱️ {c.availableHoursPerWeek || 15} hrs/wk available
                    </div>
                  </div>
                </div>

                <MatchScoreBadge score={c.matchPercentage} size="md" />
              </div>

              {/* Recommendation Rationale */}
              {c.recommendationReason && (
                <div style={{
                  fontSize: '0.8rem',
                  background: 'var(--bg-tertiary)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  borderLeft: '3px solid var(--accent-primary)'
                }}>
                  💡 {c.recommendationReason}
                </div>
              )}

              {/* Matched Skills */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Matched Skills ({c.matchedSkills?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {c.matchedSkills && c.matchedSkills.length > 0 ? (
                    c.matchedSkills.map(s => (
                      <SkillTag key={s.skillId || s.name} name={s.name} proficiency={s.proficiencyLevel} />
                    ))
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Foundational skill alignment</span>
                  )}
                </div>
              </div>

              {/* Missing Skills (if any) */}
              {c.missingSkills && c.missingSkills.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Missing Required Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {c.missingSkills.map((ms, idx) => (
                      <span key={idx} style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}>
                        {ms}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleOpenInvite(c)}
                  disabled={!selectedProjectId}
                >
                  <Send size={15} />
                  Send Team Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>No Matching Candidates Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto' }}>
            Try adjusting your department or minimum availability filters to discover more prospective teammates.
          </p>
        </div>
      )}

      {/* Invite Candidate Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title={`Invite ${selectedCandidate?.fullName} to Team`}
      >
        {inviteSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Invitation Sent!</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{inviteSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleSendInvite}>
            <div className="form-group">
              <label className="form-label">Target Project</label>
              <select
                className="form-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
              >
                {myProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Personalized Invitation Message</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Highlight why their skills are a great fit for your project milestones..."
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
                disabled={sendingInvite}
              >
                {sendingInvite ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
