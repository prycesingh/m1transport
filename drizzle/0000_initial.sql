CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state varchar(8) NOT NULL,
  reporter_name varchar(255) NOT NULL,
  incident_date varchar(32) NOT NULL,
  recipient_email varchar(255) NOT NULL DEFAULT 'operations@m1transport.com.au',
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_reports_created_at_idx
  ON incident_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS incident_reports_state_idx
  ON incident_reports (state);

CREATE INDEX IF NOT EXISTS incident_reports_reporter_name_idx
  ON incident_reports (reporter_name);