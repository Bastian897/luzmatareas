import { useState, type DragEvent } from 'react';
import { Task, TeamMember, Status } from '../types';
import { AvatarGroup, PriorityPill, TagChip, Button } from './ui';

interface BoardProps {
  tasks: Task[];
  members: TeamMember[];
  onTaskClick: (t: Task) => void;
  onStatusChange: (id: string, status: Status) => void;
  onNewTask: (status?: Status) => void;
  isBoss: boolean;
}

interface Column {
  status: Status;
  label: string;
  emoji: string;
  colorClass: string;
}

const COLUMNS: Column[] = [
  { status: 'pendiente',    label: 'Pendiente',    emoji: '⏳', colorClass: 'board-col-pendiente'    },
  { status: 'en-progreso',  label: 'En Progreso',  emoji: '🔵', colorClass: 'board-col-en-progreso'  },
  { status: 'en-revision',  label: 'En Revisión',  emoji: '🔍', colorClass: 'board-col-en-revision'  },
  { status: 'completado',   label: 'Completado',   emoji: '✅', colorClass: 'board-col-completado'   },
];

function isOverdue(task: Task): boolean {
  if (!task.due_date) return false;
  if (task.status === 'completado') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.due_date + 'T00:00:00');
  return due < today;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

export default function Board({ tasks, onTaskClick, onStatusChange, onNewTask, isBoss }: BoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);

  function handleDragStart(e: DragEvent, taskId: string) {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverStatus(null);
  }

  function handleDragOver(e: DragEvent, status: Status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  }

  function handleDragLeave() {
    setDragOverStatus(null);
  }

  function handleDrop(e: DragEvent, status: Status) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, status);
    }
    setDraggingId(null);
    setDragOverStatus(null);
  }

  return (
    <div className="lzm-page">
      <div className="lzm-page-header">
        <p className="lzm-eyebrow">Vista Kanban</p>
        <h1>Board</h1>
        <p className="lzm-subtitle">Deslizá entre columnas · Arrastrá las tarjetas para cambiar el estado.</p>
      </div>

      <div className="board-columns">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);
          const isDragTarget = dragOverStatus === col.status;

          return (
            <div
              key={col.status}
              className={`board-column ${col.colorClass}${isDragTarget ? ' drag-over' : ''}`}
              onDragOver={e => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.status)}
            >
              {/* Column header */}
              <div className="board-col-header">
                <div className="board-col-title">
                  <span>{col.emoji}</span>
                  <span>{col.label}</span>
                </div>
                <span className="board-count-badge">{colTasks.length}</span>
              </div>

              {/* Cards */}
              <div className="board-col-body">
                {colTasks.length === 0 && (
                  <div className="board-empty">Sin tareas</div>
                )}
                {colTasks.map(task => {
                  const overdue = isOverdue(task);

                  return (
                    <div
                      key={task.id}
                      className={`task-card${draggingId === task.id ? ' dragging' : ''}`}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="task-card-title">{task.title}</div>

                      {task.tags && task.tags.length > 0 && (
                        <div className="task-card-tags">
                          {task.tags.slice(0, 3).map(tag => (
                            <TagChip key={tag} tag={tag} />
                          ))}
                        </div>
                      )}

                      <div className="task-card-footer">
                        <div className="task-card-meta">
                          <PriorityPill priority={task.priority} />
                          {task.due_date && (
                            <span className={`task-card-date${overdue ? ' overdue' : ''}`}>
                              {overdue ? '⚠ ' : ''}{formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                        <AvatarGroup members={task.assignees ?? []} max={3} />
                      </div>
                    </div>
                  );
                })}

                {/* Add button — solo para jefes */}
                {isBoss && (
                  <div className="board-add-btn">
                    <Button
                      variant={col.status === 'en-progreso' || col.status === 'completado' ? 'white' : 'ghost'}
                      size="sm"
                      fullWidth
                      onClick={() => onNewTask(col.status)}
                    >
                      + Agregar tarea
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
