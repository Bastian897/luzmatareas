import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Task, TeamMember, Comment, Status } from './types';
import Header, { View } from './components/Header';
import Dashboard from './components/Dashboard';
import Board from './components/Board';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import TaskDetail from './components/TaskDetail';

/* ============================================================
   ENV CHECK
   ============================================================ */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL !== 'undefined' && SUPABASE_KEY !== 'undefined');

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
   LOADING SCREEN
   ============================================================ */
function LoadingScreen() {
  return (
    <div className="lzm-loading">
      <div className="lzm-spinner" />
      <p className="lzm-loading-text">Cargando LuzmaTV...</p>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  if (!isConfigured) return <ConfigError />;

  const [view, setView]                   = useState<View>('dashboard');
  const [tasks, setTasks]                 = useState<Task[]>([]);
  const [members, setMembers]             = useState<TeamMember[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedTask, setSelectedTask]   = useState<Task | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [editingTask, setEditingTask]     = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status | undefined>(undefined);
  const [comments, setComments]           = useState<Comment[]>([]);

  // Current user: Carla Vázquez (Productora)
  const currentUser = members.find(m => m.role === 'Productora') ?? members[0] ?? null;

  /* ---- FETCH ---- */
  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:team_members(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }
    setTasks((data as Task[]) ?? []);
  }, []);

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching members:', error);
      return;
    }
    setMembers((data as TeamMember[]) ?? []);
  }, []);

  const fetchComments = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:team_members(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }
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

  /* ---- HANDLERS ---- */
  async function handleAddTask(data: Partial<Task>) {
    const payload = {
      title:       data.title!,
      description: data.description ?? null,
      status:      data.status ?? 'pendiente',
      priority:    data.priority ?? 'media',
      assignee_id: data.assignee_id ?? null,
      due_date:    data.due_date ?? null,
      tags:        data.tags ?? [],
    };

    const { error } = await supabase.from('tasks').insert([payload]);
    if (error) {
      console.error('Error inserting task:', error);
      alert('Error al crear la tarea: ' + error.message);
      return;
    }
    setShowModal(false);
    setEditingTask(null);
    setDefaultStatus(undefined);
    await fetchTasks();
  }

  async function handleUpdateTask(data: Partial<Task>) {
    if (!editingTask) return;

    const payload = {
      title:       data.title!,
      description: data.description ?? null,
      status:      data.status ?? editingTask.status,
      priority:    data.priority ?? editingTask.priority,
      assignee_id: data.assignee_id ?? null,
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
    setShowModal(false);
    setEditingTask(null);
    setDefaultStatus(undefined);
    await fetchTasks();

    // If we were viewing this task, update selectedTask
    if (selectedTask?.id === editingTask.id) {
      setSelectedTask(null); // will be re-opened from updated list if needed
    }
  }

  async function handleDeleteTask(id: string) {
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
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }
    await fetchTasks();
    // Update selectedTask if open
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
      return;
    }
    await fetchComments(selectedTask.id);
  }

  function openNewTask(status?: Status) {
    setEditingTask(null);
    setDefaultStatus(status);
    setShowModal(true);
  }

  function openEditTask() {
    if (!selectedTask) return;
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
        currentUser={currentUser}
      />

      {view === 'dashboard' && (
        <Dashboard
          tasks={tasks}
          members={members}
          onNewTask={() => openNewTask()}
          onTaskClick={openDetail}
        />
      )}

      {view === 'board' && (
        <Board
          tasks={tasks}
          members={members}
          onTaskClick={openDetail}
          onStatusChange={handleStatusChange}
          onNewTask={openNewTask}
        />
      )}

      {view === 'lista' && (
        <TaskList
          tasks={tasks}
          members={members}
          onTaskClick={openDetail}
          onDelete={handleDeleteTask}
          onComplete={handleCompleteTask}
          onNewTask={() => openNewTask()}
        />
      )}

      {/* Task Detail Panel */}
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
        />
      )}

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          members={members}
          defaultStatus={defaultStatus}
          onSave={handleModalSave}
          onClose={() => { setShowModal(false); setEditingTask(null); setDefaultStatus(undefined); }}
        />
      )}
    </div>
  );
}
