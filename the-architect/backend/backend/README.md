# DevBrain Backend

Django REST API backend for DevBrain - an AI-assisted mind mapping tool for project planning and ideation.

## 🎯 Architecture

The backend handles:

- **Mind Map Storage** - Persistent hierarchical node/edge structure
- **Knowledge Base Management** - Upload and index knowledge files (PDFs, docs)
- **Contextual AI** - Gemini API integration with knowledge-grounded responses
- **Chat History** - Per-node conversation storage for thinking continuity

### Data Model

```
Project (root container)
├── Nodes (ideas/tasks with status)
│   ├── status: not-started | in-progress | completed
│   ├── parent/children hierarchy
│   └── position tracking (x, y)
├── Edges (connections - auto-generated from parent relationships)
├── KnowledgeBase (uploaded files for context)
└── ChatMessages (per-node conversation history)
```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.9+
- Django 4.2+

### 2. Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Setup Database

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser
```

### 4. Configure Gemini API

Edit `config/settings.py`:

```python
GEMINI_API_KEY = 'INSERT API KEY'  # Replace with your actual key
```

Or set environment variable:

```bash
export GEMINI_API_KEY=your_actual_key
```

Get your API key from: https://ai.google.dev

### 5. Run Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

Server runs at `http://localhost:8000`

## 📚 API Endpoints

### Projects

```
GET    /api/projects/              # List user projects
POST   /api/projects/              # Create new project
GET    /api/projects/{id}/         # Get project with nodes/edges
PUT    /api/projects/{id}/         # Update project
DELETE /api/projects/{id}/         # Delete project
GET    /api/projects/{id}/export/  # Export as JSON
```

### Nodes (Mind Map Items)

```
GET    /api/nodes/?project={id}    # List nodes in project
POST   /api/nodes/                 # Create node
GET    /api/nodes/{id}/            # Get node details + chat history
PUT    /api/nodes/{id}/            # Update node
DELETE /api/nodes/{id}/            # Delete node (cascades children)
POST   /api/nodes/{id}/move/       # Update position {x, y}
POST   /api/nodes/{id}/update_status/  # Quick status update
GET    /api/nodes/{id}/children/   # Get direct children
```

### Edges (Connections)

```
GET    /api/edges/?project={id}    # List edges
POST   /api/edges/                 # Create edge
DELETE /api/edges/{id}/            # Delete connection
```

### Knowledge Base

```
GET    /api/knowledge/?project={id}     # List knowledge files
POST   /api/knowledge/                  # Upload file (multipart)
DELETE /api/knowledge/{id}/             # Delete knowledge file
GET    /api/knowledge/search/?q=...     # Search knowledge
```

### Chat & AI

```
POST   /api/chat/node/{node_id}/       # Send message, get AI response
GET    /api/chat-history/?node={id}    # Get chat history for node
GET    /api/search/knowledge/?node={id}&query=...  # Find relevant knowledge
```

## 🤖 AI Integration (Gemini)

When a user sends a message to a node's chat:

1. **Knowledge Search** - Find relevant uploaded documents
2. **Context Building** - Create focused prompt with node info + knowledge
3. **API Call** - Use Gemini to generate response
4. **Fallback** - Mock response if API unavailable

Example chat flow:

```
User selects node: "Implement Auth System"
Sends: "How do I start?"
→ Backend searches knowledge base for auth-related docs
→ Builds prompt with node context + retrieved knowledge
→ Calls Gemini API
→ Returns response grounded in your uploaded materials
```

## 📁 File Upload

Supported formats: PDF, TXT, MD, DOCX

```bash
curl -X POST http://localhost:8000/api/knowledge/ \
  -F "file=@research.pdf" \
  -F "title=Research Notes" \
  -F "file_type=pdf" \
  -F "project=project-123"
```

**Dependencies for file extraction:**

- PDFs: `PyPDF2` (included)
- DOCX: `python-docx` (included)

## 🔗 Frontend Integration

Frontend should call these endpoints:

```javascript
// Example: Create a project
fetch("http://localhost:8000/api/projects/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "My Hackathon",
    description: "Project planning",
  }),
});

// Example: Chat with AI on a node
fetch("http://localhost:8000/api/chat/node/node-123/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Break this down into tasks",
    use_knowledge: true,
  }),
});
```

## 🛠️ Development Workflow

### Create Migration (after model changes)

```bash
python manage.py makemigrations
python manage.py migrate
```

### Run Tests

```bash
python manage.py test
```

### Admin Panel

```
http://localhost:8000/admin
```

Use superuser credentials created with `createsuperuser`

## 📊 Project Structure

```
backend/
├── config/              # Django settings & routing
│   ├── settings.py      # Main config (GEMINI_API_KEY here)
│   ├── urls.py          # API routes
│   ├── asgi.py          # ASGI app
│   └── wsgi.py          # WSGI app
├── api/                 # Main Django app
│   ├── models.py        # Database models (Node, Edge, etc.)
│   ├── views.py         # REST API endpoints
│   ├── serializers.py   # JSON serialization
│   ├── services.py      # AI & knowledge search logic
│   └── admin.py         # Admin panel
├── manage.py            # Django CLI
├── requirements.txt     # Python dependencies
└── db.sqlite3          # SQLite database (created on first run)
```

## 🔐 API Authentication (Optional)

For production, add Django REST token auth:

```bash
pip install djangorestframework
```

Then in `views.py`:

```python
from rest_framework.authentication import TokenAuthentication
```

## 🌐 CORS Configuration

Currently allows requests from:

- `http://localhost:5173` (Vite frontend)
- `http://localhost:3000` (React dev)

Update `config/settings.py` for different frontend URLs:

```python
CORS_ALLOWED_ORIGINS = [
    'http://your-frontend-url:port',
]
```

## 📝 Environment Variables

Create `.env` file in `backend/` directory:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your_actual_gemini_api_key
DATABASE_URL=sqlite:///db.sqlite3
```

Load with `python-decouple`:

```python
from decouple import config
API_KEY = config('GEMINI_API_KEY')
```

## 🐛 Troubleshooting

**Port 8000 already in use:**

```bash
python manage.py runserver 8001
```

**Database errors:**

```bash
rm db.sqlite3
python manage.py migrate
```

**Gemini API key not working:**

- Verify key in https://ai.google.dev
- Check `settings.py` has correct format
- Ensure `google-generativeai` is installed: `pip install google-generativeai`

**CORS errors from frontend:**

- Check `CORS_ALLOWED_ORIGINS` in settings.py
- Make sure frontend URL matches exactly (including port)

## 🚀 Production Deployment

Before deploying:

1. **Security:**

   ```python
   DEBUG = False
   SECRET_KEY = os.environ.get('SECRET_KEY')
   ALLOWED_HOSTS = ['yourdomain.com']
   ```

2. **Database:**

   ```bash
   # Use PostgreSQL instead of SQLite
   pip install psycopg2-binary
   ```

3. **Static Files:**

   ```bash
   python manage.py collectstatic
   ```

4. **Environment:**
   ```bash
   export GEMINI_API_KEY=...
   export SECRET_KEY=...
   python manage.py runserver 0.0.0.0:8000
   ```

Or use Gunicorn:

```bash
pip install gunicorn
gunicorn config.wsgi
```

## 📚 Key Concepts

### Hierarchical Nodes

Nodes form a tree structure. Deleting a parent cascades to children:

```python
node.delete()  # Deletes node + all descendants
```

### Auto-Generated Edges

When you create a node with a parent, the edge is auto-created:

```python
Node.objects.create(
    label='Task',
    parent_id='parent-123'
    # Edge automatically created
)
```

### Knowledge Grounding

AI responses include metadata about which knowledge files were used:

```json
{
  "message": "...",
  "knowledge_used": true,
  "knowledge_sources": ["research.pdf", "notes.md"]
}
```

### Chat Context Binding

Chat is tied to individual nodes, creating focused conversations:

```
/api/chat/node/{node_id}/
```

## 📖 Additional Resources

- [Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Google Gemini API](https://ai.google.dev/)

---

**Questions?** Check `config/settings.py` for all configuration options.
