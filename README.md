# 🏠 AS REALTY — Aplikasi Pemasaran Perumahan

Stack: **Next.js 14** · **Supabase** · **Vercel** · **GitHub**

---

## Struktur Fitur

| Fitur | Admin | Agent |
|---|---|---|
| Login / Logout | ✅ | ✅ |
| Kelola Agent | ✅ | ❌ |
| Tambah Listing Rumah | ❌ | ✅ |
| Upload Foto (galeri/kamera) | ❌ | ✅ |
| Upload Video (~2 menit) | ❌ | ✅ |
| Input Spesifikasi Rumah | ❌ | ✅ |
| Input Lokasi Rumah | ❌ | ✅ |
| Foto Profil Agent | ❌ | ✅ |
| Nomor WhatsApp Agent | ❌ | ✅ (profil) |
| Lihat Semua Listing | ✅ | ✅ |
| Hapus/Nonaktifkan Listing | ✅ | ✅ (milik sendiri) |

---

## Setup Cepat

### 1. Clone & Install
```bash
git clone https://github.com/USERNAME/as-realty.git
cd as-realty
npm install
```

### 2. Supabase Setup
Buat project baru di https://supabase.com lalu jalankan SQL di bawah.

### 3. Environment Variables
Buat file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Jalankan Lokal
```bash
npm run dev
```
Buka http://localhost:3000

### 5. Deploy ke Vercel
```bash
npx vercel --prod
```
Tambahkan env variables yang sama di Vercel Dashboard.

---

## Catatan
- Semua halaman (`app/`), middleware proteksi route, dan komponen pendukung
  (`Navbar`, `SpecBadge`) sudah lengkap dan siap pakai — tinggal isi `.env.local`
  dan jalankan SQL schema di Supabase.
- Saat edit listing, foto/video lama belum ditampilkan ulang di form (hanya
  upload baru). Ini bisa dikembangkan lebih lanjut jika dibutuhkan.
- Agent bisa upload foto profil di halaman `/dashboard/profile`. Foto ini
  tampil sebagai avatar kecil di setiap listing card, dan saat customer
  menekan tombol "WhatsApp", muncul popup berisi foto besar agent, nama, dan
  nomor WA sebelum diarahkan ke chat WhatsApp.
- Jangan lupa buat bucket Storage `avatars` (Public) di Supabase — sudah
  termasuk di `supabase-schema.sql`, tinggal jalankan ulang skripnya jika
  bucket belum ada.
- Lihat `DEPLOYMENT.md` untuk panduan deploy lengkap langkah demi langkah.

