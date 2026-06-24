import { TeamMember } from '../types';
import { Avatar, Button } from './ui';

export type View = 'dashboard' | 'board' | 'lista';

interface HeaderProps {
  view: View;
  onViewChange: (v: View) => void;
  onNewTask: () => void;
  currentUser?: TeamMember | null;
}

const NAV_ITEMS: { label: string; view: View }[] = [
  { label: 'Dashboard', view: 'dashboard' },
  { label: 'Board',     view: 'board' },
  { label: 'Lista',     view: 'lista' },
];

export default function Header({ view, onViewChange, onNewTask, currentUser }: HeaderProps) {
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

        {/* Right: Nueva tarea + usuario */}
        <div className="lzm-header-right">
          <Button variant="primary" onClick={onNewTask}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M8 2v12M2 8h12" />
            </svg>
            Nueva Tarea
          </Button>

          <div className="lzm-user-info">
            <div className="lzm-user-text">
              <span className="lzm-user-name">{currentUser?.name ?? 'Carla Vázquez'}</span>
              <span className="lzm-user-role">{currentUser?.role ?? 'Productora'}</span>
            </div>
            <Avatar member={currentUser} size="md" />
          </div>
        </div>
      </div>
    </header>
  );
}
