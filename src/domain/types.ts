export const KURIKULUM = "kemendikdasmen-ppa-2025" as const;
export const VERSI_BERKAS = 1 as const;

export type Jenjang = "SD" | "MI" | "SMP" | "MTs" | "SMA" | "SMK";
export type Fase = "A" | "B" | "C" | "D" | "E" | "F";
export type Agama = "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Khonghucu";
export type ModePenilaian = "semester" | "asesmen";
export type OpsiHitung = "rata-rata" | "pembobotan" | "persentase";
export type SkalaKualitatif = "perlu-bimbingan" | "cukup" | "baik" | "sangat-baik";
export type KelompokMapel = "wajib" | "umum" | "kejuruan" | "pilihan" | "mulok";
export type JenisMapel = "biasa" | "agama" | "seni" | "kejuruan-nama" | "pkl" | "pilihan";
export type KeputusanKenaikan = "" | "naik" | "tidak-naik" | "lulus";

export interface Sekolah {
  nama: string;
  npsn: string;
  alamat: string;
  kepalaSekolah: string;
  jenjang: Jenjang;
  programSmk: 3 | 4;
  kota: string;
}

export interface Rombel {
  id: string;
  kelas: string;
  paralel: string;
  fase: Fase;
  waliKelas: string;
  mode: ModePenilaian;
  sembunyikanAngka: boolean;
  ambang: number | null;
}

export interface Murid {
  id: string;
  rombelId: string;
  nama: string;
  nisn: string;
  nis: string;
  agama: Agama;
}

export interface Mapel {
  id: string;
  rombelId: string;
  kode: string;
  nama: string;
  kelompok: KelompokMapel;
  jenis: JenisMapel;
  urutan: number;
  aktif: boolean;
  berlakuUntuk: "semua" | "per-murid";
  opsiHitung: OpsiHitung;
  progresif: boolean;
  ambang: number | null;
  bawaan: boolean;
}

export interface PilihanMurid {
  muridId: string;
  mapelId: string;
}

export interface Sumatif {
  id: string;
  mapelId: string;
  urutan: number;
  nama: string;
  bobot: number | null;
  akhirSemester: boolean;
}

export interface Tujuan {
  id: string;
  mapelId: string;
  urutan: number;
  nama: string;
  bobot: number | null;
}

export interface NilaiAngka {
  muridId: string;
  butirId: string;
  nilai: number | null;
}

export interface NilaiTujuan {
  muridId: string;
  tujuanId: string;
  nilai: number | null;
  skala: SkalaKualitatif | null;
}

export interface DeskripsiMapel {
  muridId: string;
  mapelId: string;
  teks: string;
  catatanGuru: string;
}

export interface Kokurikuler {
  muridId: string;
  kegiatan: string;
  dimensiKuat: string[];
  buktiKuat: string;
  dimensiPerlu: string[];
  buktiPerlu: string;
  deskripsi: string;
}

export interface Ekskul {
  id: string;
  muridId: string;
  nama: string;
  keterangan: string;
}

export interface Absensi {
  muridId: string;
  sakit: number;
  izin: number;
  alfa: number;
}

export interface CatatanMurid {
  muridId: string;
  catatanWali: string;
  tanggapanOrtu: string;
  keputusan: KeputusanKenaikan;
  catatanKeputusan: string;
}

export interface Berkas {
  versi: typeof VERSI_BERKAS;
  kurikulum: typeof KURIKULUM;
  sekolah: Sekolah;
  tahunAjaran: string;
  semester: 1 | 2;
  tanggalRapor: string;
  rombel: Rombel[];
  murid: Murid[];
  mapel: Mapel[];
  pilihan: PilihanMurid[];
  sumatif: Sumatif[];
  tujuan: Tujuan[];
  nilaiSumatif: NilaiAngka[];
  nilaiTujuan: NilaiTujuan[];
  deskripsi: DeskripsiMapel[];
  kokurikuler: Kokurikuler[];
  ekskul: Ekskul[];
  absensi: Absensi[];
  catatan: CatatanMurid[];
}

export interface TemplatMapel {
  kode: string;
  nama: string;
  kelompok: KelompokMapel;
  jenis: JenisMapel;
  opsional: boolean;
  berlakuUntuk: "semua" | "per-murid";
}

export const AGAMA: Agama[] = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Khonghucu"];

export const NAMA_AGAMA: Record<Agama, string> = {
  Islam: "Pendidikan Agama Islam dan Budi Pekerti",
  Kristen: "Pendidikan Agama Kristen dan Budi Pekerti",
  Katolik: "Pendidikan Agama Katolik dan Budi Pekerti",
  Hindu: "Pendidikan Agama Hindu dan Budi Pekerti",
  Buddha: "Pendidikan Agama Buddha dan Budi Pekerti",
  Khonghucu: "Pendidikan Agama Khonghucu dan Budi Pekerti",
};

export const LABEL_SKALA: Record<SkalaKualitatif, string> = {
  "perlu-bimbingan": "Perlu bimbingan",
  cukup: "Cukup",
  baik: "Baik",
  "sangat-baik": "Sangat baik",
};

export const DIMENSI_PROFIL = [
  { id: "keimanan", label: "keimanan dan ketakwaan kepada Tuhan Yang Maha Esa" },
  { id: "kewargaan", label: "kewargaan" },
  { id: "penalaran-kritis", label: "penalaran kritis" },
  { id: "kreativitas", label: "kreativitas" },
  { id: "kolaborasi", label: "kolaborasi" },
  { id: "kemandirian", label: "kemandirian" },
  { id: "kesehatan", label: "kesehatan" },
  { id: "komunikasi", label: "komunikasi" },
] as const;

export function uid(): string {
  return crypto.randomUUID();
}
