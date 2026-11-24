# E-Rapor Offline

Aplikasi rapor untuk wali kelas SD/MI, SMP/MTs, SMA, dan SMK. Satu komputer, tanpa internet, dan tanpa XAMPP. Guru mata pelajaran tidak masuk ke aplikasi. Wali kelas mengunduh lembar isian, menerima nilainya, lalu mengimpor atau mengetik dan mencetak rapor.

Format cetak mengikuti 12 komponen Panduan Pembelajaran dan Asesmen BSKAP Kemendikdasmen, edisi revisi 2025. Susunan mata pelajaran mengikuti Permendikbudristek Nomor 12 Tahun 2024 dan, untuk MI/MTs, Keputusan Menteri Agama Nomor 1503 Tahun 2025. Berkas sekolah bertanda paket kurikulum `kemendikdasmen-ppa-2025`.

Nilai akhir hanya dihitung dari asesmen sumatif. Pilihannya rata-rata, pembobotan, atau persentase ketercapaian. Kokurikuler tetap narasi, tanpa angka. Lembar rapor murid tidak memuat peringkat. Peringkat hanya ditulis pada berkas rekap, dari nomor 1 untuk rata-rata tertinggi.

Pengiriman nilai ke Dapodik dan pengisian PDSS tetap lewat e-Rapor resmi direktorat. Rekap di aplikasi ini dipakai bila sekolah perlu menyalin angka ke sana.

## Cara membuka

Buka `e-rapor.html` dengan Chrome, Edge, atau Firefox. Tidak perlu memasang aplikasi lain.

Untuk membangun ulang halaman itu dari kode sumber:

```bash
npm install
npm test
npm run build
```

Perintah `npm run build` menulis ulang `e-rapor.html`.

## Cara memakai

Tujuh langkah di bilah atas dikunci berurutan. Langkah berikutnya baru terbuka setelah langkah yang sedang dikerjakan terisi. Langkah yang sudah lewat tetap bisa dibuka.

1. **Sekolah.** Isi identitas satuan pendidikan dan semester, lalu klik Buat berkas sekolah. Atau buka berkas `.erapor.json` yang sudah ada. Simpan berkas itu ke komputer atau flashdisk.
2. **Rombel.** Klik Tambah rombel. Isi kelas, nama rombel, dan wali kelas pada jendela. Daftar rombel tampil sebagai tabel.
3. **Murid.** Klik Tambah murid. Isi nama, NISN, dan agama pada jendela. Agama menentukan mata pelajaran agama. Seni dipilih pada baris murid.
4. **Mapel.** Pilih rapor semester atau asesmen penuh, lalu isi ambang rombel. Angka itu berlaku untuk semua mapel. Isi kolom ambang pada satu mapel bila KKM-nya berbeda. Langkah Nilai terbuka setelah ambang rombel terisi.
5. **Nilai.** Ikuti nomor pada halaman: pilih mapel, sesuaikan kegiatan, lalu isi angka. Capaian kompetensi terisi sendiri setelah ada nilai, dan masih bisa disunting.
6. **Kelengkapan.** Pilih rombel, lalu pilih nama murid. Isi ketidakhadiran, narasi kokurikuler, ekstrakurikuler, dan catatan wali kelas. Kotak kokurikuler memuat contoh narasi. Pada semester genap, catat keputusan musyawarah.
7. **Cetak.** Periksa rapor dan leger, lalu cetak. Unduh rekap bila perlu. Rekap mengurutkan murid dari peringkat 1.

Setelah selesai, kembali ke Sekolah dan klik Simpan berkas.

## Video tutorial

Rekaman langkah ada di folder `demo` pada repositori ini:

- `demo/langkah-e-rapor.mp4`, alur pengisian dari awal
- `demo/tata-letak-formulir.mp4`, tata letak formulir
- `demo/tab-murid-terpisah.mp4`, tab Murid terpisah dari Rombel
- `demo/pengaturan-mapel-kkm-cara-hitung.mp4`, ambang, cara hitung, dan nilai terakhir
- `demo/modal-tambah-murid.mp4`, penambahan murid lewat jendela

Petunjuk yang sama, plus daftar sumber resmi, ada di halaman Bantuan di dalam aplikasi.

## Kontributor

- [tomiyquan](https://github.com/tomiyquan), pemilik repositori.
- Penyempurnaan aplikasi dibantu Cursor Agent.
