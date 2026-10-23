import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Kanban,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Award,
  Zap,
  Check,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProjectProgressPage = ({ selectedProjectId }) => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task modal state & validation
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskErrors, setTaskErrors] = useState({});
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    milestoneId: '',
    assignedToId: '',
    dueDate: ''
  });

  // New milestone modal state & validation
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneErrors, setMilestoneErrors] = useState({});
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const projects = await api.getMyProjects();
      setMyProjects(projects || []);

      let active = null;
      if (selectedProjectId) {
        active = (projects || []).find(p => p.id === Number(selectedProjectId));
      }
      if (!active && projects && projects.length > 0) {
        active = projects[0];
      }
      setCurrentProject(active);

      if (active) {
        const [msData, taskData] = await Promise.all([
          api.getMilestones(active.id).catch(() => []),
          api.getTasks(active.id).catch(() => [])
        ]);
        setMilestones(msData || []);
        setTasks(taskData || []);
      }
    } catch (err) {
      console.error('Error loading project progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId, user]);

  const handleSelectProject = async (projId) => {
    const proj = myProjects.find(p => p.id === Number(projId));
    setCurrentProject(proj);
    if (proj) {
      const [msData, taskData] = await Promise.all([
        api.getMilestones(proj.id).catch(() => []),
        api.getTasks(proj.id).catch(() => [])
      ]);
      setMilestones(msData || []);
      setTasks(taskData || []);
    }
  };

  const handleUpdateProjectStatus = async (newStatus) => {
    if (!currentProject) return;
    try {
      await api.updateProjectStatus(currentProject.id, newStatus);
      setCurrentProject(prev => ({ ...prev, status: newStatus }));
      setMyProjects(prev => prev.map(p => p.id === currentProject.id ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert(err.message || 'Failed to update project status');
    }
  };

  const validateTask = () => {
    const errors = {};
    if (!taskForm.title || !taskForm.title.trim()) {
      errors.title = 'Task title is required';
    } else if (taskForm.title.trim().length < 3) {
      errors.title = 'Task title must be at least 3 characters';
    }
    if (taskForm.description && taskForm.description.trim().length > 0 && taskForm.description.trim().length < 5) {
      errors.description = 'Description should be at least 5 characters if provided';
    }
    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validateTask()) return;
    if (!currentProject) return;
    try {
      const payload = {
        ...taskForm,
        milestoneId: taskForm.milestoneId ? Number(taskForm.milestoneId) : null,
        assignedToId: taskForm.assignedToId ? Number(taskForm.assignedToId) : null,
        dueDate: taskForm.dueDate || null
      };
      await api.createTask(currentProject.id, payload);
      setTaskModalOpen(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', milestoneId: '', assignedToId: '', dueDate: '' });
      setTaskErrors({});
      const updatedTasks = await api.getTasks(currentProject.id);
      setTasks(updatedTasks || []);
    } catch (err) {
      alert(err.message || 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      if (newStatus === 'DONE') {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
      }
      const updatedTasks = await api.getTasks(currentProject.id);
      setTasks(updatedTasks || []);
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      const updatedTasks = await api.getTasks(currentProject.id);
      setTasks(updatedTasks || []);
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const validateMilestone = () => {
    const errors = {};
    if (!milestoneForm.title || !milestoneForm.title.trim()) {
      errors.title = 'Milestone title is required';
    } else if (milestoneForm.title.trim().length < 3) {
      errors.title = 'Milestone title must be at least 3 characters';
    }
    if (milestoneForm.description && milestoneForm.description.trim().length > 0 && milestoneForm.description.trim().length < 5) {
      errors.description = 'Description should be at least 5 characters if provided';
    }
    setMilestoneErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!validateMilestone()) return;
    if (!currentProject) return;
    try {
      await api.createMilestone(currentProject.id, {
        ...milestoneForm,
        dueDate: milestoneForm.dueDate || null
      });
      setMilestoneModalOpen(false);
      setMilestoneForm({ title: '', description: '', dueDate: '' });
      setMilestoneErrors({});
      const updated = await api.getMilestones(currentProject.id);
      setMilestones(updated || []);
    } catch (err) {
      alert(err.message || 'Failed to create milestone');
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId, newStatus) => {
    try {
      await api.updateMilestoneStatus(milestoneId, newStatus);
      const updated = await api.getMilestones(currentProject.id);
      setMilestones(updated || []);
    } catch (err) {
      alert(err.message || 'Failed to update milestone status');
    }
  };

  // Progress metrics calculation
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const totalMilestones = milestones.length;
  const doneMilestones = milestones.filter(m => m.status === 'COMPLETED').length;

  const progressPercent = totalTasks > 0
    ? Math.round((doneTasks / totalTasks) * 100)
    : totalMilestones > 0
      ? Math.round((doneMilestones / totalMilestones) * 100)
      : 0;

  const kanbanColumns = [
    { id: 'TODO', title: 'To Do', color: '#6366f1' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b' },
    { id: 'REVIEW', title: 'Under Review', color: '#8b5cf6' },
    { id: 'DONE', title: 'Completed', color: '#10b981' }
  ];

  return (
    <div className="page-body">
      {/* Header & Project Selector & Status Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Kanban size={24} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              Project Progress & Agile Kanban Board
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Track sprint deliverables, milestones, and collaborative team tasks in real-time
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {myProjects.length > 0 && (
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

          {/* Project-level In Progress / Status toggle bar */}
          {currentProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', paddingRight: '0.25rem' }}>
                Status:
              </span>
              <button
                type="button"
                onClick={() => handleUpdateProjectStatus('IN_PROGRESS')}
                className={`btn btn-sm ${currentProject.status === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: currentProject.status === 'IN_PROGRESS' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : undefined,
                  color: currentProject.status === 'IN_PROGRESS' ? '#ffffff' : undefined,
                  borderColor: currentProject.status === 'IN_PROGRESS' ? '#f59e0b' : undefined,
                  fontWeight: '700'
                }}
                title="Mark project as actively In Progress"
              >
                <Zap size={13} /> In Progress
              </button>
              <button
                type="button"
                onClick={() => handleUpdateProjectStatus('RECRUITING')}
                className={`btn btn-sm ${currentProject.status === 'RECRUITING' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                title="Mark project as Recruiting"
              >
                🎯 Recruiting
              </button>
              <button
                type="button"
                onClick={() => handleUpdateProjectStatus('COMPLETED')}
                className={`btn btn-sm ${currentProject.status === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                title="Mark project as Completed"
              >
                🏆 Completed
              </button>
            </div>
          )}

          <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)} disabled={!currentProject}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Sprint Progress Gauge */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>Overall Project Completion</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{progressPercent}%</span>
          </div>
          <div style={{ height: '10px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.65rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Tasks: <strong>{doneTasks} / {totalTasks} Done</strong></span>
            <span>Milestones: <strong>{doneMilestones} / {totalMilestones} Completed</strong></span>
          </div>
        </div>

        <button className="btn btn-outline btn-sm" onClick={() => setMilestoneModalOpen(true)} disabled={!currentProject}>
          <Plus size={14} /> Add Milestone
        </button>
      </div>

      {/* Milestones Horizontal Bar */}
      {milestones.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.85rem' }}>
            Project Milestones
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {milestones.map((m, idx) => (
              <div key={m.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Milestone {idx + 1}
                  </span>
                  <select
                    className="form-select"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                    value={m.status}
                    onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value)}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <h4 style={{ fontSize: '0.98rem', fontWeight: '700', margin: 0 }}>{m.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{m.description}</p>

                {m.dueDate && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 'auto' }}>
                    <Calendar size={13} /> Due: {m.dueDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4-Column Interactive Kanban Board */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
            Sprint Kanban Board
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {tasks.length} total tasks across all columns
          </span>
        </div>

        <div className="kanban-board">
          {kanbanColumns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);

            return (
              <div key={col.id} className="kanban-col">
                <div className="kanban-col-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                    <span>{col.title}</span>
                  </div>
                  <span className="badge badge-indigo" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>
                    {colTasks.length}
                  </span>
                </div>

                {colTasks.map(task => (
                  <div key={task.id} className="kanban-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <StatusBadge status={task.priority} />
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <h5 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 0.35rem 0', lineHeight: 1.3 }}>
                      {task.title}
                    </h5>

                    {task.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem 0', lineHeight: 1.4 }}>
                        {task.description}
                      </p>
                    )}

                    {/* Assignee & Due Date */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {task.assignedToAvatarUrl ? (
                          <img src={task.assignedToAvatarUrl} alt={task.assignedToName} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <User size={14} />
                        )}
                        <span>{task.assignedToName ? task.assignedToName.split(' ')[0] : 'Unassigned'}</span>
                      </div>

                      {task.dueDate && <span>{task.dueDate}</span>}
                    </div>

                    {/* Direct In Progress / Status Action Buttons */}
                    <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {task.status === 'TODO' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="btn btn-sm"
                          style={{
                            width: '100%',
                            fontSize: '0.75rem',
                            padding: '0.3rem 0.5rem',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            fontWeight: '700',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Click to start task and move to In Progress"
                        >
                          <Zap size={13} /> ⚡ Start (In Progress)
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.id, 'REVIEW')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                            title="Submit for review"
                          >
                            Review 🔍
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.id, 'DONE')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', background: '#10b981', borderColor: '#10b981' }}
                            title="Complete task"
                          >
                            <Check size={12} /> Done ✓
                          </button>
                        </div>
                      )}

                      {task.status === 'REVIEW' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}
                            title="Send back for revisions"
                          >
                            <RotateCcw size={11} /> Rework
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(task.id, 'DONE')}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', background: '#10b981', borderColor: '#10b981' }}
                            title="Approve & mark complete"
                          >
                            <Check size={12} /> Approve ✓
                          </button>
                        </div>
                      )}

                      {task.status === 'DONE' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="btn btn-secondary btn-sm"
                          style={{ width: '100%', fontSize: '0.72rem', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}
                          title="Reopen task"
                        >
                          <RotateCcw size={11} /> Reopen Task
                        </button>
                      )}

                      {/* Move Column Dropdown (Secondary option) */}
                      <select
                        className="form-select"
                        style={{ fontSize: '0.72rem', padding: '0.15rem 0.35rem', marginTop: '0.2rem' }}
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '2rem 0' }}>
                    No tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* New Task Modal with Field Validation */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Create New Project Task">
        <form onSubmit={handleCreateTask} noValidate>
          <div className="form-group">
            <label className="form-label">Task Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implement user login JWT endpoint"
              value={taskForm.title}
              onChange={(e) => {
                setTaskForm({ ...taskForm, title: e.target.value });
                if (taskErrors.title) setTaskErrors({ ...taskErrors, title: null });
              }}
              style={{ borderColor: taskErrors.title ? 'var(--danger)' : undefined }}
            />
            {taskErrors.title && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ {taskErrors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description & Acceptance Criteria</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide context and requirements for the team member..."
              value={taskForm.description}
              onChange={(e) => {
                setTaskForm({ ...taskForm, description: e.target.value });
                if (taskErrors.description) setTaskErrors({ ...taskErrors, description: null });
              }}
              style={{ borderColor: taskErrors.description ? 'var(--danger)' : undefined }}
            />
            {taskErrors.description && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ {taskErrors.description}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select
                className="form-select"
                value={taskForm.assignedToId}
                onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {currentProject?.members?.map(m => (
                  <option key={m.userId} value={m.userId}>{m.fullName} ({m.roleInTeam})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          {milestones.length > 0 && (
            <div className="form-group">
              <label className="form-label">Associated Milestone</label>
              <select
                className="form-select"
                value={taskForm.milestoneId}
                onChange={(e) => setTaskForm({ ...taskForm, milestoneId: e.target.value })}
              >
                <option value="">-- None --</option>
                {milestones.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setTaskModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </Modal>

      {/* New Milestone Modal with Field Validation */}
      <Modal isOpen={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} title="Add Project Milestone">
        <form onSubmit={handleCreateMilestone} noValidate>
          <div className="form-group">
            <label className="form-label">Milestone Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alpha Testing & Demo Submission"
              value={milestoneForm.title}
              onChange={(e) => {
                setMilestoneForm({ ...milestoneForm, title: e.target.value });
                if (milestoneErrors.title) setMilestoneErrors({ ...milestoneErrors, title: null });
              }}
              style={{ borderColor: milestoneErrors.title ? 'var(--danger)' : undefined }}
            />
            {milestoneErrors.title && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ {milestoneErrors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Scope & Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Key objectives to reach this milestone..."
              value={milestoneForm.description}
              onChange={(e) => {
                setMilestoneForm({ ...milestoneForm, description: e.target.value });
                if (milestoneErrors.description) setMilestoneErrors({ ...milestoneErrors, description: null });
              }}
              style={{ borderColor: milestoneErrors.description ? 'var(--danger)' : undefined }}
            />
            {milestoneErrors.description && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ {milestoneErrors.description}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Target Due Date</label>
            <input
              type="date"
              className="form-input"
              value={milestoneForm.dueDate}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setMilestoneModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Milestone</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
