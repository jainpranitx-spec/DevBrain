import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Eye, EyeOff } from 'lucide-react';
import useStore from '../store/useStore';
import NodeCard from './NodeCard';
import '../styles/TreeView.css';

const nodeTypes = {
    custom: NodeCard,
};

// Layout nodes in hierarchical tree structure
const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 150 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 200, height: 80 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 100,
                y: nodeWithPosition.y - 40,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

const TreeView = () => {
    const { nodes: storeNodes, edges: storeEdges, selectNode } = useStore();
    const [showMiniMap, setShowMiniMap] = useState(true);

    // Convert store nodes to ReactFlow format
    const reactFlowNodes = useMemo(() => {
        return storeNodes.map(node => ({
            id: node.id,
            type: 'custom',
            data: {
                label: node.label,
                status: node.status,
                owner: node.owner,
            },
            position: node.position,
        }));
    }, [storeNodes]);

    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
        () => getLayoutedElements(reactFlowNodes, storeEdges),
        [reactFlowNodes, storeEdges]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    const onNodeClick = useCallback((event, node) => {
        selectNode(node.id);
    }, [selectNode]);

    return (
        <div className="tree-view">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                }}
            >
                <Background color="#ffffff10" gap={20} />
                <Controls className="react-flow-controls" />

                {/* MiniMap Toggle Button */}
                <Panel position="bottom-right" className="minimap-toggle-container">
                    <button
                        className="glass-button icon-only"
                        onClick={() => setShowMiniMap(!showMiniMap)}
                        title={showMiniMap ? "Hide MiniMap" : "Show MiniMap"}
                        style={{ marginBottom: '10px' }}
                    >
                        {showMiniMap ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </Panel>

                {showMiniMap && (
                    <MiniMap
                        className="react-flow-minimap"
                        nodeColor={(node) => {
                            const status = node.data.status;
                            if (status === 'completed') return '#10b981';
                            if (status === 'in-progress') return '#fbbf24';
                            return '#6b7280';
                        }}
                    />
                )}
            </ReactFlow>
        </div>
    );
};

export default TreeView;
