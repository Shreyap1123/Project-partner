import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { SkillTag } from '../components/SkillTag';
import {
  Users,
  ShieldCheck,
  Mail,
  UserMinus,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Inbox,
  Clock,
  ExternalLink,
  Kanban,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TeamWorkspacePage = ({ selectedProjectId, onNavigate }) => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [activeTab, setActiveTab] = useState('roster'); // 'roster', 'requests', 'discussions'
  const [loading, setLoading] = useState(true);

  // Requests state
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  // Discussions state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      const projects = await api.getMyProjects();
      setMyProjects(projects || []);

      let activeProj = null;
      if (selectedProjectId) {
        activeProj = (projects || []).find(p => p.id === Number(selectedProjectId));
      }
      if (!activeProj && projects && projects.length > 0) {
        activeProj = projects[0];
      }
      setCurrentProject(activeProj);

      if (activeProj) {
        // Load messages for active project
        const msgs = await api.getMessages(activeProj.id).catch(() => []);
        setMessages(msgs || []);
      }

      // Load incoming & outgoing requests
      const [incoming, outgoing] = await Promise.all([
        api.getIncomingRequests().catch(() => []),
        api.getOutgoingRequests().catch(() => [])
      ]);
      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
    } catch (err) {
      console.error('Error loading team workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [selectedProjectId, user]);

  const handleSelectProject = async (projId) => {
    const proj = myProjects.find(p => p.id === Number(projId));
    setCurrentProject(proj);
    if (proj) {
      const msgs = await api.getMessages(proj.id).catch(() => []);
      setMessages(msgs || []);
    }
  };

  const handleRespondRequest = async (requestId, accept) => {
    try {
      await api.respondToRequest(requestId, accept);
      if (accept) {
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
      }
      await loadWorkspace();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Cancel this pending request?')) return;
    try {
      await api.cancelRequest(requestId);
      await loadWorkspace();
    } catch (err) {
      alert(err.message || 'Cancel failed');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!currentProject) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.removeTeamMember(currentProject.id, memberUserId);
      await loadWorkspace();
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentProject) return;
    setSendingMsg(true);
    try {
      const msg = await api.postMessage(currentProject.id, newMessage.trim());
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUpdateProjectStatus = async (newStatus) => {
    if (!currentProject) return;
    try {
      await api.updateProjectStatus(currentProject.id, newStatus);
      if (newStatus === 'COMPLETED') {
        try { confetti({ particleCount: 80, spread: 70 }); } catch (e) {}
      }
      await loadWorkspace();
    } catch (err) {
      alert(err.message || 'Failed to update project status');
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${currentProject.title}"? All associated tasks, milestones, and discussions will be removed.`)) return;
    try {
      await api.deleteProject(currentProject.id);
      await loadWorkspace();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const isLeader = currentProject?.leaderId === user?.id;

  if (loading) {
    return <div className="page-body" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading team workspace...</div>;
  }

  return (
    <div className="page-body">
      {/* Workspace Top Bar with Project Switcher */}
      <div className="glass-card" style={{ marginBottom: '1.75rem', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Active Project Team Workspace
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
            {currentProject ? currentProject.title : 'No Project Selected'}
          </h1>
          {currentProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              <StatusBadge status={currentProject.status} />
              <span>•</span>
              <span>Domain: <strong>{currentProject.domain?.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>Team Size: <strong>{currentProject.currentTeamSize} / {currentProject.maxTeamSize}</strong></span>

              {(isLeader || user?.role === 'ROLE_ADMIN') && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Set Status:</span>
                  <button
                    type="button"
                    className={`btn btn-sm ${currentProject.status === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem', height: 'auto' }}
                    onClick={() => handleUpdateProjectStatus('IN_PROGRESS')}
                    title="Mark project as actively In Progress"
                  >
                    ⚡ In Progress
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${currentProject.status === 'RECRUITING' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem', height: 'auto' }}
                    onClick={() => handleUpdateProjectStatus('RECRUITING')}
                    title="Open project for team recruiting"
                  >
                    🎯 Recruiting
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${currentProject.status === 'COMPLETED' ? 'btn-success' : 'btn-secondary'}`}
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem', height: 'auto' }}
                    onClick={() => handleUpdateProjectStatus('COMPLETED')}
                    title="Mark project sprint as Completed"
                  >
                    🏆 Completed
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {myProjects.length > 1 && (
            <select
              className="form-select"
              style={{ minWidth: '220px' }}
              value={currentProject?.id || ''}
              onChange={(e) => handleSelectProject(e.target.value)}
            >
              {myProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}

          {currentProject && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('progress')}
              title="Open Kanban Board"
            >
              <Kanban size={16} /> Sprint Kanban
            </button>
          )}

          {currentProject && (isLeader || user?.role === 'ROLE_ADMIN') && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeleteProject}
              title="Permanently delete this project"
            >
              <Trash2 size={15} /> Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.75rem', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'roster' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('roster')}
        >
          <Users size={15} /> Team Roster ({currentProject?.members?.length || 0})
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('requests')}
        >
          <Inbox size={15} /> Request Inbox ({incomingRequests.filter(r => r.status === 'PENDING').length})
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'discussions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('discussions')}
        >
          <MessageSquare size={15} /> Team Discussions ({messages.length})
        </button>
      </div>

      {/* TAB 1: TEAM ROSTER */}
      {activeTab === 'roster' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {currentProject?.members?.map(member => {
              const isMemberLeader = member.userId === currentProject.leaderId;
              const isCurrentUser = member.userId === user?.id;

              return (
                <div key={member.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.fullName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gradient-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                          {member.fullName[0]}
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                          {member.fullName} {isCurrentUser && '(You)'}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                      </div>
                    </div>

                    {isMemberLeader && (
                      <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <ShieldCheck size={13} /> Leader
                      </span>
                    )}
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Role:</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{member.roleInTeam?.replace('_', ' ')}</strong>
                  </div>

                  {/* Actions: leader can remove member or user can leave */}
                  {isLeader && !isMemberLeader && (
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveMember(member.userId)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <UserMinus size={13} /> Remove from Team
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: REQUEST INBOX (MODULE 4) */}
      {activeTab === 'requests' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          {/* Incoming Requests */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={18} color="var(--accent-primary)" /> Incoming Requests & Invites
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {incomingRequests.length > 0 ? (
                incomingRequests.map(req => (
                  <div key={req.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                          {req.requestType === 'JOIN_REQUEST' ? 'Join Request Received' : 'Team Invitation Received'}
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0.15rem 0' }}>
                          {req.projectTitle}
                        </h4>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          From: <strong>{req.senderName}</strong> ({req.senderEmail})
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{req.message}"
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Proposed Role: <strong>{req.proposedRole?.replace('_', ' ')}</strong>
                    </div>

                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button
                          className="btn btn-success btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleRespondRequest(req.id, true)}
                        >
                          <CheckCircle2 size={15} /> Accept Request
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleRespondRequest(req.id, false)}
                        >
                          <XCircle size={15} /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No incoming join requests or invitations currently.
                </div>
              )}
            </div>
          </div>

          {/* Outgoing Requests */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} color="var(--accent-secondary)" /> Outgoing Sent Requests
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {outgoingRequests.length > 0 ? (
                outgoingRequests.map(req => (
                  <div key={req.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                          Sent to {req.receiverName}
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0.1rem 0' }}>
                          {req.projectTitle}
                        </h4>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                      "{req.message}"
                    </p>

                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', color: 'var(--danger)' }}
                          onClick={() => handleCancelRequest(req.id)}
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  You haven't sent any requests yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM DISCUSSION BOARD */}
      {activeTab === 'discussions' && (
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '550px' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1.25rem' }}>
            {messages.length > 0 ? (
              messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      <strong>{msg.senderName}</strong> • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        background: isMe ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.45,
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                No messages yet on the project bulletin. Say hi to your team!
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type an announcement or team update..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={sendingMsg}>
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
