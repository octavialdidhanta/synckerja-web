# Shared Supabase — Dokumentasi Antar Project

Database Supabase **dipakai bersama** oleh:

| Project | Repo / path | File handoff |
|---------|-------------|--------------|
| **synckerja-web** | `synckerja-web` (marketing + CMS admin) | [`synckerja-web`](./synckerja-web) |
| **synckerja** | Office app (`office.synckerja.com`) | [`synckerja`](./synckerja) |

## Alur kerja

1. Tim **synckerja-web** mengubah DB → update [`synckerja-web`](./synckerja-web) + file di `supabase/migrations/`
2. Serahkan salinan `documents/synckerja-web` + file migration ke tim **synckerja**
3. Tim **synckerja** copy migration ke repo mereka sebelum/sesudah apply ke Supabase shared
4. Sebaliknya: perubahan dari **synckerja** didokumentasikan di [`synckerja`](./synckerja) dan diserahkan ke **synckerja-web**

## Prinsip aman (shared DB)

- **Additive first**: tambah tabel/RPC baru, hindari ubah RLS/trigger office tanpa koordinasi
- CMS admin: pola `SECURITY DEFINER` + guard `is_cms_admin()`, bukan RLS write ke tabel tenant
- Jangan apply migration ke production tanpa review tim lain jika menyentuh tabel yang dipakai office
- Setiap entry wajib cantumkan: dampak ke office, status apply, langkah untuk tim lain

## Template entry baru

Lihat [`TEMPLATE-synckerja-web.md`](./TEMPLATE-synckerja-web.md).
