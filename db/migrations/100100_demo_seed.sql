-- Wave 10 demo seed (fixed UUIDs). Idempotent. Applied by DemoSeedFactory, not Connection.applySchema.

INSERT OR IGNORE INTO plan (id, name, status, created_at, updated_at) VALUES
  ('c10a0002-2222-4222-8222-000000000001', 'Plus', 'active',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z');

INSERT OR IGNORE INTO app_user (
  id, name, nick_name, cellphone, email, role, status, auth_user_id, created_at, updated_at
) VALUES
  ('c10a0001-1111-4111-8111-000000000001', 'Great Kids Admin', 'Admin', NULL,
   'admin@example.com', 'Admin', 'active', NULL,
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0001-1111-4111-8111-000000000002', 'Great Kids Operator', 'Operator', NULL,
   'operator@example.com', 'Operator', 'active', NULL,
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0001-1111-4111-8111-000000000003', 'Marina Alves', 'Marina', NULL,
   'marina@example.com', 'Parent', 'active', NULL,
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z');

INSERT OR IGNORE INTO family_profile (
  id, quiz_answer, rhythms, achievements, profile_notes, deleted, created_at, updated_at
) VALUES (
  'c10a0003-3333-4333-8333-000000000001',
  '{"id":"c10a0003-3333-4333-8333-000000000012","quiz_answer":[]}',
  '{"id":"c10a0003-3333-4333-8333-000000000013","rhythms":[]}',
  '{"id":"c10a0003-3333-4333-8333-000000000014","achievements":[]}',
  NULL, 0, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'
);

INSERT OR IGNORE INTO family_diary (
  id, family_notes, mission_note, deleted, created_at, updated_at
) VALUES (
  'c10a0003-3333-4333-8333-000000000002',
  '{"id":"c10a0003-3333-4333-8333-000000000015","notes":[]}',
  '{"id":"c10a0003-3333-4333-8333-000000000016","notes":[]}',
  0, '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'
);

INSERT OR IGNORE INTO family (
  id, fam_profile_id, fam_diary_id, status, family_members, address,
  missions_completed, score, plan_id, created_at, updated_at
) VALUES (
  'c10a0003-3333-4333-8333-000000000010',
  'c10a0003-3333-4333-8333-000000000001',
  'c10a0003-3333-4333-8333-000000000002',
  'active',
  '{"id":"c10a0003-3333-4333-8333-000000000011","members":[{"user_id":"c10a0001-1111-4111-8111-000000000003","user_nickname":"Marina","user_role":"Parent"},{"user_id":null,"user_nickname":"Leo","user_role":"Child"}]}',
  '{"street":"Rua das Acacias","number":"120","neighborhood":"Jardim","city":"Porto Alegre","state":"RS","zip_code":"90450-000"}',
  1, 0, 'c10a0002-2222-4222-8222-000000000001',
  '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'
);

INSERT OR IGNORE INTO mission (
  id, status, title, description, img_path, type, weight, rules, repeatable, deleted,
  format, review_status, category_id, age_min, age_max, duration_minutes, setting, "values",
  created_at, updated_at
) VALUES
  ('c10a0004-4444-4444-8444-000000000001', 'active', 'Movie night',
   'Pick a short film and talk about one kind moment.',
   'great-kids/demo/movie-night.png', 'Activity', 1, NULL, 1, 0, 'Quick-Win', 'published',
   'f43929c0-ec67-51da-aeb9-9e461f57f364', 4, 12, 30, 'Indoor',
   '{"id":"c10a0008-8888-4888-8888-000000000001","values":[]}',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0004-4444-4444-8444-000000000002', 'active', 'Cartoon Saturday',
   'Watch a cartoon together and name a feeling you saw.',
   'great-kids/demo/cartoon-saturday.png', 'Activity', 1, NULL, 1, 0, 'Quick-Win', 'published',
   'f43929c0-ec67-51da-aeb9-9e461f57f364', 3, 10, 20, 'Indoor',
   '{"id":"c10a0008-8888-4888-8888-000000000002","values":[]}',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0004-4444-4444-8444-000000000003', 'active', 'Bedtime story',
   'Read two pages and ask what happened next.',
   'great-kids/demo/bedtime-story.png', 'Activity', 1, NULL, 1, 0, 'Quick-Win', 'published',
   '5f9e8bba-8e25-5ad2-8ee9-8e9df3473ca1', 3, 9, 15, 'Indoor',
   '{"id":"c10a0008-8888-4888-8888-000000000003","values":[]}',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0004-4444-4444-8444-000000000004', 'active', 'Paper boats',
   'Fold two boats and race them in a sink.',
   'great-kids/demo/paper-boats.png', 'Activity', 1, NULL, 1, 0, 'Quick-Win', 'published',
   '903ef6ee-ee16-5335-8868-e635f8acb830', 4, 11, 25, 'Indoor',
   '{"id":"c10a0008-8888-4888-8888-000000000004","values":[]}',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0004-4444-4444-8444-000000000005', 'active', 'Living room fort',
   'Build a fort with blankets and tell a tiny adventure.',
   'great-kids/demo/living-room-fort.png', 'Quality-time', 1, NULL, 1, 0, 'Signature', 'published',
   '6198064b-d949-518d-9dae-c50f48b46d3a', 3, 12, 40, 'Indoor',
   '{"id":"c10a0008-8888-4888-8888-000000000005","values":[]}',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0004-4444-4444-8444-000000000007', 'active', 'Draft telescope',
   'Unpublished watch idea.',
   'great-kids/demo/draft-telescope.png', 'Activity', 0, NULL, 0, 0, 'Quick-Win', 'draft',
   'f43929c0-ec67-51da-aeb9-9e461f57f364', NULL, NULL, NULL, 'Indoor',
   '{"id":"c10a0008-8888-4888-8888-000000000007","values":[]}',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0004-4444-4444-8444-000000000008', 'active', 'Draft clay animals',
   'Unpublished make idea.',
   'great-kids/demo/draft-clay.png', 'Activity', 0, NULL, 0, 0, 'Quick-Win', 'draft',
   '903ef6ee-ee16-5335-8868-e635f8acb830', NULL, NULL, NULL, 'Indoor',
   '{"id":"c10a0008-8888-4888-8888-000000000008","values":[]}',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z');

INSERT OR IGNORE INTO curated_material (
  id, type, status, title, description, feat_img_path, file_path, deleted,
  last_curated_at, created_at, updated_at
) VALUES
  ('c10a0005-5555-4555-8555-000000000001', 'Book', 'Can-use', 'Idea Book',
   'Placeholder catalog book.', 'great-kids/demo/idea-book.png',
   'great-kids/demo/idea-book.pdf', 0, '2026-01-15T00:00:00Z',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0005-5555-4555-8555-000000000002', 'Activity', 'Can-use', 'Paper boats sheet',
   'Folding steps.', 'great-kids/demo/boats-sheet.png',
   'great-kids/demo/boats-sheet.pdf', 0, '2026-01-15T00:00:00Z',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0005-5555-4555-8555-000000000003', 'Book', 'Can-use', 'Feelings reader',
   'Short feelings story.', 'great-kids/demo/feelings-reader.png',
   'great-kids/demo/feelings-reader.pdf', 0, '2026-01-15T00:00:00Z',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0005-5555-4555-8555-000000000004', 'Activity', 'Can-use', 'Fort checklist',
   'What to gather for a fort.', 'great-kids/demo/fort-checklist.png',
   'great-kids/demo/fort-checklist.pdf', 0, '2026-01-15T00:00:00Z',
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z');

INSERT OR IGNORE INTO family_quiz (
  id, question_text, status, weight, kind, deleted, created_at, updated_at
) VALUES
  ('c10a0006-6666-4666-8666-000000000001',
   'What made everyone laugh this week?', 'active', 1, 'Family-Quiz', 0,
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z'),
  ('c10a0006-6666-4666-8666-000000000002',
   'If the mascot had a secret talent, what would it be?', 'active', 1, 'Say-What', 0,
   '2026-01-15T00:00:00Z', '2026-01-15T00:00:00Z');

INSERT OR IGNORE INTO family_mission (
  id, fam_id, mission_id, status, accepted_at, completed_at, closing, title, created_at, updated_at
) VALUES
  ('c10a0007-7777-4777-8777-000000000001',
   'c10a0003-3333-4333-8333-000000000010',
   'c10a0004-4444-4444-8444-000000000005',
   'Accepted', '2026-01-16T00:00:00Z', NULL, NULL, 'Living room fort',
   '2026-01-16T00:00:00Z', '2026-01-16T00:00:00Z'),
  ('c10a0007-7777-4777-8777-000000000002',
   'c10a0003-3333-4333-8333-000000000010',
   'c10a0004-4444-4444-8444-000000000004',
   'Completed', '2026-01-14T00:00:00Z', '2026-01-14T18:00:00Z',
   '{"do_again":true,"save_memory":true}', 'Paper boats',
   '2026-01-14T00:00:00Z', '2026-01-14T18:00:00Z');
