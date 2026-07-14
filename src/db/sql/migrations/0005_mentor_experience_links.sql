-- Mentor work history + taxonomy join tables (M:N with mentor_profiles).

CREATE TABLE IF NOT EXISTS mentor_experiences (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   uuid NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  title       varchar(150) NOT NULL,
  company     varchar(150),
  location    varchar(150),
  start_date  date,
  end_date    date,                                   -- null = current
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mentor_experiences_mentor ON mentor_experiences (mentor_id);

CREATE TABLE IF NOT EXISTS mentor_categories (
  mentor_id   uuid NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_mentor_categories_category ON mentor_categories (category_id);

CREATE TABLE IF NOT EXISTS mentor_expertise (
  mentor_id uuid NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  tag_id    uuid NOT NULL REFERENCES expertise_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_mentor_expertise_tag ON mentor_expertise (tag_id);

CREATE TABLE IF NOT EXISTS mentor_languages (
  mentor_id   uuid NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  language_id uuid NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, language_id)
);
CREATE INDEX IF NOT EXISTS idx_mentor_languages_language ON mentor_languages (language_id);
