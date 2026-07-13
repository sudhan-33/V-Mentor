-- Shared trigger function: keeps updated_at current on every UPDATE.
-- Idempotent (CREATE OR REPLACE) — re-applied on every migrate run.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
