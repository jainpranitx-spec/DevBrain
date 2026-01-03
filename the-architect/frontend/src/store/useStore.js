import { create } from 'zustand';
import { mockProject, generateEdges } from '../utils/mockData';
import * as api from '../services/api';

const useStore = create((set, get) => ({
    // View state
    currentView: 'tree', // 'tree' | 'graph'

    // Project state
    projectId: null,
    projectName: 'DevBrain Project',
    
    // Nodes and edges
    nodes: mockProject.nodes,
    edges: generateEdges(mockProject.nodes),

    // Selected node for chat
    selectedNodeId: null,

    // Chat history per node
    chatHistory: {},

    // Loading states
    loading: false,
    error: null,

    // Backend connection status
    isConnected: false,

    // Actions
    setView: (view) => set({ currentView: view }),

    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Project management
    initializeProject: async (projectData) => {
        set({ loading: true, error: null });
        try {
            const project = await api.initializeProject(projectData);
            
            // Import generateEdges to create edges from parent relationships
            const { generateEdges } = await import('../utils/mockData');
            const edges = generateEdges(project.nodes || []);
            
            // Convert chat_messages from nodes into chatHistory format
            const chatHistory = {};
            (project.nodes || []).forEach(node => {
                if (node.chat_messages && node.chat_messages.length > 0) {
                    chatHistory[node.id] = node.chat_messages;
                }
            });
            
            set({ 
                projectId: project.id,
                projectName: project.name,
                nodes: project.nodes || [],
                edges: edges,
                chatHistory: chatHistory,
                isConnected: true,
                loading: false 
            });
            return project;
        } catch (error) {
            console.warn('Failed to initialize project, using mock data:', error);
            set({ 
                loading: false, 
                error: error.message,
                isConnected: false 
            });
            // Keep using mock data as fallback
            return null;
        }
    },

    loadProject: async (projectId) => {
        set({ loading: true, error: null });
        try {
            const project = await api.fetchProject(projectId);
            
            // Import generateEdges to create edges from parent relationships
            const { generateEdges } = await import('../utils/mockData');
            const edges = generateEdges(project.nodes || []);
            
            // Convert chat_messages from nodes into chatHistory format
            const chatHistory = {};
            (project.nodes || []).forEach(node => {
                if (node.chat_messages && node.chat_messages.length > 0) {
                    chatHistory[node.id] = node.chat_messages;
                }
            });
            
            set({
                projectId: project.id,
                projectName: project.name,
                nodes: project.nodes || [],
                edges: edges,
                chatHistory: chatHistory,
                isConnected: true,
                loading: false
            });
            
            console.log('✅ Loaded project with', Object.keys(chatHistory).length, 'chat histories');
            
            return project;
        } catch (error) {
            console.warn('Failed to load project:', error);
            set({ 
                loading: false, 
                error: error.message,
                isConnected: false 
            });
            throw error;
        }
    },

    // Node management with backend sync
    addNode: async (nodeData) => {
        const state = get();
        
        if (state.isConnected && state.projectId) {
            try {
                const newNode = await api.createNode(state.projectId, nodeData);
                set((state) => {
                    const newNodes = [...state.nodes, newNode];
                    return {
                        nodes: newNodes,
                        edges: generateEdges(newNodes),
                    };
                });
                return newNode;
            } catch (error) {
                console.warn('Failed to create node on backend, adding locally:', error);
                set({ error: error.message });
                
                // Fallback to local state
                const localNode = { ...nodeData, id: `local-${Date.now()}` };
                set((state) => {
                    const newNodes = [...state.nodes, localNode];
                    return {
                        nodes: newNodes,
                        edges: generateEdges(newNodes),
                    };
                });
                return localNode;
            }
        }
        
        // Fallback to local state when not connected
        const localNode = { ...nodeData, id: `local-${Date.now()}` };
        set((state) => {
            const newNodes = [...state.nodes, localNode];
            return {
                nodes: newNodes,
                edges: generateEdges(newNodes),
            };
        });
        return localNode;
    },

    updateNode: async (id, updates) => {
        const state = get();
        
        // Only try backend update if it's not a local ID
        if (state.isConnected && !id.startsWith('local-')) {
            try {
                await api.updateNode(id, updates);
            } catch (error) {
                console.warn('Failed to update node on backend:', error);
                set({ error: error.message });
            }
        }

        // Update local state regardless
        set((state) => {
            const newNodes = state.nodes.map(node =>
                node.id === id ? { ...node, ...updates } : node
            );
            return {
                nodes: newNodes,
                edges: generateEdges(newNodes),
            };
        });
    },

    updateNodeStatus: async (id, status) => {
        const state = get();
        
        // Only try backend update if it's not a local ID
        if (state.isConnected && !id.startsWith('local-')) {
            try {
                await api.updateNodeStatus(id, status);
            } catch (error) {
                console.warn('Failed to update node status:', error);
                set({ error: error.message });
            }
        }

        // Update local state
        set((state) => ({
            nodes: state.nodes.map(node =>
                node.id === id ? { ...node, status } : node
            ),
        }));
    },

    deleteNode: async (id) => {
        const state = get();
        
        // Only try backend delete if it's not a local ID
        if (state.isConnected && !id.startsWith('local-')) {
            try {
                await api.deleteNode(id);
            } catch (error) {
                console.warn('Failed to delete node on backend:', error);
                set({ error: error.message });
            }
        }

        // Update local state - backend handles cascade delete
        set((state) => {
            // Also delete all children locally
            const nodesToDelete = new Set([id]);
            const findChildren = (parentId) => {
                state.nodes.forEach(node => {
                    if (node.parentId === parentId || node.parent_id === parentId) {
                        nodesToDelete.add(node.id);
                        findChildren(node.id);
                    }
                });
            };
            findChildren(id);

            const newNodes = state.nodes.filter(node => !nodesToDelete.has(node.id));
            return {
                nodes: newNodes,
                edges: generateEdges(newNodes),
            };
        });
    },

    updateNodePosition: async (id, position) => {
        const state = get();
        
        // Only try backend update if it's not a local ID
        if (state.isConnected && !id.startsWith('local-')) {
            try {
                await api.updateNodePosition(id, position);
            } catch (error) {
                console.warn('Failed to update node position:', error);
            }
        }

        // Update local state
        set((state) => ({
            nodes: state.nodes.map(node =>
                node.id === id ? { ...node, position } : node
            ),
        }));
    },

    selectNode: (id) => set({ selectedNodeId: id }),
    deselectNode: () => set({ selectedNodeId: null }),

    // Chat with backend AI
    addChatMessage: async (nodeId, message, useKnowledge = true) => {
        const state = get();
        
        // Add user message immediately
        const userMessage = {
            id: `msg-${Date.now()}`,
            message,
            role: 'user',
            timestamp: new Date().toISOString(),
        };

        set((state) => ({
            chatHistory: {
                ...state.chatHistory,
                [nodeId]: [
                    ...(state.chatHistory[nodeId] || []),
                    userMessage,
                ],
            },
        }));

        // Get AI response
        if (state.isConnected) {
            try {
                const result = await api.chatWithAI(nodeId, message, useKnowledge);
                
                set((state) => ({
                    chatHistory: {
                        ...state.chatHistory,
                        [nodeId]: [
                            ...(state.chatHistory[nodeId] || []),
                            result.ai_response,
                        ],
                    },
                }));

                return result;
            } catch (error) {
                console.warn('Failed to get AI response, using fallback:', error);
                set({ error: error.message });
            }
        }

        // Fallback to local AI service
        const { generateAIResponse } = await import('../services/ai');
        const node = state.nodes.find(n => n.id === nodeId);
        const aiResponse = await generateAIResponse(message, node?.label || 'Unknown');
        
        const aiMessage = {
            id: `msg-${Date.now()}-ai`,
            message: aiResponse.message,
            role: 'ai',
            timestamp: new Date().toISOString(),
            source: aiResponse.source,
        };

        set((state) => ({
            chatHistory: {
                ...state.chatHistory,
                [nodeId]: [
                    ...(state.chatHistory[nodeId] || []),
                    aiMessage,
                ],
            },
        }));

        return { ai_response: aiMessage };
    },

    // Knowledge base management
    uploadKnowledge: async (file, description = '') => {
        const state = get();
        
        if (!state.isConnected || !state.projectId) {
            throw new Error('Not connected to backend or no project loaded');
        }

        try {
            const result = await api.uploadKnowledge(state.projectId, file, description);
            return result;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // Check backend connection
    checkConnection: async () => {
        try {
            const isHealthy = await api.healthCheck();
            set({ isConnected: isHealthy });
            return isHealthy;
        } catch (error) {
            set({ isConnected: false });
            return false;
        }
    },

    // Clear current project (useful for starting fresh)
    clearProject: () => {
        localStorage.removeItem('devbrain_project_id');
        set({
            projectId: null,
            projectName: 'DevBrain Project',
            nodes: [],
            edges: [],
            chatHistory: {},
            selectedNodeId: null,
        });
    },
}));

export default useStore;
