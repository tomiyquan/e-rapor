export function BantuanView() {
  return (
    <section className="kartu">
      <h2>Cara memakai</h2>
      <p>Buka <strong>e-rapor.html</strong> dengan Chrome, Edge, atau Firefox. Tidak perlu memasang XAMPP atau server. Bilah di atas halaman adalah urutan kerja wali kelas. Selesaikan satu langkah, lalu klik Lanjut.</p>
      <ol>
        <li><strong>Sekolah.</strong> Isi identitas satuan pendidikan dan semester, atau buka berkas <strong>.erapor.json</strong> yang sudah ada. Simpan berkas itu ke komputer atau flashdisk.</li>
        <li><strong>Rombel.</strong> Buat kelas dan daftarkan murid. Agama murid menentukan mata pelajaran agama. Pilih satu jenis seni bila sekolah menyelenggarakannya.</li>
        <li><strong>Mapel.</strong> Pilih rapor semester atau asesmen penuh, isi ambang ketercapaian sekolah, lalu centang mapel yang diajarkan. Mapel pilihan SMA, kejuruan SMK, dan Bahasa Inggris SD/MI diaktifkan hanya bila memang dipakai.</li>
        <li><strong>Nilai.</strong> Unduh format isian per mata pelajaran untuk guru mapel, lalu impor kembali atau ketik nilainya. Sunting deskripsi sebelum dicetak.</li>
        <li><strong>Kelengkapan.</strong> Isi ketidakhadiran, narasi kokurikuler, ekstrakurikuler, dan catatan wali kelas. Pada semester genap, catat keputusan musyawarah kenaikan kelas.</li>
        <li><strong>Cetak.</strong> Periksa rapor dan leger, lalu simpan berkas sekolah lagi.</li>
      </ol>
      <h2>Yang dihitung</h2>
      <p>
        Nilai akhir hanya berasal dari asesmen sumatif. Asesmen formatif tidak digabung dan tidak menjadi pembagi. Tiga cara hitung dapat dipilih: rata-rata, pembobotan yang membulatkan tiap komponen, atau persentase tujuan yang mencapai ambang sekolah. Bila tujuan pembelajaran bersifat prasyarat berurutan, nilai akhir dapat memakai tujuan terakhir.
      </p>
      <p>
        Deskripsi menyebut kompetensi yang sudah dikuasai dan yang masih perlu pendampingan, dengan kalimat yang dapat diedit sebelum dicetak. Kokurikuler berupa satu narasi dimensi profil lulusan, bukan angka. Rapor tidak memuat peringkat.
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
