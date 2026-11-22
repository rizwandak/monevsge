-- ============================================================================
-- 10_reports.sql
-- Tabel pengaturan aplikasi, notifikasi, dan annual reports
-- Urutan Eksekusi: 10
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.annual_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_period_label VARCHAR(50) NOT NULL DEFAULT '2026',
  scope_type VARCHAR(30) NOT NULL, -- 'ORGANIZATION', 'DIRECTORATE', 'MINISTRY'
  directorate_id UUID REFERENCES public.directorates(id) ON DELETE SET NULL,
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE SET NULL,
  title VARCHAR(250) NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  includes_sensitive_hr BOOLEAN NOT NULL DEFAULT FALSE,
  generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_report_scope CHECK (scope_type IN ('ORGANIZATION', 'DIRECTORATE', 'MINISTRY'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_annual_reports_scope ON public.annual_reports(scope_type);
