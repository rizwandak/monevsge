-- ============================================================================
-- 04_users_and_roles.sql
-- Tabel profil pengguna, penugasan role, dan keanggotaan ministry
-- Urutan Eksekusi: 4
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  nim VARCHAR(32),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_ub_email_domain CHECK (
    email IS NULL OR LOWER(email) LIKE '%@student.ub.ac.id'
  )
);

CREATE TABLE IF NOT EXISTS public.user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  directorate_id UUID REFERENCES public.directorates(id) ON DELETE SET NULL,
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_assignment UNIQUE (profile_id, role, directorate_id, ministry_id)
);

CREATE TABLE IF NOT EXISTS public.ministry_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_name VARCHAR(150) NOT NULL,
  position_title VARCHAR(100) NOT NULL, -- Contoh: 'C-Level', 'Staff'
  is_c_level BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_assignments_profile_id ON public.user_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_role ON public.user_assignments(role);
CREATE INDEX IF NOT EXISTS idx_user_assignments_ministry_id ON public.user_assignments(ministry_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_directorate_id ON public.user_assignments(directorate_id);
CREATE INDEX IF NOT EXISTS idx_ministry_members_ministry_id ON public.ministry_members(ministry_id);
CREATE INDEX IF NOT EXISTS idx_ministry_members_profile_id ON public.ministry_members(profile_id);
