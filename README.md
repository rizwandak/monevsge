# Sistem Evaluasi Tahunan Proker BEM FILKOM UB 2026 — Kabinet Bumi Cakrawala

Aplikasi web full-stack untuk mengumpulkan evaluasi program kerja (Proker), mengevaluasi sumber daya manusia (SDM), mengolah nilai KPI, membandingkan kinerja Ministry, menentukan Best Ministry, serta menghasilkan dokumentasi evaluasi tahunan BEM FILKOM Universitas Brawijaya.

## Technology Stack

- **Frontend:** React.js, Vite.js, Tailwind CSS, React Router DOM, Axios, Lucide React, React Hook Form, Zod, Recharts
- **Backend:** Node.js, Express.js (ES Modules), Nodemon, Supabase JS Client, Zod, CORS, Helmet, Morgan, dotenv
- **Database & Auth:** Supabase PostgreSQL, Supabase Auth (Google OAuth `@student.ub.ac.id`), Row Level Security (RLS)

## Struktur Project

```text
sistem-evaluasi-bem-filkom/
├── frontend/          # Aplikasi React + Vite + Tailwind CSS
├── backend/           # REST API Express.js + Nodemon
├── supabase/          # Skema SQL & dokumentasi database (Phase 2)
├── docs/              # Dokumentasi arsitektur, API, dan user flow
├── .gitignore
├── package.json
└── README.md
```

## Instalasi

1. Install seluruh dependencies (root, frontend, dan backend):
   ```bash
   npm run install:all
   ```

2. Konfigurasi environment variables:
   - Salin `frontend/.env.example` menjadi `frontend/.env`
   - Salin `backend/.env.example` menjadi `backend/.env`
   - Isi kredensial Supabase pada masing-masing file `.env`.

## Menjalankan Aplikasi (Development)

Jalankan frontend dan backend secara bersamaan:
```bash
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000`
- **Health Check:** `GET http://localhost:5000/api/v1/health`

Menjalankan secara terpisah:
```bash
npm run dev:frontend
npm run dev:backend
```

## Build Frontend

```bash
npm run build
```
