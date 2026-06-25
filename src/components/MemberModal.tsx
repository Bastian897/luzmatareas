import { useState, type FormEvent } from 'react';
import { Button } from './ui';

const PALETTE = [
  { hex: '#0055FF', name: 'Azul' },
  { hex: '#E91E8C', name: 'Magenta' },
  { hex: '#43A047', name: 'Verde' },
  { hex: '#29B6F6', name: 'Celeste' },
  { hex: '#FDD835', name: 'Amarillo' },
  { hex: '#E53935', name: 'Rojo' },
  { hex: '#9C27B0', name: 'Violeta' },
  { hex: '#FF6B00', name: 'Naranja' },
  { hex: '#0A0F2C', name: 'Noche' },
  { hex: '#111111', name: 'Negro' },
];

interface NewMemberData {
  name: string;
  role: string;
  color: string;
  initials: string;
  username?: string;
  password?: string;
  is_boss?: boolean;
}

interface MemberModalProps {
  onSave: (data: NewMemberData) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

export default function MemberModal({ onSave, onClose, saving = false }: MemberModalProps) {
  const [name, setName]       = useState('');
  const [role, setRole]       = useState('');
  const [color, setColor]     = useState('#0055FF');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBoss, setIsBoss]   = useState(false);
  const [error, setError]     = useState('');

  const initials = name.trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || '?';

  const needsDarkText = ['#FDD835', '#FFD600', '#F2F4FB'].includes(color);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es obligatorio.'); return; }
    if (!role.trim()) { setError('El rol es obligatorio.'); return; }
    if (username.trim() && !password.trim()) {
      setError('Si ingresás un usuario, también necesitás una contraseña.');
      return;
    }
    setError('');
    await onSave({
      name:     name.trim(),
      role:     role.trim(),
      color,
      initials,
      username: username.trim() || undefined,
      password: password.trim() || undefined,
      is_boss:  isBoss || undefined,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ background: 'var(--luzma-blue)' }}>
          <h2 className="modal-title" style={{ color: '#fff' }}>Nuevo Miembro</h2>
          <button className="btn btn-white btn-sm" type="button" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
            Cerrar
          </button>
        </div>

        {/* Body */}
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Preview */}
          <div className="member-preview">
            <div
              className="avatar avatar-lg"
              style={{ background: color, color: needsDarkText ? '#111' : '#fff', fontSize: '1rem' }}
            >
              {initials}
            </div>
            <div>
              <div className="member-preview-name">
                {name.trim() || 'Nombre del miembro'}
              </div>
              <div className="member-preview-role">
                {role.trim() || 'Rol en el equipo'}
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre completo *</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ej. Ana García"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          {/* Rol */}
          <div className="form-group">
            <label className="form-label">Rol *</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ej. Editora, Director de Arte..."
              value={role}
              onChange={e => { setRole(e.target.value); setError(''); }}
            />
          </div>

          {/* Color */}
          <div className="form-group">
            <label className="form-label">Color del avatar</label>
            <div className="member-color-grid">
              {PALETTE.map(p => (
                <button
                  key={p.hex}
                  type="button"
                  className={`member-color-btn${color === p.hex ? ' selected' : ''}`}
                  style={{ background: p.hex }}
                  title={p.name}
                  onClick={() => setColor(p.hex)}
                />
              ))}
            </div>
          </div>

          {/* Acceso a la app */}
          <div style={{ borderTop: '1px solid var(--luzma-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', margin: 0 }}>
              Acceso a la app (opcional)
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Usuario</label>
              <input
                className="form-input"
                type="text"
                placeholder="Ej. ana.garcia"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                autoComplete="off"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contraseña</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="new-password"
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.82rem' }}>
              <input
                type="checkbox"
                checked={isBoss}
                onChange={e => setIsBoss(e.target.checked)}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--luzma-blue)', cursor: 'pointer' }}
              />
              Es jefe (ve todas las tareas del equipo)
            </label>
          </div>

          {error && (
            <span style={{ color: 'var(--luzma-red)', fontSize: '0.78rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
              {error}
            </span>
          )}

          <Button variant="blue" type="submit" fullWidth size="lg" disabled={saving}>
            {saving ? 'Guardando...' : '👤 Agregar Miembro'}
          </Button>
        </form>
      </div>
    </div>
  );
}
