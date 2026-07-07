# Cara Pasang Fix Keamanan — AS Realty

## 1. Jalankan SQL migration
Buka Supabase SQL Editor → jalankan file `supabase-migration-security-hardening.sql`
(paste isi lengkapnya, run sekali).

Ini otomatis memperbaiki:
- Privilege escalation lewat update `profiles` (role/plan/badge/kuota)
- Role admin bisa diinjeksi saat signup
- Storage `banner-images` yang bukan admin-only
- Storage listing/service foto-video yang tidak scoped per-user
- Bukti transfer pembayaran yang bisa dilihat publik

## 2. Ganti 2 file kode ini di project kamu
- `app/dashboard/upgrade/UpgradeRequestForm.tsx`
- `app/admin/UpgradeRequestsPanel.tsx`

Kenapa perlu diganti: migration SQL bikin bucket `payment-proofs` jadi
**private** (poin #5). Kalau kode lama tetap dipakai (pakai `getPublicUrl`),
gambar bukti transfer TIDAK akan muncul lagi di panel admin (403/broken image).
File baru ini pakai `createSignedUrl()` yang jalan otomatis untuk bucket private.

## 3. Setelah deploy, coba tes manual
- Login sebagai agent biasa, buka console browser, coba jalankan:
  `supabase.from('profiles').update({role:'admin'}).eq('id', <uid sendiri>)`
  → harus GAGAL dengan error "Tidak diizinkan mengubah role sendiri"
- Coba upgrade paket via form biasa → upload bukti → cek di panel admin,
  gambar harus tetap muncul (via signed URL)
- Coba akses langsung public URL foto bukti transfer lama (kalau ada) →
  harus sudah tidak bisa diakses lagi

## Catatan
- Kolom `proof_url` di tabel `upgrade_requests` sekarang tidak lagi dipakai
  untuk request baru (selalu null), tapi kolomnya tetap ada di skema —
  aman, tidak perlu di-drop kecuali kamu mau beres-beres.
- Trigger baru (`protect_sensitive_profile_columns`) hanya mengunci kolom
  role/plan/badge/kuota. Kolom lain di profil (nama, no WA, avatar, dll)
  tetap bisa diubah agent sendiri seperti biasa.
