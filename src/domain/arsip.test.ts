import { describe, expect, it } from "vitest";
import { arsipSama, drafPerluDilanjutkan, kunciRapor, rapatArsip, semesterBerikut } from "./arsip";
import { buatBerkas } from "./ubah";
import type { Berkas } from "./types";

function contoh(semester: 1 | 2, tahun = "2026/2027"): Berkas {
  return buatBerkas({
    sekolah: {
      nama: "SD Contoh",
      npsn: "12345678",
      alamat: "Jl. Melati",
      kepalaSekolah: "Sari",
      jenjang: "SD",
      programSmk: 3,
      kota: "Jayapura",
    },
    tahunAjaran: tahun,
    semester,
    tanggalRapor: "2026-12-19",
  });
}

describe("arsip rapor", () => {
  it("menyimpan ulang semester yang sama pada satu entri", () => {
    const awal = contoh(1);
    const diubah = { ...awal, tanggalRapor: "2026-12-20" };
    const daftar = rapatArsip(rapatArsip([], awal, "2026-12-01T00:00:00.000Z"), diubah, "2026-12-02T00:00:00.000Z");
    expect(daftar).toHaveLength(1);
    expect(daftar[0]?.berkas.tanggalRapor).toBe("2026-12-20");
    expect(daftar[0]?.id).toBe(kunciRapor(awal));
  });

  it("memisahkan semester dan tahun ajaran", () => {
    const ganjil = contoh(1);
    const genap = contoh(2);
    const daftar = rapatArsip(rapatArsip([], ganjil, "2026-12-01T00:00:00.000Z"), genap, "2027-06-01T00:00:00.000Z");
    expect(daftar.map((item) => item.berkas.semester)).toEqual([2, 1]);
  });

  it("menganggap draf selesai bila isinya sama dengan arsip", () => {
    const berkas = contoh(1);
    const daftar = rapatArsip([], berkas, "2026-12-01T00:00:00.000Z");
    expect(arsipSama(daftar, berkas)).toBe(true);
    expect(drafPerluDilanjutkan(berkas, daftar)).toBe(false);
    expect(drafPerluDilanjutkan({ ...berkas, tanggalRapor: "2026-12-21" }, daftar)).toBe(true);
  });

  it("mengusulkan semester berikutnya", () => {
    expect(semesterBerikut(contoh(1))).toEqual({ tahunAjaran: "2026/2027", semester: 2 });
    expect(semesterBerikut(contoh(2))).toEqual({ tahunAjaran: "2027/2028", semester: 1 });
  });
});
