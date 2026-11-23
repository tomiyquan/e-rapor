import { infoKelas, templatMapel } from "./kurikulum";
import {
  AGAMA,
  NAMA_AGAMA,
  type Agama,
  type Berkas,
  type KeputusanKenaikan,
  type KelompokMapel,
  type Mapel,
  type ModePenilaian,
  type OpsiHitung,
  type Sekolah,
  type SkalaKualitatif,
  uid,
} from "./types";

function salin(berkas: Berkas): Berkas {
  return structuredClone(berkas);
}

export function buatBerkas(input: {
  sekolah: Sekolah;
  tahunAjaran: string;
  semester: 1 | 2;
  tanggalRapor: string;
}): Berkas {
  return {
    versi: 1,
    kurikulum: "kemendikdasmen-ppa-2025",
    sekolah: input.sekolah,
    tahunAjaran: input.tahunAjaran,
    semester: input.semester,
    tanggalRapor: input.tanggalRapor,
    rombel: [],
    murid: [],
    mapel: [],
    pilihan: [],
    sumatif: [],
    tujuan: [],
    nilaiSumatif: [],
    nilaiTujuan: [],
    deskripsi: [],
    kokurikuler: [],
    ekskul: [],
    absensi: [],
    catatan: [],
  };
}

export function ubahSekolah(berkas: Berkas, sekolah: Sekolah, tahunAjaran: string, semester: 1 | 2, tanggalRapor: string): Berkas {
  const berikutnya = salin(berkas);
  const jenjangTerkunci = berikutnya.rombel.length > 0;
  berikutnya.sekolah = {
    ...sekolah,
    jenjang: jenjangTerkunci ? berikutnya.sekolah.jenjang : sekolah.jenjang,
    programSmk: jenjangTerkunci ? berikutnya.sekolah.programSmk : sekolah.programSmk,
  };
  berikutnya.tahunAjaran = tahunAjaran;
  berikutnya.semester = semester;
  berikutnya.tanggalRapor = tanggalRapor;
  return berikutnya;
}

export function tambahRombel(berkas: Berkas, input: { kelas: string; paralel: string; waliKelas: string }): Berkas {
  const info = infoKelas(berkas.sekolah.jenjang, berkas.sekolah.programSmk, input.kelas);
  if (!info) return berkas;
  const berikutnya = salin(berkas);
  const rombelId = uid();
  berikutnya.rombel.push({
    id: rombelId,
    kelas: info.nilai,
    paralel: input.paralel.trim(),
    fase: info.fase,
    waliKelas: input.waliKelas.trim(),
    mode: "semester",
    sembunyikanAngka: info.fase === "A" ? false : false,
    ambang: null,
  });
  const templat = templatMapel(berkas.sekolah.jenjang, info.nilai, berkas.sekolah.programSmk);
  templat.forEach((item, indeks) => {
    if (item.jenis === "agama") return;
    berikutnya.mapel.push(mapelDariTemplat(rombelId, item.kode, item.nama, item.kelompok, item.jenis, item.berlakuUntuk, !item.opsional, indeks));
  });
  return berikutnya;
}

function mapelDariTemplat(
  rombelId: string,
  kode: string,
  nama: string,
  kelompok: KelompokMapel,
  jenis: Mapel["jenis"],
  berlakuUntuk: Mapel["berlakuUntuk"],
  aktif: boolean,
  urutan: number,
): Mapel {
  return {
    id: uid(),
    rombelId,
    kode,
    nama,
    kelompok,
    jenis,
    urutan,
    aktif,
    berlakuUntuk,
    opsiHitung: "rata-rata",
    progresif: false,
    bawaan: true,
  };
}

export function hapusRombel(berkas: Berkas, rombelId: string): Berkas {
  const berikutnya = salin(berkas);
  const muridId = new Set(berikutnya.murid.filter((item) => item.rombelId === rombelId).map((item) => item.id));
  const mapelId = new Set(berikutnya.mapel.filter((item) => item.rombelId === rombelId).map((item) => item.id));
  berikutnya.rombel = berikutnya.rombel.filter((item) => item.id !== rombelId);
  berikutnya.murid = berikutnya.murid.filter((item) => item.rombelId !== rombelId);
  berikutnya.mapel = berikutnya.mapel.filter((item) => item.rombelId !== rombelId);
  berikutnya.pilihan = berikutnya.pilihan.filter((item) => !muridId.has(item.muridId) && !mapelId.has(item.mapelId));
  berikutnya.sumatif = berikutnya.sumatif.filter((item) => !mapelId.has(item.mapelId));
  berikutnya.tujuan = berikutnya.tujuan.filter((item) => !mapelId.has(item.mapelId));
  const sumatifId = new Set(berkas.sumatif.filter((item) => mapelId.has(item.mapelId)).map((item) => item.id));
  const tujuanId = new Set(berkas.tujuan.filter((item) => mapelId.has(item.mapelId)).map((item) => item.id));
  berikutnya.nilaiSumatif = berikutnya.nilaiSumatif.filter((item) => !muridId.has(item.muridId) && !sumatifId.has(item.butirId));
  berikutnya.nilaiTujuan = berikutnya.nilaiTujuan.filter((item) => !muridId.has(item.muridId) && !tujuanId.has(item.tujuanId));
  berikutnya.deskripsi = berikutnya.deskripsi.filter((item) => !muridId.has(item.muridId));
  berikutnya.kokurikuler = berikutnya.kokurikuler.filter((item) => !muridId.has(item.muridId));
  berikutnya.ekskul = berikutnya.ekskul.filter((item) => !muridId.has(item.muridId));
  berikutnya.absensi = berikutnya.absensi.filter((item) => !muridId.has(item.muridId));
  berikutnya.catatan = berikutnya.catatan.filter((item) => !muridId.has(item.muridId));
  return berikutnya;
}

export function ubahRombel(
  berkas: Berkas,
  rombelId: string,
  perubahan: Partial<Pick<import("./types").Rombel, "paralel" | "waliKelas" | "mode" | "sembunyikanAngka" | "ambang">>,
): Berkas {
  const berikutnya = salin(berkas);
  const rombel = berikutnya.rombel.find((item) => item.id === rombelId);
  if (!rombel) return berkas;
  Object.assign(rombel, perubahan);
  return berikutnya;
}

export function tambahMurid(berkas: Berkas, input: { rombelId: string; nama: string; nisn: string; nis: string; agama: Agama }): Berkas {
  const berikutnya = salin(berkas);
  const murid = {
    id: uid(),
    rombelId: input.rombelId,
    nama: input.nama.trim(),
    nisn: input.nisn.trim(),
    nis: input.nis.trim(),
    agama: input.agama,
  };
  berikutnya.murid.push(murid);
  berikutnya.absensi.push({ muridId: murid.id, sakit: 0, izin: 0, alfa: 0 });
  berikutnya.catatan.push({ muridId: murid.id, catatanWali: "", tanggapanOrtu: "", keputusan: "", catatanKeputusan: "" });
  berikutnya.kokurikuler.push({
    muridId: murid.id,
    kegiatan: "",
    dimensiKuat: [],
    buktiKuat: "",
    dimensiPerlu: [],
    buktiPerlu: "",
    deskripsi: "",
  });
  selaraskanAgama(berikutnya, murid.id);
  return berikutnya;
}

export function ubahMurid(
  berkas: Berkas,
  muridId: string,
  perubahan: Partial<Pick<import("./types").Murid, "nama" | "nisn" | "nis" | "agama">>,
): Berkas {
  const berikutnya = salin(berkas);
  const murid = berikutnya.murid.find((item) => item.id === muridId);
  if (!murid) return berkas;
  Object.assign(murid, {
    nama: perubahan.nama?.trim() ?? murid.nama,
    nisn: perubahan.nisn?.trim() ?? murid.nisn,
    nis: perubahan.nis?.trim() ?? murid.nis,
    agama: perubahan.agama ?? murid.agama,
  });
  selaraskanAgama(berikutnya, muridId);
  return berikutnya;
}

export function hapusMurid(berkas: Berkas, muridId: string): Berkas {
  const berikutnya = salin(berkas);
  berikutnya.murid = berikutnya.murid.filter((item) => item.id !== muridId);
  berikutnya.pilihan = berikutnya.pilihan.filter((item) => item.muridId !== muridId);
  berikutnya.nilaiSumatif = berikutnya.nilaiSumatif.filter((item) => item.muridId !== muridId);
  berikutnya.nilaiTujuan = berikutnya.nilaiTujuan.filter((item) => item.muridId !== muridId);
  berikutnya.deskripsi = berikutnya.deskripsi.filter((item) => item.muridId !== muridId);
  berikutnya.kokurikuler = berikutnya.kokurikuler.filter((item) => item.muridId !== muridId);
  berikutnya.ekskul = berikutnya.ekskul.filter((item) => item.muridId !== muridId);
  berikutnya.absensi = berikutnya.absensi.filter((item) => item.muridId !== muridId);
  berikutnya.catatan = berikutnya.catatan.filter((item) => item.muridId !== muridId);
  return berikutnya;
}

function selaraskanAgama(berkas: Berkas, muridId: string): void {
  const murid = berkas.murid.find((item) => item.id === muridId);
  if (!murid) return;
  const rombel = berkas.rombel.find((item) => item.id === murid.rombelId);
  if (!rombel) return;
  const adaAgama = templatMapel(berkas.sekolah.jenjang, rombel.kelas, berkas.sekolah.programSmk).some((item) => item.jenis === "agama");
  if (!adaAgama) return;
  const kode = `agama-${murid.agama}`;
  let mapel = berkas.mapel.find((item) => item.rombelId === rombel.id && item.kode === kode);
  if (!mapel) {
    mapel = {
      id: uid(),
      rombelId: rombel.id,
      kode,
      nama: NAMA_AGAMA[murid.agama],
      kelompok: berkas.sekolah.jenjang === "SMA" && rombel.fase === "F" ? "umum" : berkas.sekolah.jenjang === "SMK" ? "umum" : "wajib",
      jenis: "agama",
      urutan: -10 + AGAMA.indexOf(murid.agama),
      aktif: true,
      berlakuUntuk: "per-murid",
      opsiHitung: "rata-rata",
      progresif: false,
      bawaan: true,
    };
    berkas.mapel.push(mapel);
  }
  berkas.pilihan = berkas.pilihan.filter((item) => {
    if (item.muridId !== muridId) return true;
    const terkait = berkas.mapel.find((mapelItem) => mapelItem.id === item.mapelId);
    return terkait?.jenis !== "agama";
  });
  berkas.pilihan.push({ muridId, mapelId: mapel.id });
}

export function tambahMapel(
  berkas: Berkas,
  input: { rombelId: string; nama: string; kelompok: KelompokMapel; berlakuUntuk: "semua" | "per-murid" },
): Berkas {
  const berikutnya = salin(berkas);
  const urutan = berikutnya.mapel.filter((item) => item.rombelId === input.rombelId).reduce((maks, item) => Math.max(maks, item.urutan), -1) + 1;
  berikutnya.mapel.push({
    id: uid(),
    rombelId: input.rombelId,
    kode: `kustom-${urutan}`,
    nama: input.nama.trim(),
    kelompok: input.kelompok,
    jenis: "biasa",
    urutan,
    aktif: true,
    berlakuUntuk: input.berlakuUntuk,
    opsiHitung: "rata-rata",
    progresif: false,
    bawaan: false,
  });
  return berikutnya;
}

export function ubahMapel(
  berkas: Berkas,
  mapelId: string,
  perubahan: Partial<Pick<Mapel, "nama" | "aktif" | "opsiHitung" | "progresif" | "kelompok" | "berlakuUntuk">>,
): Berkas {
  const berikutnya = salin(berkas);
  const mapel = berikutnya.mapel.find((item) => item.id === mapelId);
  if (!mapel) return berkas;
  Object.assign(mapel, perubahan);
  return berikutnya;
}

export function hapusMapel(berkas: Berkas, mapelId: string): Berkas {
  const berikutnya = salin(berkas);
  const mapel = berikutnya.mapel.find((item) => item.id === mapelId);
  if (!mapel || mapel.bawaan) return berkas;
  const sumatifId = new Set(berikutnya.sumatif.filter((item) => item.mapelId === mapelId).map((item) => item.id));
  const tujuanId = new Set(berikutnya.tujuan.filter((item) => item.mapelId === mapelId).map((item) => item.id));
  berikutnya.mapel = berikutnya.mapel.filter((item) => item.id !== mapelId);
  berikutnya.pilihan = berikutnya.pilihan.filter((item) => item.mapelId !== mapelId);
  berikutnya.sumatif = berikutnya.sumatif.filter((item) => item.mapelId !== mapelId);
  berikutnya.tujuan = berikutnya.tujuan.filter((item) => item.mapelId !== mapelId);
  berikutnya.nilaiSumatif = berikutnya.nilaiSumatif.filter((item) => !sumatifId.has(item.butirId));
  berikutnya.nilaiTujuan = berikutnya.nilaiTujuan.filter((item) => !tujuanId.has(item.tujuanId));
  berikutnya.deskripsi = berikutnya.deskripsi.filter((item) => item.mapelId !== mapelId);
  return berikutnya;
}

export function aturPilihan(berkas: Berkas, muridId: string, mapelId: string, ikut: boolean): Berkas {
  const berikutnya = salin(berkas);
  const ada = berikutnya.pilihan.some((item) => item.muridId === muridId && item.mapelId === mapelId);
  if (ikut && !ada) berikutnya.pilihan.push({ muridId, mapelId });
  if (!ikut && ada) berikutnya.pilihan = berikutnya.pilihan.filter((item) => !(item.muridId === muridId && item.mapelId === mapelId));
  return berikutnya;
}

export function pilihSeni(berkas: Berkas, muridId: string, mapelId: string): Berkas {
  const berikutnya = salin(berkas);
  const murid = berikutnya.murid.find((item) => item.id === muridId);
  if (!murid) return berkas;
  const seniId = new Set(
    berikutnya.mapel.filter((item) => item.rombelId === murid.rombelId && item.jenis === "seni").map((item) => item.id),
  );
  berikutnya.pilihan = berikutnya.pilihan.filter((item) => item.muridId !== muridId || !seniId.has(item.mapelId));
  if (mapelId) berikutnya.pilihan.push({ muridId, mapelId });
  return berikutnya;
}

export function tambahSumatif(berkas: Berkas, mapelId: string, nama: string): Berkas {
  const berikutnya = salin(berkas);
  const urutan = berikutnya.sumatif.filter((item) => item.mapelId === mapelId).reduce((maks, item) => Math.max(maks, item.urutan), -1) + 1;
  berikutnya.sumatif.push({ id: uid(), mapelId, urutan, nama: nama.trim() || `Sumatif ${urutan + 1}`, bobot: null, akhirSemester: false });
  return berikutnya;
}

export function ubahSumatif(
  berkas: Berkas,
  sumatifId: string,
  perubahan: Partial<Pick<import("./types").Sumatif, "nama" | "bobot" | "akhirSemester">>,
): Berkas {
  const berikutnya = salin(berkas);
  const sumatif = berikutnya.sumatif.find((item) => item.id === sumatifId);
  if (!sumatif) return berkas;
  Object.assign(sumatif, perubahan);
  return berikutnya;
}

export function hapusSumatif(berkas: Berkas, sumatifId: string): Berkas {
  const berikutnya = salin(berkas);
  berikutnya.sumatif = berikutnya.sumatif.filter((item) => item.id !== sumatifId);
  berikutnya.nilaiSumatif = berikutnya.nilaiSumatif.filter((item) => item.butirId !== sumatifId);
  return berikutnya;
}

export function tambahTujuan(berkas: Berkas, mapelId: string, nama: string): Berkas {
  const berikutnya = salin(berkas);
  const urutan = berikutnya.tujuan.filter((item) => item.mapelId === mapelId).reduce((maks, item) => Math.max(maks, item.urutan), -1) + 1;
  berikutnya.tujuan.push({ id: uid(), mapelId, urutan, nama: nama.trim() || `Tujuan pembelajaran ${urutan + 1}`, bobot: null });
  return berikutnya;
}

export function ubahTujuan(berkas: Berkas, tujuanId: string, perubahan: Partial<Pick<import("./types").Tujuan, "nama" | "bobot">>): Berkas {
  const berikutnya = salin(berkas);
  const tujuan = berikutnya.tujuan.find((item) => item.id === tujuanId);
  if (!tujuan) return berkas;
  Object.assign(tujuan, perubahan);
  return berikutnya;
}

export function hapusTujuan(berkas: Berkas, tujuanId: string): Berkas {
  const berikutnya = salin(berkas);
  berikutnya.tujuan = berikutnya.tujuan.filter((item) => item.id !== tujuanId);
  berikutnya.nilaiTujuan = berikutnya.nilaiTujuan.filter((item) => item.tujuanId !== tujuanId);
  return berikutnya;
}

export function setNilaiSumatif(berkas: Berkas, muridId: string, butirId: string, nilai: number | null): Berkas {
  const berikutnya = salin(berkas);
  const ada = berikutnya.nilaiSumatif.find((item) => item.muridId === muridId && item.butirId === butirId);
  if (ada) ada.nilai = nilai;
  else berikutnya.nilaiSumatif.push({ muridId, butirId, nilai });
  return berikutnya;
}

export function setNilaiTujuan(
  berkas: Berkas,
  muridId: string,
  tujuanId: string,
  perubahan: { nilai?: number | null; skala?: SkalaKualitatif | null },
): Berkas {
  const berikutnya = salin(berkas);
  let ada = berikutnya.nilaiTujuan.find((item) => item.muridId === muridId && item.tujuanId === tujuanId);
  if (!ada) {
    ada = { muridId, tujuanId, nilai: null, skala: null };
    berikutnya.nilaiTujuan.push(ada);
  }
  if ("nilai" in perubahan) ada.nilai = perubahan.nilai ?? null;
  if ("skala" in perubahan) ada.skala = perubahan.skala ?? null;
  return berikutnya;
}

export function setDeskripsi(berkas: Berkas, muridId: string, mapelId: string, teks: string, catatanGuru?: string): Berkas {
  const berikutnya = salin(berkas);
  let ada = berikutnya.deskripsi.find((item) => item.muridId === muridId && item.mapelId === mapelId);
  if (!ada) {
    ada = { muridId, mapelId, teks: "", catatanGuru: "" };
    berikutnya.deskripsi.push(ada);
  }
  ada.teks = teks;
  if (catatanGuru !== undefined) ada.catatanGuru = catatanGuru;
  return berikutnya;
}

export function setKokurikuler(berkas: Berkas, muridId: string, perubahan: Partial<import("./types").Kokurikuler>): Berkas {
  const berikutnya = salin(berkas);
  let ada = berikutnya.kokurikuler.find((item) => item.muridId === muridId);
  if (!ada) {
    ada = { muridId, kegiatan: "", dimensiKuat: [], buktiKuat: "", dimensiPerlu: [], buktiPerlu: "", deskripsi: "" };
    berikutnya.kokurikuler.push(ada);
  }
  Object.assign(ada, perubahan, { muridId });
  return berikutnya;
}

export function tambahEkskul(berkas: Berkas, muridId: string, nama: string): Berkas {
  const berikutnya = salin(berkas);
  berikutnya.ekskul.push({ id: uid(), muridId, nama: nama.trim(), keterangan: "" });
  return berikutnya;
}

export function ubahEkskul(berkas: Berkas, ekskulId: string, perubahan: Partial<Pick<import("./types").Ekskul, "nama" | "keterangan">>): Berkas {
  const berikutnya = salin(berkas);
  const ekskul = berikutnya.ekskul.find((item) => item.id === ekskulId);
  if (!ekskul) return berkas;
  Object.assign(ekskul, perubahan);
  return berikutnya;
}

export function hapusEkskul(berkas: Berkas, ekskulId: string): Berkas {
  const berikutnya = salin(berkas);
  berikutnya.ekskul = berikutnya.ekskul.filter((item) => item.id !== ekskulId);
  return berikutnya;
}

export function setAbsensi(berkas: Berkas, muridId: string, perubahan: Partial<Pick<import("./types").Absensi, "sakit" | "izin" | "alfa">>): Berkas {
  const berikutnya = salin(berkas);
  let ada = berikutnya.absensi.find((item) => item.muridId === muridId);
  if (!ada) {
    ada = { muridId, sakit: 0, izin: 0, alfa: 0 };
    berikutnya.absensi.push(ada);
  }
  Object.assign(ada, perubahan);
  return berikutnya;
}

export function setCatatan(
  berkas: Berkas,
  muridId: string,
  perubahan: Partial<{ catatanWali: string; tanggapanOrtu: string; keputusan: KeputusanKenaikan; catatanKeputusan: string }>,
): Berkas {
  const berikutnya = salin(berkas);
  let ada = berikutnya.catatan.find((item) => item.muridId === muridId);
  if (!ada) {
    ada = { muridId, catatanWali: "", tanggapanOrtu: "", keputusan: "", catatanKeputusan: "" };
    berikutnya.catatan.push(ada);
  }
  Object.assign(ada, perubahan);
  return berikutnya;
}

export function terapkanNilaiImpor(
  berkas: Berkas,
  mapelId: string,
  mode: ModePenilaian,
  baris: { muridId: string; nilai: { butirId: string; nilai: number | null }[]; catatan: string }[],
): Berkas {
  let berikutnya = salin(berkas);
  for (const item of baris) {
    for (const nilai of item.nilai) {
      berikutnya = mode === "semester"
        ? setNilaiSumatif(berikutnya, item.muridId, nilai.butirId, nilai.nilai)
        : setNilaiTujuan(berikutnya, item.muridId, nilai.butirId, { nilai: nilai.nilai });
    }
    if (item.catatan.trim()) {
      const ada = berikutnya.deskripsi.find((desk) => desk.muridId === item.muridId && desk.mapelId === mapelId);
      berikutnya = setDeskripsi(berikutnya, item.muridId, mapelId, ada?.teks ?? "", item.catatan.trim());
    }
  }
  return berikutnya;
}

export type { ModePenilaian, OpsiHitung };
