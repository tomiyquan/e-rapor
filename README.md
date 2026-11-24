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

Delapan langkah di bilah atas dikunci berurutan. Langkah berikutnya baru terbuka setelah langkah yang sedang dikerjakan terisi. Langkah yang sudah lewat tetap bisa dibuka. Tiap langkah punya tombol **Lihat panduan** di kanan judul. Video diputar langsung di halaman.

1. **Sekolah.** Pemakaian pertama: isi identitas satuan pendidikan dan semester, lalu klik Buat berkas sekolah. Bila komputer ini sudah menyimpan rapor, pilih rapor pada daftar atau buat rapor semester baru. Berkas `.erapor.json` dari komputer lain tetap bisa dibuka.
2. **Rombel.** Klik Tambah rombel. Isi kelas, nama rombel, dan wali kelas pada jendela. Daftar rombel tampil sebagai tabel.
3. **Murid.** Klik Tambah murid. Isi nama, NISN, dan agama pada jendela. Agama menentukan mata pelajaran agama. Seni dipilih pada baris murid.
4. **Mapel.** Pilih rapor semester atau asesmen penuh, lalu isi ambang rombel. Angka itu berlaku untuk semua mapel. Isi kolom ambang pada satu mapel bila KKM-nya berbeda. Langkah Nilai terbuka setelah ambang rombel terisi.
5. **Nilai.** Ikuti nomor pada halaman: pilih mapel, sesuaikan kegiatan, lalu isi angka. Capaian kompetensi terisi sendiri setelah ada nilai, dan masih bisa disunting.
6. **Kelengkapan.** Pilih rombel, lalu pilih nama murid. Isi ketidakhadiran, narasi kokurikuler, ekstrakurikuler, dan catatan wali kelas. Kotak kokurikuler memuat contoh narasi. Pada semester genap, catat keputusan musyawarah.
7. **Cetak.** Periksa rapor dan leger, lalu cetak. Unduh rekap bila perlu. Rekap mengurutkan murid dari peringkat 1.
8. **Simpan.** Klik Simpan rapor. Semester ini masuk ke daftar di tab Sekolah, dan berkas `.erapor.json` terunduh sebagai cadangan. Saat aplikasi dibuka lagi, rapor itu bisa dipilih. Semester yang sama diperbarui. Semester lain tetap tersimpan terpisah.

## Video tutorial

Rekaman langkah ada di folder `demo` pada repositori ini. Tombol Lihat panduan memutar video langkah yang sedang dibuka:

- `demo/panduan-sekolah.mp4`, identitas sekolah
- `demo/panduan-rombel.mp4`, rombel
- `demo/panduan-murid.mp4`, murid
- `demo/panduan-mapel.mp4`, mata pelajaran
- `demo/panduan-nilai.mp4`, nilai
- `demo/panduan-kelengkapan.mp4`, kelengkapan
- `demo/panduan-cetak.mp4`, cetak
- `demo/panduan-simpan.mp4`, simpan rapor
- `demo/panduan-bantuan.mp4`, seluruh langkah

Rekaman sebelumnya tetap ada:

- `demo/langkah-e-rapor.mp4`, alur pengisian dari awal
- `demo/tata-letak-formulir.mp4`, tata letak formulir
- `demo/tab-murid-terpisah.mp4`, tab Murid terpisah dari Rombel
- `demo/pengaturan-mapel-kkm-cara-hitung.mp4`, ambang, cara hitung, dan nilai terakhir
- `demo/modal-tambah-murid.mp4`, penambahan murid lewat jendela

Petunjuk yang sama, plus daftar sumber resmi, ada di halaman Bantuan di dalam aplikasi.

## Kontributor

- [tomiyquan](https://github.com/tomiyquan), pemilik repositori.
- Penyempurnaan aplikasi dibantu Cursor Agent.
