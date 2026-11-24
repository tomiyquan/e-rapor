import { useState } from "react";
import { butirLembar, bacaLembar, buatLembar, unduhBerkas } from "../domain/lembar";
import { hasilMapel, mengikuti, mapelRombel, muridRombel, namaRombel, susunDraf, teksCaraHitung } from "../domain/rapor";
import type { Mapel, SkalaKualitatif } from "../domain/types";
import { LABEL_SKALA } from "../domain/types";
import {
  hapusSumatif,
  hapusTujuan,
  setDeskripsi,
  setNilaiSumatif,
  setNilaiTujuan,
  tambahSumatif,
  tambahTujuan,
  terapkanNilaiImpor,
  ubahSumatif,
  ubahTujuan,
} from "../domain/ubah";
import { useBerkas } from "../state/BerkasContext";
import { Pesan } from "./komponen";

export function NilaiView() {
  const { berkas, ubah } = useBerkas();
  const [rombelId, setRombelId] = useState(berkas?.rombel[0]?.id ?? "");
  const [mapelId, setMapelId] = useState("");
  const [galat, setGalat] = useState<string[]>([]);
  const [info, setInfo] = useState("");
  if (!berkas) return null;
  const rombel = berkas.rombel.find((item) => item.id === rombelId) ?? berkas.rombel[0];
  if (!rombel) {
    return (
      <section className="kartu">
        <h2>Nilai</h2>
        <p>Langkah ini terbuka setelah rombel dan murid ada. Buat kelas pada langkah Rombel, lalu daftarkan siswa pada langkah Murid.</p>
      </section>
    );
  }
  const mapelAktif = mapelRombel(berkas, rombel.id).filter(
    (item) => item.aktif && (item.berlakuUntuk === "semua" || berkas.murid.some((siswa) => mengikuti(berkas, siswa, item))),
  );
  const mapel = mapelAktif.find((item) => item.id === mapelId) ?? mapelAktif[0];
  const murid = muridRombel(berkas, rombel.id).filter((item) => (mapel ? mengikuti(berkas, item, mapel) : false));

  async function impor(file: File | undefined) {
    if (!file || !mapel) return;
    try {
      const hasil = bacaLembar(await file.arrayBuffer(), berkas!);
      if (hasil.kesalahan.length > 0) {
        setInfo("");
        setGalat(hasil.kesalahan.map((item) => `Baris ${item.baris}: ${item.pesan}`));
        return;
      }
      if (hasil.mapelId !== mapel.id) {
        setGalat(["Lembar ini untuk mata pelajaran lain. Buka mapel yang sesuai atau unduh ulang formatnya."]);
        return;
      }
      ubah((saatIni) => terapkanNilaiImpor(saatIni, mapel.id, hasil.mode, hasil.baris));
      setGalat([]);
      setInfo(`Nilai ${hasil.baris.length} murid dimasukkan. Periksa kembali sebelum dicetak.`);
    } catch {
      setGalat(["Lembar kerja tidak dapat dibaca."]);
    }
  }

  function unduh() {
    if (!mapel) return;
    const butir = butirLembar(berkas!, mapel, rombel!.mode);
    if (butir.length === 0) {
      setGalat([rombel!.mode === "semester" ? "Tambahkan kegiatan sumatif terlebih dahulu." : "Tambahkan tujuan pembelajaran terlebih dahulu."]);
      return;
    }
    const data = buatLembar(berkas!, rombel!, mapel, murid);
    unduhBerkas(`isian-${namaRombel(rombel!).replaceAll(" ", "-")}-${mapel.nama}.xlsx`, data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    setGalat([]);
  }

  return (
    <section className="kartu">
      <h2>Nilai</h2>
      <p className="senyap">Guru mapel tidak membuka aplikasi ini. Wali kelas mengunduh format, menerima isiannya, lalu memasukkan nilai lewat impor atau ketikan langsung. Nilai akhir hanya dari sumatif.</p>
      <h3>1. Pilih rombel dan mata pelajaran</h3>
      <div className="baris-aksi">
        <label className="bidang">Rombel
          <select value={rombel.id} onChange={(event) => { setRombelId(event.target.value); setMapelId(""); }}>
            {berkas.rombel.map((item) => <option key={item.id} value={item.id}>{namaRombel(item)}</option>)}
          </select>
        </label>
        <label className="bidang">Mata pelajaran
          <select value={mapel?.id ?? ""} onChange={(event) => setMapelId(event.target.value)}>
            {mapelAktif.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
          </select>
        </label>
      </div>
      {galat.length > 0 && <Pesan jenis="galat" anak={galat.join(" ")} />}
      {info && <Pesan jenis="baik" anak={info} />}
      <h3>2. Sesuaikan kegiatan yang dinilai</h3>
      {mapel && <p className="senyap">{teksCaraHitung(mapel, rombel)} Pilihan ini diubah di langkah Mapel. Tambah, ubah nama, atau hapus kegiatan di bawah ini sebelum mengisi angka.</p>}
      {mapel && rombel.mode === "semester" && <EditorSumatif mapel={mapel} />}
      {mapel && rombel.mode === "asesmen" && <EditorTujuan mapel={mapel} />}
      <h3>3. Isi nilai, capaian kompetensi menyusul sendiri</h3>
      <p className="senyap">Ketik nilai pada tabel, atau unduh format untuk guru mapel lalu impor kembali. Capaian kompetensi terisi otomatis begitu ada angka. Bila tujuan pembelajaran lebih dari satu, kalimat menyebut semuanya: yang mencapai ambang, lalu yang masih perlu pendampingan. Sunting bila perlu; mengubah nilai akan menyusun ulang kalimat itu.</p>
      <div className="tombol-baris">
        <button className="tombol kedua" type="button" onClick={unduh} disabled={!mapel}>Unduh format isian</button>
        <label className="tombol kedua">
          Impor isian
          <input type="file" accept=".xlsx" hidden onChange={(event) => { void impor(event.target.files?.[0]); event.target.value = ""; }} />
        </label>
      </div>
      {mapel && (
        <div className="tabel-bungkus">
          <table className="tabel">
            <thead>
              <tr>
                <th>Murid</th>
                {(rombel.mode === "semester" ? berkas.sumatif : berkas.tujuan)
                  .filter((item) => item.mapelId === mapel.id)
                  .sort((a, b) => a.urutan - b.urutan)
                  .map((item) => <th key={item.id}>{item.nama}</th>)}
                <th>Nilai akhir</th>
                <th>Capaian kompetensi</th>
              </tr>
            </thead>
            <tbody>
              {murid.map((item) => {
                const hasil = hasilMapel(berkas, rombel, mapel, item.id);
                const deskripsi = berkas.deskripsi.find((entri) => entri.muridId === item.id && entri.mapelId === mapel.id);
                const butir = (rombel.mode === "semester" ? berkas.sumatif : berkas.tujuan)
                  .filter((entri) => entri.mapelId === mapel.id)
                  .sort((a, b) => a.urutan - b.urutan);
                return (
                  <tr key={item.id}>
                    <td>{item.nama}<br /><span className="senyap">{item.nisn}</span></td>
                    {butir.map((entri) => (
                      <td key={entri.id}>
                        <NilaiSel
                          label={`Nilai ${item.nama} ${entri.nama}`}
                          nilai={
                            rombel.mode === "semester"
                              ? berkas.nilaiSumatif.find((nilai) => nilai.muridId === item.id && nilai.butirId === entri.id)?.nilai ?? null
                              : berkas.nilaiTujuan.find((nilai) => nilai.muridId === item.id && nilai.tujuanId === entri.id)?.nilai ?? null
                          }
                          onChange={(nilai) => ubah((saatIni) => (
                            rombel.mode === "semester"
                              ? setNilaiSumatif(saatIni, item.id, entri.id, nilai)
                              : setNilaiTujuan(saatIni, item.id, entri.id, { nilai })
                          ))}
                        />
                        {rombel.mode === "asesmen" && (
                          <select
                            aria-label={`Skala ${item.nama} ${entri.nama}`}
                            value={berkas.nilaiTujuan.find((nilai) => nilai.muridId === item.id && nilai.tujuanId === entri.id)?.skala ?? ""}
                            onChange={(event) => ubah((saatIni) => setNilaiTujuan(saatIni, item.id, entri.id, { skala: (event.target.value || null) as SkalaKualitatif | null }))}
                          >
                            <option value="">Skala</option>
                            {Object.entries(LABEL_SKALA).map(([kunci, label]) => <option key={kunci} value={kunci}>{label}</option>)}
                          </select>
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="nilai-akhir">{hasil.nilai ?? "—"}</div>
                      {hasil.pesan && <span className="senyap">{hasil.pesan}</span>}
                    </td>
                    <td>
                      {deskripsi?.catatanGuru && <p className="senyap">Catatan guru: {deskripsi.catatanGuru}</p>}
                      <button className="tombol kedua" type="button" onClick={() => ubah((saatIni) => setDeskripsi(saatIni, item.id, mapel.id, susunDraf(saatIni, rombel, mapel, item.id), deskripsi?.catatanGuru))}>
                        Susun ulang
                      </button>
                      <textarea
                        aria-label={`Deskripsi ${item.nama}`}
                        value={deskripsi?.teks ?? ""}
                        onChange={(event) => ubah((saatIni) => setDeskripsi(saatIni, item.id, mapel.id, event.target.value))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {mapel && murid.length === 0 && <p className="senyap">Belum ada murid yang mengikuti mata pelajaran ini.</p>}
    </section>
  );
}

function EditorSumatif({ mapel }: { mapel: Mapel }) {
  const { berkas, ubah } = useBerkas();
  const [nama, setNama] = useState("");
  if (!berkas) return null;
  const daftar = berkas.sumatif.filter((item) => item.mapelId === mapel.id).sort((a, b) => a.urutan - b.urutan);
  return (
    <div>
      <h3>Kegiatan sumatif</h3>
      {daftar.map((item) => (
        <div className="baris-data" key={item.id}>
          <input aria-label={`Nama ${item.nama}`} value={item.nama} onChange={(event) => ubah((saatIni) => ubahSumatif(saatIni, item.id, { nama: event.target.value }))} />
          {tampilkanBobot(mapel) && (
            <input
              aria-label={`Bobot ${item.nama}`}
              inputMode="decimal"
              placeholder="Bobot %"
              value={item.bobot ?? ""}
              onChange={(event) => ubah((saatIni) => ubahSumatif(saatIni, item.id, { bobot: angkaAtauKosong(event.target.value) }))}
            />
          )}
          <label className="centang">
            <input type="checkbox" checked={item.akhirSemester} onChange={(event) => ubah((saatIni) => ubahSumatif(saatIni, item.id, { akhirSemester: event.target.checked }))} />
            Akhir semester
          </label>
          <button className="tombol bahaya" type="button" onClick={() => ubah((saatIni) => hapusSumatif(saatIni, item.id))}>Hapus</button>
        </div>
      ))}
      <form className="baris-data" onSubmit={(event) => { event.preventDefault(); ubah((saatIni) => tambahSumatif(saatIni, mapel.id, nama)); setNama(""); }}>
        <input aria-label="Nama sumatif baru" value={nama} placeholder="Nama lingkup materi" onChange={(event) => setNama(event.target.value)} />
        <button className="tombol" type="submit">Tambah sumatif</button>
      </form>
    </div>
  );
}

function EditorTujuan({ mapel }: { mapel: Mapel }) {
  const { berkas, ubah } = useBerkas();
  const [nama, setNama] = useState("");
  if (!berkas) return null;
  const daftar = berkas.tujuan.filter((item) => item.mapelId === mapel.id).sort((a, b) => a.urutan - b.urutan);
  return (
    <div>
      <h3>Tujuan pembelajaran</h3>
      <p className="senyap">Tulis tujuan yang benar-benar diajarkan, dari yang paling awal ke yang paling akhir. Urutan ini dipakai bila kolom Nilai terakhir dicentang.</p>
      {daftar.map((item) => (
        <div className="baris-data" key={item.id}>
          <input aria-label={`Tujuan ${item.nama}`} value={item.nama} onChange={(event) => ubah((saatIni) => ubahTujuan(saatIni, item.id, { nama: event.target.value }))} />
          {tampilkanBobot(mapel) && (
            <input
              aria-label={`Bobot ${item.nama}`}
              inputMode="decimal"
              placeholder="Bobot %"
              value={item.bobot ?? ""}
              onChange={(event) => ubah((saatIni) => ubahTujuan(saatIni, item.id, { bobot: angkaAtauKosong(event.target.value) }))}
            />
          )}
          <button className="tombol bahaya" type="button" onClick={() => ubah((saatIni) => hapusTujuan(saatIni, item.id))}>Hapus</button>
        </div>
      ))}
      <form className="baris-data" onSubmit={(event) => { event.preventDefault(); ubah((saatIni) => tambahTujuan(saatIni, mapel.id, nama)); setNama(""); }}>
        <input aria-label="Tujuan baru" value={nama} placeholder="Tujuan pembelajaran" onChange={(event) => setNama(event.target.value)} />
        <button className="tombol" type="submit">Tambah tujuan</button>
      </form>
    </div>
  );
}

function NilaiSel({ label, nilai, onChange }: { label: string; nilai: number | null; onChange: (nilai: number | null) => void }) {
  return (
    <input
      aria-label={label}
      inputMode="decimal"
      value={nilai ?? ""}
      onChange={(event) => onChange(angkaAtauKosong(event.target.value))}
    />
  );
}

function tampilkanBobot(mapel: Mapel): boolean {
  return mapel.opsiHitung === "pembobotan" && !mapel.progresif;
}

function angkaAtauKosong(teks: string): number | null {
  const bersih = teks.replace(",", ".").trim();
  if (!bersih) return null;
  const angka = Number(bersih);
  return Number.isNaN(angka) ? null : angka;
}
