import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

export default function ConnectionStatus() {
  const { isConnected, checkConnection, error, clearError } = useStore();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Show status for a few seconds
    setShowStatus(true);
    const timer = setTimeout(() => setShowStatus(false), 3000);
    
    return () => clearTimeout(timer);
  }, [checkConnection]);

  useEffect(() => {
    if (error) {
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!showStatus && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="connection-status"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        background: error 
          ? 'rgba(239, 68, 68, 0.1)' 
          : isConnected 
            ? 'rgba(34, 197, 94, 0.1)' 
            : 'rgba(251, 191, 36, 0.1)',
        color: error 
          ? '#ef4444' 
          : isConnected 
            ? '#22c55e' 
            : '#f59e0b',
      }}
    >
      {error ? (
        <div>
          <div>⚠️ Backend Error</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            Using local mode
          </div>
        </div>
      ) : isConnected ? (
        <div>✅ Backend Connected</div>
      ) : (
        <div>🔄 Connecting to Backend...</div>
      )}
    </motion.div>
  );
}