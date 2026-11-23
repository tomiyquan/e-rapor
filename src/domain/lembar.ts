import * as XLSX from "xlsx";
import type { Berkas, Mapel, ModePenilaian, Murid, Rombel } from "./types";
import { namaRombel } from "./rapor";

export interface KesalahanImpor {
  baris: number;
  pesan: string;
}

export interface HasilImpor {
  mapelId: string;
  mode: ModePenilaian;
  baris: { muridId: string; nilai: { butirId: string; nilai: number | null }[]; catatan: string }[];
  kesalahan: KesalahanImpor[];
}

interface ButirLembar {
  id: string;
  nama: string;
}

export function butirLembar(berkas: Berkas, mapel: Mapel, mode: ModePenilaian): ButirLembar[] {
  if (mode === "semester") {
    return berkas.sumatif
      .filter((item) => item.mapelId === mapel.id)
      .sort((a, b) => a.urutan - b.urutan)
      .map((item) => ({ id: item.id, nama: item.nama }));
  }
  return berkas.tujuan
    .filter((item) => item.mapelId === mapel.id)
    .sort((a, b) => a.urutan - b.urutan)
    .map((item) => ({ id: item.id, nama: item.nama }));
}

export function buatLembar(berkas: Berkas, rombel: Rombel, mapel: Mapel, murid: Murid[]): Uint8Array {
  const mode = rombel.mode;
  const butir = butirLembar(berkas, mapel, mode);
  const judul = ["NISN", "Nama Murid", "Agama", ...butir.map((item) => item.nama), "Catatan untuk deskripsi"];
  const kode = ["kode", "", "", ...butir.map((item) => item.id), "catatan"];
  const isi = murid.map((item) => {
    const nilai = butir.map((kolom) => {
      if (mode === "semester") {
        return berkas.nilaiSumatif.find((nilaiItem) => nilaiItem.muridId === item.id && nilaiItem.butirId === kolom.id)?.nilai ?? "";
      }
      return berkas.nilaiTujuan.find((nilaiItem) => nilaiItem.muridId === item.id && nilaiItem.tujuanId === kolom.id)?.nilai ?? "";
    });
    const catatan = berkas.deskripsi.find((desk) => desk.muridId === item.id && desk.mapelId === mapel.id)?.catatanGuru ?? "";
    return [item.nisn, item.nama, item.agama, ...nilai, catatan];
  });
  const aoa = [
    ["Jenis", "e-rapor-isian"],
    ["MapelId", mapel.id],
    ["Mode", mode],
    ["Rombel", namaRombel(rombel)],
    ["Mapel", mapel.nama],
    ["Petunjuk", "Isi nilai 0–100. Jangan mengubah baris kode. Kosongkan sel bila belum ada nilai."],
    [],
    judul,
    kode,
    ...isi,
  ];
  const buku = XLSX.utils.book_new();
  const lembar = XLSX.utils.aoa_to_sheet(aoa);
  lembar["!cols"] = judul.map((kolom) => ({ wch: Math.max(18, kolom.length + 2) }));
  XLSX.utils.book_append_sheet(buku, lembar, "Isian");
  return XLSX.write(buku, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

function teks(nilai: unknown): string {
  return String(nilai ?? "").trim();
}

function angka(nilai: unknown): number | null | "invalid" {
  const mentah = teks(nilai).replace(",", ".");
  if (!mentah) return null;
  const hasil = Number(mentah);
  if (Number.isNaN(hasil) || hasil < 0 || hasil > 100) return "invalid";
  return hasil;
}

export function bacaLembar(data: ArrayBuffer | Uint8Array, berkas: Berkas): HasilImpor {
  const buku = XLSX.read(data, { type: "array" });
  const namaLembar = buku.SheetNames[0];
  const lembar = namaLembar ? buku.Sheets[namaLembar] : undefined;
  if (!lembar) {
    return { mapelId: "", mode: "semester", baris: [], kesalahan: [{ baris: 1, pesan: "Lembar kerja kosong." }] };
  }
  const baris = XLSX.utils.sheet_to_json<(string | number)[]>(lembar, { header: 1, raw: false, defval: "" });
  const jenis = baris.find((row) => teks(row[0]).toLowerCase() === "jenis");
  if (!jenis || teks(jenis[1]) !== "e-rapor-isian") {
    return { mapelId: "", mode: "semester", baris: [], kesalahan: [{ baris: 1, pesan: "Berkas ini bukan format isian e-rapor." }] };
  }
  const mapelId = teks(baris.find((row) => teks(row[0]).toLowerCase() === "mapelid")?.[1]);
  const modeMentah = teks(baris.find((row) => teks(row[0]).toLowerCase() === "mode")?.[1]);
  const mode: ModePenilaian = modeMentah === "asesmen" ? "asesmen" : "semester";
  const mapel = berkas.mapel.find((item) => item.id === mapelId);
  if (!mapel) {
    return { mapelId, mode, baris: [], kesalahan: [{ baris: 2, pesan: "Mata pelajaran pada berkas tidak ada di data rombel. Unduh ulang format isian." }] };
  }
  const indeksJudul = baris.findIndex((row) => teks(row[0]).toUpperCase() === "NISN");
  if (indeksJudul < 0 || !baris[indeksJudul + 1]) {
    return { mapelId, mode, baris: [], kesalahan: [{ baris: 1, pesan: "Baris judul NISN tidak ditemukan." }] };
  }
  const judul = baris[indeksJudul];
  const kode = baris[indeksJudul + 1];
  if (teks(kode[0]).toLowerCase() !== "kode") {
    return { mapelId, mode, baris: [], kesalahan: [{ baris: indeksJudul + 2, pesan: "Baris kode hilang. Unduh ulang format isian dan jangan menghapus baris itu." }] };
  }
  const butirSah = new Set(butirLembar(berkas, mapel, mode).map((item) => item.id));
  const kolom: { indeks: number; id: string }[] = [];
  let kolomCatatan = -1;
  for (let indeks = 3; indeks < judul.length; indeks += 1) {
    if (teks(judul[indeks]).toLowerCase().startsWith("catatan") || teks(kode[indeks]) === "catatan") {
      kolomCatatan = indeks;
      continue;
    }
    const id = teks(kode[indeks]);
    if (!id) continue;
    if (!butirSah.has(id)) {
      return {
        mapelId,
        mode,
        baris: [],
        kesalahan: [{ baris: indeksJudul + 2, pesan: `Kolom "${teks(judul[indeks])}" tidak lagi ada. Unduh ulang format isian.` }],
      };
    }
    kolom.push({ indeks, id });
  }
  const kesalahan: KesalahanImpor[] = [];
  const hasil: HasilImpor["baris"] = [];
  const nisnTerlihat = new Set<string>();
  for (let indeks = indeksJudul + 2; indeks < baris.length; indeks += 1) {
    const row = baris[indeks];
    const nisn = teks(row[0]);
    const nama = teks(row[1]);
    if (!nisn && !nama && kolom.every((kolomItem) => !teks(row[kolomItem.indeks]))) continue;
    const nomor = indeks + 1;
    if (!nisn) {
      kesalahan.push({ baris: nomor, pesan: "NISN kosong." });
      continue;
    }
    if (nisnTerlihat.has(nisn)) {
      kesalahan.push({ baris: nomor, pesan: `NISN ${nisn} terulang.` });
      continue;
    }
    nisnTerlihat.add(nisn);
    const murid = berkas.murid.find((item) => item.rombelId === mapel.rombelId && item.nisn === nisn);
    if (!murid) {
      kesalahan.push({ baris: nomor, pesan: `NISN ${nisn} tidak ada di rombel ini.` });
      continue;
    }
    const nilai: { butirId: string; nilai: number | null }[] = [];
    let gagal = false;
    for (const kolomItem of kolom) {
      const hasilAngka = angka(row[kolomItem.indeks]);
      if (hasilAngka === "invalid") {
        kesalahan.push({ baris: nomor, pesan: `Nilai "${teks(row[kolomItem.indeks])}" di luar 0–100.` });
        gagal = true;
        break;
      }
      nilai.push({ butirId: kolomItem.id, nilai: hasilAngka });
    }
    if (gagal) continue;
    hasil.push({ muridId: murid.id, nilai, catatan: kolomCatatan >= 0 ? teks(row[kolomCatatan]) : "" });
  }
  if (kesalahan.length > 0) {
    return { mapelId, mode, baris: [], kesalahan };
  }
  return { mapelId, mode, baris: hasil, kesalahan: [] };
}

export function unduhBerkas(nama: string, data: BlobPart | Uint8Array, tipe: string): void {
  const salinan = data instanceof Uint8Array ? Uint8Array.from(data) : data;
  const tautan = document.createElement("a");
  const url = URL.createObjectURL(new Blob([salinan], { type: tipe }));
  tautan.href = url;
  tautan.download = nama;
  tautan.click();
  URL.revokeObjectURL(url);
}
