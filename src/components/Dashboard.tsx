import { Task, TeamMember } from '../types';
import { Avatar, PriorityPill, StatusPill, Button } from './ui';

interface DashboardProps {
  tasks: Task[];
  members: TeamMember[];
  onNewTask: () => void;
  onTaskClick: (t: Task) => void;
  onAddMember: () => void;
}

function isOverdue(task: Task): boolean {
  if (!task.due_date) return false;
  if (task.status === 'completado' || task.status === 'en-revision') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.due_date + 'T00:00:00');
  return due < today;
}

export default function Dashboard({ tasks, members, onNewTask, onTaskClick, onAddMember }: DashboardProps) {
  const total = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'en-progreso').length;
  const completed = tasks.filter(t => t.status === 'completado').length;
  const overdue = tasks.filter(t => isOverdue(t)).length;

  const urgentTasks = tasks.filter(t => t.priority === 'urgente' && t.status !== 'completado');

  const workload = members.map(m => ({
    member: m,
    count: tasks.filter(t => t.assignee_id === m.id && t.status !== 'completado').length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="lzm-page">
      <div className="lzm-page-header">
        <p className="lzm-eyebrow">Resumen del equipo</p>
        <h1>Dashboard</h1>
        <p className="lzm-subtitle">Vista rápida de la operación del canal — todo lo que está pasando, ahora mismo.</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-number">{total}</div>
          <div className="stat-label">Tareas Totales</div>
        </div>
        <div className="stat-card stat-card-yellow">
          <div className="stat-number">{inProgress}</div>
          <div className="stat-label">En Progreso</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-number">{completed}</div>
          <div className="stat-label">Completadas</div>
        </div>
        <div className="stat-card stat-card-red">
          <div className="stat-number">{overdue}</div>
          <div className="stat-label">Vencidas</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Urgent tasks */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">🔴 Tareas Urgentes</span>
            <Button variant="accent" size="sm" onClick={onNewTask}>
              + Nueva
            </Button>
          </div>
          <div className="dash-card-body">
            {urgentTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', padding: '1.5rem 0', fontWeight: 700 }}>
                Sin tareas urgentes 🎉
              </p>
            ) : (
              urgentTasks.map(task => {
                const assignee = members.find(m => m.id === task.assignee_id);
                return (
                  <div
                    key={task.id}
                    className="urgent-task-row"
                    onClick={() => onTaskClick(task)}
                  >
                    <Avatar member={assignee} size="sm" />
                    <div className="urgent-task-info">
                      <div className="urgent-task-title">{task.title}</div>
                      <div className="urgent-task-pills">
                        <PriorityPill priority={task.priority} />
                        <StatusPill status={task.status} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Workload */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">👥 Carga de Trabajo</span>
            <Button variant="ghost" size="sm" onClick={onAddMember}>
              + Miembro
            </Button>
          </div>
          <div className="dash-card-body">
            {workload.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', padding: '1.5rem 0', fontWeight: 700 }}>
                Sin miembros aún
              </p>
            ) : (
              workload.map(({ member, count }) => (
                <div key={member.id} className="workload-row">
                  <Avatar member={member} size="sm" />
                  <div className="workload-info">
                    <div className="workload-name">{member.name}</div>
                    <div className="workload-role">{member.role}</div>
                  </div>
                  <div className={`workload-badge${count === 0 ? ' zero' : ''}`}>
                    {count}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
