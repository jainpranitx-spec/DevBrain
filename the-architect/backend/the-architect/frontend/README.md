# 🏗️ The Architect

> A stunning mind map coding companion for hackathons. Organize your ideas with dual visualizations and AI assistance.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🌳 **Tree View** - Hierarchical mind map with drag-and-drop
- 🕸️ **Graph View** - Obsidian-style force-directed network
- 💬 **AI Chat** - Contextual chatbot for each node (mock ready for backend)
- 🎨 **iOS Glassmorphism** - Heavy transparency, blur, smooth animations
- 📊 **Status Tracking** - Visual progress indicators (not started/in progress/completed)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
cd the-architect/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎯 Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── Navbar.jsx           # Top navigation with view toggle
│   │   ├── TreeView.jsx         # Hierarchical mind map
│   │   ├── GraphView.jsx        # Force-directed network
│   │   ├── ChatPanel.jsx        # AI chat interface
│   │   └── NodeCard.jsx         # Custom node component
│   ├── store/            # State management
│   │   └── useStore.js          # Zustand store
│   ├── utils/            # Utilities
│   │   └── mockData.js          # Sample data + AI responses
│   ├── styles/           # CSS files
│   │   └── index.css            # Design system
│   └── App.jsx           # Main app component
└── package.json
```

---

## 🎨 Design System

### Glassmorphism

```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### Status Colors

- 🔴 **Not Started**: Gray (#6b7280)
- 🟡 **In Progress**: Yellow (#fbbf24)
- 🟢 **Completed**: Green (#10b981)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Vite** | Build tool & dev server |
| **React 18** | UI framework |
| **ReactFlow** | Tree view mind map |
| **react-force-graph-2d** | Graph visualization |
| **Zustand** | State management |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |

---

## 📖 Usage

### Tree View

1. Click any node to open the chat panel
2. Drag nodes to reposition
3. Use zoom/pan controls to navigate
4. Check the minimap for overview

### Graph View

1. Toggle to graph view from navbar
2. Watch nodes settle with physics simulation
3. Click nodes to open contextual chat
4. Zoom/pan to explore connections

### AI Chat

1. Click a node to open chat panel
2. Type a message (try "Break this down")
3. AI responds with suggestions
4. Close panel with X button

---

## 🔌 Backend Integration

The frontend is ready for backend integration. You need:

### API Endpoints

```javascript
POST /api/chat          // Send message, get AI response
POST /api/nodes         // Create new node
PUT  /api/nodes/:id     // Update node
DELETE /api/nodes/:id   // Delete node
GET  /api/projects/:id  // Load project data
```

### Replace Mock Data

Update `src/utils/mockData.js` to call your API instead of returning mock responses.

---

## 🎬 Demo Script (2 minutes)

1. **Opening** (30s): "Organize scattered hackathon ideas visually"
2. **Tree View** (1m): Show hierarchy, click node, AI breakdown
3. **Graph View** (30s): Toggle view, show physics, connections
4. **Closing** (30s): "Chaos to clarity with The Architect"

---

## 🏆 Hackathon Tips

- ✅ Start with tree view demo (easier to understand)
- ✅ Have sample project loaded (don't start blank)
- ✅ Practice the AI chat interaction
- ✅ Emphasize the glassmorphism aesthetics
- ✅ Show both views to demonstrate technical depth

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

Outputs to `dist/` folder.

---

## 🤝 Team Roles

- **Frontend**: This repository (UI/UX complete ✅)
- **Backend/AI**: API endpoints, AI integration, database
- **UX/UI**: Design refinements, user testing

---

## 📝 License

MIT License - feel free to use for your hackathon!

---

## 🙏 Acknowledgments

Built with love for hackathons. May your ideas never get lost again! 🚀

---

**Questions?** Check the walkthrough documentation for detailed info.
