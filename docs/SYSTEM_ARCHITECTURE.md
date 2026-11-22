# System Architecture — Sistem Evaluasi Tahunan BEM FILKOM UB 2026

## 1. Arsitektur Umum
Aplikasi dibangun menggunakan arsitektur monorepo terpisah antara **Frontend** (`React + Vite + Tailwind CSS`) dan **Backend** (`Node.js + Express.js`), dengan **Supabase PostgreSQL** sebagai database utama.

## 2. Lapisan Backend
- **Routes (`backend/src/routes/`):** Definisi endpoint REST API (`/api/v1/*`).
- **Middlewares (`backend/src/middlewares/`):** `authenticate.js` (verifikasi `x-profile-id` / JWT Supabase), `authorize.js` (RBAC berbasis `user_assignments`), `validate.js` (validasi payload Zod), `notFound.js`, dan `errorHandler.js`.
- **Controllers (`backend/src/controllers/`):** Menangani request/response dan business logic per domain (`auth`, `organization`, `user`, `program`, `evaluation`, `hr`, `kpi`, `leaderboard`).
- **Config (`backend/src/config/`):** `environment.js` dan `supabase.js` (`supabaseAdmin` menggunakan Secret / Service Role Key hanya di sisi server).

## 3. Keamanan
- `SUPABASE_SERVICE_ROLE_KEY` tidak pernah dikirim ke frontend.
- Seluruh tabel utama di Supabase mengaktifkan Row Level Security (RLS) dengan helper `SECURITY DEFINER` non-recursive.
- Penguncian deadline evaluasi divalidasi di backend sebelum menyimpan atau men-submit formulir.
