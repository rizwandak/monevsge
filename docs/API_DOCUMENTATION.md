# API Documentation (`/api/v1`)

Format response standar:
- Sukses: `{ "success": true, "message": "...", "data": {} }`
- Error: `{ "success": false, "message": "...", "errors": [] }`

## Health Check
- `GET /api/v1/health` — Public

## Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login-name` — Login dengan `{ full_name }`
- `GET /api/v1/auth/me` — Profil & daftar penugasan pengguna aktif
- `GET /api/v1/auth/assignments` — Daftar penugasan role
- `POST /api/v1/auth/select-role` — Verifikasi role aktif
- `POST /api/v1/auth/logout` — Logout

## Organization (`/api/v1/organization`)
- `GET /api/v1/organization/directorates` — Daftar Directorate beserta Ministry
- `GET /api/v1/organization/ministries` — Daftar Ministry (filter opsional `?directorate_id=`)
- `GET /api/v1/organization/ministries/:id` — Detail Ministry & anggota

## Users (`/api/v1/users`) — Role: `ADMIN`
- `GET /api/v1/users` — Daftar seluruh pengguna
- `POST /api/v1/users` — Tambah pengguna & penugasan role
- `PATCH /api/v1/users/:id` — Update pengguna
- `DELETE /api/v1/users/:id` — Hapus pengguna

## Programs (`/api/v1/programs`)
- `GET /api/v1/programs` — Daftar Proker sesuai scope role
- `GET /api/v1/programs/:id` — Detail Proker, PIC OC, indikator, & submission
- `POST /api/v1/programs` — Tambah Proker (`ADMIN`, `DIRECTOR`)
- `PATCH /api/v1/programs/:id` — Edit Proker (`ADMIN`, `DIRECTOR`)
- `DELETE /api/v1/programs/:id` — Hapus Proker (`ADMIN`, `DIRECTOR`)
- `POST /api/v1/programs/:id/committee` — Tambah PIC OC
- `POST /api/v1/programs/:id/indicators` — Tambah indikator Proker

## Program Evaluations (`/api/v1/evaluations`)
- `GET /api/v1/evaluations/programs` — Daftar Proker untuk evaluasi
- `GET /api/v1/evaluations/programs/:programId` — Detail evaluasi Proker (SC & OC)
- `POST /api/v1/evaluations/programs/:programId/draft` — Simpan draft SC/OC
- `POST /api/v1/evaluations/programs/:programId/submit` — Submit evaluasi SC/OC
- `POST /api/v1/evaluations/programs/:programId/review` — Review & perbandingan Director

## HR Evaluations (`/api/v1/hr`)
- `GET /api/v1/hr/templates/:type` — Template `C_LEVEL` atau `STAFF` + kandidat *paling gacor*
- `GET /api/v1/hr/evaluations` — Daftar submission SDM sesuai scope
- `POST /api/v1/hr/evaluations/draft` — Simpan draft evaluasi SDM
- `POST /api/v1/hr/evaluations/:id/submit` — Submit evaluasi SDM
- `POST /api/v1/hr/interviews` — Catatan wawancara (`DIRECTOR`, `ADMIN`)
- `POST /api/v1/hr/observations` — Catatan observasi (`DIRECTOR`, `ADMIN`)
- `POST /api/v1/hr/findings/:id/verify` — Verifikasi temuan (`DIRECTOR`, `ADMIN`)

## KPI & Leaderboard (`/api/v1/kpi`, `/api/v1/leaderboard`)
- `GET /api/v1/kpi/configuration` — Kategori, indikator, rubrik, dan bobot
- `GET /api/v1/kpi/results` — Hasil KPI seluruh Ministry
- `POST /api/v1/kpi/director-review/:ministryId` — Penilaian Director (75%)
- `POST /api/v1/kpi/kd-assess/:ministryId` — Penilaian KD (25%)
- `POST /api/v1/kpi/calculate/:ministryId` — Hitung KPI Final
- `GET /api/v1/leaderboard` — Peringkat Ministry & Best Ministry
