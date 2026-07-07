# 🚀 PANDUAN DEPLOY — AS REALTY

## LANGKAH 1: Supabase Setup

1. Buka https://supabase.com → New Project
2. Catat: **Project URL** & **Anon Key** (Settings → API)
3. Buka **SQL Editor** → New Query
4. Copy-paste seluruh isi file `supabase-schema.sql` → Run

### Setup Storage
Sudah otomatis dibuat oleh SQL. Tapi verifikasi di:
- Supabase Dashboard → Storage
- Pastikan ada bucket: `listing-photos` dan `listing-videos`
- Keduanya harus **Public**

### Buat Admin Pertama
1. Register via halaman `/auth/register` dengan email admin kamu
2. Buka Supabase → SQL Editor → jalankan:
```sql
UPDATE profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'emailkamu@gmail.com');
```

---

## LANGKAH 2: GitHub Setup

```bash
# Buat repo baru di github.com, lalu:
git init
git add .
git commit -m "feat: initial AS REALTY app"
git branch -M main
git remote add origin https://github.com/USERNAME/as-realty.git
git push -u origin main
```

---

## LANGKAH 3: Deploy ke Vercel

### Opsi A: Via Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Opsi B: Via Vercel Dashboard (Lebih mudah)
1. Buka https://vercel.com → Add New Project
2. Import dari GitHub → pilih repo `as-realty`
3. **Environment Variables** — tambahkan:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxxxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJxxxxx... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJxxxxx... (dari Settings → API → service_role) |

4. Klik **Deploy** → tunggu 2-3 menit
5. ✅ Aplikasi live!

---

## LANGKAH 4: Konfigurasi Supabase Auth

Setelah dapat URL Vercel (misal: `https://as-realty.vercel.app`):

1. Supabase → Authentication → URL Configuration
2. **Site URL**: `https://as-realty.vercel.app`
3. **Redirect URLs**: tambahkan `https://as-realty.vercel.app/**`

---

## FITUR TAMBAHAN (Opsional)

### A. Google Maps Embed
Tambahkan Google Maps JavaScript API key untuk menampilkan peta di listing detail.

### B. Push Notification
Gunakan Supabase Realtime untuk notifikasi ke admin ketika listing baru ditambahkan.

### C. Filter & Search
Tambahkan filter berdasarkan:
- Kota
- Rentang harga
- Jumlah kamar
- Luas tanah/bangunan

### D. Watermark Foto
Gunakan Supabase Edge Functions + Sharp untuk auto-watermark foto dengan nama agent.

---

## CATATAN PENTING

### Batasan Video Upload
- Max file: 150MB (~2 menit video 720p)
- Format: MP4, MOV, AVI
- Supabase Storage free tier: **1GB total**
- Upgrade ke Pro untuk lebih banyak storage

### WhatsApp Number Format
Nomor WA harus format internasional: `628xxxxxxxx`
- Benar: `6281234567890`
- Salah: `081234567890` atau `+6281234567890`

### SEO
Tambahkan metadata di setiap halaman listing untuk SEO:
```tsx
export const metadata = {
  title: listing.title,
  description: listing.description,
  openGraph: { images: [coverPhoto.url] }
}
```
