-- Unified users + role-specific profiles (see docs/vmentor.dbml §Identity).

CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          varchar(255) NOT NULL UNIQUE,
  phone          varchar(20) UNIQUE,
  password_hash  varchar(255),
  role           user_role NOT NULL,
  full_name      varchar(150) NOT NULL,
  photo_url      text,
  status         user_status NOT NULL DEFAULT 'pending',
  auth_provider  auth_provider NOT NULL DEFAULT 'local',
  provider_sub   varchar(255),
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  last_login_at  timestamptz,
  metadata       jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_provider
  ON users (auth_provider, provider_sub) WHERE provider_sub IS NOT NULL;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS student_profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline   varchar(200),
  goals      text,
  interests  text,
  metadata   jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  designation            varchar(150),
  company                varchar(150),
  years_of_experience    int DEFAULT 0,
  bio                    text,
  base_session_price     decimal(12,2) NOT NULL DEFAULT 0,
  currency               char(3) NOT NULL DEFAULT 'INR',
  default_session_minutes int NOT NULL DEFAULT 60,
  timezone               varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
  verification_status    mentor_verification_status NOT NULL DEFAULT 'pending',
  is_accepting_bookings  boolean NOT NULL DEFAULT true,
  rating_avg             decimal(3,2) NOT NULL DEFAULT 0,
  rating_count           int NOT NULL DEFAULT 0,
  lifetime_earnings      decimal(14,2) NOT NULL DEFAULT 0,
  metadata               jsonb NOT NULL DEFAULT '{}',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  deleted_at             timestamptz
);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_verification ON mentor_profiles (verification_status);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_accepting ON mentor_profiles (is_accepting_bookings);

DROP TRIGGER IF EXISTS trg_mentor_profiles_updated_at ON mentor_profiles;
CREATE TRIGGER trg_mentor_profiles_updated_at BEFORE UPDATE ON mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
