-- ============================================================
-- LuzmaTV Tareas — Seed data
-- 8 miembros + 13 tareas
-- ============================================================

DO $$
DECLARE
  lucia_id   UUID;
  mateo_id   UUID;
  sofia_id   UUID;
  diego_id   UUID;
  carla_id   UUID;
  tomas_id   UUID;
  valeria_id UUID;
  javier_id  UUID;
BEGIN
  -- Insert team members
  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Lucía Martín', 'Diseñadora', '#E91E8C', 'LM')
    RETURNING id INTO lucia_id;

  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Mateo Sánchez', 'Camarógrafo', '#43A047', 'MS')
    RETURNING id INTO mateo_id;

  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Sofía Pérez', 'Editora Video', '#0055FF', 'SP')
    RETURNING id INTO sofia_id;

  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Diego Ramírez', 'Dev Backend', '#0A0F2C', 'DR')
    RETURNING id INTO diego_id;

  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Carla Vázquez', 'Productora', '#29B6F6', 'CV')
    RETURNING id INTO carla_id;

  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Tomás Herrera', 'Guionista', '#FDD835', 'TH')
    RETURNING id INTO tomas_id;

  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Valeria Cruz', 'Social Media', '#E91E8C', 'VC')
    RETURNING id INTO valeria_id;

  INSERT INTO team_members (name, role, color, initials)
    VALUES ('Javier Núñez', 'Director', '#111111', 'JN')
    RETURNING id INTO javier_id;

  -- Insert tasks
  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Subir episodios a plataforma streaming',
      'completado', 'alta', sofia_id, '2026-06-20',
      ARRAY['Distribución']
    );

  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Render final del especial de Halloween',
      'en-revision', 'urgente', sofia_id, '2026-06-21',
      ARRAY['Edición', 'Especial']
    );

  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Programar publicaciones semanales en redes',
      'completado', 'media', valeria_id, '2026-06-22',
      ARRAY['Social', 'Marketing']
    );

  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Revisar contratos de patrocinio Q3',
      'pendiente', 'urgente', carla_id, '2026-06-23',
      ARRAY['Legal', 'Patrocinio']
    );

  INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Editar episodio piloto temporada 3',
      'Incluir intro nueva, corregir audio del segmento 2 y agregar gráficas finales.',
      'en-progreso', 'urgente', sofia_id, '2026-06-24',
      ARRAY['Edición', 'Piloto']
    );

  INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Grabar entrevista con artista invitado',
      'Locación: estudio B. Duración estimada 90 min. Llevar kit de audio Rode.',
      'en-progreso', 'alta', mateo_id, '2026-06-25',
      ARRAY['Producción', 'Entrevista']
    );

  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Diseñar miniaturas para YouTube',
      'pendiente', 'media', lucia_id, '2026-06-28',
      ARRAY['Diseño', 'YouTube']
    );

  INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Analítica canal YouTube Q2',
      'Reporte de performance: vistas, suscriptores, CTR, watch time. Comparar con Q1.',
      'en-revision', 'alta', valeria_id, '2026-06-30',
      ARRAY['Marketing', 'Analítica']
    );

  INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Migrar CMS de notas',
      'Pasar de Notion a CMS propio. Endpoints: /notas y /guiones. Auth con Supabase.',
      'en-progreso', 'media', diego_id, '2026-07-03',
      ARRAY['Backend', 'Web']
    );

  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Reunión kickoff temporada 3',
      'pendiente', 'alta', javier_id, '2026-07-05',
      ARRAY['Producción', 'Reunión']
    );

  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Comprar equipo de iluminación nuevo',
      'pendiente', 'baja', mateo_id, '2026-07-07',
      ARRAY['Compras', 'Equipo']
    );

  INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Escribir guión episodio 5 temporada 3',
      'Tema: IA en la música. Entrevistas a 3 artistas. Duración guión: 45 min.',
      'en-progreso', 'alta', tomas_id, '2026-07-01',
      ARRAY['Guión', 'Temporada 3']
    );

  INSERT INTO tasks (title, status, priority, assignee_id, due_date, tags)
    VALUES (
      'Crear identidad visual nueva temporada',
      'en-revision', 'media', lucia_id, '2026-07-10',
      ARRAY['Diseño', 'Branding']
    );

END $$;
