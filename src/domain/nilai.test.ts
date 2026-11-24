import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { normalkan } from "./berkas";
import { drafDeskripsi, drafKokurikuler } from "./deskripsi";
import { bacaLembar, buatLembar } from "./lembar";
import { hitungNilaiAkhir } from "./nilai";
import { ambangBerlaku, hasilMapel, teksCaraHitung } from "./rapor";
import { templatMapel } from "./kurikulum";
import { buatBerkas, setNilaiSumatif, tambahMurid, tambahRombel, tambahSumatif, ubahMapel, ubahRombel } from "./ubah";
import type { Berkas } from "./types";

const edo = [
  { nama: "Melakukan penjumlahan bilangan cacah", nilai: 85, bobot: 20 },
  { nama: "Mengukur panjang dengan satuan baku", nilai: 83, bobot: 20 },
  { nama: "Menyusun dan menguraikan berbagai bangun datar", nilai: 60, bobot: 20 },
  { nama: "Menyajikan data dalam bentuk diagram gambar", nilai: 84, bobot: 40 },
];

function sekolahDasar(): Berkas {
  let berkas = buatBerkas({
    sekolah: {
      nama: "SD Contoh",
      npsn: "12345678",
      alamat: "Jl. Melati",
      kepalaSekolah: "Sari",
      jenjang: "SD",
      programSmk: 3,
      kota: "Jayapura",
    },
    tahunAjaran: "2026/2027",
    semester: 1,
    tanggalRapor: "2026-12-19",
  });
  berkas = tambahRombel(berkas, { kelas: "1", paralel: "A", waliKelas: "Budi" });
  const rombel = berkas.rombel[0];
  berkas = tambahMurid(berkas, { rombelId: rombel.id, nama: "Edo", nisn: "1001", nis: "1", agama: "Islam" });
  berkas = tambahMurid(berkas, { rombelId: rombel.id, nama: "Dayu", nisn: "1002", nis: "2", agama: "Kristen" });
  return berkas;
}

describe("hitungNilaiAkhir", () => {
  it("membobotkan seperti contoh Edo di panduan", () => {
    expect(hitungNilaiAkhir("pembobotan", edo, null, false)).toEqual({ nilai: 80, pesan: null });
  });

  it("menghitung persentase ketercapaian 3 dari 4", () => {
    expect(hitungNilaiAkhir("persentase", edo, 75, false)).toEqual({ nilai: 75, pesan: null });
  });

  it("merata-rata 85, 83, 60, dan 84 menjadi 78", () => {
    expect(hitungNilaiAkhir("rata-rata", edo, null, false)).toEqual({ nilai: 78, pesan: null });
  });

  it("menolak bobot yang belum 100 persen", () => {
    const hasil = hitungNilaiAkhir("pembobotan", edo.slice(0, 3), null, false);
    expect(hasil.nilai).toBeNull();
    expect(hasil.pesan).toMatch(/100%/);
  });

  it("memakai nilai tujuan terakhir bila materi bersifat prasyarat", () => {
    expect(hitungNilaiAkhir("rata-rata", edo, null, true).nilai).toBe(84);
  });

  it("memakai ambang mapel bila diisi, dan ambang rombel bila kosong", () => {
    let berkas = sekolahDasar();
    const rombelAwal = berkas.rombel[0];
    berkas = ubahRombel(berkas, rombelAwal.id, { ambang: 75 });
    const matematika = berkas.mapel.find((item) => item.kode === "matematika")!;
    const rombel = berkas.rombel[0];
    expect(ambangBerlaku(matematika, rombel)).toBe(75);
    berkas = ubahMapel(berkas, matematika.id, { ambang: 84, opsiHitung: "persentase" });
    const mapel = berkas.mapel.find((item) => item.id === matematika.id)!;
    expect(ambangBerlaku(mapel, berkas.rombel[0])).toBe(84);
    expect(teksCaraHitung(mapel, berkas.rombel[0])).toMatch(/ambang mapel ini 84/);
    expect(teksCaraHitung({ ...mapel, ambang: null, opsiHitung: "rata-rata", progresif: false }, berkas.rombel[0])).toMatch(/Kolom bobot tidak dipakai/);

    const skor = [85, 83, 60, 84];
    const murid = berkas.murid.find((item) => item.nama === "Edo")!;
    for (const nilai of skor) {
      berkas = tambahSumatif(berkas, mapel.id, `Butir ${nilai}`);
      const butir = berkas.sumatif.filter((item) => item.mapelId === mapel.id).at(-1)!;
      berkas = setNilaiSumatif(berkas, murid.id, butir.id, nilai);
    }
    expect(hasilMapel(berkas, berkas.rombel[0], berkas.mapel.find((item) => item.id === mapel.id)!, murid.id)).toEqual({
      nilai: 50,
      pesan: null,
    });
  });

  it("kosong bila belum ada angka", () => {
    expect(hitungNilaiAkhir("rata-rata", [{ nama: "A", nilai: null, bobot: null }], null, false)).toEqual({
      nilai: null,
      pesan: null,
    });
  });
});

describe("draf deskripsi dan kokurikuler", () => {
  it("menyusun capaian tertinggi dan terendah", () => {
    const teks = drafDeskripsi(
      [
        { nama: "menentukan peluang dan frekuensi harapan", nilai: 90, skala: null },
        { nama: "menggunakan diagram pencar", nilai: 60, skala: null },
      ],
      75,
    );
    expect(teks).toBe(
      "Menunjukkan penguasaan yang baik dalam menentukan peluang dan frekuensi harapan. Perlu pendampingan dalam menggunakan diagram pencar.",
    );
  });

  it("menyusun narasi kokurikuler tanpa angka", () => {
    const teks = drafKokurikuler(
      ["kemandirian"],
      "kegigihan menyelesaikan tugas secara tepat",
      ["komunikasi"],
      "dalam menyampaikan kembali informasi dengan tepat",
    );
    expect(teks).toContain("sudah baik dalam kemandirian");
    expect(teks).toContain("masih perlu pendampingan dalam komunikasi");
    expect(teks).not.toMatch(/\d/);
  });
});

describe("berkas dan lembar isian", () => {
  it("menyediakan mapel sesuai jenjang dan kelas", () => {
    expect(templatMapel("SD", "4", 3).some((item) => item.kode === "ipas")).toBe(true);
    expect(templatMapel("MI", "1", 3).some((item) => item.kode === "quran-hadis")).toBe(true);
    expect(templatMapel("MI", "1", 3).some((item) => item.kode === "ski")).toBe(false);
    expect(templatMapel("MTs", "7", 3).some((item) => item.kode === "fikih")).toBe(true);
    expect(templatMapel("SMA", "11", 3).filter((item) => item.kelompok === "pilihan").length).toBeGreaterThanOrEqual(7);
    expect(templatMapel("SMK", "12", 3).some((item) => item.jenis === "pkl")).toBe(true);
    expect(templatMapel("SMK", "12", 4).some((item) => item.jenis === "pkl")).toBe(false);
  });

  it("menolak berkas kurikulum lain", () => {
    expect(normalkan({ versi: 1, kurikulum: "lain" })).toEqual({
      error: "Berkas ini bukan paket kurikulum kemendikdasmen-ppa-2025.",
    });
  });

  it("membuat mapel agama sesuai agama murid dan menolak nilai di luar rentang", () => {
    let berkas = sekolahDasar();
    const rombel = berkas.rombel[0];
    const agama = berkas.mapel.filter((item) => item.jenis === "agama").map((item) => item.nama).sort();
    expect(agama).toEqual(["Pendidikan Agama Islam dan Budi Pekerti", "Pendidikan Agama Kristen dan Budi Pekerti"]);
    expect(berkas.mapel.some((item) => item.kode === "ipas")).toBe(false);

    const matematika = berkas.mapel.find((item) => item.kode === "matematika")!;
    berkas = tambahSumatif(berkas, matematika.id, "Penjumlahan");
    const murid = berkas.murid.filter((item) => item.rombelId === rombel.id);
    const lembar = buatLembar(berkas, rombel, matematika, murid);
    const bersih = bacaLembar(lembar, berkas);
    expect(bersih.kesalahan).toEqual([]);
    expect(bersih.baris).toHaveLength(2);
    expect(bersih.baris[0].nilai[0].nilai).toBeNull();

    const buku = XLSX.read(lembar, { type: "array" });
    const sheet = buku.Sheets[buku.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: "" });
    const judul = rows.findIndex((row) => String(row[0]).toUpperCase() === "NISN");
    rows[judul + 2][3] = 140;
    rows[judul + 3][0] = "9999";
    buku.Sheets[buku.SheetNames[0]] = XLSX.utils.aoa_to_sheet(rows);
    const rusak = XLSX.write(buku, { type: "array", bookType: "xlsx" }) as Uint8Array;
    const hasil = bacaLembar(rusak, berkas);
    expect(hasil.baris).toEqual([]);
    expect(hasil.kesalahan.map((item) => item.pesan).join(" ")).toMatch(/0–100/);
    expect(hasil.kesalahan.map((item) => item.pesan).join(" ")).toMatch(/9999/);
  });
});
