import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { supabase } from './lib/supabase';
import { Task, TeamMember, Comment, Status } from './types';
import Header, { View } from './components/Header';
import Dashboard from './components/Dashboard';
import Board from './components/Board';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import TaskDetail from './components/TaskDetail';
import MemberModal from './components/MemberModal';

/* ============================================================
   UTILS
   ============================================================ */
async function hashPassword(pw: string): Promise<string> {
  const data = new TextEncoder().encode(pw.toLowerCase());
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ============================================================
   ENV CHECK
   ============================================================ */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isConfigured = Boolean(
  SUPABASE_URL && SUPABASE_KEY &&
  SUPABASE_URL !== 'undefined' && SUPABASE_KEY !== 'undefined'
);

type Session = { memberId: string; isBoss: boolean };

/* ============================================================
   CONFIG ERROR SCREEN
   ============================================================ */
function ConfigError() {
  return (
    <div className="lzm-config-error">
      <div className="lzm-config-box">
        <div className="lzm-config-emoji">⚙️</div>
        <h2 className="lzm-config-title">Configuración requerida</h2>
        <p className="lzm-config-text">
          Para usar la app necesitás configurar las variables de entorno de Supabase.
          Creá un archivo <strong>.env</strong> en la raíz del proyecto con:
        </p>
        <pre className="lzm-config-code">{`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ...`}</pre>
        <p className="lzm-config-text" style={{ marginTop: '1rem' }}>
          Luego reiniciá el servidor de desarrollo con <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   LOGIN SCREEN
   ============================================================ */
function LoginScreen({ onLogin }: { onLogin: (username: string, pw: string) => Promise<string | null> }) {
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !pw) {
      setError('Completá usuario y contraseña.');
      return;
    }
    setLoading(true);
    const err = await onLogin(username.trim(), pw);
    setLoading(false);
    if (err) {
      setError(err);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPw('');
    }
  }

  return (
    <div className="lzm-login-screen">
      <div className={`lzm-login-box${shaking ? ' shake' : ''}`}>
        <div className="lzm-login-logo-wrap">
          <div className="lzm-logo-box">
            <span className="lzm-logo-luzma">LUZMA</span>
            <span className="lzm-logo-tv">TV</span>
          </div>
        </div>
        <h1 className="lzm-login-title">TAREAS</h1>
        <p className="lzm-login-subtitle">Ingresá tus datos para continuar</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
          <input
            type="text"
            className="form-input lzm-login-input"
            placeholder="Usuario"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            autoFocus
            autoComplete="username"
            style={{ letterSpacing: 'normal', textAlign: 'left' }}
          />
          <input
            type="password"
            className="form-input lzm-login-input"
            placeholder="Contraseña"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(''); }}
            autoComplete="current-password"
          />
          {error && <p className="lzm-login-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   LOADING SCREEN
   ============================================================ */
function LoadingScreen() {
  return (
    <div className="lzm-loading">
      <div className="lzm-spinner" />
      <p className="lzm-loading-text">Cargando...</p>
    </div>
  );
}

/* ============================================================
   APP — maneja solo el login
   ============================================================ */
export default function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = sessionStorage.getItem('lzm-auth');
    if (!raw) return null;
    try { return JSON.parse(raw) as Session; } catch { return null; }
  });

  if (!isConfigured) return <ConfigError />;

  async function handleLogin(username: string, pw: string): Promise<string | null> {
    const hashed = await hashPassword(pw);
    const { data, error } = await supabase
      .from('team_members')
      .select('id, is_boss')
      .eq('username', username.toLowerCase())
      .eq('password', hashed)
      .maybeSingle();

    if (error) return 'Error de conexión. Intentá de nuevo.';
    if (!data) return 'Usuario o contraseña incorrectos.';

    const s: Session = { memberId: data.id, isBoss: data.is_boss ?? false };
    sessionStorage.setItem('lzm-auth', JSON.stringify(s));
    setSession(s);
    return null;
  }

  function handleLogout() {
    sessionStorage.removeItem('lzm-auth');
    setSession(null);
  }

  if (!session) return <LoginScreen onLogin={handleLogin} />;
  return <AppInner session={session} onLogout={handleLogout} />;
}

/* ============================================================
   APP INNER — toda la lógica de la app (solo si está logueado)
   ============================================================ */
function AppInner({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [view, setView]                       = useState<View>('dashboard');
  const [tasks, setTasks]                     = useState<Task[]>([]);
  const [members, setMembers]                 = useState<TeamMember[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedTask, setSelectedTask]       = useState<Task | null>(null);
  const [showModal, setShowModal]             = useState(false);
  const [editingTask, setEditingTask]         = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus]     = useState<Status | undefined>(undefined);
  const [comments, setComments]               = useState<Comment[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [savingMember, setSavingMember]       = useState(false);

  const isBoss = session.isBoss;
  const currentUser = members.find(m => m.id === session.memberId) ?? null;
  const visibleTasks = isBoss
    ? tasks
    : tasks.filter(t => t.assignees.some(a => a.id === session.memberId));

  /* ---- FETCH ---- */
  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_assignees(member:team_members(*))')
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching tasks:', error); return; }

    const tasks: Task[] = (data ?? []).map((row: any) => ({
      ...row,
      assignees: (row.task_assignees ?? []).map((ta: any) => ta.member).filter(Boolean),
      task_assignees: undefined,
    }));
    setTasks(tasks);
  }, []);

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (error) { console.error('Error fetching members:', error); return; }
    setMembers((data as TeamMember[]) ?? []);
  }, []);

  const fetchComments = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:team_members(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) { console.error('Error fetching comments:', error); return; }
    setComments((data as Comment[]) ?? []);
  }, []);

  /* ---- INIT ---- */
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchTasks()]);
      setLoading(false);
    }
    init();
  }, [fetchMembers, fetchTasks]);

  /* ---- TASK HANDLERS ---- */
  async function handleAddTask(data: Partial<Task>) {
    if (!isBoss) return;
    const assigneeIds = data.assignee_ids ?? [];

    const payload = {
      title:       data.title!,
      description: data.description ?? null,
      status:      data.status ?? 'pendiente',
      priority:    data.priority ?? 'media',
      due_date:    data.due_date ?? null,
      tags:        data.tags ?? [],
    };

    const { data: inserted, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting task:', error);
      alert('Error al crear la tarea: ' + error.message);
      return;
    }

    if (assigneeIds.length > 0) {
      await supabase.from('task_assignees').insert(
        assigneeIds.map(id => ({ task_id: inserted.id, member_id: id }))
      );
    }

    setShowModal(false);
    setEditingTask(null);
    setDefaultStatus(undefined);
    await fetchTasks();
  }

  async function handleUpdateTask(data: Partial<Task>) {
    if (!editingTask || !isBoss) return;
    const assigneeIds = data.assignee_ids ?? [];

    const payload = {
      title:       data.title!,
      description: data.description ?? null,
      status:      data.status ?? editingTask.status,
      priority:    data.priority ?? editingTask.priority,
      due_date:    data.due_date ?? null,
      tags:        data.tags ?? [],
    };

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', editingTask.id);

    if (error) {
      console.error('Error updating task:', error);
      alert('Error al actualizar la tarea: ' + error.message);
      return;
    }

    // Reemplazar asignados
    await supabase.from('task_assignees').delete().eq('task_id', editingTask.id);
    if (assigneeIds.length > 0) {
      await supabase.from('task_assignees').insert(
        assigneeIds.map(id => ({ task_id: editingTask.id, member_id: id }))
      );
    }

    setShowModal(false);
    setEditingTask(null);
    setDefaultStatus(undefined);
    await fetchTasks();

    if (selectedTask?.id === editingTask.id) setSelectedTask(null);
  }

  async function handleDeleteTask(id: string) {
    if (!isBoss) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
      alert('Error al eliminar la tarea: ' + error.message);
      return;
    }
    if (selectedTask?.id === id) {
      setSelectedTask(null);
      setComments([]);
    }
    await fetchTasks();
  }

  async function handleStatusChange(id: string, status: Status) {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
    if (error) { console.error('Error updating status:', error); return; }
    await fetchTasks();
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, status } : null);
    }
  }

  async function handleCompleteTask(id: string) {
    await handleStatusChange(id, 'completado');
  }

  function openDetail(task: Task) {
    setSelectedTask(task);
    fetchComments(task.id);
  }

  function handleDetailStatusChange(status: Status) {
    if (!selectedTask) return;
    handleStatusChange(selectedTask.id, status);
  }

  async function handleAddComment(text: string, authorId: string) {
    if (!selectedTask) return;
    const { error } = await supabase.from('comments').insert([{
      task_id:   selectedTask.id,
      author_id: authorId || null,
      text,
    }]);
    if (error) {
      console.error('Error adding comment:', error);
      alert('Error al agregar comentario: ' + error.message);
      return;
    }
    await fetchComments(selectedTask.id);
  }

  /* ---- MEMBER HANDLERS ---- */
  async function handleDeleteMember(id: string, name: string) {
    if (!isBoss) return;
    if (!window.confirm(`¿Eliminar a ${name}? Sus tareas quedarán sin asignar.`)) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) {
      console.error('Error deleting member:', error);
      alert('Error al eliminar miembro: ' + error.message);
      return;
    }
    await Promise.all([fetchMembers(), fetchTasks()]);
  }

  async function handleAddMember(data: {
    name: string;
    role: string;
    color: string;
    initials: string;
    username?: string;
    password?: string;
  }) {
    if (!isBoss) return;
    setSavingMember(true);
    const payload: Record<string, unknown> = {
      name:     data.name,
      role:     data.role,
      color:    data.color,
      initials: data.initials,
    };
    if (data.username) payload.username = data.username.toLowerCase();
    if (data.password) payload.password = await hashPassword(data.password);

    const { error } = await supabase.from('team_members').insert([payload]);
    setSavingMember(false);
    if (error) {
      console.error('Error adding member:', error);
      alert('Error al agregar miembro: ' + error.message);
      return;
    }
    setShowMemberModal(false);
    await fetchMembers();
  }

  /* ---- MODAL HELPERS ---- */
  function openNewTask(status?: Status) {
    if (!isBoss) return;
    setEditingTask(null);
    setDefaultStatus(status);
    setShowModal(true);
  }

  function openEditTask() {
    if (!selectedTask || !isBoss) return;
    setEditingTask(selectedTask);
    setShowModal(true);
  }

  function handleModalSave(data: Partial<Task>) {
    if (editingTask) {
      handleUpdateTask(data);
    } else {
      handleAddTask(data);
    }
  }

  /* ---- RENDER ---- */
  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--luzma-fog)' }}>
      <Header
        view={view}
        onViewChange={setView}
        onNewTask={() => openNewTask()}
        onLogout={onLogout}
        isBoss={isBoss}
        currentUser={currentUser}
      />

      {view === 'dashboard' && (
        <Dashboard
          tasks={visibleTasks}
          members={members}
          onNewTask={() => openNewTask()}
          onTaskClick={openDetail}
          onAddMember={() => setShowMemberModal(true)}
          onDeleteMember={handleDeleteMember}
          isBoss={isBoss}
        />
      )}

      {view === 'board' && (
        <Board
          tasks={visibleTasks}
          members={members}
          onTaskClick={openDetail}
          onStatusChange={handleStatusChange}
          onNewTask={openNewTask}
          isBoss={isBoss}
        />
      )}

      {view === 'lista' && (
        <TaskList
          tasks={visibleTasks}
          members={members}
          onTaskClick={openDetail}
          onDelete={handleDeleteTask}
          onComplete={handleCompleteTask}
          onNewTask={() => openNewTask()}
          isBoss={isBoss}
        />
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          members={members}
          comments={comments}
          currentUser={currentUser}
          onClose={() => { setSelectedTask(null); setComments([]); }}
          onEdit={openEditTask}
          onDelete={() => handleDeleteTask(selectedTask.id)}
          onAddComment={handleAddComment}
          onStatusChange={handleDetailStatusChange}
          isBoss={isBoss}
        />
      )}

      {showModal && isBoss && (
        <TaskModal
          task={editingTask}
          members={members}
          defaultStatus={defaultStatus}
          onSave={handleModalSave}
          onClose={() => { setShowModal(false); setEditingTask(null); setDefaultStatus(undefined); }}
        />
      )}

      {showMemberModal && isBoss && (
        <MemberModal
          onSave={handleAddMember}
          onClose={() => setShowMemberModal(false)}
          saving={savingMember}
        />
      )}
    </div>
  );
}
