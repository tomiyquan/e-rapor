import { useState } from "react";
import { unduhBerkas } from "../domain/lembar";
import { barisRapor, muridRombel, namaRombel, rekapCsv } from "../domain/rapor";
import { useBerkas } from "../state/BerkasContext";
import { LegerKertas, RaporKertas } from "./RaporKertas";

type ModeCetak = "satu" | "semua" | "leger";

export function CetakView() {
  const { berkas } = useBerkas();
  const [rombelId, setRombelId] = useState(berkas?.rombel[0]?.id ?? "");
  const [muridId, setMuridId] = useState("");
  const [mode, setMode] = useState<ModeCetak>("satu");
  if (!berkas) return null;
  const rombel = berkas.rombel.find((item) => item.id === rombelId) ?? berkas.rombel[0];
  if (!rombel) return <section className="kartu"><p>Buat rombel terlebih dahulu.</p></section>;
  const murid = muridRombel(berkas, rombel.id);
  const muridAktif = murid.find((item) => item.id === muridId) ?? murid[0];

  return (
    <section>
      <div className="kartu jangan-cetak">
        <div className="judul-bagian">
          <h2>Cetak</h2>
          <div className="tombol-baris">
            <button className="tombol" type="button" onClick={() => { setMode("satu"); window.setTimeout(() => window.print(), 50); }} disabled={!muridAktif}>Cetak rapor ini</button>
            <button className="tombol kedua" type="button" onClick={() => { setMode("semua"); window.setTimeout(() => window.print(), 50); }} disabled={murid.length === 0}>Cetak semua rapor</button>
            <button className="tombol kedua" type="button" onClick={() => { setMode("leger"); window.setTimeout(() => window.print(), 50); }}>Cetak leger</button>
            <button
              className="tombol kedua"
              type="button"
              onClick={() => unduhBerkas(`rekap-${namaRombel(rombel).replaceAll(" ", "-")}.csv`, rekapCsv(berkas, rombel), "text/csv;charset=utf-8")}
            >
              Unduh rekap nilai
            </button>
          </div>
        </div>
        <div className="baris-aksi">
          <label className="bidang">Rombel
            <select value={rombel.id} onChange={(event) => { setRombelId(event.target.value); setMuridId(""); setMode("satu"); }}>
              {berkas.rombel.map((item) => <option key={item.id} value={item.id}>{namaRombel(item)}</option>)}
            </select>
          </label>
          <label className="bidang">Murid
            <select value={muridAktif?.id ?? ""} onChange={(event) => { setMuridId(event.target.value); setMode("satu"); }}>
              {murid.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
            </select>
          </label>
        </div>
        <ul>
          {murid.map((item) => {
            const baris = barisRapor(berkas, rombel, item);
            const tanpaDeskripsi = baris.filter((barisItem) => !barisItem.deskripsi).length;
            const kok = berkas.kokurikuler.find((entri) => entri.muridId === item.id)?.deskripsi;
            return (
              <li key={item.id}>
                {item.nama}: {tanpaDeskripsi === 0 ? "deskripsi mapel terisi" : `${tanpaDeskripsi} mapel belum ada deskripsi`}; {kok ? "kokurikuler terisi" : "kokurikuler masih kosong"}.
              </li>
            );
          })}
        </ul>
      </div>
      <div className="pratinjau">
        {mode === "leger" && <LegerKertas berkas={berkas} rombel={rombel} />}
        {mode === "satu" && muridAktif && <RaporKertas berkas={berkas} rombel={rombel} murid={muridAktif} />}
        {mode === "semua" && murid.map((item) => (
          <div className="halaman-pecah" key={item.id}>
            <RaporKertas berkas={berkas} rombel={rombel} murid={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
