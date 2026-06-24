import { type ReactNode, type MouseEvent } from 'react';
import { TeamMember, Status, Priority } from '../types';

/* ============================================================
   AVATAR
   ============================================================ */
interface AvatarProps {
  member?: TeamMember | null;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ member, size = 'md' }: AvatarProps) {
  const sizeClass = `avatar-${size}`;
  const bg = member?.color ?? '#888';
  const initials = member?.initials ?? '?';
  const needsDarkText = ['#FDD835', '#FFD600', '#F2F4FB'].includes(bg);

  return (
    <div
      className={`avatar ${sizeClass}`}
      style={{ background: bg, color: needsDarkText ? '#111' : '#fff' }}
      title={member?.name}
    >
      {initials}
    </div>
  );
}

/* ============================================================
   STATUS PILL
   ============================================================ */
interface StatusPillProps {
  status: Status;
}

const STATUS_META: Record<Status, { label: string; emoji: string }> = {
  pendiente:    { label: 'Pendiente',    emoji: '⏳' },
  'en-progreso': { label: 'En Progreso', emoji: '🔵' },
  'en-revision': { label: 'En Revisión', emoji: '🔍' },
  completado:   { label: 'Completado',   emoji: '✅' },
};

export function StatusPill({ status }: StatusPillProps) {
  const meta = STATUS_META[status];
  return (
    <span className={`pill pill-${status}`}>
      <span>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

/* ============================================================
   PRIORITY PILL
   ============================================================ */
interface PriorityPillProps {
  priority: Priority;
}

const PRIORITY_META: Record<Priority, { label: string; emoji: string }> = {
  baja:    { label: 'Baja',    emoji: '▽' },
  media:   { label: 'Media',   emoji: '◈' },
  alta:    { label: 'Alta',    emoji: '△' },
  urgente: { label: 'Urgente', emoji: '🔴' },
};

export function PriorityPill({ priority }: PriorityPillProps) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={`pill pill-${priority}`}>
      {priority === 'urgente' && <span className="pill-dot" />}
      {meta.label}
    </span>
  );
}

/* ============================================================
   TAG CHIP
   ============================================================ */
interface TagChipProps {
  tag: string;
}

export function TagChip({ tag }: TagChipProps) {
  return <span className="tag-chip">{tag}</span>;
}

/* ============================================================
   BUTTON
   ============================================================ */
type ButtonVariant = 'primary' | 'blue' | 'accent' | 'ghost' | 'white' | 'green';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  blue:    'btn-blue',
  accent:  'btn-accent',
  ghost:   'btn-ghost',
  white:   'btn-white',
  green:   'btn-green',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const classes = [
    'btn',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth ? 'btn-full' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={disabled ? { opacity: 0.5, cursor: 'not-allowed', transform: 'none', boxShadow: 'var(--shadow-sm)' } : undefined}
    >
      {children}
    </button>
  );
}

/* ============================================================
   ICON BUTTON
   ============================================================ */
interface IconBtnProps {
  icon: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  variant?: 'default' | 'yellow' | 'red' | 'green' | 'blue';
  type?: 'button' | 'submit';
}

export function IconBtn({ icon, onClick, title, variant = 'default', type = 'button' }: IconBtnProps) {
  const variantClass = variant !== 'default' ? `icon-btn-${variant}` : '';
  return (
    <button
      className={`icon-btn ${variantClass}`}
      onClick={onClick}
      title={title}
      type={type}
    >
      {icon}
    </button>
  );
}

/* ============================================================
   SVG ICONS
   ============================================================ */
export const Icons = {
  close: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M2 2l12 12M14 2L2 14" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2l3 3-9 9H2v-3L11 2z" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8l4 4 8-8" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M8 2v12M2 8h12" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L2 7l5 2 2 5 5-12z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  ),
  chevronUp: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M3 10l5-5 5 5" />
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M3 6l5 5 5-5" />
    </svg>
  ),
  comment: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="14" height="10" rx="2" />
      <path d="M4 15l2-4h0" />
    </svg>
  ),
};
