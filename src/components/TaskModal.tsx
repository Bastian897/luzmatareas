import { useState, useEffect, type FormEvent } from 'react';
import { Task, TeamMember, Status, Priority } from '../types';
import { Button } from './ui';

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
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id ?? '');
  const [dueDate, setDueDate]       = useState(task?.due_date ?? '');
  const [tagsStr, setTagsStr]       = useState(task?.tags?.join(', ') ?? '');
  const [error, setError]           = useState('');

  useEffect(() => {
    // Trap focus / close on Escape
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

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
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      assignee_id: assigneeId || undefined,
      due_date: dueDate || undefined,
      tags,
    };

    onSave(data);
  }

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

          {/* ASIGNADO | VENCIMIENTO */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="modal-assignee">Asignado A</label>
              <select
                id="modal-assignee"
                className="form-select"
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
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
