import { useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import useStore from '../store/useStore';
import { getStatusColor } from '../utils/mockData';
import '../styles/GraphView.css';

const GraphView = () => {
    const { nodes, edges, selectNode } = useStore();
    const graphRef = useRef();

    // Convert nodes and edges to force-graph format
    const graphData = {
        nodes: nodes.map(node => ({
            id: node.id,
            name: node.label,
            status: node.status,
            owner: node.owner,
            val: 10, // Node size
        })),
        links: edges.map(edge => ({
            source: edge.source,
            target: edge.target,
        })),
    };

    const handleNodeClick = useCallback((node) => {
        selectNode(node.id);
    }, [selectNode]);

    useEffect(() => {
        // Fit graph to view on mount
        if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50);
        }
    }, []);

    return (
        <div className="graph-view">
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="name"
                nodeAutoColorBy="status"
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    const nodeRadius = 8;

                    // Draw node circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = getStatusColor(node.status);
                    ctx.fill();

                    // Draw glow
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = getStatusColor(node.status);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Draw border
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1.5 / globalScale;
                    ctx.stroke();

                    // Draw label
                    ctx.font = `${fontSize}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(label, node.x, node.y + nodeRadius + fontSize);

                    // Draw owner if exists
                    if (node.owner) {
                        ctx.font = `${fontSize * 0.8}px Inter, sans-serif`;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.fillText(node.owner, node.x, node.y + nodeRadius + fontSize * 2.2);
                    }
                }}
                linkColor={() => 'rgba(59, 130, 246, 0.3)'}
                linkWidth={2}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="#000000"
                onNodeClick={handleNodeClick}
                cooldownTicks={100}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
            />
        </div>
    );
};

export default GraphView;
