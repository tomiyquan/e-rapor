# E-Rapor Offline

Aplikasi rapor untuk wali kelas SD/MI, SMP/MTs, SMA, dan SMK. Format cetak mengikuti Panduan Pembelajaran dan Asesmen BSKAP Kemendikdasmen edisi revisi 2025. Data sekolah disimpan sebagai berkas di komputer, tanpa internet dan tanpa XAMPP.

## Membuka

Buka `e-rapor.html` dengan Chrome, Edge, atau Firefox. Tidak perlu memasang aplikasi lain.

Isi identitas sekolah, lalu simpan berkas `.erapor.json` ke komputer atau flashdisk. Bawa berkas itu bila pindah komputer.

Untuk membangun ulang halaman itu dari kode sumber:

```bash
npm install
npm test
npm run build
```

Petunjuk langkah wali kelas, cara olah nilai, dan daftar sumber resmi ada di halaman Bantuan di dalam aplikasi.

Pengiriman nilai ke Dapodik dan pengisian PDSS tetap dilakukan lewat e-Rapor resmi direktorat. Aplikasi ini menyediakan rekap nilai akhir untuk disalin bila sekolah juga wajib melapor ke sana.
