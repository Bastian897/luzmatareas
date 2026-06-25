-- ============================================================
-- LuzmaTV Tareas — Autenticación por usuario/contraseña
-- ============================================================

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password TEXT,
  ADD COLUMN IF NOT EXISTS is_boss  BOOLEAN NOT NULL DEFAULT FALSE;

-- Jefe inicial (se ignora si ya existe)
INSERT INTO team_members (name, role, color, initials, username, password, is_boss)
VALUES ('Jefe', 'Jefe', '#0055FF', 'JF', 'jefeluzma123', 'luzma123', true)
ON CONFLICT (username) DO NOTHING;
