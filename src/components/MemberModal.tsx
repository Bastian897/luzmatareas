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
}

interface MemberModalProps {
  onSave: (data: NewMemberData) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

export default function MemberModal({ onSave, onClose, saving = false }: MemberModalProps) {
  const [name, setName]   = useState('');
  const [role, setRole]   = useState('');
  const [color, setColor] = useState('#0055FF');
  const [error, setError] = useState('');

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
    setError('');
    await onSave({ name: name.trim(), role: role.trim(), color, initials });
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
