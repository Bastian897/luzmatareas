import { useState, useEffect, type FormEvent } from 'react';
import { Task, TeamMember, Status, Priority } from '../types';
import { Avatar, Button } from './ui';

interface TaskModalProps {
  task?: Task | null;
  members: TeamMember[];
  defaultStatus?: Status;
  onSave: (data: Partial<Task>) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'pendiente',    label: 'Pendiente' },
  { value: 'en-progreso',  label: 'En Progreso' },
  { value: 'en-revision',  label: 'En Revisión' },
  { value: 'completado',   label: 'Completado' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'baja',    label: 'Baja' },
  { value: 'media',   label: 'Media' },
  { value: 'alta',    label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export default function TaskModal({ task, members, defaultStatus, onSave, onClose }: TaskModalProps) {
  const isEditing = Boolean(task);

  const [title, setTitle]           = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus]         = useState<Status>(task?.status ?? defaultStatus ?? 'pendiente');
  const [priority, setPriority]     = useState<Priority>(task?.priority ?? 'media');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    task?.assignees?.map(a => a.id) ?? []
  );
  const [dueDate, setDueDate]       = useState(task?.due_date ?? '');
  const [tagsStr, setTagsStr]       = useState(task?.tags?.join(', ') ?? '');
  const [error, setError]           = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggleAssignee(id: string) {
    setAssigneeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setError('');

    const tags = tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const data: Partial<Task> = {
      title:       title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      assignee_ids: assigneeIds,
      due_date:    dueDate || undefined,
      tags,
    };

    onSave(data);
  }

  const nonBossMembers = members.filter(m => !m.is_boss);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
            Cerrar
          </button>
        </div>

        {/* Body */}
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* TÍTULO */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-title">Título *</label>
            <input
              id="modal-title"
              className="form-input"
              type="text"
              placeholder="Ej. Grabar entrevista con artista invitado..."
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              autoFocus
            />
            {error && (
              <span style={{ color: 'var(--luzma-red)', fontSize: '0.78rem', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                {error}
              </span>
            )}
          </div>

          {/* DESCRIPCIÓN */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-desc">Descripción</label>
            <textarea
              id="modal-desc"
              className="form-textarea"
              rows={4}
              placeholder="Detalles, contexto, links..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* ESTADO | PRIORIDAD */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="modal-status">Estado</label>
              <select
                id="modal-status"
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-priority">Prioridad</label>
              <select
                id="modal-priority"
                className="form-select"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                {PRIORITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ASIGNADOS */}
          <div className="form-group">
            <label className="form-label">Asignados</label>
            {nonBossMembers.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>
                Sin miembros disponibles
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {nonBossMembers.map(m => {
                  const selected = assigneeIds.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selected ? 'rgba(0,85,255,0.07)' : 'transparent',
                        border: selected ? '1.5px solid rgba(0,85,255,0.25)' : '1.5px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAssignee(m.id)}
                        style={{ accentColor: 'var(--luzma-blue)', width: '15px', height: '15px', flexShrink: 0 }}
                      />
                      <Avatar member={m} size="sm" />
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: '0.82rem', color: '#111' }}>
                          {m.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#888' }}>
                          {m.role}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* VENCIMIENTO */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-due">Vencimiento</label>
            <input
              id="modal-due"
              className="form-input"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          {/* TAGS */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-tags">Tags</label>
            <input
              id="modal-tags"
              className="form-input"
              type="text"
              placeholder="Edición, Piloto, Reunión (separados por coma)"
              value={tagsStr}
              onChange={e => setTagsStr(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button variant="blue" type="submit" fullWidth size="lg">
            {isEditing ? '💾 Guardar Cambios' : '✨ Crear Tarea'}
          </Button>
        </form>
      </div>
    </div>
  );
}
