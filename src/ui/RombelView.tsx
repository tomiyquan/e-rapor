import { useState } from "react";
import { daftarKelas } from "../domain/kurikulum";
import { namaRombel } from "../domain/rapor";
import { AGAMA, type Agama, type KelompokMapel, type Mapel, type ModePenilaian, type OpsiHitung } from "../domain/types";
import {
  aturPilihan,
  hapusMapel,
  hapusMurid,
  hapusRombel,
  pilihSeni,
  tambahMapel,
  tambahMurid,
  tambahRombel,
  ubahMapel,
  ubahMurid,
  ubahRombel,
} from "../domain/ubah";
import { useBerkas } from "../state/BerkasContext";
import { Bidang } from "./komponen";

export function RombelView({ bagian }: { bagian: "kelas" | "murid" | "mapel" }) {
  const { berkas, ubah } = useBerkas();
  const [rombelId, setRombelId] = useState(berkas?.rombel[0]?.id ?? "");
  const [kelas, setKelas] = useState(daftarKelas(berkas?.sekolah.jenjang ?? "SD", berkas?.sekolah.programSmk ?? 3)[0]?.nilai ?? "1");
  const [paralel, setParalel] = useState("A");
  const [wali, setWali] = useState("");
  const [namaMurid, setNamaMurid] = useState("");
  const [nisn, setNisn] = useState("");
  const [nis, setNis] = useState("");
  const [agama, setAgama] = useState<Agama>("Islam");
  const [mapelBaru, setMapelBaru] = useState("");
  const [kelompokBaru, setKelompokBaru] = useState<KelompokMapel>("mulok");

  if (!berkas) return null;
  const rombel = berkas.rombel.find((item) => item.id === rombelId) ?? berkas.rombel[0];
  const murid = berkas.murid.filter((item) => item.rombelId === rombel?.id).sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  const mapel = berkas.mapel.filter((item) => item.rombelId === rombel?.id).sort((a, b) => a.urutan - b.urutan);
  const aktif = mapel.filter((item) => item.aktif || !item.bawaan);
  const dorman = mapel.filter((item) => !item.aktif && item.bawaan);
  const seni = mapel.filter((item) => item.jenis === "seni");
  const pilihan = mapel.filter((item) => item.jenis === "pilihan" && item.aktif);

  return (
    <section className="kartu">
      <h2>{bagian === "kelas" ? "Rombel" : bagian === "murid" ? "Murid" : "Mata pelajaran rombel"}</h2>
      {bagian === "kelas" && (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          ubah((saatIni) => tambahRombel(saatIni, { kelas, paralel, waliKelas: wali }));
          setWali("");
        }}
      >
        <div className="kisi kisi-3">
        <Bidang label="Kelas" id="kelas-baru">
          <select id="kelas-baru" value={kelas} onChange={(event) => setKelas(event.target.value)}>
            {daftarKelas(berkas.sekolah.jenjang, berkas.sekolah.programSmk).map((item) => (
              <option key={item.nilai} value={item.nilai}>
                {item.label} · Fase {item.fase}
              </option>
            ))}
          </select>
        </Bidang>
        <Bidang label="Rombel" id="paralel">
          <input id="paralel" value={paralel} onChange={(event) => setParalel(event.target.value)} />
        </Bidang>
        <Bidang label="Wali kelas" id="wali-baru">
          <input id="wali-baru" value={wali} onChange={(event) => setWali(event.target.value)} />
        </Bidang>
        </div>
        <div className="aksi-formulir">
          <button className="tombol" type="submit">Tambah rombel</button>
        </div>
      </form>
      )}
      {berkas.rombel.length === 0 && (
        <p className="senyap">
          {bagian === "kelas"
            ? "Belum ada rombel. Daftar mata pelajaran awal akan mengikuti jenjang sekolah."
            : bagian === "murid"
              ? "Belum ada rombel. Kembali ke langkah Rombel dan buat kelas terlebih dahulu."
              : "Belum ada rombel. Kembali ke langkah Rombel, lalu tambahkan kelas."}
        </p>
      )}
      <div className="daftar-rombel">
        {berkas.rombel.map((item) => (
          <button key={item.id} type="button" className={item.id === rombel?.id ? "aktif" : ""} onClick={() => setRombelId(item.id)}>
            {namaRombel(item)}
          </button>
        ))}
      </div>
      {rombel && (
        <>
          {bagian === "kelas" && (
            <div className="kisi kisi-3">
              <Bidang label="Nama wali kelas" id="wali-ubah">
                <input id="wali-ubah" value={rombel.waliKelas} onChange={(event) => ubah((saatIni) => ubahRombel(saatIni, rombel.id, { waliKelas: event.target.value }))} />
              </Bidang>
            </div>
          )}
          {bagian === "mapel" && (
            <>
              <div className="kisi kisi-2">
                <Bidang label="Cara mengolah nilai" id="mode">
                  <select
                    id="mode"
                    value={rombel.mode}
                    onChange={(event) => ubah((saatIni) => ubahRombel(saatIni, rombel.id, { mode: event.target.value as ModePenilaian }))}
                  >
                    <option value="semester">Rapor semester, dari beberapa nilai sumatif</option>
                    <option value="asesmen">Asesmen penuh, dari tujuan pembelajaran</option>
                  </select>
                </Bidang>
                <Bidang label="Ambang ketercapaian" id="ambang">
                  <input
                    id="ambang"
                    inputMode="decimal"
                    value={rombel.ambang ?? ""}
                    placeholder="Diisi sekolah, misalnya 75"
                    onChange={(event) => {
                      const teks = event.target.value.replace(",", ".");
                      ubah((saatIni) => ubahRombel(saatIni, rombel.id, { ambang: teks === "" ? null : Number(teks) }));
                    }}
                  />
                </Bidang>
              </div>
              {rombel.fase === "A" && (
                <label className="centang">
                  <input
                    id="sembunyikan-angka"
                    type="checkbox"
                    checked={rombel.sembunyikanAngka}
                    onChange={(event) => ubah((saatIni) => ubahRombel(saatIni, rombel.id, { sembunyikanAngka: event.target.checked }))}
                  />
                  Rapor Fase A tanpa angka, hanya deskripsi capaian
                </label>
              )}
              <p className="senyap">
                {rombel.mode === "semester"
                  ? "Rapor semester memakai beberapa nilai sumatif. Deskripsi diketik wali kelas pada langkah Nilai."
                  : "Asesmen penuh memakai tujuan pembelajaran. Draf deskripsi diambil dari capaian tertinggi dan yang masih perlu pendampingan."}
                {" "}Asesmen formatif tidak masuk nilai akhir.
              </p>
            </>
          )}
          {bagian === "murid" && (
          <>
          <p className="senyap">NISN harus sama dengan yang nanti diisi guru mapel pada lembar kerja. Agama murid memilih nama mata pelajaran agama.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!namaMurid.trim()) return;
              ubah((saatIni) => tambahMurid(saatIni, { rombelId: rombel.id, nama: namaMurid, nisn, nis, agama }));
              setNamaMurid("");
              setNisn("");
              setNis("");
            }}
          >
            <div className="kisi">
            <Bidang label="Nama" id="nama-murid">
              <input id="nama-murid" value={namaMurid} onChange={(event) => setNamaMurid(event.target.value)} />
            </Bidang>
            <Bidang label="NISN" id="nisn-murid">
              <input id="nisn-murid" value={nisn} onChange={(event) => setNisn(event.target.value)} />
            </Bidang>
            <Bidang label="NIS" id="nis-murid">
              <input id="nis-murid" value={nis} onChange={(event) => setNis(event.target.value)} />
            </Bidang>
            <Bidang label="Agama" id="agama-murid">
              <select id="agama-murid" value={agama} onChange={(event) => setAgama(event.target.value as Agama)}>
                {AGAMA.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Bidang>
            </div>
            <div className="aksi-formulir">
              <button className="tombol" type="submit">Tambah murid</button>
            </div>
          </form>
          <div className="tabel-bungkus">
            <table className="tabel">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NISN</th>
                  <th>NIS</th>
                  <th>Agama</th>
                  {seni.length > 0 && <th>Seni yang diikuti</th>}
                  <th className="kolom-aksi" />
                </tr>
              </thead>
              <tbody>
                {murid.map((item) => {
                  const seniTerpilih = seni.find((mapelItem) => berkas.pilihan.some((pilihanItem) => pilihanItem.muridId === item.id && pilihanItem.mapelId === mapelItem.id));
                  return (
                    <tr key={item.id}>
                      <td className="kolom-nama"><input aria-label={`Nama ${item.nama}`} value={item.nama} onChange={(event) => ubah((saatIni) => ubahMurid(saatIni, item.id, { nama: event.target.value }))} /></td>
                      <td><input aria-label={`NISN ${item.nama}`} value={item.nisn} onChange={(event) => ubah((saatIni) => ubahMurid(saatIni, item.id, { nisn: event.target.value }))} /></td>
                      <td><input aria-label={`NIS ${item.nama}`} value={item.nis} onChange={(event) => ubah((saatIni) => ubahMurid(saatIni, item.id, { nis: event.target.value }))} /></td>
                      <td>
                        <select aria-label={`Agama ${item.nama}`} value={item.agama} onChange={(event) => ubah((saatIni) => ubahMurid(saatIni, item.id, { agama: event.target.value as Agama }))}>
                          {AGAMA.map((agamaItem) => (
                            <option key={agamaItem}>{agamaItem}</option>
                          ))}
                        </select>
                      </td>
                      {seni.length > 0 && (
                        <td>
                          <select aria-label={`Seni ${item.nama}`} value={seniTerpilih?.id ?? ""} onChange={(event) => ubah((saatIni) => pilihSeni(saatIni, item.id, event.target.value))}>
                            <option value="">Belum dipilih</option>
                            {seni.map((mapelItem) => (
                              <option key={mapelItem.id} value={mapelItem.id}>{mapelItem.nama}</option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td className="kolom-aksi"><button className="tombol bahaya" type="button" onClick={() => ubah((saatIni) => hapusMurid(saatIni, item.id))}>Hapus</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
          )}
          {bagian === "mapel" && pilihan.length > 0 && (
            <>
              <h3>Mapel pilihan murid</h3>
              <div className="tabel-bungkus">
                <table className="tabel">
                  <thead>
                    <tr>
                      <th>Murid</th>
                      {pilihan.map((item) => <th key={item.id}>{item.nama}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {murid.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nama}</td>
                        {pilihan.map((mapelItem) => {
                          const ikut = berkas.pilihan.some((pilihanItem) => pilihanItem.muridId === item.id && pilihanItem.mapelId === mapelItem.id);
                          return (
                            <td key={mapelItem.id}>
                              <input
                                type="checkbox"
                                aria-label={`${item.nama} mengikuti ${mapelItem.nama}`}
                                checked={ikut}
                                onChange={(event) => ubah((saatIni) => aturPilihan(saatIni, item.id, mapelItem.id, event.target.checked))}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {bagian === "mapel" && (
            <>
              <h3>Mata pelajaran yang dipakai</h3>
              <p className="senyap">Centang Pakai pada mapel yang diajarkan. Cara hitung boleh berbeda tiap mapel: rata-rata, pembobotan, atau persentase yang mencapai ambang. Centang prasyarat berurutan bila nilai akhir cukup memakai tujuan terakhir.</p>
              <DaftarMapel mapel={aktif} ubah={ubah} />
              {dorman.length > 0 && (
                <details>
                  <summary>Mata pelajaran yang belum diaktifkan ({dorman.length})</summary>
                  <DaftarMapel mapel={dorman} ubah={ubah} />
                </details>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!mapelBaru.trim()) return;
                  ubah((saatIni) => tambahMapel(saatIni, {
                    rombelId: rombel.id,
                    nama: mapelBaru,
                    kelompok: kelompokBaru,
                    berlakuUntuk: kelompokBaru === "pilihan" ? "per-murid" : "semua",
                  }));
                  setMapelBaru("");
                }}
              >
                <div className="kisi kisi-2">
                <Bidang label="Tambah mapel atau muatan lokal" id="mapel-baru">
                  <input id="mapel-baru" value={mapelBaru} onChange={(event) => setMapelBaru(event.target.value)} />
                </Bidang>
                <Bidang label="Kelompok" id="kelompok-baru">
                  <select id="kelompok-baru" value={kelompokBaru} onChange={(event) => setKelompokBaru(event.target.value as KelompokMapel)}>
                    <option value="mulok">Muatan lokal</option>
                    <option value="wajib">Wajib</option>
                    <option value="umum">Umum</option>
                    <option value="kejuruan">Kejuruan</option>
                    <option value="pilihan">Pilihan</option>
                  </select>
                </Bidang>
                </div>
                <div className="aksi-formulir">
                  <button className="tombol kedua" type="submit">Tambah mapel</button>
                </div>
              </form>
            </>
          )}
          {bagian === "kelas" && (
            <div className="aksi-formulir">
              <button
                className="tombol bahaya"
                type="button"
                onClick={() => {
                  if (window.confirm(`Hapus ${namaRombel(rombel)} beserta nilainya?`)) {
                    ubah((saatIni) => hapusRombel(saatIni, rombel.id));
                    setRombelId("");
                  }
                }}
              >
                Hapus rombel ini
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function DaftarMapel({
  mapel,
  ubah,
}: {
  mapel: Mapel[];
  ubah: ReturnType<typeof useBerkas>["ubah"];
}) {
  return (
    <div className="tabel-bungkus">
      <table className="tabel">
        <thead>
          <tr>
            <th>Pakai</th>
            <th>Mata pelajaran</th>
            <th>Cara hitung</th>
            <th>Prasyarat berurutan</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {mapel.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  aria-label={`Pakai ${item.nama}`}
                  checked={item.aktif}
                  onChange={(event) => ubah((saatIni) => ubahMapel(saatIni, item.id, { aktif: event.target.checked }))}
                />
              </td>
              <td className="kolom-nama">
                <input aria-label={`Nama ${item.nama}`} value={item.nama} onChange={(event) => ubah((saatIni) => ubahMapel(saatIni, item.id, { nama: event.target.value }))} />
              </td>
              <td>
                <select aria-label={`Cara hitung ${item.nama}`} value={item.opsiHitung} onChange={(event) => ubah((saatIni) => ubahMapel(saatIni, item.id, { opsiHitung: event.target.value as OpsiHitung }))}>
                  <option value="rata-rata">Rata-rata</option>
                  <option value="pembobotan">Pembobotan</option>
                  <option value="persentase">Persentase ketercapaian</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  aria-label={`Prasyarat ${item.nama}`}
                  checked={item.progresif}
                  onChange={(event) => ubah((saatIni) => ubahMapel(saatIni, item.id, { progresif: event.target.checked }))}
                />
              </td>
              <td>
                {!item.bawaan && (
                  <button className="tombol bahaya" type="button" onClick={() => ubah((saatIni) => hapusMapel(saatIni, item.id))}>Hapus</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
