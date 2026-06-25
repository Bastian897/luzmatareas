-- ============================================================
-- LuzmaTV Tareas — Asignaciones múltiples por tarea
-- ============================================================

CREATE TABLE task_assignees (
  task_id   UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, member_id)
);

CREATE INDEX idx_task_assignees_member ON task_assignees(member_id);

ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for task_assignees"
  ON task_assignees FOR ALL USING (true) WITH CHECK (true);

-- Migrar asignaciones existentes
INSERT INTO task_assignees (task_id, member_id)
SELECT id, assignee_id FROM tasks WHERE assignee_id IS NOT NULL;

-- Eliminar columna vieja
ALTER TABLE tasks DROP COLUMN assignee_id;
