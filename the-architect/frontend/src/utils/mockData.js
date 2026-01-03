// Mock data for demo purposes
export const mockProject = {
  id: 'project-1',
  name: 'Hackathon App',
  nodes: [
    {
      id: '1',
      label: 'Hackathon App',
      description: 'Main project root',
      status: 'in-progress',
      owner: null,
      parentId: null,
      position: { x: 400, y: 50 },
      createdAt: '2026-01-03T01:00:00',
    },
    {
      id: '2',
      label: 'Login System',
      description: 'User authentication module',
      status: 'in-progress',
      owner: 'Shams',
      parentId: '1',
      position: { x: 200, y: 200 },
      createdAt: '2026-01-03T01:10:00',
    },
    {
      id: '3',
      label: 'Firebase Auth',
      description: 'Set up Firebase SDK and configuration',
      status: 'completed',
      owner: 'Shams',
      parentId: '2',
      position: { x: 50, y: 350 },
      createdAt: '2026-01-03T01:15:00',
    },
    {
      id: '4',
      label: 'Auth UI',
      description: 'Login/signup forms with validation',
      status: 'in-progress',
      owner: 'Shams',
      parentId: '2',
      position: { x: 200, y: 350 },
      createdAt: '2026-01-03T01:20:00',
    },
    {
      id: '5',
      label: 'Error Handling',
      description: 'Toast notifications for auth errors',
      status: 'not-started',
      owner: null,
      parentId: '2',
      position: { x: 350, y: 350 },
      createdAt: '2026-01-03T01:25:00',
    },
    {
      id: '6',
      label: 'Mind Map Dashboard',
      description: 'Interactive visualization interface',
      status: 'in-progress',
      owner: 'You',
      parentId: '1',
      position: { x: 600, y: 200 },
      createdAt: '2026-01-03T01:30:00',
    },
    {
      id: '7',
      label: 'ReactFlow Setup',
      description: 'Tree view implementation',
      status: 'completed',
      owner: 'You',
      parentId: '6',
      position: { x: 500, y: 350 },
      createdAt: '2026-01-03T01:35:00',
    },
    {
      id: '8',
      label: 'Graph View',
      description: 'Force-directed network visualization',
      status: 'in-progress',
      owner: 'You',
      parentId: '6',
      position: { x: 650, y: 350 },
      createdAt: '2026-01-03T01:40:00',
    },
    {
      id: '9',
      label: 'AI Chat Integration',
      description: 'Contextual chatbot for each node',
      status: 'not-started',
      owner: null,
      parentId: '6',
      position: { x: 800, y: 350 },
      createdAt: '2026-01-03T01:45:00',
    },
  ],
};

// Generate edges from parent-child relationships
export const generateEdges = (nodes) => {
  return nodes
    .filter(node => node.parentId || node.parent_id)
    .map(node => {
      const parentId = node.parentId || node.parent_id;
      return {
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: node.status === 'in-progress',
        style: {
          stroke: getStatusColor(node.status),
          strokeWidth: 2,
        },
        // Particle color for graph view
        color: getStatusColor(node.status),
      };
    });
};

// Helper to get status color
export const getStatusColor = (status) => {
  // Use CSS variables logic but in hex for canvas
  switch (status) {
    case 'completed':
      return '#30d158'; // iOS Green
    case 'in-progress':
      return '#ff9f0a'; // iOS Orange
    case 'not-started':
    default:
      return '#8e8e93'; // iOS Gray
  }
};

// Enhanced Mock AI Responses to simulate RAG (Retrieval Augmented Generation)
export const mockAIResponses = {
  default: {
    message: "I've analyzed the current node context. I can help you break this down further, find related technical documentation, or suggest implementation steps. What do you need?",
    type: 'ai'
  },
  'breakdown': {
    message: "Based on the architecture of this node, here is a suggested breakdown:\n\n1. **Core Logic**: Define the primary data models and algorithms.\n2. **API Layer**: Design the endpoints (REST/GraphQL) to expose this functionality.\n3. **UI Components**: Create the necessary views and interaction states.\n4. **State Management**: specific stores/reducers for this feature.\n\nShall I create these sub-nodes for you?",
    type: 'ai'
  },
  'context': {
    message: "I'm reading the context from your connected knowledge base...\n\nFound 3 relevant files:\n- 📄 `architecture_v1.pdf` (Page 12)\n- 📝 `meeting_notes_backend.md`\n- 🔗 `Linear Issue #42`\n\nThis feature seems to depend on the *User Authentication* module. Ensure that token validation is implemented before proceeding with this.",
    type: 'ai'
  }
};

export const getAIResponse = (input, nodeLabel) => {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('break') || lowerInput.includes('task') || lowerInput.includes('sub')) {
    return {
      message: `**Breakdown for ${nodeLabel}:**\n\n1. 🏗️ **Scaffold Component**: Initialize the base structure.\n2. 🔄 **State Logic**: Define ${nodeLabel} specific hooks/stores.\n3. 🎨 **Styling**: Apply glassmorphism tokens.\n4. 🧪 **Tests**: Write unit tests for core logic.\n\nWould you like me to generate these nodes?`,
      type: 'ai'
    };
  }

  if (lowerInput.includes('context') || lowerInput.includes('search') || lowerInput.includes('what is')) {
    return {
      message: `**Context Analysis for ${nodeLabel}:**\n\nInitializing semantic search...\n\n🔍 *Found related pattern in SystemDesign.md*\n> "All UI components must implement the GlassCard interface for consistency."\n\nMake sure to import glass-card utility from the styles index.`,
      type: 'ai'
    };
  }

  return {
    message: `I'm focused on **${nodeLabel}**. \n\nI can assist with:\n- 🔨 Breaking this down into tasks\n- 🔍 Finding relevant code snippets\n- 📝 Generating documentation\n\nJust let me know what you're thinking.`,
    type: 'ai'
  };
};
