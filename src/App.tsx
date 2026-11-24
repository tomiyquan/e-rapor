import { useState } from "react";
import type { Berkas } from "./domain/types";
import { useBerkas } from "./state/BerkasContext";
import { BantuanView } from "./ui/BantuanView";
import { BerkasView } from "./ui/BerkasView";
import { CetakView } from "./ui/CetakView";
import { KelengkapanView } from "./ui/KelengkapanView";
import { NilaiView } from "./ui/NilaiView";
import { RombelView } from "./ui/RombelView";
import { SimpanView } from "./ui/SimpanView";

type Layar = "berkas" | "rombel" | "murid" | "mapel" | "nilai" | "kelengkapan" | "cetak" | "simpan" | "bantuan";

interface Langkah {
  id: Exclude<Layar, "bantuan">;
  data: string;
  label: string;
  ringkas: string;
  judul: string;
  urut: string[];
}

const LANGKAH: Langkah[] = [
  {
    id: "berkas",
    data: "Berkas",
    label: "Sekolah",
    ringkas: "Identitas",
    judul: "Mulai dari identitas sekolah",
    urut: [
      "Isi nama satuan pendidikan, jenjang, dan semester pada formulir.",
      "Klik Buat berkas sekolah. Satu berkas menyimpan satu semester.",
      "Kalau komputer ini sudah pernah dipakai, pilih rapor pada daftar atau buat semester baru.",
    ],
  },
  {
    id: "rombel",
    data: "Rombel",
    label: "Rombel",
    ringkas: "Kelas",
    judul: "Buat rombel",
    urut: [
      "Klik Tambah rombel, lalu isi kelas, nama rombel, dan wali kelas pada jendela.",
      "Daftar rombel tampil sebagai tabel. Wali kelas bisa diubah langsung pada barisnya.",
      "Langkah Murid terbuka setelah sedikitnya satu rombel tersimpan.",
    ],
  },
  {
    id: "murid",
    data: "Murid",
    label: "Murid",
    ringkas: "Siswa",
    judul: "Daftarkan murid pada rombel",
    urut: [
      "Pilih rombel yang sudah dibuat.",
      "Klik Tambah murid. Isi nama, NISN, dan agama pada jendela, lalu simpan. Agama menentukan mata pelajaran agama di rapor.",
      "Bila ada seni, pilih satu jenis untuk tiap murid.",
    ],
  },
  {
    id: "mapel",
    data: "Mapel",
    label: "Mapel",
    ringkas: "Cara nilai",
    judul: "Pilih cara nilai dan mata pelajaran",
    urut: [
      "Pilih rapor semester atau asesmen penuh. Pilihan ini berlaku untuk rombel yang sedang dibuka.",
      "Isi ambang rombel. Angka itu dipakai semua mapel, dan langkah Nilai terbuka setelah ambang terisi. Isi kolom Ambang pada satu mapel bila KKM-nya berbeda.",
      "Pilih cara hitung tiap mapel. Tab Nilai mengikuti pilihan itu: bobot hanya muncul pada pembobotan.",
      "Centang Nilai terakhir bila tujuan berurutan dan saling menjadi syarat. Nilai rapor lalu memakai tujuan terakhir yang terisi.",
    ],
  },
  {
    id: "nilai",
    data: "Nilai",
    label: "Nilai",
    ringkas: "Isian guru",
    judul: "Masukkan nilai dari guru mapel",
    urut: [
      "Ikuti nomor pada halaman: pilih mapel, susun kegiatan, lalu isi nilai.",
      "Capaian kompetensi terisi sendiri setelah ada angka. Sunting kalimat bila perlu.",
      "Langkah Kelengkapan terbuka setelah sedikitnya satu nilai tersimpan.",
    ],
  },
  {
    id: "kelengkapan",
    data: "Kelengkapan",
    label: "Kelengkapan",
    ringkas: "Selain nilai",
    judul: "Lengkapi bagian rapor di luar nilai",
    urut: [
      "Pilih rombel, lalu pilih nama murid pada daftar.",
      "Isi ketidakhadiran. Centang dimensi kokurikuler dan susun narasinya. Kotak narasi memuat contoh.",
      "Tambahkan ekstrakurikuler dan catatan wali kelas. Pada semester genap, catat keputusan musyawarah.",
    ],
  },
  {
    id: "cetak",
    data: "Cetak",
    label: "Cetak",
    ringkas: "Rapor",
    judul: "Periksa kelengkapan, lalu cetak",
    urut: [
      "Baca daftar murid. Mapel tanpa deskripsi dan kokurikuler yang kosong disebut di sana.",
      "Pilih murid untuk melihat rapor sebelum dicetak.",
      "Cetak rapor atau leger, lalu lanjut ke langkah Simpan.",
    ],
  },
  {
    id: "simpan",
    data: "Simpan",
    label: "Simpan",
    ringkas: "Arsip",
    judul: "Simpan rapor di komputer ini",
    urut: [
      "Klik Simpan rapor. Semester ini masuk ke daftar pada tab Sekolah.",
      "Berkas .erapor.json ikut terunduh sebagai cadangan untuk komputer lain.",
      "Saat aplikasi dibuka lagi, pilih rapor itu atau buat rapor semester berikutnya.",
    ],
  },
];

function langkahSelesai(id: Langkah["id"], berkas: Berkas | null, tersimpanDiArsip: boolean): boolean {
  if (!berkas) return false;
  if (id === "berkas") return true;
  if (id === "rombel") return berkas.rombel.length > 0;
  if (id === "murid") return berkas.murid.length > 0;
  if (id === "mapel") return berkas.rombel.length > 0 && berkas.rombel.every((item) => typeof item.ambang === "number" && !Number.isNaN(item.ambang));
  if (id === "nilai") {
    return berkas.nilaiSumatif.some((item) => item.nilai !== null) || berkas.nilaiTujuan.some((item) => item.nilai !== null);
  }
  if (id === "kelengkapan" || id === "cetak") return berkas.kokurikuler.some((item) => item.deskripsi.trim().length > 0);
  return tersimpanDiArsip && berkas.kokurikuler.some((item) => item.deskripsi.trim().length > 0);
}

function langkahTerbuka(id: Langkah["id"], berkas: Berkas | null, tersimpanDiArsip: boolean): boolean {
  const indeks = LANGKAH.findIndex((item) => item.id === id);
  if (indeks <= 0) return true;
  return LANGKAH.slice(0, indeks).every((item) => langkahSelesai(item.id, berkas, tersimpanDiArsip));
}

function judulLangkah(aktif: Layar, berkas: Berkas | null, adaRiwayat: boolean): string {
  if (aktif === "berkas" && berkas) return "Periksa identitas semester ini";
  if (aktif === "berkas" && adaRiwayat) return "Pilih rapor atau buat yang baru";
  const indeks = LANGKAH.findIndex((item) => item.id === aktif);
  return LANGKAH[indeks]?.judul ?? "";
}

function isiLangkah(aktif: Layar, berkas: Berkas | null, adaRiwayat: boolean): string[] {
  if (aktif === "berkas" && berkas) {
    return [
      "Periksa identitas, tahun ajaran, dan tanggal rapor.",
      "Klik Perbarui identitas bila ada yang diubah.",
      "Rapor masuk ke daftar komputer pada langkah Simpan, setelah cetak.",
    ];
  }
  if (aktif === "berkas" && adaRiwayat) {
    return [
      "Pilih rapor pada daftar, lalu klik Buka rapor.",
      "Klik Buat rapor baru untuk semester berikutnya. Identitas sekolah disalin dan masih bisa diubah.",
      "Berkas .erapor.json dari komputer lain dibuka lewat Buka berkas.",
    ];
  }
  const indeks = LANGKAH.findIndex((item) => item.id === aktif);
  return LANGKAH[indeks]?.urut ?? [];
}

function petunjukBerikut(berkas: Berkas | null, tersimpanDiArsip: boolean): string {
  if (!berkas) return `Ikuti langkah 1 sampai ${LANGKAH.length}. Mulai dari tab Sekolah.`;
  const belum = LANGKAH.find((item) => !langkahSelesai(item.id, berkas, tersimpanDiArsip));
  if (!belum) return "Semua langkah sudah terisi. Rapor semester ini tersimpan di komputer ini.";
  return `Berikutnya: langkah ${LANGKAH.indexOf(belum) + 1}, ${belum.label.toLowerCase()}.`;
}

export function App() {
  const { siap, berkas, draf, arsip, adaPerubahan, tersimpanDiArsip } = useBerkas();
  const [layar, setLayar] = useState<Layar>("berkas");
  if (!siap) return <p className="isi">Membuka salinan kerja…</p>;

  const indeks = LANGKAH.findIndex((item) => item.id === layar);
  const langkah = indeks >= 0 ? LANGKAH[indeks] : null;
  const aktif: Layar = langkah && !berkas && langkah.id !== "berkas" ? "berkas" : layar;
  const indeksAktif = LANGKAH.findIndex((item) => item.id === aktif);

  function bukaLangkah(id: Layar) {
    if (id === "bantuan") {
      setLayar(id);
      return;
    }
    if (!langkahTerbuka(id, berkas, tersimpanDiArsip)) return;
    setLayar(id);
  }

  return (
    <div className="aplikasi">
      <header className="kepala jangan-cetak">
        <div className="baris-merek">
          <div className="merek">
            <strong>E-Rapor</strong>
            <span>{berkas ? `${berkas.sekolah.nama} · ${berkas.sekolah.jenjang}` : "Belum ada berkas sekolah"}</span>
          </div>
          <div className="sisi-kepala">
            <button type="button" className={aktif === "bantuan" ? "tautan-bantuan aktif" : "tautan-bantuan"} onClick={() => bukaLangkah("bantuan")}>
              Bantuan
            </button>
            <p className="status-simpan">
              {petunjukBerikut(berkas, tersimpanDiArsip)}
              {berkas && adaPerubahan ? " Perubahan belum disimpan pada langkah Simpan." : ""}
            </p>
          </div>
        </div>
        <nav className="nav langkah-nav" aria-label="Langkah pengisian rapor">
          {LANGKAH.map((item, urutan) => {
            const selesai = langkahSelesai(item.id, berkas, tersimpanDiArsip);
            const terkunci = !langkahTerbuka(item.id, berkas, tersimpanDiArsip);
            return (
              <button
                key={item.id}
                type="button"
                data-langkah={item.data}
                className={[aktif === item.id ? "aktif" : "", selesai ? "selesai" : ""].filter(Boolean).join(" ")}
                disabled={terkunci}
                title={terkunci ? "Selesaikan langkah sebelumnya terlebih dahulu" : undefined}
                onClick={() => bukaLangkah(item.id)}
              >
                <span className="nomor">{selesai && aktif !== item.id ? "✓" : urutan + 1}</span>
                <span className="nama-langkah">
                  {item.label}
                  <small>{item.ringkas}</small>
                </span>
              </button>
            );
          })}
        </nav>
      </header>
      <main className="isi">
        {langkah && aktif !== "bantuan" && (
          <section className="pengantar jangan-cetak">
            <p className="kicker">Langkah {indeksAktif + 1} dari {LANGKAH.length}</p>
            <h2>{judulLangkah(aktif, berkas, draf !== null || arsip.length > 0)}</h2>
            <ol>
              {isiLangkah(aktif, berkas, draf !== null || arsip.length > 0).map((kalimat) => (
                <li key={kalimat}>{kalimat}</li>
              ))}
            </ol>
          </section>
        )}
        {aktif === "berkas" && <BerkasView />}
        {aktif === "rombel" && <RombelView bagian="kelas" />}
        {aktif === "murid" && <RombelView bagian="murid" />}
        {aktif === "mapel" && <RombelView bagian="mapel" />}
        {aktif === "nilai" && <NilaiView />}
        {aktif === "kelengkapan" && <KelengkapanView />}
        {aktif === "cetak" && <CetakView />}
        {aktif === "simpan" && <SimpanView />}
        {aktif === "bantuan" && <BantuanView />}
        {aktif !== "bantuan" && (
          <div className="jejak jangan-cetak">
            <button className="tombol kedua" type="button" onClick={() => bukaLangkah(LANGKAH[Math.max(0, indeksAktif - 1)].id)} disabled={indeksAktif <= 0}>
              Kembali
            </button>
            {indeksAktif < LANGKAH.length - 1 && (
              <button
                className="tombol"
                type="button"
                onClick={() => bukaLangkah(LANGKAH[indeksAktif + 1].id)}
                disabled={!langkahSelesai(LANGKAH[indeksAktif].id, berkas, tersimpanDiArsip)}
              >
                Lanjut ke {LANGKAH[indeksAktif + 1].label}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
