import { useEffect, useRef, useState } from 'react';
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
    X,
} from 'lucide-react';
import useStore from '../store/useStore';
import CreateNodeModal from './CreateNodeModal';
import '../styles/Navbar.css';

const Navbar = () => {
    const { currentView, setView } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSheet, setActiveSheet] = useState(null);
    const [toast, setToast] = useState('');
    const [feedback, setFeedback] = useState({ email: '', message: '' });
    const [feedbackSent, setFeedbackSent] = useState(false);
    const toastTimer = useRef(null);

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

    const triggerToast = (message) => {
        setToast(message);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 1800);
    };

    const openSheet = (sheet) => {
        setActiveSheet(sheet);
        setMenuOpen(false);
    };

    const closeSheet = () => setActiveSheet(null);

    const handleSave = () => {
        window.dispatchEvent(new CustomEvent('devmind:save-project'));
        triggerToast('Project saved locally. Export ready.');
    };

    const handleHelp = () => {
        window.dispatchEvent(new CustomEvent('devmind:open-help'));
        openSheet('help');
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        setFeedbackSent(true);
        triggerToast('Thanks for the feedback!');
        setTimeout(() => setFeedbackSent(false), 1500);
        setFeedback({ email: '', message: '' });
        closeSheet();
    };

    const renderSheetBody = () => {
        switch (activeSheet) {
            case 'shortcuts':
                return (
                    <div className="sheet-grid">
                        <div>
                            <div className="sheet-subtitle">Global</div>
                            <ul className="sheet-list">
                                <li><span className="kbd">Ctrl/Cmd + K</span><span>Open command palette</span></li>
                                <li><span className="kbd">Ctrl/Cmd + S</span><span>Quick save project</span></li>
                                <li><span className="kbd">Esc</span><span>Close dialogs & palette</span></li>
                            </ul>
                        </div>
                        <div>
                            <div className="sheet-subtitle">Navigation</div>
                            <ul className="sheet-list">
                                <li><span className="kbd">T</span><span>Switch to Tree view</span></li>
                                <li><span className="kbd">G</span><span>Switch to Graph view</span></li>
                                <li><span className="kbd">N</span><span>Open Create Node modal</span></li>
                            </ul>
                        </div>
                    </div>
                );
            case 'catalog':
                return (
                    <div className="sheet-stack">
                        <div className="sheet-pill-row">
                            <span className="pill success">v1.0</span>
                            <span className="pill subtle">Live</span>
                        </div>
                        <div className="sheet-card">
                            <div className="sheet-card__title">What shipped</div>
                            <ul className="sheet-bullets">
                                <li>Premium glass navbar with live theme toggle & tooltips.</li>
                                <li>Realtime Tree/Graph sync with instant node create/delete.</li>
                                <li>Command palette, quick actions, and compact chat layout.</li>
                                <li>Theme-aware graph styling plus polished modals.</li>
                            </ul>
                        </div>
                        <div className="sheet-card">
                            <div className="sheet-card__title">Roadmap</div>
                            <ul className="sheet-bullets">
                                <li>Versioned exports and team sharing.</li>
                                <li>Inline AI suggestions per node.</li>
                                <li>Insights dashboard with run history.</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'feedback':
                return (
                    <form className="sheet-form" onSubmit={handleFeedbackSubmit}>
                        <div className="input-group">
                            <label>Email (optional)</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={feedback.email}
                                onChange={(e) => setFeedback((prev) => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="input-group">
                            <label>Feedback</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Tell us what to improve or build next..."
                                value={feedback.message}
                                onChange={(e) => setFeedback((prev) => ({ ...prev, message: e.target.value }))}
                            />
                        </div>
                        <div className="sheet-actions">
                            <button type="button" className="ghost" onClick={closeSheet}>Cancel</button>
                            <button type="submit" className="glass-button primary">Send</button>
                        </div>
                        {feedbackSent && <div className="sheet-success">We received your feedback.</div>}
                    </form>
                );
            case 'help':
                return (
                    <div className="sheet-stack">
                        <div className="sheet-card">
                            <div className="sheet-card__title">Need a quick start?</div>
                            <ul className="sheet-bullets">
                                <li>Use the New Node button to scaffold features.</li>
                                <li>Toggle Tree/Graph views to validate relationships.</li>
                                <li>Use the palette (Ctrl/Cmd + K) to jump anywhere.</li>
                            </ul>
                        </div>
                        <div className="sheet-card">
                            <div className="sheet-card__title">Docs & support</div>
                            <ul className="sheet-links">
                                <li><span className="dot" />Product catalog & changelog available in the menu.</li>
                                <li><span className="dot" />Chat panel is ready for quick prompts.</li>
                                <li><span className="dot" />Reach out via the feedback form.</li>
                            </ul>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        const handleKey = (e) => {
            const target = e.target;
            const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.closest?.('[contenteditable="true"]');
            const key = e.key.toLowerCase();

            if ((e.metaKey || e.ctrlKey) && key === 's') {
                e.preventDefault();
                handleSave();
                return;
            }

            if ((e.metaKey || e.ctrlKey) && key === '/') {
                e.preventDefault();
                openSheet('help');
                return;
            }

            if (activeSheet) {
                if (e.key === 'Escape') closeSheet();
                return;
            }

            if (isInput) return;

            if (key === 't') setView('tree');
            if (key === 'g') setView('graph');
            if (key === 'n') setIsModalOpen(true);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [activeSheet, setView]);

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
                        <button
                            className="icon-ghost has-tooltip"
                            aria-label="Save"
                            data-tip="Save (Ctrl/Cmd+S)"
                            onClick={handleSave}
                        >
                            <Save size={16} />
                        </button>
                        <button
                            className="icon-ghost has-tooltip"
                            aria-label="Help"
                            data-tip="Help & tips"
                            onClick={handleHelp}
                        >
                            <HelpCircle size={16} />
                        </button>
                        <button
                            className={`icon-ghost has-tooltip theme-toggle ${theme === 'light' ? 'light' : 'dark'}`}
                            onClick={toggleTheme}
                            data-tip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
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
                                    <button className="profile-menu__item" onClick={() => openSheet('shortcuts')}>
                                        <span className="profile-menu__icon"><Keyboard size={16} /></span>
                                        <div className="profile-menu__text">
                                            <div className="profile-menu__label">Keyboard shortcuts</div>
                                            <div className="profile-menu__hint">Speed-run the UI</div>
                                        </div>
                                        <span className="profile-menu__pill">Ctrl/Cmd + K</span>
                                    </button>

                                    <button className="profile-menu__item" onClick={() => openSheet('catalog')}>
                                        <span className="profile-menu__icon"><ListChecks size={16} /></span>
                                        <div className="profile-menu__text">
                                            <div className="profile-menu__label">View changelog</div>
                                            <div className="profile-menu__hint">See what shipped</div>
                                        </div>
                                        <span className="profile-menu__pill subtle">v1.0</span>
                                    </button>

                                    <button className="profile-menu__item" onClick={() => openSheet('feedback')}>
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

            {activeSheet && (
                <div className="nav-sheet-backdrop" onClick={closeSheet}>
                    <div className="nav-sheet glass-card" onClick={(e) => e.stopPropagation()}>
                        <div className="nav-sheet__header">
                            <div>
                                <div className="nav-sheet__eyebrow">Workspace</div>
                                <div className="nav-sheet__title">
                                    {activeSheet === 'catalog' && 'What\'s new & roadmap'}
                                    {activeSheet === 'shortcuts' && 'Keyboard shortcuts'}
                                    {activeSheet === 'feedback' && 'Send feedback'}
                                    {activeSheet === 'help' && 'Help & tips'}
                                </div>
                            </div>
                            <button className="icon-ghost" aria-label="Close panel" onClick={closeSheet}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="nav-sheet__body">{renderSheetBody()}</div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="nav-toast glass-card">{toast}</div>
            )}

            <CreateNodeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Navbar;
