import { useState } from "react";
import { namaBerkas, normalkan } from "../domain/berkas";
import { unduhBerkas } from "../domain/lembar";
import type { Jenjang, Sekolah } from "../domain/types";
import { buatBerkas, ubahSekolah } from "../domain/ubah";
import { useBerkas } from "../state/BerkasContext";
import { Bidang, Pesan } from "./komponen";

const JENJANG: Jenjang[] = ["SD", "MI", "SMP", "MTs", "SMA", "SMK"];

const kosong: Sekolah = {
  nama: "",
  npsn: "",
  alamat: "",
  kepalaSekolah: "",
  jenjang: "SD",
  programSmk: 3,
  kota: "",
};

export function BerkasView() {
  const { berkas, ganti, ubah, adaPerubahan, tandaiTersimpan } = useBerkas();
  const [draf, setDraf] = useState<Sekolah>(berkas?.sekolah ?? kosong);
  const [tahun, setTahun] = useState(berkas?.tahunAjaran ?? "2026/2027");
  const [semester, setSemester] = useState<1 | 2>(berkas?.semester ?? 1);
  const [tanggal, setTanggal] = useState(berkas?.tanggalRapor ?? "");
  const [galat, setGalat] = useState("");

  function simpanIdentitas() {
    if (!draf.nama.trim()) {
      setGalat("Isi nama satuan pendidikan.");
      return;
    }
    setGalat("");
    if (!berkas) {
      ganti(buatBerkas({ sekolah: { ...draf, nama: draf.nama.trim() }, tahunAjaran: tahun.trim(), semester, tanggalRapor: tanggal }));
      return;
    }
    ubah((saatIni) => ubahSekolah(saatIni, draf, tahun.trim(), semester, tanggal));
  }

  function simpanBerkas() {
    if (!berkas) return;
    unduhBerkas(namaBerkas(berkas), JSON.stringify(berkas, null, 2), "application/json");
    tandaiTersimpan();
  }

  async function bukaBerkas(berkasFile: File | undefined) {
    if (!berkasFile) return;
    try {
      const hasil = normalkan(JSON.parse(await berkasFile.text()));
      if ("error" in hasil) {
        setGalat(hasil.error);
        return;
      }
      setGalat("");
      setDraf(hasil.berkas.sekolah);
      setTahun(hasil.berkas.tahunAjaran);
      setSemester(hasil.berkas.semester);
      setTanggal(hasil.berkas.tanggalRapor);
      ganti(hasil.berkas, true);
    } catch {
      setGalat("Berkas tidak dapat dibaca. Pilih berkas .erapor.json yang dibuat aplikasi ini.");
    }
  }

  const terkunci = (berkas?.rombel.length ?? 0) > 0;

  return (
    <section className="kartu">
      <div className="judul-bagian">
        <h2>Berkas sekolah</h2>
        <div className="tombol-baris">
          <label className="tombol kedua">
            Buka berkas
            <input
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(event) => {
                void bukaBerkas(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <button className="tombol" type="button" onClick={simpanBerkas} disabled={!berkas}>
            Simpan berkas
          </button>
        </div>
      </div>
      <p className="senyap">
        Satu berkas menyimpan satu semester. Simpan ke komputer atau flashdisk setelah mengisi. Salinan kerja tetap ada di
        peramban ini sampai berkas dibuka di komputer lain.
      </p>
      {adaPerubahan && berkas && <Pesan jenis="info" anak="Ada perubahan yang belum disimpan ke berkas." />}
      {galat && <Pesan jenis="galat" anak={galat} />}
      <div className="kisi">
        <Bidang label="Nama satuan pendidikan" id="nama-sekolah">
          <input id="nama-sekolah" value={draf.nama} onChange={(event) => setDraf({ ...draf, nama: event.target.value })} />
        </Bidang>
        <Bidang label="NPSN" id="npsn">
          <input id="npsn" value={draf.npsn} onChange={(event) => setDraf({ ...draf, npsn: event.target.value })} />
        </Bidang>
        <Bidang label="Jenjang" id="jenjang">
          <select
            id="jenjang"
            value={draf.jenjang}
            disabled={terkunci}
            onChange={(event) => setDraf({ ...draf, jenjang: event.target.value as Jenjang })}
          >
            {JENJANG.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Bidang>
        {draf.jenjang === "SMK" && (
          <Bidang label="Program SMK" id="program-smk">
            <select
              id="program-smk"
              value={draf.programSmk}
              disabled={terkunci}
              onChange={(event) => setDraf({ ...draf, programSmk: Number(event.target.value) === 4 ? 4 : 3 })}
            >
              <option value={3}>3 tahun</option>
              <option value={4}>4 tahun</option>
            </select>
          </Bidang>
        )}
        <Bidang label="Kepala sekolah" id="kepala">
          <input id="kepala" value={draf.kepalaSekolah} onChange={(event) => setDraf({ ...draf, kepalaSekolah: event.target.value })} />
        </Bidang>
        <Bidang label="Kota pada rapor" id="kota">
          <input id="kota" value={draf.kota} onChange={(event) => setDraf({ ...draf, kota: event.target.value })} />
        </Bidang>
        <Bidang label="Tahun ajaran" id="tahun">
          <input id="tahun" value={tahun} onChange={(event) => setTahun(event.target.value)} placeholder="2026/2027" />
        </Bidang>
        <Bidang label="Semester" id="semester">
          <select id="semester" value={semester} onChange={(event) => setSemester(event.target.value === "2" ? 2 : 1)}>
            <option value={1}>1 (Ganjil)</option>
            <option value={2}>2 (Genap)</option>
          </select>
        </Bidang>
        <Bidang label="Tanggal rapor" id="tanggal">
          <input id="tanggal" type="date" value={tanggal} onChange={(event) => setTanggal(event.target.value)} />
        </Bidang>
      </div>
      <Bidang label="Alamat satuan pendidikan" id="alamat">
        <textarea id="alamat" value={draf.alamat} onChange={(event) => setDraf({ ...draf, alamat: event.target.value })} />
      </Bidang>
      <div className="tombol-baris">
        <button className="tombol" type="button" onClick={simpanIdentitas}>
          {berkas ? "Perbarui identitas" : "Buat berkas sekolah"}
        </button>
      </div>
      {terkunci && <p className="senyap">Jenjang terkunci karena rombel sudah dibuat. Simpan berkas lain bila satuan pendidikannya berbeda.</p>}
    </section>
  );
}
