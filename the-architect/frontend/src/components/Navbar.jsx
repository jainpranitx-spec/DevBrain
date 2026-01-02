import { LayoutGrid, Network, Plus, Save } from 'lucide-react';
import useStore from '../store/useStore';
import '../styles/Navbar.css';

const Navbar = () => {
    const { currentView, setView } = useStore();

    return (
        <nav className="navbar glass-card">
            <div className="navbar-left">
                <div className="logo">
                    <div className="logo-icon">🏗️</div>
                    <h1 className="logo-text text-gradient">The Architect</h1>
                </div>
            </div>

            <div className="navbar-center">
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${currentView === 'tree' ? 'active' : ''}`}
                        onClick={() => setView('tree')}
                    >
                        <LayoutGrid size={18} />
                        <span>Tree View</span>
                    </button>
                    <button
                        className={`toggle-btn ${currentView === 'graph' ? 'active' : ''}`}
                        onClick={() => setView('graph')}
                    >
                        <Network size={18} />
                        <span>Graph View</span>
                    </button>
                </div>
            </div>

            <div className="navbar-right">
                <button className="glass-button">
                    <Plus size={18} />
                    <span>New Node</span>
                </button>
                <button className="glass-button">
                    <Save size={18} />
                    <span>Save</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
