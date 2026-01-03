import { useEffect, useMemo, useState } from 'react';
import { Command, LayoutGrid, Network, Plus, Search } from 'lucide-react';
import useStore from '../store/useStore';
import '../styles/CommandPalette.css';

const CommandPalette = () => {
    const { setView, nodes, selectNode } = useStore();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const handleKey = (e) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const cmdKey = isMac ? e.metaKey : e.ctrlKey;
            if (cmdKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const actions = useMemo(() => {
        const baseActions = [
            {
                id: 'tree',
                label: 'Switch to Tree View',
                icon: <LayoutGrid size={16} />,
                group: 'View',
                run: () => setView('tree'),
            },
            {
                id: 'graph',
                label: 'Switch to Graph View',
                icon: <Network size={16} />,
                group: 'View',
                run: () => setView('graph'),
            },
            {
                id: 'new-node',
                label: 'Create new node (open modal)',
                icon: <Plus size={16} />,
                group: 'Actions',
                run: () => {
                    const event = new CustomEvent('devmind:new-node');
                    window.dispatchEvent(event);
                },
            },
        ];

        const nodeActions = nodes.map((n) => ({
            id: `node-${n.id}`,
            label: `Jump to node: ${n.label}`,
            icon: <Command size={14} />,
            group: 'Nodes',
            run: () => selectNode(n.id),
        }));

        return [...baseActions, ...nodeActions];
    }, [nodes, selectNode, setView]);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        if (!q) return actions;
        return actions.filter((a) => a.label.toLowerCase().includes(q));
    }, [actions, query]);

    if (!open) return null;

    return (
        <div className="cmd-backdrop" onClick={() => setOpen(false)}>
            <div className="cmd" onClick={(e) => e.stopPropagation()}>
                <div className="cmd-input-row">
                    <Search size={18} />
                    <input
                        autoFocus
                        placeholder="Search commands or nodes..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="kbd">Esc</div>
                </div>
                <div className="cmd-list">
                    {filtered.map((action) => (
                        <button
                            key={action.id}
                            className="cmd-item"
                            onClick={() => {
                                action.run();
                                setOpen(false);
                            }}
                        >
                            <div className="cmd-item-left">
                                <span className="cmd-icon">{action.icon}</span>
                                <span className="cmd-label">{action.label}</span>
                            </div>
                            <div className="cmd-group">{action.group}</div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="cmd-empty">No matches. Try another keyword.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
