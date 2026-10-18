CREATE TABLE public.plan_progress (
  device_hash text NOT NULL CHECK (length(device_hash) = 64),
  profile_key text NOT NULL CHECK (length(profile_key) BETWEEN 1 AND 64),
  day smallint NOT NULL CHECK (day BETWEEN 1 AND 30),
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_hash, profile_key, day)
);
GRANT ALL ON public.plan_progress TO service_role;
ALTER TABLE public.plan_progress ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.plan_progress IS 'Private day completion only. Access requires a server-verified HttpOnly device capability; no questionnaire answers are stored. No direct anonymous or authenticated Data API access.';