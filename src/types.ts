export type Status = 'pendiente' | 'en-progreso' | 'en-revision' | 'completado';
export type Priority = 'baja' | 'media' | 'alta' | 'urgente';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  initials: string;
  username?: string;
  password?: string;
  is_boss?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignees: TeamMember[];
  assignee_ids?: string[];   // transitorio: solo para envío desde el formulario
  due_date?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id?: string;
  author?: TeamMember;
  text: string;
  created_at: string;
}
