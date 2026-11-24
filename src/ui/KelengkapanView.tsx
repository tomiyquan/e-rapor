import { useState } from "react";
import { drafKokurikuler } from "../domain/deskripsi";
import { namaRombel } from "../domain/rapor";
import { DIMENSI_PROFIL, type KeputusanKenaikan } from "../domain/types";
import {
  hapusEkskul,
  setAbsensi,
  setCatatan,
  setDeskripsi,
  setKokurikuler,
  tambahEkskul,
  ubahEkskul,
} from "../domain/ubah";
import { useBerkas } from "../state/BerkasContext";

export function KelengkapanView() {
  const { berkas, ubah } = useBerkas();
  const [rombelId, setRombelId] = useState(berkas?.rombel[0]?.id ?? "");
  const [muridId, setMuridId] = useState("");
  if (!berkas) return null;
  const rombel = berkas.rombel.find((item) => item.id === rombelId) ?? berkas.rombel[0];
  if (!rombel) {
    return (
      <section className="kartu">
        <h2>Kelengkapan rapor</h2>
        <p>Lengkapi bagian ini setelah murid terdaftar. Kembali ke langkah Rombel bila kelas masih kosong.</p>
      </section>
    );
  }
  const murid = berkas.murid.filter((item) => item.rombelId === rombel.id).sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  const muridAktif = murid.find((item) => item.id === muridId) ?? murid[0];
  const kok = berkas.kokurikuler.find((item) => item.muridId === muridAktif?.id);
  const catatan = berkas.catatan.find((item) => item.muridId === muridAktif?.id);
  const pkl = berkas.mapel.find((item) => item.rombelId === rombel.id && item.jenis === "pkl" && item.aktif);
  const deskripsiPkl = muridAktif && pkl ? berkas.deskripsi.find((item) => item.muridId === muridAktif.id && item.mapelId === pkl.id) : undefined;

  return (
    <section className="kartu">
      <h2>Kelengkapan rapor</h2>
      <label className="bidang">Rombel
        <select value={rombel.id} onChange={(event) => { setRombelId(event.target.value); setMuridId(""); }}>
          {berkas.rombel.map((item) => <option key={item.id} value={item.id}>{namaRombel(item)}</option>)}
        </select>
      </label>
      <h3>1. Ketidakhadiran {namaRombel(rombel)}</h3>
      <p className="senyap">Isi jumlah hari. Angka nol tetap tercetak bila murid tidak absen.</p>
      <div className="tabel-bungkus">
        <table className="tabel">
          <thead>
            <tr><th>Murid</th><th>Sakit</th><th>Izin</th><th>Tanpa keterangan</th></tr>
          </thead>
          <tbody>
            {murid.map((item) => {
              const absen = berkas.absensi.find((entri) => entri.muridId === item.id);
              return (
                <tr key={item.id}>
                  <td>{item.nama}</td>
                  {(["sakit", "izin", "alfa"] as const).map((kolom) => (
                    <td key={kolom}>
                      <input
                        inputMode="numeric"
                        aria-label={`${kolom} ${item.nama}`}
                        value={absen?.[kolom] ?? 0}
                        onChange={(event) => {
                          const angka = Math.max(0, Number(event.target.value) || 0);
                          ubah((saatIni) => setAbsensi(saatIni, item.id, { [kolom]: angka }));
                        }}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="dua-kolom">
        <div className="daftar-murid">
          {murid.map((item) => (
            <button key={item.id} type="button" className={item.id === muridAktif?.id ? "aktif" : ""} onClick={() => setMuridId(item.id)}>
              {item.nama}
            </button>
          ))}
        </div>
        {muridAktif && kok && (
          <div>
            <h3>2. Kokurikuler {muridAktif.nama}</h3>
            <label className="bidang">Kegiatan kokurikuler semester ini
              <textarea value={kok.kegiatan} onChange={(event) => ubah((saatIni) => setKokurikuler(saatIni, muridAktif.id, { kegiatan: event.target.value }))} />
            </label>
            <p className="senyap">Pilih dimensi yang sudah dikuatkan dan yang masih perlu penguatan. Yang tercetak tetap satu narasi, bukan angka.</p>
            <div className="dimensi">
              {DIMENSI_PROFIL.map((dimensi) => (
                <label key={dimensi.id} className="centang">
                  <input
                    type="checkbox"
                    checked={kok.dimensiKuat.includes(dimensi.id)}
                    onChange={(event) => ubah((saatIni) => setKokurikuler(saatIni, muridAktif.id, {
                      dimensiKuat: event.target.checked ? [...kok.dimensiKuat, dimensi.id] : kok.dimensiKuat.filter((id) => id !== dimensi.id),
                    }))}
                  />
                  Sudah baik: {dimensi.label}
                </label>
              ))}
              {DIMENSI_PROFIL.map((dimensi) => (
                <label key={`${dimensi.id}-perlu`} className="centang">
                  <input
                    type="checkbox"
                    checked={kok.dimensiPerlu.includes(dimensi.id)}
                    onChange={(event) => ubah((saatIni) => setKokurikuler(saatIni, muridAktif.id, {
                      dimensiPerlu: event.target.checked ? [...kok.dimensiPerlu, dimensi.id] : kok.dimensiPerlu.filter((id) => id !== dimensi.id),
                    }))}
                  />
                  Perlu pendampingan: {dimensi.label}
                </label>
              ))}
            </div>
            <div className="kisi">
              <label className="bidang">Bukti yang sudah baik
                <input value={kok.buktiKuat} onChange={(event) => ubah((saatIni) => setKokurikuler(saatIni, muridAktif.id, { buktiKuat: event.target.value }))} />
              </label>
              <label className="bidang">Hal yang masih perlu pendampingan
                <input value={kok.buktiPerlu} onChange={(event) => ubah((saatIni) => setKokurikuler(saatIni, muridAktif.id, { buktiPerlu: event.target.value }))} />
              </label>
            </div>
            <button
              className="tombol kedua"
              type="button"
              onClick={() => ubah((saatIni) => setKokurikuler(saatIni, muridAktif.id, {
                deskripsi: drafKokurikuler(kok.dimensiKuat, kok.buktiKuat, kok.dimensiPerlu, kok.buktiPerlu),
              }))}
            >
              Susun narasi kokurikuler
            </button>
            <label className="bidang">Deskripsi kokurikuler yang dicetak
              <textarea value={kok.deskripsi} onChange={(event) => ubah((saatIni) => setKokurikuler(saatIni, muridAktif.id, { deskripsi: event.target.value }))} />
            </label>
            <h3>3. Ekstrakurikuler dan catatan</h3>
            {berkas.ekskul.filter((item) => item.muridId === muridAktif.id).map((item) => (
              <div className="baris-aksi" key={item.id}>
                <input aria-label="Nama ekstrakurikuler" value={item.nama} onChange={(event) => ubah((saatIni) => ubahEkskul(saatIni, item.id, { nama: event.target.value }))} />
                <input aria-label="Keterangan ekstrakurikuler" value={item.keterangan} onChange={(event) => ubah((saatIni) => ubahEkskul(saatIni, item.id, { keterangan: event.target.value }))} />
                <button className="tombol bahaya" type="button" onClick={() => ubah((saatIni) => hapusEkskul(saatIni, item.id))}>Hapus</button>
              </div>
            ))}
            <button className="tombol kedua" type="button" onClick={() => ubah((saatIni) => tambahEkskul(saatIni, muridAktif.id, "Pramuka"))}>Tambah ekstrakurikuler</button>
            <label className="bidang">Catatan wali kelas
              <textarea value={catatan?.catatanWali ?? ""} onChange={(event) => ubah((saatIni) => setCatatan(saatIni, muridAktif.id, { catatanWali: event.target.value }))} />
            </label>
            <label className="bidang">Tanggapan orang tua/wali, bila sudah diterima kembali
              <textarea value={catatan?.tanggapanOrtu ?? ""} onChange={(event) => ubah((saatIni) => setCatatan(saatIni, muridAktif.id, { tanggapanOrtu: event.target.value }))} />
            </label>
            {pkl && (
              <label className="bidang">Keterangan Praktik Kerja Lapangan
                <textarea
                  value={deskripsiPkl?.teks ?? ""}
                  onChange={(event) => ubah((saatIni) => setDeskripsi(saatIni, muridAktif.id, pkl.id, event.target.value))}
                />
              </label>
            )}
            {berkas.semester === 2 && (
              <>
                <label className="bidang">Keputusan satuan pendidikan
                  <select
                    value={catatan?.keputusan ?? ""}
                    onChange={(event) => ubah((saatIni) => setCatatan(saatIni, muridAktif.id, { keputusan: event.target.value as KeputusanKenaikan }))}
                  >
                    <option value="">Belum diputuskan</option>
                    <option value="naik">Naik kelas</option>
                    <option value="tidak-naik">Tidak naik kelas</option>
                    <option value="lulus">Lulus</option>
                  </select>
                </label>
                <label className="bidang">Catatan keputusan
                  <textarea value={catatan?.catatanKeputusan ?? ""} onChange={(event) => ubah((saatIni) => setCatatan(saatIni, muridAktif.id, { catatanKeputusan: event.target.value }))} />
                </label>
                <p className="senyap">Keputusan kenaikan kelas dan kelulusan dicatat setelah musyawarah pendidik. Aplikasi tidak menetapkan naik atau tidak naik sendiri. Catatan ini masuk leger, tidak menambah kolom pada rapor murid.</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
