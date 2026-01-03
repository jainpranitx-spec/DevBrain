import { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

export default function IntegrationTest() {
  const { 
    isConnected, 
    projectId, 
    addNode, 
    addChatMessage, 
    uploadKnowledge,
    nodes 
  } = useStore();
  
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results = {};

    // Test 1: Backend Connection
    results.connection = isConnected;

    // Test 2: Project Initialization
    results.project = !!projectId;

    // Test 3: Node Creation
    try {
      const testNode = await addNode({
        label: 'Test Node',
        description: 'Integration test node',
        status: 'not-started',
        owner: 'Test User',
        position: { x: 100, y: 100 }
      });
      results.nodeCreation = !!testNode;
    } catch (error) {
      results.nodeCreation = false;
      results.nodeError = error.message;
    }

    // Test 4: AI Chat (if we have nodes)
    if (nodes.length > 0) {
      try {
        const chatResult = await addChatMessage(
          nodes[0].id, 
          'Hello, this is a test message'
        );
        results.aiChat = !!chatResult;
      } catch (error) {
        results.aiChat = false;
        results.chatError = error.message;
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        color: 'white',
        fontSize: '14px',
        maxWidth: '300px',
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
        🧪 Integration Test
      </h3>
      
      <button
        onClick={runTests}
        disabled={testing}
        style={{
          background: testing ? '#666' : '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '12px',
          width: '100%',
        }}
      >
        {testing ? 'Testing...' : 'Run Integration Tests'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Results:</div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ marginRight: '8px' }}>
              {testResults.connection ? '✅' : '❌'}
            </span>
            Backend Connection
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ marginRight: '8px' }}>
              {testResults.project ? '✅' : '❌'}
            </span>
            Project Initialized
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ marginRight: '8px' }}>
              {testResults.nodeCreation ? '✅' : '❌'}
            </span>
            Node Creation
            {testResults.nodeError && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                {testResults.nodeError}
              </div>
            )}
          </div>
          
          {testResults.aiChat !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ marginRight: '8px' }}>
                {testResults.aiChat ? '✅' : '❌'}
              </span>
              AI Chat
              {testResults.chatError && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                  {testResults.chatError}
                </div>
              )}
            </div>
          )}

          <div style={{ 
            marginTop: '12px', 
            padding: '8px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            Project ID: {projectId || 'None'}<br/>
            Nodes: {nodes.length}<br/>
            Status: {isConnected ? 'Connected' : 'Offline'}
          </div>
        </div>
      )}
    </motion.div>
  );
}