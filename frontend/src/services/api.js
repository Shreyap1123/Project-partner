// Centralized API client with JWT interceptor and unified endpoints

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMsg = 'Request failed';
    try {
      const err = await response.json();
      errorMsg = err.message || err.error || JSON.stringify(err);
    } catch {
      errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const api = {
  // 1. Auth Module
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // 2. Student Profile & Skills Module
  getMyProfile: async () => {
    const res = await fetch(`${API_BASE}/profiles/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getProfileByUserId: async (userId) => {
    const res = await fetch(`${API_BASE}/profiles/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAllProfiles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/profiles${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE}/profiles/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  addSkill: async (skillData) => {
    const res = await fetch(`${API_BASE}/profiles/me/skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(skillData)
    });
    return handleResponse(res);
  },

  removeSkill: async (skillId) => {
    const res = await fetch(`${API_BASE}/profiles/me/skills/${skillId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  addPastProject: async (projectData) => {
    const res = await fetch(`${API_BASE}/profiles/me/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return handleResponse(res);
  },

  deletePastProject: async (projectId) => {
    const res = await fetch(`${API_BASE}/profiles/me/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Skills dictionary
  getAllSkills: async (category) => {
    const url = category ? `${API_BASE}/skills?category=${category}` : `${API_BASE}/skills`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  getSkillCategories: async () => {
    const res = await fetch(`${API_BASE}/skills/categories`);
    return handleResponse(res);
  },

  // 3. Recommendation & Matching Module
  getTeammateRecommendations: async (projectId, limit = 15) => {
    const res = await fetch(`${API_BASE}/recommendations/teammates/${projectId}?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getProjectRecommendations: async (limit = 10) => {
    const res = await fetch(`${API_BASE}/recommendations/projects?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // 4. Team Requests Module
  sendTeamRequest: async (requestData) => {
    const res = await fetch(`${API_BASE}/team-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    return handleResponse(res);
  },

  respondToRequest: async (requestId, accept) => {
    const res = await fetch(`${API_BASE}/team-requests/${requestId}/respond?accept=${accept}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  cancelRequest: async (requestId) => {
    const res = await fetch(`${API_BASE}/team-requests/${requestId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getIncomingRequests: async () => {
    const res = await fetch(`${API_BASE}/team-requests/incoming`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getOutgoingRequests: async () => {
    const res = await fetch(`${API_BASE}/team-requests/outgoing`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getProjectRequests: async (projectId) => {
    const res = await fetch(`${API_BASE}/team-requests/project/${projectId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // 5. Team & Project Management Module
  createProject: async (projectData) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return handleResponse(res);
  },

  getAllProjects: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.domain) searchParams.append('domain', params.domain);
    if (params.query) searchParams.append('query', params.query);
    const qs = searchParams.toString();
    const res = await fetch(`${API_BASE}/projects${qs ? `?${qs}` : ''}`);
    return handleResponse(res);
  },

  getProjectById: async (projectId) => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getMyProjects: async () => {
    const res = await fetch(`${API_BASE}/projects/user/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateProjectStatus: async (projectId, status) => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  removeTeamMember: async (projectId, memberUserId) => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members/${memberUserId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  deleteProject: async (projectId) => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // 6. Project Progress & Kanban Module
  getMilestones: async (projectId) => {
    const res = await fetch(`${API_BASE}/progress/${projectId}/milestones`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createMilestone: async (projectId, milestoneData) => {
    const res = await fetch(`${API_BASE}/progress/${projectId}/milestones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(milestoneData)
    });
    return handleResponse(res);
  },

  updateMilestoneStatus: async (milestoneId, status) => {
    const res = await fetch(`${API_BASE}/progress/milestones/${milestoneId}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  deleteMilestone: async (milestoneId) => {
    const res = await fetch(`${API_BASE}/progress/milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getTasks: async (projectId) => {
    const res = await fetch(`${API_BASE}/progress/${projectId}/tasks`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createTask: async (projectId, taskData) => {
    const res = await fetch(`${API_BASE}/progress/${projectId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  updateTaskStatus: async (taskId, status) => {
    const res = await fetch(`${API_BASE}/progress/tasks/${taskId}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateTask: async (taskId, taskData) => {
    const res = await fetch(`${API_BASE}/progress/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  deleteTask: async (taskId) => {
    const res = await fetch(`${API_BASE}/progress/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getMessages: async (projectId) => {
    const res = await fetch(`${API_BASE}/progress/${projectId}/messages`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  postMessage: async (projectId, message) => {
    const res = await fetch(`${API_BASE}/progress/${projectId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    return handleResponse(res);
  },

  // 7. Admin Module
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getAllUsersAdmin: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  toggleUserStatusAdmin: async (userId) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  deleteUserAdmin: async (userId) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  deleteProjectAdmin: async (projectId) => {
    const res = await fetch(`${API_BASE}/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateProjectStatusAdmin: async (projectId, status) => {
    const res = await fetch(`${API_BASE}/admin/projects/${projectId}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  createSkillAdmin: async (skillData) => {
    const res = await fetch(`${API_BASE}/admin/skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(skillData)
    });
    return handleResponse(res);
  },

  deleteSkillAdmin: async (skillId) => {
    const res = await fetch(`${API_BASE}/admin/skills/${skillId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
