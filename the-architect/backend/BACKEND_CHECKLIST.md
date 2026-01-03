# DevBrain Backend - Developer Checklist

## 🎯 Before Starting

- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Text editor or IDE open
- [ ] Terminal ready

## 📥 Installation Checklist

### Backend Setup

- [ ] Navigate to `backend/` directory
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate venv: `source venv/Scripts/activate` (Windows: `venv\Scripts\activate`)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run migrations: `python manage.py migrate`
- [ ] Verify no errors in migration output

### Configuration

- [ ] Open `backend/config/settings.py`
- [ ] Find line with `GEMINI_API_KEY = 'INSERT API KEY'`
- [ ] Replace with actual API key from https://ai.google.dev OR
- [ ] Leave as-is to use mock responses (still works!)

### Frontend Setup

- [ ] Navigate to `the-architect/frontend/`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` file with:
  ```
  VITE_API_URL=http://localhost:8000/api
  ```
- [ ] Verify dependencies installed (no errors)

## 🚀 Running the Application

### Terminal 1: Backend

- [ ] `cd backend`
- [ ] `source venv/Scripts/activate`
- [ ] `python manage.py runserver 0.0.0.0:8000`
- [ ] Verify: "Starting development server at http://0.0.0.0:8000/"
- [ ] ✅ Backend running

### Terminal 2: Frontend

- [ ] `cd the-architect/frontend`
- [ ] `npm run dev`
- [ ] Verify: "Local: http://localhost:5173/"
- [ ] ✅ Frontend running

## ✅ Feature Testing

### 1. Access Frontend

- [ ] Open http://localhost:5173 in browser
- [ ] See DevBrain UI with "The Architect" title
- [ ] Navigation bar visible at top

### 2. Access Admin Panel

- [ ] Open http://localhost:8000/admin in browser
- [ ] Create superuser if needed: `python manage.py createsuperuser`
- [ ] Log in with credentials
- [ ] See Projects, Nodes, Edges, KnowledgeBase panels
- [ ] ✅ Admin working

### 3. Create Project (via Frontend)

- [ ] Click "New Project" or similar button
- [ ] Enter project name: "Test Hackathon"
- [ ] Verify API call: Check backend terminal for POST request
- [ ] See project appear in UI
- [ ] ✅ Project creation working

### 4. Create Nodes

- [ ] Add a root node: "Project Setup"
- [ ] Add child node: "Backend"
- [ ] Verify in TreeView or GraphView
- [ ] Check admin panel - nodes appear in database
- [ ] ✅ Node hierarchy working

### 5. Upload Knowledge File

- [ ] Create a test file `notes.txt` with content:
  ```
  Authentication should use JWT tokens
  Database queries must be optimized with indexes
  Error handling must include proper logging
  ```
- [ ] In frontend, upload this file to Knowledge Base
- [ ] Verify file appears in admin panel
- [ ] Check that text was extracted
- [ ] ✅ Knowledge upload working

### 6. Chat with AI

- [ ] Select a node in the mind map
- [ ] Open chat panel
- [ ] Type: "How should I approach this?"
- [ ] Verify response appears (may be mock if no API key)
- [ ] If knowledge uploaded, verify it shows knowledge sources
- [ ] ✅ Chat working

### 7. API Testing (Optional - via curl/Postman)

- [ ] Test GET /api/projects/
  ```bash
  curl http://localhost:8000/api/projects/
  ```
- [ ] Verify JSON response with projects
- [ ] Test POST to create node
- [ ] ✅ REST API working

## 🐛 Troubleshooting

### Backend Won't Start

```
Error: "Port 8000 already in use"
Solution: python manage.py runserver 8001

Error: "ModuleNotFoundError: No module named 'django'"
Solution: pip install -r requirements.txt
```

### Frontend Won't Connect to Backend

```
Error: CORS error, "Access-Control-Allow-Origin missing"
Solution:
1. Check backend is running
2. Verify VITE_API_URL in .env.local is correct
3. Check CORS_ALLOWED_ORIGINS in settings.py

Error: "Cannot POST to /api/chat/node/"
Solution: Check backend console for errors, verify project ID is correct
```

### Chat Returns Mock Responses

```
Expected: Real Gemini responses
Actual: Professional mock responses
Reason: No API key or invalid key
Solution: Get key from https://ai.google.dev, set in settings.py
Note: Mock responses ARE fully functional!
```

### File Upload Fails

```
Error: "Unsupported file type"
Solution: Upload PDF, TXT, MD, or DOCX only

Error: "File too large"
Solution: Max file size is 10MB, reduce file size
```

## 📊 Data Verification Checklist

In Django Admin (http://localhost:8000/admin):

### Projects Table

- [ ] Shows projects created via frontend
- [ ] Each project has correct owner/name
- [ ] Timestamps are accurate

### Nodes Table

- [ ] All nodes appear with correct labels
- [ ] Status field works (not-started, in-progress, completed)
- [ ] Parent-child relationships preserved
- [ ] Can edit nodes directly in admin

### Knowledge Base Table

- [ ] Uploaded files appear
- [ ] File type detected correctly (pdf, txt, md, docx)
- [ ] Content preview shows extracted text
- [ ] Full text indexed

### Chat Messages Table

- [ ] Messages appear after sending
- [ ] User messages and AI responses both saved
- [ ] Source field shows 'gemini-api' or 'mock'
- [ ] Node reference correct

## 📝 Code Review Points

- [ ] `models.py` - All required fields present, relationships correct
- [ ] `views.py` - Endpoints match requirements
- [ ] `services.py` - Knowledge search working, Gemini fallback present
- [ ] `settings.py` - CORS configured, API key placeholder
- [ ] `serializers.py` - All fields serialized correctly
- [ ] `api.js` - All endpoints callable from frontend

## 🔐 Security Checklist (Before Deployment)

- [ ] Remove `DEBUG = True` in production
- [ ] Set strong `SECRET_KEY`
- [ ] Update `ALLOWED_HOSTS` to actual domain
- [ ] Configure `CORS_ALLOWED_ORIGINS` for production frontend
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS
- [ ] Use PostgreSQL instead of SQLite
- [ ] Run `collectstatic` for static files
- [ ] Set up proper logging
- [ ] Enable CSRF protection
- [ ] Add rate limiting
- [ ] Add authentication/token validation

## 📚 Documentation Verification

- [ ] `SETUP.md` is accurate and tested
- [ ] `BACKEND_INTEGRATION.md` shows correct endpoints
- [ ] `backend/README.md` documents all features
- [ ] Code comments explain non-obvious logic
- [ ] API docstrings present on views

## 🎉 Success Criteria

- [ ] Backend starts without errors
- [ ] Frontend connects to backend (no CORS errors)
- [ ] Can create and view projects
- [ ] Can create, update, delete nodes
- [ ] Can upload knowledge files
- [ ] Can chat and receive responses
- [ ] Admin panel works
- [ ] All tests pass (if applicable)

## 🚀 Next Steps After Verification

1. **Implement Frontend Integration**

   - Update React components to use `api.js`
   - Sync Zustand store with backend
   - Test full workflow

2. **Add Features**

   - Real-time collaboration (WebSockets)
   - User authentication
   - Sharing/permissions
   - More AI prompts

3. **Optimize**

   - Add caching
   - Optimize database queries
   - Implement pagination fully
   - Add search indexes

4. **Deploy**
   - Containerize with Docker
   - Set up CI/CD
   - Deploy to production
   - Monitor and log

## 📞 Support

If something doesn't work:

1. Check this checklist
2. Review error messages carefully
3. Check terminal output for stack traces
4. Verify all dependencies installed: `pip list`
5. Try fresh virtual environment if persistent issues

---

**Mark items as complete as you progress. All items should be ✅ before considering backend production-ready!**
