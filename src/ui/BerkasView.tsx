import { useEffect, useState } from "react";
import { drafPerluDilanjutkan, labelRapor, labelWaktu, semesterBerikut } from "../domain/arsip";
import { namaBerkas, normalkan } from "../domain/berkas";
import { unduhBerkas } from "../domain/lembar";
import type { Berkas, Jenjang, Sekolah } from "../domain/types";
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
  const { berkas, draf, arsip, ganti, ubah, adaPerubahan, simpanArsip } = useBerkas();
  const [drafSekolah, setDrafSekolah] = useState<Sekolah>(berkas?.sekolah ?? kosong);
  const [tahun, setTahun] = useState(berkas?.tahunAjaran ?? "2026/2027");
  const [semester, setSemester] = useState<1 | 2>(berkas?.semester ?? 1);
  const [tanggal, setTanggal] = useState(berkas?.tanggalRapor ?? "");
  const [galat, setGalat] = useState("");
  const [buatBaru, setBuatBaru] = useState(false);
  const [salinan, setSalinan] = useState(false);
  const lanjut = drafPerluDilanjutkan(draf, arsip);
  const [pilihanId, setPilihanId] = useState(lanjut ? "draf" : arsip[0]?.id ?? "");
  const adaRiwayat = arsip.length > 0 || draf !== null;
  const tampilkanPilihan = !berkas && adaRiwayat && !buatBaru;

  useEffect(() => {
    if (!berkas) return;
    setDrafSekolah(berkas.sekolah);
    setTahun(berkas.tahunAjaran);
    setSemester(berkas.semester);
    setTanggal(berkas.tanggalRapor);
    setBuatBaru(false);
    setSalinan(false);
  }, [berkas]);

  function simpanIdentitas() {
    if (!drafSekolah.nama.trim()) {
      setGalat("Isi nama satuan pendidikan.");
      return;
    }
    setGalat("");
    const sekolah = { ...drafSekolah, nama: drafSekolah.nama.trim() };
    if (!berkas) {
      ganti(buatBerkas({ sekolah, tahunAjaran: tahun.trim(), semester, tanggalRapor: tanggal }));
      return;
    }
    ubah((saatIni) => ubahSekolah(saatIni, sekolah, tahun.trim(), semester, tanggal));
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
      await simpanArsip(hasil.berkas);
    } catch {
      setGalat("Berkas tidak dapat dibaca. Pilih berkas .erapor.json yang dibuat aplikasi ini.");
    }
  }

  function terapkan(sumber: Berkas) {
    setDrafSekolah(sumber.sekolah);
    setTahun(sumber.tahunAjaran);
    setSemester(sumber.semester);
    setTanggal(sumber.tanggalRapor);
  }

  function bukaPilihan() {
    const sumber = pilihanId === "draf" ? draf : arsip.find((item) => item.id === pilihanId)?.berkas;
    if (!sumber) return;
    terapkan(sumber);
    setBuatBaru(false);
    setSalinan(false);
    ganti(sumber, pilihanId !== "draf");
  }

  function mulaiBaru() {
    const asal = pilihanId === "draf" ? draf : arsip.find((item) => item.id === pilihanId)?.berkas ?? draf ?? arsip[0]?.berkas;
    if (asal) {
      const berikut = semesterBerikut(asal);
      setDrafSekolah(asal.sekolah);
      setTahun(berikut.tahunAjaran);
      setSemester(berikut.semester);
      setTanggal("");
      setSalinan(true);
    }
    setGalat("");
    setBuatBaru(true);
  }

  const terkunci = (berkas?.rombel.length ?? 0) > 0;
  const pemilihBerkas = (
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
  );

  if (tampilkanPilihan) {
    return (
      <section className="kartu">
        <h2>Rapor di komputer ini</h2>
        <p className="senyap">
          Pilih rapor yang sudah tersimpan, atau buat rapor semester baru. Data ini ada di peramban komputer ini.
        </p>
        {galat && <Pesan jenis="galat" anak={galat} />}
        <label className="bidang bidang-penuh">Rapor tersimpan
          <select id="rapor-tersimpan" value={pilihanId} onChange={(event) => setPilihanId(event.target.value)}>
            {lanjut && draf && <option value="draf">Lanjutkan pengerjaan · {labelRapor(draf)}</option>}
            {arsip.map((item) => (
              <option key={item.id} value={item.id}>{labelRapor(item.berkas)} · {labelWaktu(item.disimpanPada)}</option>
            ))}
          </select>
        </label>
        <div className="aksi-formulir">
          <button id="buka-rapor" className="tombol" type="button" onClick={bukaPilihan}>Buka rapor</button>
          <button id="buat-rapor-baru" className="tombol kedua" type="button" onClick={mulaiBaru}>Buat rapor baru</button>
          {pemilihBerkas}
        </div>
      </section>
    );
  }

  return (
    <section className="kartu">
      <div className="judul-bagian">
        <h2>{!berkas && salinan ? "Rapor semester baru" : "Identitas satuan pendidikan"}</h2>
        <div className="tombol-baris">
          {(berkas || adaRiwayat) && (
            <button id="kembali-daftar" className="tombol kedua" type="button" onClick={() => { setBuatBaru(false); ganti(null); }}>
              Pilih rapor lain
            </button>
          )}
          {pemilihBerkas}
          {berkas && (
            <button
              className="tombol kedua"
              type="button"
              onClick={() => unduhBerkas(namaBerkas(berkas), JSON.stringify(berkas, null, 2), "application/json")}
            >
              Unduh cadangan
            </button>
          )}
        </div>
      </div>
      {!berkas && !adaRiwayat && (
        <p className="senyap">Komputer ini belum menyimpan rapor. Isi identitas semester yang akan dikerjakan.</p>
      )}
      {salinan && !berkas && (
        <p className="senyap">Identitas disalin dari rapor yang dipilih, lalu semester dimajukan. Ubah bila satuan pendidikannya berbeda. Murid semester lalu tidak ikut tersalin.</p>
      )}
      {berkas && (
        <p className="senyap">
          Satu berkas menyimpan satu semester. Perubahan ikut tersimpan sebagai pengerjaan di komputer ini. Masukkan rapor ke daftar lewat langkah Simpan.
        </p>
      )}
      {adaPerubahan && berkas && <Pesan jenis="info" anak="Ada perubahan yang belum disimpan pada langkah Simpan." />}
      {galat && <Pesan jenis="galat" anak={galat} />}
      <div className="kisi">
        <Bidang label="Nama satuan pendidikan" id="nama-sekolah" lebar="dua">
          <input id="nama-sekolah" value={drafSekolah.nama} onChange={(event) => setDrafSekolah({ ...drafSekolah, nama: event.target.value })} />
        </Bidang>
        <Bidang label="NPSN" id="npsn">
          <input id="npsn" value={drafSekolah.npsn} onChange={(event) => setDrafSekolah({ ...drafSekolah, npsn: event.target.value })} />
        </Bidang>
        <Bidang label="Jenjang" id="jenjang">
          <select
            id="jenjang"
            value={drafSekolah.jenjang}
            disabled={terkunci}
            onChange={(event) => setDrafSekolah({ ...drafSekolah, jenjang: event.target.value as Jenjang })}
          >
            {JENJANG.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Bidang>
        {drafSekolah.jenjang === "SMK" && (
          <Bidang label="Program SMK" id="program-smk">
            <select
              id="program-smk"
              value={drafSekolah.programSmk}
              disabled={terkunci}
              onChange={(event) => setDrafSekolah({ ...drafSekolah, programSmk: Number(event.target.value) === 4 ? 4 : 3 })}
            >
              <option value={3}>3 tahun</option>
              <option value={4}>4 tahun</option>
            </select>
          </Bidang>
        )}
        <Bidang label="Kepala sekolah" id="kepala">
          <input id="kepala" value={drafSekolah.kepalaSekolah} onChange={(event) => setDrafSekolah({ ...drafSekolah, kepalaSekolah: event.target.value })} />
        </Bidang>
        <Bidang label="Kota pada rapor" id="kota">
          <input id="kota" value={drafSekolah.kota} onChange={(event) => setDrafSekolah({ ...drafSekolah, kota: event.target.value })} />
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
      <Bidang label="Alamat satuan pendidikan" id="alamat" lebar="penuh">
        <textarea id="alamat" value={drafSekolah.alamat} onChange={(event) => setDrafSekolah({ ...drafSekolah, alamat: event.target.value })} />
      </Bidang>
      <div className="aksi-formulir">
        <button className="tombol" type="button" onClick={simpanIdentitas}>
          {berkas ? "Perbarui identitas" : "Buat berkas sekolah"}
        </button>
      </div>
      {terkunci && <p className="senyap">Jenjang terkunci karena rombel sudah dibuat. Buat rapor baru bila satuan pendidikannya berbeda.</p>}
    </section>
  );
}
