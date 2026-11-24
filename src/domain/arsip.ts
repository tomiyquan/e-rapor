import type { Berkas } from "./types";

export interface CatatanArsip {
  id: string;
  disimpanPada: string;
  berkas: Berkas;
}

export function kunciRapor(berkas: Berkas): string {
  const identitas = berkas.sekolah.npsn.trim() || berkas.sekolah.nama.trim().toLowerCase() || "sekolah";
  return [berkas.sekolah.jenjang, identitas, berkas.tahunAjaran.trim(), String(berkas.semester)].join("|");
}

export function labelRapor(berkas: Berkas): string {
  const nama = berkas.sekolah.nama.trim() || "Satuan pendidikan";
  const tahun = berkas.tahunAjaran.trim() || "tahun ajaran";
  return `${nama} · ${tahun} · Semester ${berkas.semester}`;
}

export function labelWaktu(iso: string): string {
  const waktu = new Date(iso);
  if (Number.isNaN(waktu.getTime())) return "";
  return waktu.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function semesterBerikut(berkas: Berkas): { tahunAjaran: string; semester: 1 | 2 } {
  if (berkas.semester === 1) return { tahunAjaran: berkas.tahunAjaran, semester: 2 };
  const [awal, akhir] = berkas.tahunAjaran.split("/").map((bagian) => Number(bagian));
  if (Number.isFinite(awal) && Number.isFinite(akhir)) {
    return { tahunAjaran: `${awal + 1}/${akhir + 1}`, semester: 1 };
  }
  return { tahunAjaran: berkas.tahunAjaran, semester: 1 };
}

export function rapatArsip(daftar: CatatanArsip[], berkas: Berkas, disimpanPada: string): CatatanArsip[] {
  const catatan: CatatanArsip = { id: kunciRapor(berkas), disimpanPada, berkas };
  return [catatan, ...daftar.filter((item) => item.id !== catatan.id)].sort((a, b) => b.disimpanPada.localeCompare(a.disimpanPada));
}

export function arsipSama(daftar: CatatanArsip[], berkas: Berkas | null): boolean {
  if (!berkas) return false;
  const ada = daftar.find((item) => item.id === kunciRapor(berkas));
  return Boolean(ada && JSON.stringify(ada.berkas) === JSON.stringify(berkas));
}

export function drafPerluDilanjutkan(draf: Berkas | null, daftar: CatatanArsip[]): boolean {
  return Boolean(draf) && !arsipSama(daftar, draf);
}
