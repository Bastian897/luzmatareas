import { TeamMember } from '../types';
import { Avatar, Button } from './ui';

export type View = 'dashboard' | 'board' | 'lista';

interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  onNewTask: () => void;
  onLogout: () => void;
  isBoss: boolean;
  currentUser: TeamMember | null;
}

const NAV_ITEMS: { label: string; view: View }[] = [
  { label: 'Dashboard', view: 'dashboard' },
  { label: 'Board',     view: 'board' },
  { label: 'Lista',     view: 'lista' },
];

export default function Header({ view, onViewChange, onNewTask, onLogout, isBoss, currentUser }: HeaderProps) {
  return (
    <header className="lzm-header">
      <div className="lzm-header-inner">
        {/* Logo */}
        <div className="lzm-logo">
          <div className="lzm-logo-box">
            <span className="lzm-logo-luzma">LUZMA</span>
            <span className="lzm-logo-tv">TV</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="lzm-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.view}
              className={`lzm-nav-pill${view === item.view ? ' active' : ''}`}
              onClick={() => onViewChange(item.view)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Nueva tarea + usuario actual + título de la app + logout */}
        <div className="lzm-header-right">
          {isBoss && (
            <Button variant="primary" onClick={onNewTask}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 2v12M2 8h12" />
              </svg>
              Nueva Tarea
            </Button>
          )}

          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.9 }}>
              <Avatar member={currentUser} size="sm" />
              <span className="lzm-current-user-name" style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
                {currentUser.name.split(' ')[0]}
              </span>
            </div>
          )}

          <div className="lzm-app-title-tag">
            <span className="lzm-app-title-text">LUZMA TAREAS</span>
          </div>

          <button
            className="lzm-logout-btn"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
              <path d="M11 11l3-3-3-3" />
              <path d="M14 8H6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
