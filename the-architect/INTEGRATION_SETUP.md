# DevBrain Frontend-Backend Integration Setup

## 🚀 Quick Start Guide

### 1. Start Backend Server

```bash
# Navigate to backend directory
cd backend/backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start Django server
python manage.py runserver 0.0.0.0:8000
```

You should see:
```
Starting development server at http://0.0.0.0:8000/
```

### 2. Start Frontend Server

In a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
```

### 3. Test Integration

1. **Open the app**: Go to `http://localhost:5173/`

2. **Check connection**: Look for green "✅ Backend Connected" in top-right

3. **Run integration test**: Click "Run Integration Tests" in bottom-left panel

4. **Test features**:
   - Create a new node (should save to database)
   - Click on a node and chat with AI
   - Check browser console for API calls

### 4. What Should Work

✅ **Backend Connection**: Green status indicator  
✅ **Project Creation**: Automatic project initialization  
✅ **Node Management**: Create, update, delete nodes  
✅ **AI Chat**: Chat with nodes using Gemini API  
✅ **Data Persistence**: All data saved to SQLite database  
✅ **Knowledge Integration**: Upload files for AI context (coming next)  

### 5. Troubleshooting

#### Backend Not Connecting
- Check if Django server is running on port 8000
- Verify `VITE_API_URL=http://localhost:8000/api` in `frontend/.env.local`
- Check browser console for CORS errors

#### AI Chat Not Working
- Verify Gemini API key in `backend/backend/config/settings.py`
- Check backend logs for API errors
- App will fallback to mock responses if API fails

#### Database Issues
- Run migrations: `python manage.py migrate`
- Check if `db.sqlite3` file exists in `backend/backend/`

### 6. Next Steps

Once basic integration is working:

1. **Upload Knowledge**: Add file upload UI for knowledge base
2. **Real-time Updates**: Add WebSocket support for collaboration
3. **Authentication**: Add user accounts and project sharing
4. **Deployment**: Deploy to production servers

### 7. Development Workflow

```bash
# Terminal 1: Backend
cd backend/backend
source venv/bin/activate
python manage.py runserver

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: Development
# Make changes, test, commit
```

### 8. API Endpoints Available

- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/nodes/` - List nodes
- `POST /api/nodes/` - Create node
- `POST /api/chat/node/{id}/` - Chat with AI
- `POST /api/knowledge/` - Upload knowledge files

### 9. Environment Variables

**Backend** (`backend/backend/.env`):
```
GEMINI_API_KEY=your_api_key_here
DEBUG=True
```

**Frontend** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=your_api_key_here
```

---

## 🎯 Success Criteria

- [ ] Both servers start without errors
- [ ] Frontend shows "Backend Connected" 
- [ ] Integration test passes all checks
- [ ] Can create and chat with nodes
- [ ] Data persists after page refresh

**Ready to build something amazing!** 🚀