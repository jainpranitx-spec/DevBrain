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
            val: 20, // Base node size (ForceGraph uses this for collision/rendering hint)
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
        // Resize handler used when chat panel toggles
        const handleResize = () => {
            // Small delay to allow CSS transition to finish 
            setTimeout(() => {
                // Re-calculate graph dimensions if available in API or just rely on CSS
                // Most React Force Graph implementations auto-resize if container changes
                // But reheat helps simulation adjust
                if (graphRef.current) {
                    graphRef.current.d3ReheatSimulation();
                }
            }, 400);
        };

        window.addEventListener('resize', handleResize);
        // Also listen to transition end on main content if possible
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.addEventListener('transitionend', handleResize);
        }

        if (graphRef.current) {
            // Obsidian-like Physics
            graphRef.current.d3Force('charge').strength(-200); // Stronger repulsion for clarity
            graphRef.current.d3Force('link').distance(70);
            graphRef.current.d3Force('charge').strength(-200);
            graphRef.current.d3Force('link').distance(70);
            // 0.01 is enough to keep them from floating to infinity, but won't pull hard
            graphRef.current.d3Force('center').strength(0.01);

            // X/Y positioning force to create a loose bounding box if needed (Optional)
            // graphRef.current.d3Force('x', d3.forceX(0).strength(0.01));
            // graphRef.current.d3Force('y', d3.forceY(0).strength(0.01));

            // Initial zoom
            setTimeout(() => {
                graphRef.current?.zoomToFit(400, 50);
            }, 500);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mainContent) mainContent.removeEventListener('transitionend', handleResize);
        };
    }, []);

    return (
        <div className="graph-view">
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="name"
                nodeAutoColorBy="status"

                // Interaction
                cooldownTicks={100}
                d3AlphaDecay={0.04} // Higher = settles faster
                d3VelocityDecay={0.6} // Higher = more friction/drag (Obsidian feel)
                enableZoomInteraction={true}
                enablePanInteraction={true}
                minZoom={0.2} // Further zoom out allowed (0.2x)
                maxZoom={3}   // Limit detailed zoom (3x) for cleaner feel

                // Custom Rendering
                nodeCanvasObject={(node, ctx, globalScale) => {
                    if (!node.x || !node.y || isNaN(node.x) || isNaN(node.y)) return;

                    const label = node.name;
                    const nodeRadius = 5; // Smaller, standardized radius

                    // Font Scaling: Clamped
                    // Scale inversely with globalScale but cap it so it doesn't get MASSIVE or tiny
                    let fontSize = 12 / globalScale;
                    if (fontSize > 20) fontSize = 20; // Max size
                    if (fontSize < 3) fontSize = 0;   // Hide if too small

                    ctx.save();

                    // Node Body
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = getStatusColor(node.status);
                    ctx.fill();

                    // Hover/Glow effect only if close enough
                    if (globalScale > 0.4) {
                        ctx.shadowBlur = 12;
                        ctx.shadowColor = getStatusColor(node.status);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }

                    // Active Border
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 1.5 / globalScale;
                    ctx.stroke();

                    ctx.restore();

                    // Label Rendering
                    // Show only if font size is reasonable (text optimization)
                    if (fontSize > 4) {
                        ctx.save();
                        ctx.font = `500 ${fontSize}px Inter, sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';

                        // Text Background (for readability over lines)
                        const textWidth = ctx.measureText(label).width;
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                        // Box padding
                        const p = 2 / globalScale;

                        // Draw pill background
                        ctx.beginPath();
                        ctx.roundRect(
                            node.x - textWidth / 2 - p,
                            node.y + nodeRadius + (3 / globalScale),
                            textWidth + p * 2,
                            fontSize + p * 2,
                            4 / globalScale
                        );
                        ctx.fill();

                        // Text
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(label, node.x, node.y + nodeRadius + (3 / globalScale) + p);

                        // Owner Subtitle (only on deep zoom)
                        if (node.owner && globalScale > 1.8) {
                            ctx.font = `italic ${fontSize * 0.8}px Inter, sans-serif`;
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                            ctx.fillText(node.owner, node.x, node.y + nodeRadius + fontSize + (6 / globalScale));
                        }

                        ctx.restore();
                    }
                }}

                // Physics Pinning
                onNodeDragEnd={node => {
                    node.fx = node.x;
                    node.fy = node.y;
                }}

                // Links
                linkColor={() => 'rgba(255, 255, 255, 0.15)'}
                linkWidth={1}

                backgroundColor="#000000"
                onNodeClick={handleNodeClick}
            />
        </div>
    );
};

export default GraphView;
