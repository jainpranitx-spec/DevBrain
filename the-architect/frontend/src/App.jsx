import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import TreeView from './components/TreeView';
import GraphView from './components/GraphView';
import ChatPanel from './components/ChatPanel';
import CommandPalette from './components/CommandPalette';
import ConnectionStatus from './components/ConnectionStatus';
import useStore from './store/useStore';
import './styles/index.css';
import './App.css';

function App() {
  const { 
    currentView, 
    selectedNodeId, 
    initializeProject, 
    loadProject,
    checkConnection, 
    isConnected,
    projectId 
  } = useStore();

  useEffect(() => {
    // Initialize the app
    const initApp = async () => {
      // Check backend connection
      const connected = await checkConnection();
      
      if (connected) {
        // Check if we have a stored project ID
        const storedProjectId = localStorage.getItem('devbrain_project_id');
        
        if (storedProjectId) {
          // Load existing project
          try {
            await loadProject(storedProjectId);
            console.log('✅ Loaded existing project:', storedProjectId);
          } catch (error) {
            console.log('Failed to load project, creating new one:', error);
            // If loading fails, create a new project
            const project = await initializeProject({
              name: 'DevBrain Project',
              description: 'AI-powered mind mapping and project planning',
            });
            if (project) {
              localStorage.setItem('devbrain_project_id', project.id);
            }
          }
        } else {
          // No stored project, create a new one
          try {
            const project = await initializeProject({
              name: 'DevBrain Project',
              description: 'AI-powered mind mapping and project planning',
            });
            if (project) {
              localStorage.setItem('devbrain_project_id', project.id);
              console.log('✅ Created new project:', project.id);
            }
          } catch (error) {
            console.log('Failed to create project, using mock data');
          }
        }
      }
    };

    initApp();
  }, []); // Empty deps to run only once

  // Save project ID to localStorage when it changes
  useEffect(() => {
    if (projectId) {
      localStorage.setItem('devbrain_project_id', projectId);
    }
  }, [projectId]);

  return (
    <div className="app">
      <Navbar />
      <CommandPalette />
      <ConnectionStatus />

      <div className={`main-content ${selectedNodeId ? 'chat-open' : ''}`}>
        <AnimatePresence mode="wait">
          {currentView === 'tree' ? (
            <motion.div
              key="tree"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="view-container"
            >
              <TreeView />
            </motion.div>
          ) : (
            <motion.div
              key="graph"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="view-container"
            >
              <GraphView />
            </motion.div>
          )}
        </AnimatePresence>

        <ChatPanel />
      </div>
    </div>
  );
}

export default App;
