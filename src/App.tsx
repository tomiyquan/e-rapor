import { useState } from "react";
import { useBerkas } from "./state/BerkasContext";
import { BantuanView } from "./ui/BantuanView";
import { BerkasView } from "./ui/BerkasView";
import { CetakView } from "./ui/CetakView";
import { KelengkapanView } from "./ui/KelengkapanView";
import { NilaiView } from "./ui/NilaiView";
import { RombelView } from "./ui/RombelView";

type Layar = "berkas" | "rombel" | "nilai" | "kelengkapan" | "cetak" | "bantuan";

const MENU: { id: Layar; label: string; perluBerkas: boolean }[] = [
  { id: "berkas", label: "Berkas", perluBerkas: false },
  { id: "rombel", label: "Rombel", perluBerkas: true },
  { id: "nilai", label: "Nilai", perluBerkas: true },
  { id: "kelengkapan", label: "Kelengkapan", perluBerkas: true },
  { id: "cetak", label: "Cetak", perluBerkas: true },
  { id: "bantuan", label: "Bantuan", perluBerkas: false },
];

export function App() {
  const { siap, berkas, adaPerubahan } = useBerkas();
  const [layar, setLayar] = useState<Layar>("berkas");
  if (!siap) return <p className="isi">Membuka salinan kerja…</p>;
  const aktif = berkas || !MENU.find((item) => item.id === layar)?.perluBerkas ? layar : "berkas";

  return (
    <div className="aplikasi">
      <header className="kepala jangan-cetak">
        <div className="merek">
          <strong>E-Rapor</strong>
          <span>{berkas ? `${berkas.sekolah.nama} · ${berkas.sekolah.jenjang}` : "Belum ada berkas sekolah"}</span>
        </div>
        <div>
          <nav className="nav">
            {MENU.filter((item) => berkas || !item.perluBerkas).map((item) => (
              <button key={item.id} type="button" className={aktif === item.id ? "aktif" : ""} onClick={() => setLayar(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <p className="status-simpan">{berkas && adaPerubahan ? "Perubahan belum disimpan ke berkas." : " "}</p>
        </div>
      </header>
      <main className="isi">
        {aktif === "berkas" && <BerkasView />}
        {aktif === "rombel" && <RombelView />}
        {aktif === "nilai" && <NilaiView />}
        {aktif === "kelengkapan" && <KelengkapanView />}
        {aktif === "cetak" && <CetakView />}
        {aktif === "bantuan" && <BantuanView />}
      </main>
    </div>
  );
}
