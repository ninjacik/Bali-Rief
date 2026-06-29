---
name: Bali Tanggap Bencana stack
description: Architecture decisions and sharp edges for the disaster coordination platform
---

# Bali Tanggap Bencana

## Stack
- React+Vite frontend at `/` (port 26240), Express 5 API at `/api` (port 8080)
- Drizzle ORM + PostgreSQL, 7 tables: laporan, kebutuhan, relawan, inventaris+transaksi_inventaris, penugasan, users, donasi
- All API hooks generated from OpenAPI spec via Orval → `@workspace/api-client-react`
- Auth: session-based via express-session + bcryptjs (pure JS, no native build issues)

## Auth system
- `POST /api/auth/register` — creates user + sets session cookie
- `POST /api/auth/login` — sets session cookie
- `GET /api/auth/me` — returns 401 if not logged in (expected, not a bug)
- `POST /api/auth/logout` — destroys session
- Roles: admin, relawan, donatur, pelapor
- Session stored in memory (express-session default), cookie maxAge 7 days
- AuthContext (`artifacts/bencana-bali/src/context/AuthContext.tsx`) — React context wrapping the whole Router in App.tsx

## Key decisions
- `AuthProvider` wraps `<Router>` inside `<WouterRouter>` in App.tsx — both must be present for `useAuth()` to work in any page
- AppLayout now accepts `role: "donatur"` and has a logout button (LogOut icon) shown if `showLogout` prop is set or user is logged in
- kebutuhan table field is `nama_item` (NOT `nama_barang`) — watch for this in display code
- `foto_urls` and `keahlian` stored as JSON arrays in Postgres
- `/api/laporan/aktif` returns laporan where status ≠ 'selesai' with a `jumlah_kebutuhan_pending` count
- `/api/donatur/bencana-aktif` returns active laporan with embedded kebutuhan[], koordinator name, and posko[] list
- `/api/transparansi/laporan` is public (no auth required), returns full laporan data with foto_penyerahan (dummy), relawan_bertugas, donasi[]
- Inventory transaksi updates stok_masuk/keluar/sisa atomically; stok_sisa computed on write, not on read
- Seed script: `pnpm --filter @workspace/scripts run seed-bencana` (clears all tables first)
- bcryptjs used instead of bcrypt to avoid native build script approval requirement in Replit

**Why:** App is fully functional end-to-end with auth. These notes prevent re-discovering TypeScript friction points and auth architecture choices.
