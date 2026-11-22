-- ============================================================================
-- 03_organization.sql
-- Tabel master organisasi: directorates & ministries
-- Urutan Eksekusi: 3
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.directorates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  directorate_id UUID NOT NULL REFERENCES public.directorates(id) ON DELETE RESTRICT,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ministries_directorate_id ON public.ministries(directorate_id);
CREATE INDEX IF NOT EXISTS idx_ministries_name ON public.ministries(name);
