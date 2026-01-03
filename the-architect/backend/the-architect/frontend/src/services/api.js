"""
API Service for connecting React frontend to Django backend.
Replace the mock ai.js with real backend integration.
"""

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Initialize project
export const initializeProject = async (projectData) => {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
    });
    return response.json();
};

// Fetch project with all nodes and edges
export const fetchProject = async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`);
    return response.json();
};

// Create node
export const createNode = async (projectId, nodeData) => {
    const response = await fetch(`${API_BASE_URL}/nodes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...nodeData,
            project: projectId,
        }),
    });
    return response.json();
};

// Update node
export const updateNode = async (nodeId, updates) => {
    const response = await fetch(`${API_BASE_URL}/nodes/${nodeId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return response.json();
};

// Delete node (cascades to children)
export const deleteNode = async (nodeId) => {
    const response = await fetch(`${API_BASE_URL}/nodes/${nodeId}/`, {
        method: 'DELETE',
    });
    return response.status === 204;
};

// Move node to new position
export const moveNode = async (nodeId, position) => {
    const response = await fetch(`${API_BASE_URL}/nodes/${nodeId}/move/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position }),
    });
    return response.json();
};

// Update node status
export const updateNodeStatus = async (nodeId, status) => {
    const response = await fetch(`${API_BASE_URL}/nodes/${nodeId}/update_status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    return response.json();
};

// Chat with AI (sends message, gets response)
export const chatWithAI = async (nodeId, message, useKnowledge = true) => {
    const response = await fetch(`${API_BASE_URL}/chat/node/${nodeId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            use_knowledge: useKnowledge,
        }),
    });
    return response.json();
};

// Get chat history for a node
export const getChatHistory = async (nodeId) => {
    const response = await fetch(`${API_BASE_URL}/chat-history/?node=${nodeId}`);
    return response.json();
};

// Upload knowledge file
export const uploadKnowledge = async (projectId, file, title) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('file_type', file.name.split('.').pop().toLowerCase());
    formData.append('project', projectId);

    const response = await fetch(`${API_BASE_URL}/knowledge/`, {
        method: 'POST',
        body: formData,
    });
    return response.json();
};

// Search knowledge base
export const searchKnowledge = async (projectId, query) => {
    const response = await fetch(
        `${API_BASE_URL}/knowledge/search/?q=${encodeURIComponent(query)}&project=${projectId}`
    );
    return response.json();
};

// Get relevant knowledge for a node
export const getRelevantKnowledge = async (nodeId, query = null) => {
    const params = new URLSearchParams({ node: nodeId });
    if (query) params.append('query', query);
    
    const response = await fetch(
        `${API_BASE_URL}/search/knowledge/?${params}`
    );
    return response.json();
};

// List projects
export const listProjects = async () => {
    const response = await fetch(`${API_BASE_URL}/projects/`);
    return response.json();
};
