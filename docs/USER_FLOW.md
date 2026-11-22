# User Flow — Sistem Evaluasi Tahunan BEM FILKOM UB 2026

## 1. Alur Login
1. Pengguna membuka `/login` dan memasukkan **Nama Lengkap** yang terdaftar.
2. Sistem memverifikasi ke `POST /api/v1/auth/login-name`.
3. Jika memiliki lebih dari 1 role, pengguna diarahkan ke `/select-role`. Jika hanya 1 role, langsung masuk ke dashboard role tersebut.

## 2. Alur C-Level
- Mengisi **Evaluasi Proker (SC)** untuk Proker pada Ministry-nya (`/c-level/evaluations/programs`).
- Mengisi **Evaluasi SDM C-Level** termasuk pertanyaan khusus *staff paling gacor* (`/c-level/evaluations/hr`).

## 3. Alur Staff
- Mengisi **Evaluasi SDM Staff** termasuk pertanyaan khusus *C-level paling gacor* (`/staff/evaluations/hr`).

## 4. Alur Kapel / Wakapel (OC)
- Mengisi **Evaluasi Proker (OC)** untuk Proker yang menjadi tanggung jawabnya (`/oc/evaluations/programs`).

## 5. Alur Director
- Mengelola Proker di Directorate-nya (`/director/programs`).
- Meninjau Evaluasi Proker SC & OC (`/director/evaluations/programs`).
- Mengisi **KPI Assessment** bobot 75% (`/director/kpi`) dan memantau **Leaderboard** (`/director/leaderboard`).

## 6. Alur KD
- Mengisi **Penilaian KD** bobot 25% (`/kd/assessments`) dan melihat **Leaderboard** (`/kd/results`).

## 7. Alur Admin
- Mengelola pengguna dan penugasan role (`/admin/users`) serta seluruh Proker (`/admin/programs`).
