import { KURIKULUM, VERSI_BERKAS, type Berkas, type Jenjang } from "./types";

const JENJANG: Jenjang[] = ["SD", "MI", "SMP", "MTs", "SMA", "SMK"];

function array<T>(nilai: T[] | undefined): T[] {
  return Array.isArray(nilai) ? nilai : [];
}

export function normalkan(data: unknown): { berkas: Berkas } | { error: string } {
  if (!data || typeof data !== "object") return { error: "Berkas tidak dikenali." };
  const mentah = data as Partial<Berkas>;
  if (mentah.kurikulum !== KURIKULUM) {
    return { error: "Berkas ini bukan paket kurikulum kemendikdasmen-ppa-2025." };
  }
  if (mentah.versi !== VERSI_BERKAS) return { error: "Versi berkas tidak didukung." };
  if (!mentah.sekolah || !JENJANG.includes(mentah.sekolah.jenjang)) {
    return { error: "Identitas satuan pendidikan tidak lengkap." };
  }
  const berkas: Berkas = {
    versi: VERSI_BERKAS,
    kurikulum: KURIKULUM,
    sekolah: {
      nama: String(mentah.sekolah.nama ?? ""),
      npsn: String(mentah.sekolah.npsn ?? ""),
      alamat: String(mentah.sekolah.alamat ?? ""),
      kepalaSekolah: String(mentah.sekolah.kepalaSekolah ?? ""),
      jenjang: mentah.sekolah.jenjang,
      programSmk: mentah.sekolah.programSmk === 4 ? 4 : 3,
      kota: String(mentah.sekolah.kota ?? ""),
    },
    tahunAjaran: String(mentah.tahunAjaran ?? ""),
    semester: mentah.semester === 2 ? 2 : 1,
    tanggalRapor: String(mentah.tanggalRapor ?? ""),
    rombel: array(mentah.rombel),
    murid: array(mentah.murid),
    mapel: array(mentah.mapel).map((item) => ({
      ...item,
      ambang: typeof item.ambang === "number" && !Number.isNaN(item.ambang) ? item.ambang : null,
    })),
    pilihan: array(mentah.pilihan),
    sumatif: array(mentah.sumatif),
    tujuan: array(mentah.tujuan),
    nilaiSumatif: array(mentah.nilaiSumatif),
    nilaiTujuan: array(mentah.nilaiTujuan),
    deskripsi: array(mentah.deskripsi),
    kokurikuler: array(mentah.kokurikuler),
    ekskul: array(mentah.ekskul),
    absensi: array(mentah.absensi),
    catatan: array(mentah.catatan),
  };
  return { berkas };
}

export function namaBerkas(berkas: Berkas): string {
  const sekolah = berkas.sekolah.nama.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "sekolah";
  return `erapor-${sekolah}-${berkas.tahunAjaran.replace("/", "-")}-s${berkas.semester}.erapor.json`;
}
