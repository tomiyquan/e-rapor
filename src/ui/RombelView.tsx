import { useEffect, useRef, useState } from "react";
import { daftarKelas } from "../domain/kurikulum";
import { namaRombel } from "../domain/rapor";
import { AGAMA, type Agama, type Jenjang, type KelompokMapel, type Mapel, type ModePenilaian, type OpsiHitung } from "../domain/types";
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
  const [formMurid, setFormMurid] = useState(false);
  const [formRombel, setFormRombel] = useState(false);
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
        <>
          <div className="kepala-daftar">
            <p className="senyap">Satu berkas boleh berisi lebih dari satu rombel. Mata pelajaran awal mengikuti jenjang sekolah.</p>
            <button className="tombol" type="button" onClick={() => setFormRombel(true)}>Tambah rombel</button>
          </div>
          {formRombel && (
            <ModalRombel
              jenjang={berkas.sekolah.jenjang}
              programSmk={berkas.sekolah.programSmk}
              kelas={kelas}
              paralel={paralel}
              wali={wali}
              onKelas={setKelas}
              onParalel={setParalel}
              onWali={setWali}
              onTutup={() => setFormRombel(false)}
              onSimpan={() => {
                ubah((saatIni) => tambahRombel(saatIni, { kelas, paralel, waliKelas: wali }));
                setWali("");
                setFormRombel(false);
              }}
            />
          )}
          <div className="tabel-bungkus">
            <table className="tabel">
              <thead>
                <tr>
                  <th>Kelas</th>
                  <th>Rombel</th>
                  <th>Fase</th>
                  <th>Wali kelas</th>
                  <th>Murid</th>
                  <th className="kolom-aksi" />
                </tr>
              </thead>
              <tbody>
                {berkas.rombel.length === 0 && (
                  <tr>
                    <td colSpan={6}>Belum ada rombel.</td>
                  </tr>
                )}
                {berkas.rombel.map((item) => (
                  <tr key={item.id}>
                    <td>{namaRombel(item)}</td>
                    <td>{item.paralel}</td>
                    <td>{item.fase}</td>
                    <td>
                      <input
                        aria-label={`Wali ${namaRombel(item)}`}
                        value={item.waliKelas}
                        onChange={(event) => ubah((saatIni) => ubahRombel(saatIni, item.id, { waliKelas: event.target.value }))}
                      />
                    </td>
                    <td>{berkas.murid.filter((siswa) => siswa.rombelId === item.id).length}</td>
                    <td className="kolom-aksi">
                      <button
                        className="tombol bahaya"
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus ${namaRombel(item)} beserta nilainya?`)) {
                            ubah((saatIni) => hapusRombel(saatIni, item.id));
                            setRombelId("");
                          }
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {berkas.rombel.length === 0 && bagian !== "kelas" && (
        <p className="senyap">
          {bagian === "murid"
            ? "Belum ada rombel. Kembali ke langkah Rombel dan buat kelas terlebih dahulu."
            : "Belum ada rombel. Kembali ke langkah Rombel, lalu tambahkan kelas."}
        </p>
      )}
      {bagian !== "kelas" && (
      <div className="daftar-rombel">
        {berkas.rombel.map((item) => (
          <button key={item.id} type="button" className={item.id === rombel?.id ? "aktif" : ""} onClick={() => setRombelId(item.id)}>
            {namaRombel(item)}
          </button>
        ))}
      </div>
      )}
      {rombel && (
        <>
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
                <Bidang label="Ambang untuk semua mapel" id="ambang">
                  <input
                    id="ambang"
                    inputMode="decimal"
                    value={rombel.ambang ?? ""}
                    placeholder="Misalnya 75"
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
              <div className="penjelasan">
                <p><strong>Ambang ketercapaian.</strong> Batas tuntas ini ditetapkan sekolah, sering disebut KKM, bukan angka baku nasional. Angka di atas dipakai semua mapel. Isi kolom Ambang pada satu mapel bila KKM-nya berbeda, misalnya Matematika 75 dan PJOK 70. Kolom yang kosong ikut angka rombel.</p>
                <p><strong>Cara hitung.</strong> Pilihan tiap mapel diikuti tab Nilai. Rata-rata tidak menampilkan bobot. Pembobotan menampilkan bobot, dan jumlahnya harus 100%. Persentase menghitung bagian nilai yang mencapai ambang, juga tanpa bobot.</p>
                <p><strong>Nilai terakhir.</strong> Centang bila tujuan pembelajaran berurutan dan saling menjadi syarat. Contohnya, mengukur panjang baru dinilai setelah murid bisa memakai satuan. Nilai rapor lalu memakai angka tujuan terakhir yang terisi, bukan rata-rata semuanya. Kosongkan bila tiap tujuan berdiri sendiri.</p>
              </div>
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
          <div className="kepala-daftar">
            <p className="senyap">Daftar siswa rombel ini. Agama memilih nama mata pelajaran agama. Seni dipilih pada tabel setelah murid tersimpan.</p>
            <button className="tombol" type="button" onClick={() => setFormMurid(true)}>Tambah murid</button>
          </div>
          {formMurid && (
            <ModalMurid
              nama={namaMurid}
              nisn={nisn}
              nis={nis}
              agama={agama}
              onNama={setNamaMurid}
              onNisn={setNisn}
              onNis={setNis}
              onAgama={setAgama}
              onTutup={() => setFormMurid(false)}
              onSimpan={() => {
                if (!namaMurid.trim()) return;
                ubah((saatIni) => tambahMurid(saatIni, { rombelId: rombel.id, nama: namaMurid, nisn, nis, agama }));
                setNamaMurid("");
                setNisn("");
                setNis("");
                setAgama("Islam");
                setFormMurid(false);
              }}
            />
          )}
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
                {murid.length === 0 && (
                  <tr>
                    <td colSpan={seni.length > 0 ? 6 : 5}>Belum ada murid pada rombel ini.</td>
                  </tr>
                )}
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
              <p className="senyap">Centang Pakai pada mapel yang diajarkan. Cara hitung dan ambang pada baris ini yang dipakai tab Nilai.</p>
              <DaftarMapel mapel={aktif} rombel={rombel} ubah={ubah} />
              {dorman.length > 0 && (
                <details>
                  <summary>Mata pelajaran yang belum diaktifkan ({dorman.length})</summary>
                  <DaftarMapel mapel={dorman} rombel={rombel} ubah={ubah} />
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
        </>
      )}
    </section>
  );
}

function DaftarMapel({
  mapel,
  rombel,
  ubah,
}: {
  mapel: Mapel[];
  rombel: { ambang: number | null };
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
            <th>Ambang mapel</th>
            <th>Nilai terakhir</th>
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
                <select
                  aria-label={`Cara hitung ${item.nama}`}
                  value={item.opsiHitung}
                  disabled={item.progresif}
                  onChange={(event) => ubah((saatIni) => ubahMapel(saatIni, item.id, { opsiHitung: event.target.value as OpsiHitung }))}
                >
                  <option value="rata-rata">Rata-rata</option>
                  <option value="pembobotan">Pembobotan</option>
                  <option value="persentase">Persentase ketercapaian</option>
                </select>
              </td>
              <td className="kolom-angka">
                <input
                  aria-label={`Ambang ${item.nama}`}
                  inputMode="decimal"
                  placeholder={rombel.ambang === null ? "Ikut rombel" : `Ikut ${rombel.ambang}`}
                  value={item.ambang ?? ""}
                  onChange={(event) => {
                    const teks = event.target.value.replace(",", ".").trim();
                    ubah((saatIni) => ubahMapel(saatIni, item.id, { ambang: teks === "" ? null : Number(teks) }));
                  }}
                />
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

function ModalRombel({
  jenjang,
  programSmk,
  kelas,
  paralel,
  wali,
  onKelas,
  onParalel,
  onWali,
  onTutup,
  onSimpan,
}: {
  jenjang: Jenjang;
  programSmk: 3 | 4;
  kelas: string;
  paralel: string;
  wali: string;
  onKelas: (nilai: string) => void;
  onParalel: (nilai: string) => void;
  onWali: (nilai: string) => void;
  onTutup: () => void;
  onSimpan: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lepas = useRef(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    return () => {
      lepas.current = true;
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      className="modal"
      ref={dialogRef}
      aria-labelledby="judul-rombel"
      onClose={() => {
        if (!lepas.current) onTutup();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSimpan();
        }}
      >
        <div className="modal-kepala">
          <h3 id="judul-rombel">Tambah rombel</h3>
        </div>
        <div className="modal-isi">
          <div className="tumpuk">
            <Bidang label="Kelas" id="kelas-baru">
              <select id="kelas-baru" value={kelas} autoFocus onChange={(event) => onKelas(event.target.value)}>
                {daftarKelas(jenjang, programSmk).map((item) => (
                  <option key={item.nilai} value={item.nilai}>
                    {item.label} · Fase {item.fase}
                  </option>
                ))}
              </select>
            </Bidang>
            <Bidang label="Rombel" id="paralel">
              <input id="paralel" value={paralel} onChange={(event) => onParalel(event.target.value)} />
            </Bidang>
            <Bidang label="Wali kelas" id="wali-baru">
              <input id="wali-baru" value={wali} onChange={(event) => onWali(event.target.value)} />
            </Bidang>
          </div>
        </div>
        <div className="modal-aksi">
          <button className="tombol kedua" type="button" onClick={() => dialogRef.current?.close()}>Batal</button>
          <button className="tombol" type="submit">Simpan</button>
        </div>
      </form>
    </dialog>
  );
}

function ModalMurid({
  nama,
  nisn,
  nis,
  agama,
  onNama,
  onNisn,
  onNis,
  onAgama,
  onTutup,
  onSimpan,
}: {
  nama: string;
  nisn: string;
  nis: string;
  agama: Agama;
  onNama: (nilai: string) => void;
  onNisn: (nilai: string) => void;
  onNis: (nilai: string) => void;
  onAgama: (nilai: Agama) => void;
  onTutup: () => void;
  onSimpan: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lepas = useRef(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    return () => {
      lepas.current = true;
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      className="modal"
      ref={dialogRef}
      aria-labelledby="judul-murid"
      onClose={() => {
        if (!lepas.current) onTutup();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSimpan();
        }}
      >
        <div className="modal-kepala">
          <h3 id="judul-murid">Tambah murid</h3>
        </div>
        <div className="modal-isi">
          <p className="senyap">NISN harus sama dengan yang nanti diisi guru mapel pada lembar kerja. Agama murid memilih nama mata pelajaran agama.</p>
          <div className="kisi kisi-2">
            <Bidang label="Nama" id="nama-murid">
              <input id="nama-murid" value={nama} autoFocus onChange={(event) => onNama(event.target.value)} />
            </Bidang>
            <Bidang label="NISN" id="nisn-murid">
              <input id="nisn-murid" value={nisn} onChange={(event) => onNisn(event.target.value)} />
            </Bidang>
            <Bidang label="NIS" id="nis-murid">
              <input id="nis-murid" value={nis} onChange={(event) => onNis(event.target.value)} />
            </Bidang>
            <Bidang label="Agama" id="agama-murid">
              <select id="agama-murid" value={agama} onChange={(event) => onAgama(event.target.value as Agama)}>
                {AGAMA.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Bidang>
          </div>
        </div>
        <div className="modal-aksi">
          <button className="tombol kedua" type="button" onClick={() => dialogRef.current?.close()}>Batal</button>
          <button className="tombol" type="submit">Simpan</button>
        </div>
      </form>
    </dialog>
  );
}
