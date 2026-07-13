-- Enum types (subset needed for identity & auth; full set lives in the data model).
-- pgcrypto provides gen_random_uuid() on older PG; built-in on PG 13+.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE auth_provider AS ENUM ('local', 'google');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mentor_verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE auth_token_type AS ENUM ('refresh', 'email_verify', 'password_reset', 'otp');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
