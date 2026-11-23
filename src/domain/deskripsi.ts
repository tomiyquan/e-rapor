import { DIMENSI_PROFIL, LABEL_SKALA, type SkalaKualitatif } from "./types";

export interface ButirDeskripsi {
  nama: string;
  nilai: number | null;
  skala: SkalaKualitatif | null;
}

function gabung(bagian: string[]): string {
  if (bagian.length <= 1) return bagian[0] ?? "";
  if (bagian.length === 2) return `${bagian[0]} dan ${bagian[1]}`;
  return `${bagian.slice(0, -1).join(", ")}, dan ${bagian[bagian.length - 1]}`;
}

function susun(dikuasai: string[], perlu: string[]): string {
  const kalimat: string[] = [];
  if (dikuasai.length > 0) {
    kalimat.push(`Menunjukkan penguasaan yang baik dalam ${gabung(dikuasai)}.`);
  }
  if (perlu.length > 0) {
    kalimat.push(`Perlu pendampingan dalam ${gabung(perlu)}.`);
  }
  return kalimat.join(" ");
}

export function drafDeskripsi(butir: ButirDeskripsi[], ambang: number | null): string {
  const bernilai = butir.filter((item) => item.nilai !== null && !Number.isNaN(item.nilai));
  if (bernilai.length === 0) {
    const baik = butir.filter((item) => item.skala === "baik" || item.skala === "sangat-baik");
    const perlu = butir.filter((item) => item.skala === "perlu-bimbingan" || item.skala === "cukup");
    return susun(
      baik.map((item) => item.nama),
      perlu.map((item) => item.nama),
    );
  }

  if (ambang !== null) {
    const tuntas = bernilai
      .filter((item) => item.nilai! >= ambang)
      .sort((a, b) => b.nilai! - a.nilai!);
    const belum = bernilai
      .filter((item) => item.nilai! < ambang)
      .sort((a, b) => a.nilai! - b.nilai!);
    return susun(tuntas.slice(0, 1).map((item) => item.nama), belum.slice(0, 1).map((item) => item.nama));
  }

  const urut = [...bernilai].sort((a, b) => b.nilai! - a.nilai!);
  const tinggi = urut[0];
  const rendah = urut[urut.length - 1];
  if (!tinggi || tinggi === rendah) return susun(tinggi ? [tinggi.nama] : [], []);
  return susun([tinggi.nama], [rendah.nama]);
}

export function labelDimensi(id: string): string {
  return DIMENSI_PROFIL.find((item) => item.id === id)?.label ?? id;
}

export function drafKokurikuler(
  dimensiKuat: string[],
  buktiKuat: string,
  dimensiPerlu: string[],
  buktiPerlu: string,
): string {
  const kalimat: string[] = [];
  if (dimensiKuat.length > 0) {
    const bukti = buktiKuat.trim() ? ` yang terlihat dari ${buktiKuat.trim()}` : "";
    kalimat.push(`Ananda sudah baik dalam ${gabung(dimensiKuat.map(labelDimensi))}${bukti}.`);
  }
  if (dimensiPerlu.length > 0) {
    const bukti = buktiPerlu.trim() ? ` ${buktiPerlu.trim()}` : "";
    kalimat.push(`Ananda masih perlu pendampingan dalam ${gabung(dimensiPerlu.map(labelDimensi))}${bukti}.`);
  }
  return kalimat.join(" ");
}

export function teksSkala(skala: SkalaKualitatif | null): string {
  return skala ? LABEL_SKALA[skala] : "";
}
