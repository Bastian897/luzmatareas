import { useState, useMemo } from 'react';
import { Task, TeamMember, Status, Priority } from '../types';
import { Avatar, StatusPill, PriorityPill, TagChip, Button, Icons } from './ui';

interface TaskListProps {
  tasks: Task[];
  members: TeamMember[];
  onTaskClick: (t: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onNewTask: () => void;
}

type SortDir = 'asc' | 'desc';

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
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TaskList({ tasks, members, onTaskClick, onDelete, onComplete, onNewTask }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => t.tags?.forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (filterStatus) {
      result = result.filter(t => t.status === filterStatus);
    }
    if (filterPriority) {
      result = result.filter(t => t.priority === filterPriority);
    }
    if (filterAssignee) {
      result = result.filter(t => t.assignee_id === filterAssignee);
    }
    if (filterTag) {
      result = result.filter(t => t.tags?.includes(filterTag));
    }

    // Sort by due_date
    result.sort((a, b) => {
      const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const db = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return sortDir === 'asc' ? da - db : db - da;
    });

    return result;
  }, [tasks, search, filterStatus, filterPriority, filterAssignee, filterTag, sortDir]);

  function toggleSort() {
    setSortDir(d => d === 'asc' ? 'desc' : 'asc');
  }

  return (
    <div className="lzm-page">
      <div className="lzm-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="lzm-eyebrow">Vista Tabla</p>
          <h1>Lista de Tareas</h1>
          <p className="lzm-subtitle">Filtrá, buscá y gestioná todas las tareas del equipo en un solo lugar.</p>
        </div>
        <Button variant="primary" onClick={onNewTask} size="lg">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 2v12M2 8h12" />
          </svg>
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="list-filters">
        <div className="list-search-wrap">
          <span className="list-search-icon">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
            </svg>
          </span>
          <input
            className="list-search"
            type="text"
            placeholder="Buscar tarea..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="list-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Status | '')}
        >
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="en-progreso">En Progreso</option>
          <option value="en-revision">En Revisión</option>
          <option value="completado">Completado</option>
        </select>

        <select
          className="list-select"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value as Priority | '')}
        >
          <option value="">Prioridad</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>

        <select
          className="list-select"
          value={filterAssignee}
          onChange={e => setFilterAssignee(e.target.value)}
        >
          <option value="">Asignado</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          className="list-select"
          value={filterTag}
          onChange={e => setFilterTag(e.target.value)}
        >
          <option value="">Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        {(search || filterStatus || filterPriority || filterAssignee || filterTag) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setFilterStatus('');
              setFilterPriority('');
              setFilterAssignee('');
              setFilterTag('');
            }}
          >
            × Limpiar
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="tasks-table-wrap">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Estado</th>
              <th>Asignado</th>
              <th>Prioridad</th>
              <th className="sortable" onClick={toggleSort}>
                Vencimiento {sortDir === 'asc' ? '↑' : '↓'}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🔍</div>
                    <div className="table-empty-text">No hay tareas que coincidan con los filtros</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(task => {
                const assignee = members.find(m => m.id === task.assignee_id);
                const overdue = isOverdue(task);

                return (
                  <tr key={task.id} onClick={() => onTaskClick(task)}>
                    <td>
                      <div className="table-task-title">{task.title}</div>
                      {task.tags && task.tags.length > 0 && (
                        <div className="table-task-tags">
                          {task.tags.map(tag => <TagChip key={tag} tag={tag} />)}
                        </div>
                      )}
                    </td>
                    <td data-label="Estado"><StatusPill status={task.status} /></td>
                    <td data-label="Asignado">
                      <div className="table-assignee">
                        <Avatar member={assignee} size="sm" />
                        <span className="table-assignee-name">
                          {assignee?.name ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td data-label="Prioridad"><PriorityPill priority={task.priority} /></td>
                    <td data-label="Vence">
                      <span className={`table-date${overdue ? ' overdue' : ''}`}>
                        {overdue ? '⚠ ' : ''}{formatDate(task.due_date)}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="table-actions">
                        {task.status !== 'completado' && (
                          <button
                            className="icon-btn icon-btn-green"
                            title="Marcar completada"
                            onClick={e => { e.stopPropagation(); onComplete(task.id); }}
                          >
                            {Icons.check}
                          </button>
                        )}
                        <button
                          className="icon-btn"
                          title="Ver detalle"
                          onClick={e => { e.stopPropagation(); onTaskClick(task); }}
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="8" cy="8" r="3" />
                            <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
                          </svg>
                        </button>
                        <button
                          className="icon-btn icon-btn-red"
                          title="Eliminar tarea"
                          onClick={e => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar "${task.title}"?`)) {
                              onDelete(task.id);
                            }
                          }}
                        >
                          {Icons.trash}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <p style={{ marginTop: '0.75rem', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 700, color: '#888', letterSpacing: '0.05em' }}>
        {filtered.length} de {tasks.length} tareas
      </p>
    </div>
  );
}
