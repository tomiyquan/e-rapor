import { TombolPanduan } from "./Panduan";

export function BantuanView() {
  return (
    <section className="kartu">
      <div className="baris-judul">
        <h2>Cara memakai</h2>
        <TombolPanduan src="demo/panduan-bantuan.mp4" judul="keseluruhan" />
      </div>
      <p>Buka <strong>e-rapor.html</strong> dengan Chrome, Edge, atau Firefox. Tidak perlu memasang XAMPP atau server. Bilah di atas halaman adalah urutan kerja wali kelas. Langkah berikutnya baru bisa dibuka setelah langkah yang sedang dikerjakan terisi. Tombol <strong>Lihat panduan</strong> di kanan judul memutar video langkah itu langsung di halaman.</p>
      <ol>
        <li><strong>Sekolah.</strong> Pemakaian pertama: isi identitas satuan pendidikan dan semester. Bila komputer ini sudah menyimpan rapor, pilih rapor pada daftar atau buat rapor semester baru. Berkas <strong>.erapor.json</strong> dari komputer lain tetap bisa dibuka.</li>
        <li><strong>Rombel.</strong> Klik Tambah rombel. Isi kelas, nama rombel, dan wali kelas pada jendela. Daftar rombel tampil sebagai tabel.</li>
        <li><strong>Murid.</strong> Klik Tambah murid, isi data pada jendela, lalu simpan. Agama murid menentukan mata pelajaran agama. Pilih satu jenis seni bila sekolah menyelenggarakannya.</li>
        <li><strong>Mapel.</strong> Pilih rapor semester atau asesmen penuh. Ambang rombel berlaku untuk semua mapel; isi ambang pada baris mapel bila KKM-nya berbeda. Cara hitung tiap mapel diikuti tab Nilai. Centang Nilai terakhir bila tujuan berurutan dan saling menjadi syarat.</li>
        <li><strong>Nilai.</strong> Ikuti nomor 1, 2, dan 3 pada halaman. Capaian kompetensi terisi sendiri setelah angka nilai ada. Bila ada lebih dari satu tujuan, semuanya disebut dalam kalimat, lalu masih bisa disunting.</li>
        <li><strong>Kelengkapan.</strong> Pilih rombel, lalu pilih nama murid. Isi ketidakhadiran dan narasi kokurikuler. Dimensi dicentang. Bukti yang sudah baik dan yang masih perlu pendampingan diketik wali kelas; contohnya tertulis di dalam kotak. Pada semester genap, catat keputusan musyawarah kenaikan kelas.</li>
        <li><strong>Cetak.</strong> Periksa rapor dan leger, lalu cetak. Unduh rekap bila perlu.</li>
        <li><strong>Simpan.</strong> Klik Simpan rapor. Semester ini masuk ke daftar di tab Sekolah, dan berkas <strong>.erapor.json</strong> terunduh sebagai cadangan. Semester yang sama diperbarui. Semester lain tetap tersimpan terpisah.</li>
      </ol>
      <h2>Yang dihitung</h2>
      <p>
        Nilai akhir hanya berasal dari asesmen sumatif. Asesmen formatif tidak digabung dan tidak menjadi pembagi. Tiap mapel punya cara hitung sendiri. Rata-rata tidak memakai bobot. Pembobotan menampilkan bobot yang jumlahnya 100% dan tiap komponen dibulatkan. Persentase menghitung bagian nilai yang mencapai ambang mapel, atau ambang rombel bila mapel tidak diisi sendiri. Nilai terakhir dipakai bila tujuan berurutan: angka rapor adalah tujuan terakhir yang terisi.
      </p>
      <p>
        Deskripsi menyebut kompetensi yang sudah dikuasai dan yang masih perlu pendampingan. Kalimat itu terisi otomatis dari nilai, lalu dapat diedit sebelum dicetak. Kokurikuler berupa satu narasi dimensi profil lulusan, bukan angka. Rapor murid tidak memuat peringkat. Peringkat hanya ada pada berkas rekap, diurut dari nomor 1.
      </p>
      <h2>Sumber</h2>
      <ul>
        <li>Panduan Pembelajaran dan Asesmen, BSKAP Kemendikdasmen, edisi revisi 2025.</li>
        <li>Panduan Kokurikuler Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah, 2025.</li>
        <li>Permendikbudristek Nomor 12 Tahun 2024 tentang Kurikulum pada PAUD, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah.</li>
        <li>Keputusan Kepala BSKAP Nomor 032/H/KR/2024 tentang Capaian Pembelajaran pada Kurikulum Merdeka, untuk penamaan fase.</li>
        <li>Keputusan Menteri Agama Nomor 1503 Tahun 2025 untuk susunan mata pelajaran MI dan MTs.</li>
      </ul>
      <p>
        Paket kurikulum pada berkas ini bertanda <strong>kemendikdasmen-ppa-2025</strong>. Berkas tahun ajaran yang sudah tersimpan tetap bisa dibuka. Pengiriman nilai ke Dapodik dan pengisian PDSS tetap dilakukan melalui e-Rapor resmi direktorat. Rekap nilai akhir dapat diunduh untuk disalin ke sana.
      </p>
    </section>
  );
}
