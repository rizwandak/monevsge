-- ============================================================================
-- 16_seed_all_programs.sql
-- Seed seluruh Program Kerja dari Grand Design BEM FILKOM UB 2026
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================================

INSERT INTO public.programs (directorate_id, ministry_id, name, evaluation_period_label)
SELECT m.directorate_id, m.id, v.prog_name, '2026'
FROM (VALUES
  -- Student Advocacy & Welfare (MIN-SAW)
  ('MIN-SAW', 'Kabar Beasiswa'),
  ('MIN-SAW', 'Scholarship Festival (Schotival)'),
  ('MIN-SAW', 'Suarkan Asa'),
  ('MIN-SAW', 'Terkesima'),
  ('MIN-SAW', 'Rumah Advokasi'),
  ('MIN-SAW', 'Crisis Center Bantuan Keuangan'),
  ('MIN-SAW', 'Advo Siaga'),
  ('MIN-SAW', 'Halo Maba'),

  -- Inter-Agency Affairs (MIN-IAA)
  ('MIN-IAA', 'Studi Banding'),
  ('MIN-IAA', 'FILKOM Goes To School'),
  ('MIN-IAA', 'FILKOM Awarding Festival'),
  ('MIN-IAA', 'Organization & Community Fun-Day'),
  ('MIN-IAA', 'Grand Launching Lembaga & Komunitas FILKOM'),
  ('MIN-IAA', 'SGE Actively Maintaining Bonds And Nurturing Growth (SAMBANG)'),

  -- Social Equity & Environment (MIN-SEE)
  ('MIN-SEE', 'FILKOM Mengajar'),
  ('MIN-SEE', 'FILKOM Peduli'),
  ('MIN-SEE', 'SJW FILKOM'),
  ('MIN-SEE', 'EnviroACT'),
  ('MIN-SEE', 'EDULIS'),

  -- Studies & Strategic Action (MIN-SSA)
  ('MIN-SSA', 'POLARIS (Politik dalam Aksi Realitas Inspiratif)'),
  ('MIN-SSA', 'KARADOKS (Kajian Riset dan Aksi Dokumenter)'),
  ('MIN-SSA', 'RESONANSI (Refleksi Sosial dan Analisis)'),
  ('MIN-SSA', 'ROUTER (Roastingan Terkini)'),

  -- IT Solutions (MIN-ITS)
  ('MIN-ITS', 'Web Event Request'),
  ('MIN-ITS', 'Website BEM'),
  ('MIN-ITS', 'BEM Apps'),
  ('MIN-ITS', 'IT Partnership'),

  -- Creative Media & Information (MIN-CMI)
  ('MIN-CMI', 'Gala Premiere SGE FILKOM UB 2026'),
  ('MIN-CMI', 'PROLOG'),
  ('MIN-CMI', 'Media Partnership and Engagement'),
  ('MIN-CMI', 'FILKOM Your Page (FYP)'),
  ('MIN-CMI', 'Kiprah Kinerja'),
  ('MIN-CMI', 'Company Profile'),
  ('MIN-CMI', 'Value Magazine'),
  ('MIN-CMI', 'EPILOG'),

  -- Administration & Finance (MIN-AF)
  ('MIN-AF', 'Pengarsipan dan Pengelolaan Proposal dan Laporan Pertanggungjawaban'),
  ('MIN-AF', 'Pengarsipan dan Pengelolaan Surat, Sertifikat, dan Dokumen Pendukung Lainnya'),
  ('MIN-AF', 'Regulasi Peminjaman Ruang dan Barang FILKOM'),
  ('MIN-AF', 'Support Center dan Jumat Bersih'),
  ('MIN-AF', 'Pengelolaan Inventaris dan Sekretariat BEM FILKOM'),
  ('MIN-AF', 'Buku Panduan Administrasi dan Keuangan'),
  ('MIN-AF', 'Laporan Keuangan Internal'),
  ('MIN-AF', 'Laporan Keuangan Eksternal')
) AS v(min_code, prog_name)
JOIN public.ministries m ON m.code = v.min_code
ON CONFLICT (ministry_id, name, evaluation_period_label) DO NOTHING;
