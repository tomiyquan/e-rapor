import { useState } from "react";
import { labelRapor, labelWaktu } from "../domain/arsip";
import { namaBerkas } from "../domain/berkas";
import { unduhBerkas } from "../domain/lembar";
import { useBerkas } from "../state/BerkasContext";
import { Pesan } from "./komponen";

export function SimpanView() {
  const { berkas, arsip, tersimpanDiArsip, simpanArsip } = useBerkas();
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");

  async function simpan() {
    if (!berkas) return;
    setGalat("");
    unduhBerkas(namaBerkas(berkas), JSON.stringify(berkas, null, 2), "application/json");
    try {
      await simpanArsip(berkas);
      setPesan("Rapor tersimpan di komputer ini. Berkas cadangan .erapor.json ikut terunduh.");
    } catch {
      setPesan("");
      setGalat("Berkas cadangan terunduh, tetapi daftar rapor di komputer ini belum berubah.");
    }
  }

  if (!berkas) return null;

  return (
    <section className="kartu">
      <div className="judul-bagian">
        <h2>Simpan data rapor</h2>
        <button className="tombol" type="button" onClick={() => void simpan()}>Simpan rapor</button>
      </div>
      <p className="senyap">
        Rapor yang disimpan di sini muncul lagi pada tab Sekolah saat aplikasi dibuka. Semester yang sama diperbarui.
        Semester lain tetap tersimpan sebagai rapor terpisah. Berkas .erapor.json adalah cadangan bila pindah komputer.
      </p>
      {tersimpanDiArsip && !pesan && <Pesan jenis="baik" anak="Rapor yang sedang dibuka sudah sama dengan salinan di komputer ini." />}
      {pesan && <Pesan jenis="baik" anak={pesan} />}
      {galat && <Pesan jenis="galat" anak={galat} />}
      <p><strong>{labelRapor(berkas)}</strong> · {berkas.rombel.length} rombel · {berkas.murid.length} murid</p>
      <h3>Rapor di komputer ini</h3>
      {arsip.length === 0 ? (
        <p className="senyap">Belum ada rapor yang disimpan. Klik Simpan rapor untuk memasukkan semester ini.</p>
      ) : (
        <div className="tabel-bungkus">
          <table className="tabel">
            <thead>
              <tr>
                <th>Rapor</th>
                <th>Disimpan</th>
              </tr>
            </thead>
            <tbody>
              {arsip.map((item) => (
                <tr key={item.id}>
                  <td>{labelRapor(item.berkas)}</td>
                  <td>{labelWaktu(item.disimpanPada)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
