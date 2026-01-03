import { useEffect, useState } from 'react';
import {
    LayoutGrid,
    Network,
    Plus,
    Save,
    HelpCircle,
    SunMedium,
    MoonStar,
    ChevronDown,
    Keyboard,
    ListChecks,
    Sparkles,
    LogOut,
} from 'lucide-react';
import useStore from '../store/useStore';
import CreateNodeModal from './CreateNodeModal';
import '../styles/Navbar.css';

const Navbar = () => {
    const { currentView, setView } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('devmind-theme');
        const initial = stored === 'light' ? 'light' : 'dark';
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);

        const handleNewNode = () => setIsModalOpen(true);
        window.addEventListener('devmind:new-node', handleNewNode);
        return () => {
            window.removeEventListener('devmind:new-node', handleNewNode);
        };
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('devmind-theme', next);
            window.dispatchEvent(new CustomEvent('devmind:theme-change', { detail: next }));
            return next;
        });
    };

    return (
        <>
            <nav className="navbar glass-card">
                <div className="navbar-left">
                    <div className="logo">
                        <div className="logo-icon">🏗️</div>
                        <h1 className="logo-text text-gradient">DevMind</h1>
                    </div>
                </div>

                <div className="navbar-center">
                    <div className="view-toggle">
                        <div className={`toggle-indicator ${currentView}`}></div>
                        <button
                            className={`toggle-btn ${currentView === 'tree' ? 'active' : ''}`}
                            onClick={() => setView('tree')}
                            aria-pressed={currentView === 'tree'}
                        >
                            <LayoutGrid size={18} />
                            <span>Tree View</span>
                        </button>
                        <button
                            className={`toggle-btn ${currentView === 'graph' ? 'active' : ''}`}
                            onClick={() => setView('graph')}
                            aria-pressed={currentView === 'graph'}
                        >
                            <Network size={18} />
                            <span>Graph View</span>
                        </button>
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="icon-bar">
                        <button className="icon-ghost" aria-label="Save">
                            <Save size={16} />
                        </button>
                        <button className="icon-ghost" aria-label="Help">
                            <HelpCircle size={16} />
                        </button>
                        <button
                            className={`icon-ghost theme-toggle ${theme === 'light' ? 'light' : 'dark'}`}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
                        </button>
                    </div>

                    <button
                        className="glass-button primary"
                        onClick={() => setIsModalOpen(true)}
                        id="new-node-trigger"
                    >
                        <Plus size={18} />
                        <span>New Node</span>
                    </button>

                    <div
                        className="profile-chip"
                        onMouseLeave={() => setMenuOpen(false)}
                    >
                        <button
                            className="profile-button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-expanded={menuOpen}
                        >
                            <div className="avatar">D</div>
                            <span className="profile-name">DevMind</span>
                            <ChevronDown size={14} />
                        </button>

                        {menuOpen && (
                            <div className="profile-menu glass-card">
                                <div className="profile-menu__header">
                                    <div className="avatar">D</div>
                                    <div>
                                        <div className="profile-menu__title">DevMind</div>
                                        <div className="profile-menu__subtitle">Premium workspace</div>
                                    </div>
                                </div>

                                <div className="profile-menu__section">
                                    <button className="profile-menu__item">
                                        <span className="profile-menu__icon"><Keyboard size={16} /></span>
                                        <div className="profile-menu__text">
                                            <div className="profile-menu__label">Keyboard shortcuts</div>
                                            <div className="profile-menu__hint">Speed-run the UI</div>
                                        </div>
                                        <span className="profile-menu__pill">Ctrl/Cmd + K</span>
                                    </button>

                                    <button className="profile-menu__item">
                                        <span className="profile-menu__icon"><ListChecks size={16} /></span>
                                        <div className="profile-menu__text">
                                            <div className="profile-menu__label">View changelog</div>
                                            <div className="profile-menu__hint">See what shipped</div>
                                        </div>
                                        <span className="profile-menu__pill subtle">v1.0</span>
                                    </button>

                                    <button className="profile-menu__item">
                                        <span className="profile-menu__icon"><Sparkles size={16} /></span>
                                        <div className="profile-menu__text">
                                            <div className="profile-menu__label">Feedback</div>
                                            <div className="profile-menu__hint">Tell us what to polish</div>
                                        </div>
                                        <span className="profile-menu__pill">New</span>
                                    </button>
                                </div>

                                <div className="profile-menu__section muted">
                                    <button className="profile-menu__item">
                                        <span className="profile-menu__icon"><LogOut size={16} /></span>
                                        <div className="profile-menu__text">
                                            <div className="profile-menu__label">Sign out</div>
                                            <div className="profile-menu__hint">See you soon</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <CreateNodeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Navbar;
