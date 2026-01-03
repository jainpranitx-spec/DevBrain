import { create } from 'zustand';
import { mockProject, generateEdges } from '../utils/mockData';

const useStore = create((set, get) => ({
    // View state
    currentView: 'tree', // 'tree' | 'graph'

    // Nodes and edges
    nodes: mockProject.nodes,
    edges: generateEdges(mockProject.nodes),

    // Selected node for chat
    selectedNodeId: null,

    // Chat history per node
    chatHistory: {},

    // Actions
    setView: (view) => set({ currentView: view }),

    addNode: (node) => set((state) => {
        const newNodes = [...state.nodes, node];
        return {
            nodes: newNodes,
            edges: generateEdges(newNodes),
        };
    }),

    updateNode: (id, updates) => set((state) => {
        const newNodes = state.nodes.map(node =>
            node.id === id ? { ...node, ...updates } : node
        );
        return {
            nodes: newNodes,
            edges: generateEdges(newNodes),
        };
    }),

    deleteNode: (id) => set((state) => {
        // Also delete all children
        const nodesToDelete = new Set([id]);
        const findChildren = (parentId) => {
            state.nodes.forEach(node => {
                if (node.parentId === parentId) {
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
    }),

    selectNode: (id) => set({ selectedNodeId: id }),

    deselectNode: () => set({ selectedNodeId: null }),

    addChatMessage: (nodeId, message) => set((state) => ({
        chatHistory: {
            ...state.chatHistory,
            [nodeId]: [
                ...(state.chatHistory[nodeId] || []),
                message,
            ],
        },
    })),

    updateNodePosition: (id, position) => set((state) => ({
        nodes: state.nodes.map(node =>
            node.id === id ? { ...node, position } : node
        ),
    })),
}));

export default useStore;
