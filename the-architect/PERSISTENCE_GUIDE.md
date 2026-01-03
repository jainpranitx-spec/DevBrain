# DevBrain Data Persistence Guide

## 🎯 How It Works

Your DevBrain project now persists across browser sessions using:
1. **Backend Database**: SQLite stores all nodes, edges, and chat history
2. **LocalStorage**: Stores the current project ID
3. **Auto-Load**: Automatically loads your project on page refresh

## 📦 What Gets Saved

### Automatically Persisted:
- ✅ All nodes (with labels, descriptions, status, owners)
- ✅ Parent-child relationships (hierarchy)
- ✅ Node positions
- ✅ Chat history per node
- ✅ Project metadata

### Session-Only (Not Persisted):
- ❌ Current view (Tree vs Graph)
- ❌ Selected node
- ❌ UI state (modals, menus)

## 🔄 How Persistence Works

### On First Load:
1. App checks for stored project ID in localStorage
2. If none exists, creates a new project
3. Saves project ID to localStorage

### On Refresh:
1. App reads project ID from localStorage
2. Loads project data from backend
3. Restores all nodes and relationships

### On Node Creation:
1. Node is created in backend database
2. Backend returns node with real UUID
3. Frontend updates local state
4. Everything is automatically saved

## 🧪 Testing Persistence

### Test 1: Basic Persistence
```bash
1. Create 3-4 nodes with different statuses
2. Set up parent-child relationships
3. Chat with a node
4. Refresh the page (F5)
5. ✅ All nodes should reappear with their data
```

### Test 2: Cross-Session Persistence
```bash
1. Create a project with nodes
2. Close the browser completely
3. Reopen the browser and go to localhost:5173
4. ✅ Your project should load automatically
```

### Test 3: Server Restart
```bash
1. Create nodes in the app
2. Stop the Django server
3. Restart the Django server
4. Refresh the frontend
5. ✅ All data should still be there (SQLite persists)
```

## 🛠️ Troubleshooting

### Nodes Disappear on Refresh
**Cause**: Project ID not being stored or loaded correctly

**Fix**:
```javascript
// Open browser console and check:
localStorage.getItem('devbrain_project_id')

// If null, the project wasn't saved. Check backend logs.
```

### Old Data Showing Up
**Cause**: Cached project ID pointing to old project

**Fix**:
```javascript
// Clear localStorage in browser console:
localStorage.removeItem('devbrain_project_id')

// Or use the clearProject function:
// (Add this to your UI as a "New Project" button)
```

### Backend Connection Lost
**Cause**: Django server not running

**Fix**:
```bash
cd backend/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

## 🎨 Advanced: Multiple Projects

Want to work on multiple projects? You can:

### Option 1: Manual Project Switching
```javascript
// In browser console:
localStorage.setItem('devbrain_project_id', 'your-project-uuid-here')
// Then refresh the page
```

### Option 2: Add Project Selector (Future Feature)
- List all projects from backend
- Switch between projects
- Create new projects
- Delete old projects

## 🗄️ Database Location

Your data is stored in:
```
backend/backend/db.sqlite3
```

**Backup Your Data**:
```bash
# Copy the database file
cp backend/backend/db.sqlite3 backend/backend/db.backup.sqlite3

# Or export as JSON
curl http://localhost:8000/api/projects/YOUR_PROJECT_ID/export/ > backup.json
```

## 🔐 Data Safety

### Current Setup (Development):
- ✅ Data persists in SQLite
- ✅ Survives server restarts
- ⚠️ Single database file (backup regularly)
- ⚠️ No authentication (anyone can access)

### Production Recommendations:
- Use PostgreSQL instead of SQLite
- Add user authentication
- Implement project permissions
- Regular automated backups
- Use cloud storage for knowledge files

## 🚀 Quick Commands

### Start Fresh (Clear Everything):
```javascript
// In browser console:
localStorage.clear()
// Then refresh page
```

### Check Current Project:
```javascript
// In browser console:
console.log('Project ID:', localStorage.getItem('devbrain_project_id'))
```

### View All Projects:
```bash
# In terminal:
curl http://localhost:8000/api/projects/
```

---

**Your data is now persistent! Create, refresh, and your work stays safe.** 🎉