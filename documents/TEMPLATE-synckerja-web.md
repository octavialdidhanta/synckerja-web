# [YYYY-MM-DD] Judul singkat perubahan

**Project sumber:** synckerja-web  
**Author:** nama  
**Status apply Supabase:** [ ] Belum apply · [x] Sudah apply · [ ] Rollback  

## Ringkasan

Satu kalimat: apa yang berubah dan mengapa.

## File migration

| File | Jenis |
|------|-------|
| `supabase/migrations/YYYYMMDDHHMMSS_nama.sql` | ADD table / ADD RPC / ALTER … |

## Objek database

### Tabel baru
- `public.nama_tabel` — deskripsi singkat

### RPC / fungsi baru atau diubah
- `public.nama_rpc(...)` — deskripsi, guard (`is_cms_admin()` dll.)

## Dampak ke project synckerja (office)

- [ ] **Tidak ada dampak** — additive only, office tidak perlu ubah kode
- [ ] **Perlu review** — jelaskan tabel/fungsi yang disentuh
- [ ] **Breaking** — jelaskan apa yang bisa error di office dan mitigasi

**Detail dampak:**

- RLS existing diubah? **Ya/Tidak**
- Trigger existing diubah? **Ya/Tidak**
- Kolom/tabel yang dibaca office: …

## Yang harus dilakukan tim synckerja

1. Copy file migration ke `supabase/migrations/` repo synckerja (nama file sama)
2. Review SQL (terutama jika ada ALTER/RLS/trigger)
3. Apply ke Supabase shared (jika belum di-apply dari synckerja-web)
4. Test: … (cantumkan skenario)

## Rollback / koreksi

Cara memperbaiki jika salah apply: …

---

_Hapus section di atas dan isi untuk entry baru. Tambahkan entry terbaru di **bagian atas** file [`synckerja-web`](./synckerja-web)._
