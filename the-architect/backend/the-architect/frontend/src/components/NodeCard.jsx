import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { getStatusColor } from '../utils/mockData';
import '../styles/NodeCard.css';

const NodeCard = ({ data }) => {
    const { label, status, owner } = data;

    return (
        <div className="node-card glass-card" style={{ borderLeftColor: getStatusColor(status) }}>
            <Handle type="target" position={Position.Top} className="node-handle" />

            <div className="node-content">
                <div className="node-header">
                    <div className="node-label">{label}</div>
                    <div className={`status-dot ${status}`}></div>
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
