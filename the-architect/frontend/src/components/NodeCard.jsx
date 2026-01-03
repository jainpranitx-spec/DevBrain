import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { getStatusColor } from '../utils/mockData';
import useStore from '../store/useStore';
import '../styles/NodeCard.css';

const NodeCard = ({ data }) => {
    const { label, status, owner, id } = data;
    const { deleteNode, deselectNode } = useStore();

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteNode(id);
        deselectNode();
    };

    return (
        <div className="node-card glass-card" style={{ borderLeftColor: getStatusColor(status) }}>
            <Handle type="target" position={Position.Top} className="node-handle" />

            <div className="node-content">
                <div className="node-header">
                    <div className="node-label">{label}</div>
                    <div className={`status-dot ${status}`}></div>
                    <button
                        className="node-delete"
                        aria-label="Delete node"
                        onClick={handleDelete}
                        title="Delete node"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                {owner && (
                    <div className="node-owner">{owner}</div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="node-handle" />
        </div>
    );
};

export default memo(NodeCard);
