# 🚀 DevBrain - Quick Setup Guide

## Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver 0.0.0.0:8000
```

**Important:** Edit `backend/config/settings.py` line 93:

```python
GEMINI_API_KEY = 'INSERT API KEY'  # Replace with real key from ai.google.dev
```

## Frontend Setup (2 minutes)

```bash
cd the-architect/frontend

# Create environment file
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

# Install & run
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Test It Works

1. **Create a project** - Click "New Project" in frontend
2. **Add nodes** - Create your mind map
3. **Upload knowledge** - Add a PDF or text file (Settings → Upload Knowledge)
4. **Chat with AI** - Select a node, ask "Break this down into tasks"
   - AI will use your uploaded knowledge to answer
   - Shows which documents it referenced

## Architecture

```
Frontend (React)
    ↓
API (Django REST)
    ↓
Database (SQLite) + Gemini AI
```

**Data Flow for Chat:**

1. User selects node + sends message
2. Frontend → Backend API: `POST /api/chat/node/{id}/`
3. Backend searches uploaded knowledge files
4. Backend calls Gemini API (or mock if no key)
5. Response sent back with knowledge sources

## Key Files

### Backend

- **models.py** - Database schema (Node, Edge, Project, Knowledge Base)
- **views.py** - REST endpoints
- **services.py** - Gemini integration + knowledge search
- **settings.py** - Config (API key goes here)

### Frontend

- **api.js** - Calls backend endpoints
- **useStore.js** - Global state (syncs with backend)
- **ChatPanel.jsx** - Sends messages to `/api/chat/node/`
- **.env.local** - Backend URL

## API Endpoints

```
POST   /api/projects/              Create project
GET    /api/projects/{id}/         Get project + all nodes
POST   /api/nodes/                 Create node
POST   /api/nodes/{id}/update_status/  Change status
DELETE /api/nodes/{id}/            Delete node
POST   /api/chat/node/{id}/        Send message to AI
POST   /api/knowledge/             Upload knowledge file
```

## Admin Panel

```
http://localhost:8000/admin
```

Create superuser:

```bash
python manage.py createsuperuser
```

Manage projects, nodes, and uploaded files through web UI.

## Troubleshooting

| Issue                      | Fix                                                         |
| -------------------------- | ----------------------------------------------------------- |
| CORS error                 | Check frontend URL in `settings.py` `CORS_ALLOWED_ORIGINS`  |
| Port 8000 in use           | `python manage.py runserver 8001`                           |
| "API key invalid"          | Verify in `settings.py`, check at ai.google.dev             |
| Chat returns mock response | Need real Gemini API key (still works without it)           |
| File upload fails          | Check PyPDF2/python-docx: `pip install -r requirements.txt` |

## Understanding the Design

### Why Separate Backend?

- **Knowledge grounding** - Uploads are stored server-side, indexed for search
- **Persistent storage** - Mind maps saved in database
- **AI safety** - API keys stay on server, never exposed to frontend
- **Scalability** - Multiple users, real collaboration

### Knowledge Search

When user asks about a node:

1. Backend searches uploaded files for relevant content
2. Builds prompt with: node context + relevant excerpts
3. Sends to Gemini: "Answer this question using only the provided knowledge"
4. Returns answer + source files referenced

### Chat Binding

Unlike global chatbots, each node has its own conversation:

- `/api/chat/node/node-123/` - Focus on Task 1
- `/api/chat/node/node-456/` - Focus on Task 2
- User stays in flow, one thing at a time

## Next Steps

1. **Add authentication** (optional)

   ```bash
   pip install djangorestframework-simplejwt
   ```

2. **Deploy** to production

   - Use PostgreSQL instead of SQLite
   - Set `DEBUG=False`
   - Use Gunicorn or similar server

3. **Real-time collab** (optional)

   - Add WebSocket support
   - Multiple users editing same mind map

4. **Custom AI prompts**
   - Edit `services.py` `system_prompt` for different response styles
   - Add node-type specific prompts

## Quick Wins

- **Offline fallback** - Mock responses work without API key
- **Knowledge indexing** - Automatic text extraction from uploads
- **Status tracking** - Visual progress on each node
- **Hierarchical deletion** - Delete parent = delete all children
- **Position persistence** - Node layout saved in database

---

**Questions?** Check `backend/README.md` for full API documentation.

**Ready?** Start backend + frontend and create your first mind map! 🧠
