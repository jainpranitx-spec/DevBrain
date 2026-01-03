import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useStore from '../store/useStore';
import CustomSelect from './CustomSelect';
import '../styles/CreateNodeModal.css';

const CreateNodeModal = ({ isOpen, onClose }) => {
    const { nodes, addNode } = useStore();
    const [formData, setFormData] = useState({
        label: '',
        description: '',
        parentId: '',
        status: 'not-started',
        owner: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Intelligent Positioning
        let position = { x: 0, y: 0 };

        if (formData.parentId) {
            // Place near parent
            const parent = nodes.find(n => n.id === formData.parentId);
            if (parent) {
                // Add random offset around parent (radius 50-100)
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * 40;
                position = {
                    x: parent.position.x + Math.cos(angle) * distance,
                    y: parent.position.y + Math.sin(angle) * distance
                };
            }
        } else {
            // Root Node: Place near center (0,0) with slight jitter
            // Previously was Math.random() * 500 (too far)
            position = {
                x: (Math.random() - 0.5) * 100, // Range -50 to 50
                y: (Math.random() - 0.5) * 100
            };
        }

        const newNode = {
            id: `node-${Date.now()}`,
            label: formData.label,
            description: formData.description,
            status: formData.status,
            owner: formData.owner || null,
            parentId: formData.parentId || null,
            position: position,
            createdAt: new Date().toISOString(),
        };

        addNode(newNode);

        // Reset form
        setFormData({
            label: '',
            description: '',
            parentId: '',
            status: 'not-started',
            owner: '',
        });

        onClose();
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="modal-container glass-card"
                        initial={{ y: '-100vh', opacity: 0 }}
                        animate={{ y: '-50%', opacity: 1 }} // Center vertically
                        exit={{ y: '-100vh', opacity: 0 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                    >
                        <div className="modal-header">
                            <div>
                                <h2>Create New Node</h2>
                                <p className="modal-subtitle">Quick add with smart placement and status.</p>
                            </div>
                            <button className="close-btn glass-button" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form compact-form">
                            <div className="form-group full-width">
                                <label htmlFor="label">Node Name</label>
                                <input
                                    type="text"
                                    id="label"
                                    name="label"
                                    className="glass-input cool-input"
                                    placeholder="e.g. Authentication"
                                    value={formData.label}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                    autoComplete="off"
                                />
                            </div>

                                        <p className="form-hint">Name it clearly; we will position it near its parent.</p>

                            <div className="form-row three-cols">
                                <div className="form-group">
                                    <label htmlFor="parentId">Parent</label>
                                    <CustomSelect
                                        label="parentId"
                                        placeholder="Root"
                                        value={formData.parentId}
                                        onChange={handleChange}
                                        options={[
                                            { value: "", label: "Root (None)" },
                                            ...nodes.map(node => ({ value: node.id, label: node.label }))
                                        ]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <CustomSelect
                                        label="status"
                                        placeholder="Pending"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={[
                                            { value: "not-started", label: "Pending" },
                                            { value: "in-progress", label: "Building" },
                                            { value: "completed", label: "Done" }
                                        ]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="owner">Owner</label>
                                    <input
                                        type="text"
                                        id="owner"
                                        name="owner"
                                        className="glass-input cool-input"
                                        placeholder="Name"
                                        value={formData.owner}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="description">Brief Note</label>
                                <p className="form-hint">Optional: context or next steps.</p>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="glass-input cool-input"
                                    placeholder="Optional details..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={2} /* Reduced rows */
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="glass-button" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="glass-button primary">
                                    Create Node
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateNodeModal;
