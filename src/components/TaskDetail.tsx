import { useState, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Task, TeamMember, Status, Comment } from '../types';
import { Avatar, StatusPill, PriorityPill, TagChip, Button, Icons } from './ui';

interface TaskDetailProps {
  task: Task;
  members: TeamMember[];
  comments: Comment[];
  currentUser?: TeamMember | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddComment: (text: string, authorId: string) => void;
  onStatusChange: (status: Status) => void;
}

function isOverdue(task: Task): boolean {
  if (!task.due_date) return false;
  if (task.status === 'completado') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.due_date + 'T00:00:00');
  return due < today;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCommentDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'pendiente',    label: 'Pendiente' },
  { value: 'en-progreso',  label: 'En Progreso' },
  { value: 'en-revision',  label: 'En Revisión' },
  { value: 'completado',   label: 'Completado' },
];

export default function TaskDetail({
  task,
  members,
  comments,
  currentUser,
  onClose,
  onEdit,
  onDelete,
  onAddComment,
  onStatusChange,
}: TaskDetailProps) {
  const [commentText, setCommentText] = useState('');
  const assignee = members.find(m => m.id === task.assignee_id);
  const overdue = isOverdue(task);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSendComment() {
    const text = commentText.trim();
    if (!text) return;
    const authorId = currentUser?.id ?? (members[0]?.id ?? '');
    onAddComment(text, authorId);
    setCommentText('');
  }

  function handleCommentKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSendComment();
    }
  }

  return (
    <>
      <div className="detail-overlay" onClick={onClose} />
      <aside className="detail-panel">
        {/* Header */}
        <div className="detail-header">
          <div className="detail-header-actions">
            <select
              className="form-select"
              value={task.status}
              onChange={e => onStatusChange(e.target.value as Status)}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 1.8rem 0.35rem 0.7rem',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.5)',
                boxShadow: 'none',
                width: 'auto',
              }}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ color: '#111', background: '#fff' }}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              className="icon-btn icon-btn-yellow"
              title="Editar"
              onClick={onEdit}
            >
              {Icons.edit}
            </button>
            <button
              className="icon-btn icon-btn-red"
              title="Eliminar"
              onClick={() => {
                if (window.confirm(`¿Eliminar "${task.title}"?`)) onDelete();
              }}
            >
              {Icons.trash}
            </button>
            <button
              className="icon-btn"
              title="Cerrar"
              onClick={onClose}
            >
              {Icons.close}
            </button>
          </div>

          <div className="detail-status-badge">
            <StatusPill status={task.status} />
          </div>
          <h2 className="detail-title">{task.title}</h2>
          <PriorityPill priority={task.priority} />
        </div>

        {/* Body */}
        <div className="detail-body">
          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="detail-info-row">
              <span className="detail-info-label">Asignado</span>
              {assignee ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar member={assignee} size="sm" />
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.85rem' }}>
                    {assignee.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888' }}>
                    {assignee.role}
                  </span>
                </div>
              ) : (
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: '#aaa', fontWeight: 600 }}>
                  Sin asignar
                </span>
              )}
            </div>

            <div className="detail-info-row">
              <span className="detail-info-label">Vencimiento</span>
              <span className={`detail-date${overdue ? ' overdue' : ''}`}>
                {overdue ? '⚠ Vencida — ' : ''}{formatDate(task.due_date)}
              </span>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="detail-info-row">
                <span className="detail-info-label">Tags</span>
                <div className="detail-tags">
                  {task.tags.map(tag => <TagChip key={tag} tag={tag} />)}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <>
              <div className="detail-separator" />
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                  Descripción
                </p>
                <div className="detail-description">{task.description}</div>
              </div>
            </>
          )}

          <div className="detail-separator" />

          {/* Comments */}
          <div className="comments-section">
            <div className="comments-heading">
              {Icons.comment}
              Comentarios ({comments.length})
            </div>

            {comments.length > 0 && (
              <div className="comment-list">
                {comments.map(c => {
                  const author = members.find(m => m.id === c.author_id);
                  return (
                    <div key={c.id} className="comment-item">
                      <Avatar member={author} size="sm" />
                      <div className="comment-content">
                        <div className="comment-meta">
                          <span className="comment-author">{author?.name ?? 'Usuario'}</span>
                          <span className="comment-date">{formatCommentDate(c.created_at)}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {comments.length === 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#bbb', marginBottom: '1rem', textAlign: 'center', padding: '0.75rem 0' }}>
                Sin comentarios aún. ¡Sé el primero!
              </p>
            )}

            {/* New comment input */}
            <div className="comment-input-row">
              <Avatar member={currentUser} size="sm" />
              <textarea
                className="comment-input"
                placeholder="Añadí un comentario... (Ctrl+Enter para enviar)"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={handleCommentKeyDown}
                rows={2}
              />
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="blue"
                size="sm"
                onClick={handleSendComment}
                disabled={!commentText.trim()}
              >
                {Icons.send}
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
