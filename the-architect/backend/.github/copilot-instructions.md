# Copilot Instructions for DevBrain

## Project Overview

**DevBrain** ("The Architect") is a React-based mind map visualization tool for hackathons. It features dual visualization modes (hierarchical tree and force-directed graph), AI-powered chat assistance per node, and glassmorphism design. Built with Vite, React 18, ReactFlow, and Google Generative AI.

## Architecture & Data Flow

### Core State Management (Zustand)

All app state lives in [`src/store/useStore.js`](src/store/useStore.js). Key concepts:

- **Nodes**: Tree nodes with `id`, `label`, `status`, `parentId`, `position`, `owner`, `createdAt`
- **Edges**: Auto-generated from parent-child relationships via `generateEdges()`
- **View state**: Toggle between `'tree'` (ReactFlow) and `'graph'` (force-directed)
- **Chat context**: Per-node chat history stored in `chatHistory` object keyed by `nodeId`

Data flows: **App.jsx** → consume view/nodes/selectedNodeId → pass to **TreeView/GraphView/ChatPanel**

### Component Structure

- **Navbar.jsx**: View toggle (tree ↔ graph)
- **TreeView.jsx**: Hierarchical layout using ReactFlow + Dagre (directed acyclic graph layout)
- **GraphView.jsx**: Force-directed network using react-force-graph-2d
- **ChatPanel.jsx**: AI chat interface, shows only when node selected
- **NodeCard.jsx**: Custom ReactFlow node component with status badge
- **CreateNodeModal.jsx**: Node creation/editing dialog

### Design System (Glassmorphism)

All styles reference [`src/styles/index.css`](src/styles/index.css). Key pattern:

```css
/* Glass effect template */
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

Status colors: Not Started (gray #6b7280), In Progress (yellow #fbbf24), Completed (green #10b981)

## Critical Workflows

### Development

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### AI Integration

[`src/services/ai.js`](src/services/ai.js) handles chat:

1. **Real API**: Uses `VITE_GEMINI_API_KEY` env var for Google Gemini (`gemini-pro`)
2. **Fallback**: Professional mock responses when API unavailable/no key
3. **Network delay**: Mock adds 800-1600ms delay for realism

API key setup:

- Create `.env.local` file: `VITE_GEMINI_API_KEY=sk-...`
- Or directly set in `ai.js` (not recommended)

### Node Operations

Store actions maintain edge consistency automatically:

- `addNode()`: Requires `parentId` for hierarchy
- `deleteNode()`: Cascades to all descendants
- `updateNode()`: Preserves parent-child structure
- Edges regenerated on every node change via `generateEdges()`

## Project-Specific Patterns

### Hierarchical vs Graph Rendering

- **TreeView**: Uses ReactFlow's built-in node/edge system. Dagre positions nodes as DAG (top-down rank layout)
- **GraphView**: Uses react-force-graph-2d (separate library). Nodes positioned by force-directed physics
- Both consume same store data; different rendering engines

### Chat Context Binding

Chat happens per-node (selected via `selectNode(id)`). When sending message:

1. Extract `contextNodeName` from selected node's label
2. Pass to `generateAIResponse(userMessage, contextNodeName)`
3. Append response to `chatHistory[selectedNodeId]`
4. Clear selection = close ChatPanel

### Mock Data Pattern

[`src/utils/mockData.js`](src/utils/mockData.js) contains:

- `mockProject`: Sample hierarchy (Login System → Firebase Auth, etc.)
- `generateEdges()`: Builds parent→child edges
- `mockAIResponses`: Fallback response templates (unused, now in ai.js)

## Key Dependencies & Why

| Package                   | Purpose                           | Notes                                          |
| ------------------------- | --------------------------------- | ---------------------------------------------- |
| **ReactFlow**             | Tree view layout & node rendering | Handles DAG positioning via Dagre              |
| **react-force-graph-2d**  | Graph visualization               | Canvas-based force simulation                  |
| **Zustand**               | Global state                      | Lightweight, no providers, direct store access |
| **Framer Motion**         | Smooth view transitions           | AnimatePresence for tree↔graph swap            |
| **Lucide React**          | Icons (Eye, EyeOff, etc.)         | Consistent icon library                        |
| **@google/generative-ai** | Gemini API client                 | Conditional import in ai.js                    |
| **Dagre**                 | Layout algorithm                  | Auto-positions ReactFlow nodes hierarchically  |

## Common Tasks

**Adding a new visualization mode**:

- Add case to `currentView` switch in App.jsx
- Create new component (e.g., `TimelineView.jsx`)
- Import in App, add to toggle logic in Navbar

**Styling a new component**:

- Use glassmorphism base from `styles/index.css`
- Import CSS file next to component (e.g., `NewView.css` for `NewView.jsx`)
- Follow naming: `new-view { ... }`

**Modifying node structure**:

- Update node fields in `mockProject` → sync store initialization
- Add field to Zustand actions if state-dependent
- Update TreeView/GraphView data accessors

## ESLint & Build Setup

- Config: `eslint.config.js`, Vite: `vite.config.js`
- ESLint rules check React hooks via `eslint-plugin-react-hooks`
- Build output: `dist/` folder (production-ready static site)
