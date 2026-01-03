import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import TreeView from './components/TreeView';
import GraphView from './components/GraphView';
import ChatPanel from './components/ChatPanel';
import CommandPalette from './components/CommandPalette';
import useStore from './store/useStore';
import './styles/index.css';
import './App.css';

function App() {
  const { currentView, selectedNodeId } = useStore();

  return (
    <div className="app">
      <Navbar />
      <CommandPalette />

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
