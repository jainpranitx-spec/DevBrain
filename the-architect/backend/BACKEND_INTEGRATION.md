# DevBrain Backend Integration Guide

This document shows how to connect the React frontend to the Django backend.

## 🎯 Overview

The frontend has been updated with an `api.js` service that handles all backend communication:

- Projects (create, read, update, delete)
- Nodes & hierarchy management
- Chat with AI (grounded in uploaded knowledge)
- File uploads & knowledge base

## 🚀 Setup

### 1. Environment Configuration

Create `.env.local` in `the-architect/frontend/`:

```
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=INSERT API KEY  # Still needed for local fallback
```

Or in production:

```
VITE_API_URL=https://api.devbrain.com/api
```

### 2. Start Backend

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### 3. Start Frontend

```bash
cd the-architect/frontend
npm run dev
```

## 📋 Usage Examples

### Initialize a Project

```javascript
import { initializeProject } from "./services/api";

const project = await initializeProject({
  name: "My Hackathon",
  description: "Planning and ideation",
});
// Returns: { id: 'uuid-123', name: 'My Hackathon', ... }
```

### Create a Node

```javascript
import { createNode } from "./services/api";

const node = await createNode(projectId, {
  label: "Login System",
  description: "User authentication",
  status: "not-started",
  owner: "John",
  parent_id: "parent-node-id", // Optional: creates hierarchy
  position: { x: 100, y: 200 }, // Visual position
});
```

### Chat with AI (Knowledge-Grounded)

```javascript
import { chatWithAI } from './services/api';

const response = await chatWithAI(
  nodeId,
  'Break this down into subtasks',
  true  // useKnowledge - search uploaded files
);

// Returns:
{
  user_message: { id: '...', message: 'Break...', role: 'user', ... },
  ai_response: { id: '...', message: 'Here\'s how...', role: 'ai', ... },
  metadata: {
    source: 'gemini-api',  // or 'mock'
    knowledge_used: true,
    knowledge_sources: ['research.pdf', 'notes.md']
  }
}
```

### Upload Knowledge File

```javascript
import { uploadKnowledge } from "./services/api";

const fileInput = document.querySelector('input[type="file"]');
const response = await uploadKnowledge(
  projectId,
  fileInput.files[0],
  "Research Notes"
);
// Backend extracts text from PDF/DOCX and indexes it
```

## 🔄 Integrating with Zustand Store

Update `src/store/useStore.js` to sync with backend:

```javascript
import { create } from "zustand";
import * as api from "../services/api";

const useStore = create((set, get) => ({
  // State
  projectId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  chatHistory: {},

  // Initialize from backend
  loadProject: async (projectId) => {
    const project = await api.fetchProject(projectId);
    set({
      projectId,
      nodes: project.nodes,
      edges: project.edges,
    });
  },

  // Create node in backend + local state
  addNode: async (nodeData) => {
    const newNode = await api.createNode(get().projectId, nodeData);
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    return newNode;
  },

  // Delete cascades in backend
  deleteNode: async (id) => {
    await api.deleteNode(id);
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
    }));
  },

  // Update status quickly
  updateNodeStatus: async (id, status) => {
    await api.updateNodeStatus(id, status);
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, status } : n)),
    }));
  },

  // Chat with AI
  addChatMessage: async (nodeId, message) => {
    const result = await api.chatWithAI(nodeId, message);

    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [nodeId]: [
          ...(state.chatHistory[nodeId] || []),
          result.user_message,
          result.ai_response,
        ],
      },
    }));

    return result;
  },
}));

export default useStore;
```

## 📊 Update ChatPanel Component

Replace the mock response with backend integration:

```javascript
// src/components/ChatPanel.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import useStore from "../store/useStore";
import { chatWithAI } from "../services/api";
import "../styles/ChatPanel.css";

export default function ChatPanel() {
  const { selectedNodeId, chatHistory, addChatMessage } = useStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !selectedNodeId) return;

    setLoading(true);
    try {
      const result = await chatWithAI(selectedNodeId, input.trim());
      // Update store with messages
      // Show knowledge sources if available
      if (result.metadata.knowledge_sources.length > 0) {
        console.log("Sources:", result.metadata.knowledge_sources);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  // Rest of component...
}
```

## 🔐 Error Handling

Wrap API calls in try-catch:

```javascript
try {
  const node = await createNode(projectId, data);
} catch (error) {
  if (error.response?.status === 404) {
    // Project not found
  } else if (error.response?.status === 400) {
    // Validation error
    console.error(error.response.data);
  } else {
    // Network or server error
  }
}
```

## 📁 File Upload Flow

```javascript
// User selects file in UI
const file = event.target.files[0];

// Upload to backend
const knowledge = await uploadKnowledge(projectId, file, "My Research");
// Backend extracts text and creates searchable index

// When user asks a question on a node:
const aiResponse = await chatWithAI(
  nodeId,
  "How do I implement this?",
  true // search uploaded knowledge
);
// Backend finds relevant excerpts and includes in prompt
```

## 🔄 Real-Time Collaboration (Optional)

For multiplayer features, add WebSocket support to the backend:

```python
# In settings.py
INSTALLED_APPS = [
    'daphne',  # Already added
    # ...
]

ASGI_APPLICATION = 'config.asgi.application'
```

Then in frontend:

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/project/123/");
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Sync other users' changes
};
```

## 🧪 Testing API Locally

Use curl or Postman:

```bash
# Create project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Testing"}'

# Create node
curl -X POST http://localhost:8000/api/nodes/ \
  -H "Content-Type: application/json" \
  -d '{
    "label":"Task",
    "status":"not-started",
    "project":"project-uuid"
  }'

# Chat with AI
curl -X POST http://localhost:8000/api/chat/node/node-uuid/ \
  -H "Content-Type: application/json" \
  -d '{"message":"Help me with this"}'
```

## 🌐 CORS & Development

If you see CORS errors:

1. Make sure backend is running on `localhost:8000`
2. Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`
3. Include credentials if needed:
   ```javascript
   fetch(url, {
     credentials: "include",
     // ...
   });
   ```

## 📝 Environment Variables

### Backend (`backend/.env`)

```
GEMINI_API_KEY=INSERT API KEY
DEBUG=True
SECRET_KEY=dev-key-only
```

### Frontend (`the-architect/frontend/.env.local`)

```
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=INSERT API KEY  # Local fallback
```

## 🚀 Deployment Checklist

- [ ] Backend: Update `DEBUG=False` in settings
- [ ] Backend: Set real `SECRET_KEY`
- [ ] Backend: Configure production database
- [ ] Frontend: Update `VITE_API_URL` to production API
- [ ] Both: Set real `GEMINI_API_KEY`
- [ ] Both: Enable HTTPS
- [ ] Backend: Setup CORS for frontend domain
- [ ] Backend: Run `collectstatic` for static files
- [ ] Test full flow: create project → upload knowledge → chat → see grounded responses

## 🐛 Common Issues

**"Cannot POST to /api/chat/node/"**

- Ensure backend is running
- Check `VITE_API_URL` is correct
- Verify CORS settings

**"API key invalid"**

- Check Gemini API key in settings
- Verify key format and expiration

**Chat returns mock response when knowledge uploaded**

- Backend needs real Gemini API key
- Without it, uses mock responses (still shows knowledge sources)
- Check `GEMINI_API_KEY` in `backend/config/settings.py`

**File upload fails**

- Check file size (max 10MB)
- Ensure supported format (PDF, TXT, MD, DOCX)
- Verify PyPDF2/python-docx installed: `pip install -r requirements.txt`

---

**Ready to build?** Start the backend, then launch the frontend and begin integrating!
