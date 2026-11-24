import type { OpsiHitung } from "./types";

export interface ButirHitung {
  nama: string;
  nilai: number | null;
  bobot: number | null;
}

export interface HasilHitung {
  nilai: number | null;
  pesan: string | null;
}

function terisi(nilai: number | null): nilai is number {
  return nilai !== null && !Number.isNaN(nilai);
}

function bulatkan(nilai: number): number {
  return Math.round(nilai);
}

export function nilaiSah(nilai: number | null): boolean {
  return terisi(nilai) && nilai >= 0 && nilai <= 100;
}

/**
 * Nilai akhir hanya dari asesmen sumatif.
 * Rata-rata, pembobotan, dan persentase mengikuti contoh
 * Panduan Pembelajaran dan Asesmen edisi revisi 2025.
 * Pembobotan membulatkan tiap komponen lalu menjumlahkannya:
 * 85 (20%) + 83 (20%) + 60 (20%) + 84 (40%) = 80.
 */
export function hitungNilaiAkhir(
  opsi: OpsiHitung,
  butir: ButirHitung[],
  ambang: number | null,
  progresif: boolean,
): HasilHitung {
  if (butir.some((item) => terisi(item.nilai) && !nilaiSah(item.nilai))) {
    return { nilai: null, pesan: "Ada nilai di luar 0–100." };
  }
  const ada = butir.filter((item) => terisi(item.nilai));
  if (ada.length === 0) return { nilai: null, pesan: null };

  if (progresif) {
    const terakhir = [...butir].reverse().find((item) => terisi(item.nilai));
    return { nilai: bulatkan(terakhir!.nilai!), pesan: null };
  }

  if (opsi === "rata-rata") {
    const jumlah = ada.reduce((total, item) => total + item.nilai!, 0);
    const pesan = ada.length === butir.length ? null : "Dihitung dari nilai yang sudah terisi.";
    return { nilai: bulatkan(jumlah / ada.length), pesan };
  }

  if (opsi === "pembobotan") {
    const berbobot = butir.filter((item) => item.bobot !== null && item.bobot > 0);
    if (berbobot.length === 0) {
      return { nilai: null, pesan: "Isi bobot pada setiap kegiatan sumatif atau tujuan pembelajaran." };
    }
    const totalBobot = berbobot.reduce((total, item) => total + item.bobot!, 0);
    if (Math.round(totalBobot) !== 100) {
      return { nilai: null, pesan: `Jumlah bobot ${bulatkan(totalBobot)}%. Lengkapi sampai 100%.` };
    }
    if (berbobot.some((item) => !terisi(item.nilai))) {
      return { nilai: null, pesan: "Masih ada nilai berbobot yang kosong." };
    }
    const nilai = berbobot.reduce((total, item) => total + Math.round((item.nilai! * item.bobot!) / 100), 0);
    return { nilai, pesan: null };
  }

  if (ambang === null || Number.isNaN(ambang)) {
    return { nilai: null, pesan: "Isi ambang ketercapaian. Angka rombel berlaku untuk semua mapel, atau isi ambang mapel bila KKM-nya berbeda." };
  }
  const tuntas = ada.filter((item) => item.nilai! >= ambang).length;
  const pesan = ada.length === butir.length ? null : "Dihitung dari nilai yang sudah terisi.";
  return { nilai: bulatkan((tuntas / ada.length) * 100), pesan };
}
