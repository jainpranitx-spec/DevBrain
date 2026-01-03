// API Service for DevBrain Backend Integration
// Handles all communication with Django REST API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Project Management
export const initializeProject = async (projectData) => {
  return await apiRequest('/projects/', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

export const fetchProject = async (projectId) => {
  return await apiRequest(`/projects/${projectId}/`);
};

export const updateProject = async (projectId, updates) => {
  return await apiRequest(`/projects/${projectId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const deleteProject = async (projectId) => {
  return await apiRequest(`/projects/${projectId}/`, {
    method: 'DELETE',
  });
};

export const listProjects = async () => {
  return await apiRequest('/projects/');
};

// Node Management
export const createNode = async (projectId, nodeData) => {
  return await apiRequest('/nodes/', {
    method: 'POST',
    body: JSON.stringify({
      ...nodeData,
      project: projectId,
    }),
  });
};

export const fetchNode = async (nodeId) => {
  return await apiRequest(`/nodes/${nodeId}/`);
};

export const updateNode = async (nodeId, updates) => {
  return await apiRequest(`/nodes/${nodeId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const updateNodeStatus = async (nodeId, status) => {
  return await updateNode(nodeId, { status });
};

export const updateNodePosition = async (nodeId, position) => {
  return await updateNode(nodeId, { 
    position_x: position.x, 
    position_y: position.y 
  });
};

export const deleteNode = async (nodeId) => {
  return await apiRequest(`/nodes/${nodeId}/`, {
    method: 'DELETE',
  });
};

// Edge Management
export const fetchEdges = async (projectId) => {
  return await apiRequest(`/edges/?project=${projectId}`);
};

export const createEdge = async (projectId, edgeData) => {
  return await apiRequest('/edges/', {
    method: 'POST',
    body: JSON.stringify({
      ...edgeData,
      project: projectId,
    }),
  });
};

export const deleteEdge = async (edgeId) => {
  return await apiRequest(`/edges/${edgeId}/`, {
    method: 'DELETE',
  });
};

// Chat with AI (Knowledge-Grounded)
export const chatWithAI = async (nodeId, message, useKnowledge = true) => {
  return await apiRequest(`/chat/node/${nodeId}/`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      use_knowledge: useKnowledge,
    }),
  });
};

export const fetchChatHistory = async (nodeId) => {
  return await apiRequest(`/chat/node/${nodeId}/history/`);
};

// Knowledge Base Management
export const uploadKnowledge = async (projectId, file, description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project', projectId);
  formData.append('description', description);

  return await apiRequest('/knowledge/', {
    method: 'POST',
    headers: {}, // Remove Content-Type to let browser set it for FormData
    body: formData,
  });
};

export const fetchKnowledgeBase = async (projectId) => {
  return await apiRequest(`/knowledge/?project=${projectId}`);
};

export const deleteKnowledge = async (knowledgeId) => {
  return await apiRequest(`/knowledge/${knowledgeId}/`, {
    method: 'DELETE',
  });
};

export const searchKnowledge = async (projectId, query) => {
  return await apiRequest(`/knowledge/search/?project=${projectId}&q=${encodeURIComponent(query)}`);
};

// Export/Import
export const exportProject = async (projectId) => {
  return await apiRequest(`/projects/${projectId}/export/`);
};

// Health Check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Error handling utilities
export const isNetworkError = (error) => {
  return error.message.includes('fetch') || error.message.includes('NetworkError');
};

export const isValidationError = (error) => {
  return error.message.includes('400');
};

export const isNotFoundError = (error) => {
  return error.message.includes('404');
};