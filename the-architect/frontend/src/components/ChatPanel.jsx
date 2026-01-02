import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import useStore from '../store/useStore';
import { generateAIResponse } from '../services/ai';
import '../styles/ChatPanel.css';

const ChatPanel = () => {
    const { selectedNodeId, nodes, chatHistory, addChatMessage, deselectNode } = useStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const messages = chatHistory[selectedNodeId] || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]); // Scroll on typing too

    const handleSend = async () => {
        if (!input.trim() || !selectedNodeId) return;

        // Add user message
        addChatMessage(selectedNodeId, {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
        });

        const userInput = input;
        const nodeLabel = selectedNode.label;

        setInput('');
        setIsTyping(true);

        try {
            // Call AI Service (Real or Mock)
            const response = await generateAIResponse(userInput, nodeLabel);

            addChatMessage(selectedNodeId, {
                role: 'ai',
                content: response.message,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Chat Error:", error);
            addChatMessage(selectedNodeId, {
                role: 'ai',
                content: "I'm having trouble connecting to my brain right now.",
                timestamp: new Date().toISOString(),
            });
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AnimatePresence>
            {selectedNodeId && (
                <motion.div
                    className="chat-panel glass-card"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-title">
                            <Sparkles size={20} className="chat-icon" />
                            <div>
                                <h3>{selectedNode?.label}</h3>
                                <p className="chat-subtitle">AI Assistant</p>
                            </div>
                        </div>
                        <button className="close-btn glass-button" onClick={deselectNode}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="empty-state">
                                <Sparkles size={32} className="empty-icon" />
                                <p>Ask me anything about "{selectedNode?.label}"</p>
                                <p className="empty-hint">Try: "Break this down into tasks"</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role}`}>
                                <div className="message-content">{msg.content}</div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message ai">
                                <div className="message-content typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-container">
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="glass-button primary"
                            onClick={handleSend}
                            disabled={!input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatPanel;
