import { labelKelompok } from "./kurikulum";
import { drafDeskripsi, type ButirDeskripsi } from "./deskripsi";
import { hitungNilaiAkhir, type ButirHitung, type HasilHitung } from "./nilai";
import type { Berkas, Mapel, Murid, Rombel } from "./types";

export interface BarisRapor {
  mapelId: string;
  nama: string;
  kelompokLabel: string | null;
  nilai: number | null;
  deskripsi: string;
  pesan: string | null;
  pkl: boolean;
}

export function muridRombel(berkas: Berkas, rombelId: string): Murid[] {
  return berkas.murid
    .filter((item) => item.rombelId === rombelId)
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}

export function mapelRombel(berkas: Berkas, rombelId: string): Mapel[] {
  return berkas.mapel.filter((item) => item.rombelId === rombelId).sort((a, b) => a.urutan - b.urutan);
}

export function mengikuti(berkas: Berkas, murid: Murid, mapel: Mapel): boolean {
  if (!mapel.aktif || mapel.rombelId !== murid.rombelId) return false;
  if (mapel.berlakuUntuk === "semua") return true;
  return berkas.pilihan.some((item) => item.muridId === murid.id && item.mapelId === mapel.id);
}

export function butirMurid(berkas: Berkas, rombel: Rombel, mapel: Mapel, muridId: string): ButirHitung[] {
  if (rombel.mode === "semester") {
    return berkas.sumatif
      .filter((item) => item.mapelId === mapel.id)
      .sort((a, b) => a.urutan - b.urutan)
      .map((item) => ({
        nama: item.nama,
        bobot: item.bobot,
        nilai: berkas.nilaiSumatif.find((nilai) => nilai.muridId === muridId && nilai.butirId === item.id)?.nilai ?? null,
      }));
  }
  return berkas.tujuan
    .filter((item) => item.mapelId === mapel.id)
    .sort((a, b) => a.urutan - b.urutan)
    .map((item) => ({
      nama: item.nama,
      bobot: item.bobot,
      nilai: berkas.nilaiTujuan.find((nilai) => nilai.muridId === muridId && nilai.tujuanId === item.id)?.nilai ?? null,
    }));
}

export function ambangBerlaku(mapel: Mapel, rombel: Rombel): number | null {
  return typeof mapel.ambang === "number" && !Number.isNaN(mapel.ambang) ? mapel.ambang : rombel.ambang;
}

export function teksCaraHitung(mapel: Mapel, rombel: Rombel): string {
  if (mapel.progresif) {
    return "Nilai terakhir sedang dipakai. Nilai akhir adalah angka kegiatan terakhir yang terisi, karena tujuan sebelumnya menjadi prasyarat. Bobot tidak ditampilkan.";
  }
  if (mapel.opsiHitung === "rata-rata") {
    return "Cara hitung rata-rata, mengikuti langkah Mapel. Nilai akhir adalah rata-rata nilai yang terisi. Kolom bobot tidak dipakai.";
  }
  if (mapel.opsiHitung === "pembobotan") {
    return "Cara hitung pembobotan, mengikuti langkah Mapel. Isi bobot tiap kegiatan. Jumlah bobot harus 100%.";
  }
  const ambang = ambangBerlaku(mapel, rombel);
  const sumber = typeof mapel.ambang === "number" ? `ambang mapel ini ${ambang}` : ambang === null ? "ambang belum diisi" : `ambang rombel ${ambang}, karena mapel ini tidak diisi sendiri`;
  return `Cara hitung persentase ketercapaian. Nilai akhir adalah persentase kegiatan yang mencapai ${sumber}. Bobot tidak dipakai.`;
}

export function hasilMapel(berkas: Berkas, rombel: Rombel, mapel: Mapel, muridId: string): HasilHitung {
  return hitungNilaiAkhir(mapel.opsiHitung, butirMurid(berkas, rombel, mapel, muridId), ambangBerlaku(mapel, rombel), mapel.progresif);
}

export function butirDeskripsi(berkas: Berkas, rombel: Rombel, mapel: Mapel, muridId: string): ButirDeskripsi[] {
  if (rombel.mode === "semester") {
    return butirMurid(berkas, rombel, mapel, muridId).map((item) => ({ nama: item.nama, nilai: item.nilai, skala: null }));
  }
  return berkas.tujuan
    .filter((item) => item.mapelId === mapel.id)
    .sort((a, b) => a.urutan - b.urutan)
    .map((item) => {
      const nilai = berkas.nilaiTujuan.find((entri) => entri.muridId === muridId && entri.tujuanId === item.id);
      return { nama: item.nama, nilai: nilai?.nilai ?? null, skala: nilai?.skala ?? null };
    });
}

export function susunDraf(berkas: Berkas, rombel: Rombel, mapel: Mapel, muridId: string): string {
  const butir = butirDeskripsi(berkas, rombel, mapel, muridId);
  return drafDeskripsi(butir, ambangBerlaku(mapel, rombel), rombel.mode === "asesmen" && butir.length > 1);
}

export function barisRapor(berkas: Berkas, rombel: Rombel, murid: Murid): BarisRapor[] {
  const mapel = mapelRombel(berkas, rombel.id).filter((item) => mengikuti(berkas, murid, item));
  let labelSebelum = "";
  return mapel.map((item) => {
    const label = labelKelompok(berkas.sekolah.jenjang, item.kelompok);
    const tampil = label && label !== labelSebelum ? label : null;
    if (label) labelSebelum = label;
    const hasil = hasilMapel(berkas, rombel, item, murid.id);
    const deskripsi = berkas.deskripsi.find((entri) => entri.muridId === murid.id && entri.mapelId === item.id)?.teks ?? "";
    return {
      mapelId: item.id,
      nama: item.nama,
      kelompokLabel: tampil,
      nilai: hasil.nilai,
      deskripsi: deskripsi.trim(),
      pesan: hasil.pesan,
      pkl: item.jenis === "pkl",
    };
  });
}

export function namaRombel(rombel: Rombel): string {
  const roman: Record<string, string> = {
    "1": "I",
    "2": "II",
    "3": "III",
    "4": "IV",
    "5": "V",
    "6": "VI",
    "7": "VII",
    "8": "VIII",
    "9": "IX",
    "10": "X",
    "11": "XI",
    "12": "XII",
    "13": "XIII",
  };
  return `Kelas ${roman[rombel.kelas] ?? rombel.kelas}${rombel.paralel ? ` ${rombel.paralel}` : ""}`;
}

export function semesterTeks(semester: 1 | 2): string {
  return semester === 1 ? "1 (Ganjil)" : "2 (Genap)";
}

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatTanggal(iso: string): string {
  const [tahun, bulan, hari] = iso.split("-").map(Number);
  if (!tahun || !bulan || !hari || !BULAN[bulan - 1]) return "............................";
  return `${hari} ${BULAN[bulan - 1]} ${tahun}`;
}

function selCsv(nilai: string | number): string {
  return `"${String(nilai).replaceAll('"', '""')}"`;
}

export function urutanRekap(berkas: Berkas, rombel: Rombel): { murid: Murid; peringkat: number | null }[] {
  const daftar = muridRombel(berkas, rombel.id).map((murid) => {
    const angka = barisRapor(berkas, rombel, murid)
      .map((item) => item.nilai)
      .filter((nilai): nilai is number => nilai !== null);
    const rata = angka.length === 0 ? null : angka.reduce((jumlah, nilai) => jumlah + nilai, 0) / angka.length;
    return { murid, rata, peringkat: null as number | null };
  });
  const berperingkat = daftar
    .filter((item) => item.rata !== null)
    .sort((a, b) => b.rata! - a.rata! || a.murid.nama.localeCompare(b.murid.nama, "id"));
  let nomor = 0;
  let sebelumnya: number | null = null;
  berperingkat.forEach((item, indeks) => {
    if (sebelumnya === null || item.rata !== sebelumnya) nomor = indeks + 1;
    sebelumnya = item.rata;
    item.peringkat = nomor;
  });
  const tanpaNilai = daftar
    .filter((item) => item.rata === null)
    .sort((a, b) => a.murid.nama.localeCompare(b.murid.nama, "id"));
  return [...berperingkat, ...tanpaNilai].map((item) => ({ murid: item.murid, peringkat: item.peringkat }));
}

export function rekapCsv(berkas: Berkas, rombel: Rombel): string {
  const baris = [["Peringkat", "NISN", "Nama", "Mata Pelajaran", "Nilai Akhir", "Capaian Kompetensi"].map(selCsv).join(";")];
  for (const entri of urutanRekap(berkas, rombel)) {
    for (const item of barisRapor(berkas, rombel, entri.murid)) {
      baris.push([entri.peringkat ?? "", entri.murid.nisn, entri.murid.nama, item.nama, item.nilai ?? "", item.deskripsi].map(selCsv).join(";"));
    }
  }
  return `\uFEFF${baris.join("\n")}`;
}
