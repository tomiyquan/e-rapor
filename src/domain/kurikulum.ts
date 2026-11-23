import type { Fase, Jenjang, KelompokMapel, TemplatMapel } from "./types";

export interface InfoKelas {
  nilai: string;
  label: string;
  fase: Fase;
}

const SENI_DASAR = ["Seni Musik", "Seni Rupa", "Seni Teater", "Seni Tari"] as const;
const PRAKARYA = ["Prakarya"] as const;

function mapel(
  kode: string,
  nama: string,
  kelompok: KelompokMapel,
  ekstra: Partial<TemplatMapel> = {},
): TemplatMapel {
  return {
    kode,
    nama,
    kelompok,
    jenis: "biasa",
    opsional: false,
    berlakuUntuk: "semua",
    ...ekstra,
  };
}

function agama(kelompok: KelompokMapel): TemplatMapel {
  return mapel("agama", "Pendidikan Agama dan Budi Pekerti", kelompok, {
    jenis: "agama",
    berlakuUntuk: "per-murid",
  });
}

function seni(kelompok: KelompokMapel, denganPrakarya: boolean): TemplatMapel[] {
  const daftar = denganPrakarya ? [...SENI_DASAR, ...PRAKARYA] : [...SENI_DASAR];
  return daftar.map((nama) =>
    mapel(
      `seni-${nama.toLowerCase().replaceAll(" ", "-")}`,
      nama,
      kelompok,
      { jenis: "seni", berlakuUntuk: "per-murid" },
    ),
  );
}

function inggris(kelompok: KelompokMapel, opsional: boolean): TemplatMapel {
  return mapel("bahasa-inggris", "Bahasa Inggris", kelompok, { opsional });
}

const UMUM_SD_AWAL: TemplatMapel[] = [
  agama("wajib"),
  mapel("pancasila", "Pendidikan Pancasila", "wajib"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "wajib"),
  mapel("matematika", "Matematika", "wajib"),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "wajib"),
  ...seni("wajib", false),
  inggris("wajib", true),
];

const UMUM_SD_LANJUT: TemplatMapel[] = [
  agama("wajib"),
  mapel("pancasila", "Pendidikan Pancasila", "wajib"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "wajib"),
  mapel("matematika", "Matematika", "wajib"),
  mapel("ipas", "Ilmu Pengetahuan Alam dan Sosial", "wajib"),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "wajib"),
  ...seni("wajib", false),
  inggris("wajib", true),
];

const MI_AWAL: TemplatMapel[] = [
  mapel("quran-hadis", "Al-Qur'an Hadis", "wajib"),
  mapel("akidah-akhlak", "Akidah Akhlak", "wajib"),
  mapel("fikih", "Fikih", "wajib"),
  mapel("bahasa-arab", "Bahasa Arab", "wajib"),
  mapel("pancasila", "Pendidikan Pancasila", "wajib"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "wajib"),
  mapel("matematika", "Matematika", "wajib"),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "wajib"),
  ...seni("wajib", false),
  inggris("wajib", true),
];

const MI_LANJUT: TemplatMapel[] = [
  mapel("quran-hadis", "Al-Qur'an Hadis", "wajib"),
  mapel("akidah-akhlak", "Akidah Akhlak", "wajib"),
  mapel("fikih", "Fikih", "wajib"),
  mapel("ski", "Sejarah Kebudayaan Islam", "wajib"),
  mapel("bahasa-arab", "Bahasa Arab", "wajib"),
  mapel("pancasila", "Pendidikan Pancasila", "wajib"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "wajib"),
  mapel("matematika", "Matematika", "wajib"),
  mapel("ipas", "Ilmu Pengetahuan Alam dan Sosial", "wajib"),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "wajib"),
  ...seni("wajib", false),
  inggris("wajib", true),
  mapel("koding-ai", "Koding dan Kecerdasan Artifisial", "pilihan", {
    jenis: "pilihan",
    opsional: true,
    berlakuUntuk: "per-murid",
  }),
];

const SMP: TemplatMapel[] = [
  agama("wajib"),
  mapel("pancasila", "Pendidikan Pancasila", "wajib"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "wajib"),
  mapel("matematika", "Matematika", "wajib"),
  mapel("ipa", "Ilmu Pengetahuan Alam", "wajib"),
  mapel("ips", "Ilmu Pengetahuan Sosial", "wajib"),
  inggris("wajib", false),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "wajib"),
  mapel("informatika", "Informatika", "wajib"),
  ...seni("wajib", true),
];

const MTS: TemplatMapel[] = [
  mapel("quran-hadis", "Al-Qur'an Hadis", "wajib"),
  mapel("akidah-akhlak", "Akidah Akhlak", "wajib"),
  mapel("fikih", "Fikih", "wajib"),
  mapel("ski", "Sejarah Kebudayaan Islam", "wajib"),
  mapel("bahasa-arab", "Bahasa Arab", "wajib"),
  mapel("pancasila", "Pendidikan Pancasila", "wajib"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "wajib"),
  mapel("matematika", "Matematika", "wajib"),
  mapel("ipa", "Ilmu Pengetahuan Alam", "wajib"),
  mapel("ips", "Ilmu Pengetahuan Sosial", "wajib"),
  inggris("wajib", false),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "wajib"),
  mapel("informatika", "Informatika", "wajib"),
  ...seni("wajib", true),
  mapel("koding-ai", "Koding dan Kecerdasan Artifisial", "pilihan", {
    jenis: "pilihan",
    opsional: true,
    berlakuUntuk: "per-murid",
  }),
];

const SMA_X: TemplatMapel[] = [
  agama("wajib"),
  mapel("pancasila", "Pendidikan Pancasila", "wajib"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "wajib"),
  mapel("matematika", "Matematika", "wajib"),
  mapel("ipa", "Ilmu Pengetahuan Alam (Fisika, Kimia, Biologi)", "wajib"),
  mapel("ips", "Ilmu Pengetahuan Sosial (Sosiologi, Ekonomi, Sejarah, Geografi)", "wajib"),
  inggris("wajib", false),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "wajib"),
  mapel("informatika", "Informatika", "wajib"),
  ...seni("wajib", true),
];

const PILIHAN_SMA = [
  "Antropologi",
  "Bahasa Arab",
  "Bahasa Indonesia Tingkat Lanjut",
  "Bahasa Inggris Tingkat Lanjut",
  "Bahasa Jepang",
  "Bahasa Jerman",
  "Bahasa Korea",
  "Bahasa Mandarin",
  "Bahasa Prancis",
  "Biologi",
  "Ekonomi",
  "Fisika",
  "Geografi",
  "Informatika",
  "Kimia",
  "Matematika Tingkat Lanjut",
  "Sejarah Tingkat Lanjut",
  "Sosiologi",
  "Prakarya dan Kewirausahaan",
].map((nama) =>
  mapel(`pilihan-${nama.toLowerCase().replaceAll(" ", "-")}`, nama, "pilihan", {
    jenis: "pilihan",
    opsional: true,
    berlakuUntuk: "per-murid",
  }),
);

const SMA_F: TemplatMapel[] = [
  agama("umum"),
  mapel("pancasila", "Pendidikan Pancasila", "umum"),
  mapel("bahasa-indonesia", "Bahasa Indonesia", "umum"),
  mapel("matematika", "Matematika", "umum"),
  inggris("umum", false),
  mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "umum"),
  mapel("sejarah", "Sejarah", "umum"),
  ...seni("umum", false),
  ...PILIHAN_SMA,
];

function smkUmumAwal(denganPjokSejarah: boolean): TemplatMapel[] {
  const dasar = [
    agama("umum"),
    mapel("pancasila", "Pendidikan Pancasila", "umum"),
    mapel("bahasa-indonesia", "Bahasa Indonesia", "umum"),
  ];
  if (!denganPjokSejarah) return dasar;
  return [
    ...dasar,
    mapel("pjok", "Pendidikan Jasmani, Olahraga, dan Kesehatan", "umum"),
    mapel("sejarah", "Sejarah", "umum"),
    ...seni("umum", false),
  ];
}

const SMK_X: TemplatMapel[] = [
  ...smkUmumAwal(true),
  mapel("matematika", "Matematika", "kejuruan"),
  inggris("kejuruan", false),
  mapel("informatika", "Informatika", "kejuruan"),
  mapel("projek-ipas", "Projek Ilmu Pengetahuan Alam dan Sosial", "kejuruan"),
  mapel("dasar-keahlian", "Dasar-Dasar Program Keahlian", "kejuruan", { jenis: "kejuruan-nama" }),
];

const SMK_XI: TemplatMapel[] = [
  ...smkUmumAwal(true).filter((item) => item.jenis !== "seni"),
  mapel("matematika", "Matematika", "kejuruan"),
  inggris("kejuruan", false),
  mapel("konsentrasi", "Konsentrasi Keahlian", "kejuruan", { jenis: "kejuruan-nama" }),
  mapel("pk2", "Projek Kreatif dan Kewirausahaan", "kejuruan"),
];

const SMK_XII_3: TemplatMapel[] = [
  ...smkUmumAwal(false),
  mapel("matematika", "Matematika", "kejuruan"),
  inggris("kejuruan", false),
  mapel("konsentrasi", "Konsentrasi Keahlian", "kejuruan", { jenis: "kejuruan-nama" }),
  mapel("pk2", "Projek Kreatif dan Kewirausahaan", "kejuruan"),
  mapel("pkl", "Praktik Kerja Lapangan", "kejuruan", { jenis: "pkl" }),
];

const SMK_XII_4: TemplatMapel[] = [
  ...smkUmumAwal(true).filter((item) => item.jenis !== "seni"),
  mapel("matematika", "Matematika", "kejuruan"),
  inggris("kejuruan", false),
  mapel("konsentrasi", "Konsentrasi Keahlian", "kejuruan", { jenis: "kejuruan-nama" }),
  mapel("pk2", "Projek Kreatif dan Kewirausahaan", "kejuruan"),
];

const SMK_XIII: TemplatMapel[] = [
  mapel("matematika", "Matematika", "kejuruan"),
  inggris("kejuruan", false),
  mapel("pkl", "Praktik Kerja Lapangan", "kejuruan", { jenis: "pkl" }),
];

export function daftarKelas(jenjang: Jenjang, programSmk: 3 | 4): InfoKelas[] {
  if (jenjang === "SD" || jenjang === "MI") {
    return [
      { nilai: "1", label: "I", fase: "A" },
      { nilai: "2", label: "II", fase: "A" },
      { nilai: "3", label: "III", fase: "B" },
      { nilai: "4", label: "IV", fase: "B" },
      { nilai: "5", label: "V", fase: "C" },
      { nilai: "6", label: "VI", fase: "C" },
    ];
  }
  if (jenjang === "SMP" || jenjang === "MTs") {
    return [
      { nilai: "7", label: "VII", fase: "D" },
      { nilai: "8", label: "VIII", fase: "D" },
      { nilai: "9", label: "IX", fase: "D" },
    ];
  }
  if (jenjang === "SMA") {
    return [
      { nilai: "10", label: "X", fase: "E" },
      { nilai: "11", label: "XI", fase: "F" },
      { nilai: "12", label: "XII", fase: "F" },
    ];
  }
  const dasar = [
    { nilai: "10", label: "X", fase: "E" as const },
    { nilai: "11", label: "XI", fase: "F" as const },
    { nilai: "12", label: "XII", fase: "F" as const },
  ];
  return programSmk === 4 ? [...dasar, { nilai: "13", label: "XIII", fase: "F" }] : dasar;
}

export function infoKelas(jenjang: Jenjang, programSmk: 3 | 4, kelas: string): InfoKelas | undefined {
  return daftarKelas(jenjang, programSmk).find((item) => item.nilai === kelas);
}

export function templatMapel(jenjang: Jenjang, kelas: string, programSmk: 3 | 4): TemplatMapel[] {
  if (jenjang === "SD") return Number(kelas) <= 2 ? UMUM_SD_AWAL : UMUM_SD_LANJUT;
  if (jenjang === "MI") return Number(kelas) <= 2 ? MI_AWAL : MI_LANJUT;
  if (jenjang === "SMP") return SMP;
  if (jenjang === "MTs") return MTS;
  if (jenjang === "SMA") return kelas === "10" ? SMA_X : SMA_F;
  if (kelas === "10") return SMK_X;
  if (kelas === "11") return SMK_XI;
  if (kelas === "13") return SMK_XIII;
  return programSmk === 4 ? SMK_XII_4 : SMK_XII_3;
}

export function labelKelompok(jenjang: Jenjang, kelompok: KelompokMapel): string | null {
  if (kelompok === "mulok") return "Muatan Lokal";
  if (jenjang === "SMK") {
    if (kelompok === "umum") return "Kelompok Mata Pelajaran Umum";
    if (kelompok === "kejuruan") return "Kelompok Mata Pelajaran Kejuruan";
    return null;
  }
  if (jenjang === "SMA") {
    if (kelompok === "umum") return "Kelompok Mata Pelajaran Wajib";
    if (kelompok === "pilihan") return "Kelompok Mata Pelajaran Pilihan";
  }
  if (kelompok === "pilihan") return "Kelompok Mata Pelajaran Pilihan";
  return null;
}

export const NAMA_JENJANG: Record<Jenjang, string> = {
  SD: "SD",
  MI: "MI",
  SMP: "SMP",
  MTs: "MTs",
  SMA: "SMA",
  SMK: "SMK",
};
