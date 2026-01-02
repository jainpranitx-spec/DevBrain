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
    .filter(node => node.parentId)
    .map(node => ({
      id: `e-${node.parentId}-${node.id}`,
      source: node.parentId,
      target: node.id,
      type: 'smoothstep',
      animated: node.status === 'in-progress',
      style: {
        stroke: getStatusColor(node.status),
        strokeWidth: 2,
      },
    }));
};

// Helper to get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'in-progress':
      return '#fbbf24';
    case 'not-started':
    default:
      return '#6b7280';
  }
};

// Mock AI responses for demo
export const mockAIResponses = {
  default: [
    "I can help you break this down into smaller tasks. What specific aspect would you like to explore?",
    "This looks like an important feature! Should I suggest some sub-tasks?",
    "Let me know if you'd like me to create child nodes for this feature.",
  ],
  breakdown: (nodeName) => [
    `Great! I'll break down "${nodeName}" into manageable tasks:`,
    `• Set up the core infrastructure`,
    `• Implement the main functionality`,
    `• Add error handling and edge cases`,
    `• Write tests and documentation`,
    `\nShould I create these as child nodes?`,
  ].join('\n'),
  completed: [
    "Awesome! This task is marked as complete. Anything else you'd like to work on?",
    "Great progress! What's next on your roadmap?",
  ],
};
