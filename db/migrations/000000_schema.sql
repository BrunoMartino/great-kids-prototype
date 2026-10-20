-- Great Kids star schema — SQLite (prototype)
-- Same table/column names as schema.postgres.sql
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Feeders (no hub FK)
-- ---------------------------------------------------------------------------

CREATE TABLE plan (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE UNIQUE INDEX uq_plan_name ON plan (name);

CREATE TABLE app_user (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  nick_name     TEXT NOT NULL,
  cellphone     TEXT,
  email         TEXT,
  role          TEXT NOT NULL CHECK (role IN ('Admin', 'Operator', 'Parent', 'Child')),
  status        TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'suspended', 'blocked')),
  auth_user_id  TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE UNIQUE INDEX uq_app_user_email
  ON app_user (email) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX uq_app_user_auth_user_id
  ON app_user (auth_user_id) WHERE auth_user_id IS NOT NULL;

CREATE TABLE mission_category (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE UNIQUE INDEX uq_mission_category_slug ON mission_category (slug);

CREATE TABLE forecast_context (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE UNIQUE INDEX uq_forecast_context_slug ON forecast_context (slug);

CREATE TABLE family_quiz (
  id            TEXT PRIMARY KEY,
  question_text TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  weight        REAL NOT NULL CHECK (weight >= 0),
  kind          TEXT NOT NULL CHECK (kind IN ('Family-Quiz', 'Say-What')),
  deleted       INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX ix_family_quiz_live
  ON family_quiz (id) WHERE deleted = 0;

CREATE TABLE curated_material (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL CHECK (type IN (
                    'Book', 'Play Manual', 'Activity', 'HandsOn-Activity',
                    'Faith-Teaching', 'Money-Teaching', 'Workout', 'Volunteer'
                  )),
  status          TEXT NOT NULL CHECK (status IN ('Can-use', 'Not-use', 'Need-update')),
  title           TEXT NOT NULL,
  description     TEXT,
  feat_img_path   TEXT,
  file_path       TEXT,
  deleted         INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  last_curated_at TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE INDEX ix_curated_material_can_use
  ON curated_material (id)
  WHERE status = 'Can-use' AND deleted = 0;

CREATE INDEX ix_curated_material_live
  ON curated_material (id) WHERE deleted = 0;

-- ---------------------------------------------------------------------------
-- Hubs: diary + profile first (family points to them)
-- ---------------------------------------------------------------------------

CREATE TABLE family_diary (
  id            TEXT PRIMARY KEY,
  family_notes  TEXT NOT NULL CHECK (json_valid(family_notes)),
  mission_note  TEXT NOT NULL CHECK (json_valid(mission_note)),
  deleted       INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE family_profile (
  id            TEXT PRIMARY KEY,
  quiz_answer   TEXT NOT NULL CHECK (json_valid(quiz_answer)),
  rhythms       TEXT NOT NULL CHECK (json_valid(rhythms)),
  achievements  TEXT NOT NULL CHECK (json_valid(achievements)),
  profile_notes TEXT,
  deleted       INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE family (
  id                  TEXT PRIMARY KEY,
  fam_profile_id      TEXT NOT NULL UNIQUE
                        REFERENCES family_profile (id) ON DELETE RESTRICT,
  fam_diary_id        TEXT NOT NULL UNIQUE
                        REFERENCES family_diary (id) ON DELETE RESTRICT,
  status              TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'suspended', 'blocked')),
  family_members      TEXT NOT NULL CHECK (json_valid(family_members)),
  address             TEXT NOT NULL CHECK (json_valid(address)),
  city                TEXT GENERATED ALWAYS AS (json_extract(address, '$.city')) STORED,
  state               TEXT GENERATED ALWAYS AS (json_extract(address, '$.state')) STORED,
  missions_completed  INTEGER NOT NULL DEFAULT 0 CHECK (missions_completed >= 0),
  score               REAL NOT NULL DEFAULT 0 CHECK (score >= 0),
  plan_id             TEXT REFERENCES plan (id) ON DELETE RESTRICT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE INDEX ix_family_city ON family (city);
CREATE INDEX ix_family_state ON family (state);

CREATE TABLE mission (
  id              TEXT PRIMARY KEY,
  status          TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  title           TEXT NOT NULL,
  description     TEXT,
  img_path        TEXT,
  type            TEXT NOT NULL CHECK (type IN (
                    'Activity', 'Quality-time', 'Conversation',
                    'Workout', 'Faith-Time', 'Money-Time'
                  )),
  weight          REAL NOT NULL DEFAULT 0 CHECK (weight >= 0),
  rules           TEXT,
  repeatable      INTEGER NOT NULL DEFAULT 0 CHECK (repeatable IN (0, 1)),
  deleted         INTEGER NOT NULL DEFAULT 0 CHECK (deleted IN (0, 1)),
  format          TEXT NOT NULL CHECK (format IN (
                    'Quick-Win', 'Signature', 'Mission', 'Say-What'
                  )),
  review_status   TEXT NOT NULL CHECK (review_status IN (
                    'draft', 'in_review', 'published'
                  )),
  category_id     TEXT NOT NULL
                    REFERENCES mission_category (id) ON DELETE RESTRICT,
  age_min         INTEGER,
  age_max         INTEGER,
  duration_minutes INTEGER,
  setting         TEXT CHECK (setting IN ('Indoor', 'Outdoor', 'Either')),
  "values"        TEXT NOT NULL CHECK (json_valid("values")),
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max)
);

CREATE INDEX ix_mission_published_active
  ON mission (id)
  WHERE review_status = 'published' AND status = 'active' AND deleted = 0;

CREATE INDEX ix_mission_live
  ON mission (id) WHERE deleted = 0;

CREATE TABLE family_calendar (
  id                TEXT PRIMARY KEY,
  family_id         TEXT NOT NULL
                      REFERENCES family (id) ON DELETE RESTRICT,
  day               TEXT NOT NULL,
  previous_weather  TEXT,
  notifications     INTEGER NOT NULL DEFAULT 0 CHECK (notifications IN (0, 1)),
  suggestions       TEXT NOT NULL CHECK (json_valid(suggestions)),
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  UNIQUE (family_id, day)
);

CREATE INDEX ix_family_calendar_family_day
  ON family_calendar (family_id, day);

CREATE TABLE family_mission (
  id                TEXT PRIMARY KEY,
  fam_id            TEXT NOT NULL
                      REFERENCES family (id) ON DELETE RESTRICT,
  mission_id        TEXT NOT NULL
                      REFERENCES mission (id) ON DELETE RESTRICT,
  status            TEXT NOT NULL CHECK (status IN ('Accepted', 'Doing', 'Completed')),
  accepted_at       TEXT,
  completed_at      TEXT,
  closing           TEXT CHECK (closing IS NULL OR json_valid(closing)),
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE INDEX ix_family_mission_fam_status
  ON family_mission (fam_id, status);

CREATE TABLE mission_feedback (
  id                 TEXT PRIMARY KEY,
  fam_id             TEXT NOT NULL
                       REFERENCES family (id) ON DELETE CASCADE,
  mission_id         TEXT NOT NULL
                       REFERENCES mission (id) ON DELETE RESTRICT,
  family_mission_id  TEXT NOT NULL
                       REFERENCES family_mission (id) ON DELETE CASCADE,
  feedback_text      TEXT NOT NULL,
  created_at         TEXT NOT NULL
);

CREATE TABLE mission_material (
  id           TEXT PRIMARY KEY,
  mission_id   TEXT NOT NULL
                 REFERENCES mission (id) ON DELETE RESTRICT,
  material_id  TEXT NOT NULL
                 REFERENCES curated_material (id) ON DELETE RESTRICT,
  status       TEXT NOT NULL CHECK (status IN ('Can-use', 'Not-use', 'Need-update')),
  UNIQUE (mission_id, material_id)
);

CREATE TABLE mission_forecast_context (
  id          TEXT PRIMARY KEY,
  mission_id  TEXT NOT NULL
                REFERENCES mission (id) ON DELETE RESTRICT,
  context_id  TEXT NOT NULL
                REFERENCES forecast_context (id) ON DELETE RESTRICT,
  UNIQUE (mission_id, context_id)
);

CREATE TABLE family_invite (
  id          TEXT PRIMARY KEY,
  family_id   TEXT NOT NULL
                REFERENCES family (id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('Parent', 'Child')),
  status      TEXT NOT NULL CHECK (status IN (
                'Pending', 'Accepted', 'Revoked', 'Expired'
              )),
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX ix_family_invite_family_status
  ON family_invite (family_id, status);

-- ---------------------------------------------------------------------------
-- Seeds (fixed UUIDs — identical in schema.postgres.sql)
-- ---------------------------------------------------------------------------

INSERT INTO plan (id, name, status, created_at, updated_at) VALUES
  ('24bcd40e-7ae3-581c-b8b9-65b1f11b0ac1', 'Free', 'active',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');

INSERT INTO mission_category (id, slug, name, created_at, updated_at) VALUES
  ('f43929c0-ec67-51da-aeb9-9e461f57f364', 'watch', 'Watch',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('5f9e8bba-8e25-5ad2-8ee9-8e9df3473ca1', 'read', 'Read',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('903ef6ee-ee16-5335-8868-e635f8acb830', 'make', 'Make',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('8aa0a4e0-fc69-5619-ad12-330be2b4768e', 'cook', 'Cook',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('6198064b-d949-518d-9dae-c50f48b46d3a', 'play', 'Play',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('9fc90015-b5df-5869-9eb4-fb25e3a5cb35', 'go', 'Go',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('295b83e7-3a2e-54a7-bb5c-adf71dcbba40', 'listen', 'Listen',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('796f78fc-0ea1-5d1a-b47b-79731cd065d6', 'talk', 'Talk',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('3a1a0986-b841-52be-b2f1-d87f07a7529b', 'grow', 'Grow',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('59e8145d-f34a-56a7-88ea-d0d2815f20d5', 'faith', 'Faith',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('d711796b-809f-5980-bedc-0bd671ccdf08', 'serve', 'Serve',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('2f980f29-d8e8-5567-912d-3790d6d7e88a', 'celebrate', 'Celebrate',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');

INSERT INTO forecast_context (id, slug, name, created_at, updated_at) VALUES
  ('26533182-4f8b-58e3-83ef-3e551d134baf', 'rain', 'Rain',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('4a8e6fcd-1549-5ce9-bcc2-f47370659e34', 'holiday', 'Holiday',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('7c17c48d-fb07-5e87-8600-2c159a549832', 'christmas', 'Christmas',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('2ff3462e-70ba-5dca-b4ce-992c39a414c6', 'back-to-school', 'Back to school',
   '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
