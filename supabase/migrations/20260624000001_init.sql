-- ============================================================
-- LuzmaTV Tareas — Schema inicial
-- ============================================================

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  color      TEXT NOT NULL,
  initials   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'pendiente'
              CHECK (status IN ('pendiente', 'en-progreso', 'en-revision', 'completado')),
  priority    TEXT NOT NULL DEFAULT 'media'
              CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
  assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  due_date    DATE,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES team_members(id) ON DELETE SET NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: enable but allow all for anon (no auth in this app)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for team_members"
  ON team_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for tasks"
  ON tasks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for comments"
  ON comments FOR ALL USING (true) WITH CHECK (true);
