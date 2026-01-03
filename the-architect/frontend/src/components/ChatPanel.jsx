import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Wand2, ListChecks, RefreshCcw, User2 } from 'lucide-react';
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

    const statusMeta = useMemo(() => {
        const map = {
            'not-started': { label: 'Not started', color: '#8e8e93' },
            'in-progress': { label: 'In progress', color: '#fbbf24' },
            completed: { label: 'Completed', color: '#30d158' },
        };
        return map[selectedNode?.status] || map['not-started'];
    }, [selectedNode]);

    const quickPrompts = [
        'Break this down into tasks',
        'Give me a quick summary',
        'What are the risks?',
        'Draft next steps',
    ];

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
                    initial={{ x: 28, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 24, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 240, mass: 0.9 }}
                >
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-title">
                            <div className="chat-title-icon">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h3>{selectedNode?.label}</h3>
                                <div className="chat-meta">
                                    <span className="status-pill" style={{ color: statusMeta.color, borderColor: statusMeta.color }}>
                                        {statusMeta.label}
                                    </span>
                                    {selectedNode?.owner && (
                                        <span className="owner-pill"><User2 size={12} />{selectedNode.owner}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button className="close-btn glass-button icon-only" onClick={deselectNode} aria-label="Close chat">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-actions">
                        <button className="pill-btn" onClick={() => setInput(quickPrompts[0])}><ListChecks size={14} />Tasks</button>
                        <button className="pill-btn" onClick={() => setInput(quickPrompts[1])}><Sparkles size={14} />Summary</button>
                        <button className="pill-btn" onClick={() => setInput(quickPrompts[2])}><RefreshCcw size={14} />Risks</button>
                        <button className="pill-btn" onClick={() => setInput(quickPrompts[3])}><Wand2 size={14} />Next steps</button>
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
                                <div className="message-content">
                                    <div className="message-label">{msg.role === 'user' ? 'You' : 'AI'}</div>
                                    <div className="message-body">{msg.content}</div>
                                </div>
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
