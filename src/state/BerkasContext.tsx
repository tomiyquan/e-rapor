import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { arsipSama, rapatArsip, type CatatanArsip } from "../domain/arsip";
import type { Berkas } from "../domain/types";
import { bacaArsip, bacaKerja, simpanCatatan, simpanKerja } from "../storage/kerja";

interface KonteksBerkas {
  siap: boolean;
  berkas: Berkas | null;
  draf: Berkas | null;
  arsip: CatatanArsip[];
  ubah: (ubah: (berkas: Berkas) => Berkas) => void;
  ganti: (berkas: Berkas | null, sudahTersimpan?: boolean) => void;
  adaPerubahan: boolean;
  tersimpanDiArsip: boolean;
  tandaiTersimpan: () => void;
  simpanArsip: (berkas: Berkas) => Promise<void>;
}

const Konteks = createContext<KonteksBerkas | null>(null);

export function BerkasProvider({ children }: { children: ReactNode }) {
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [draf, setDraf] = useState<Berkas | null>(null);
  const [arsip, setArsip] = useState<CatatanArsip[]>([]);
  const [siap, setSiap] = useState(false);
  const [sidikTersimpan, setSidikTersimpan] = useState("");
  const berkasRef = useRef<Berkas | null>(null);
  berkasRef.current = berkas;

  useEffect(() => {
    void Promise.all([bacaKerja(), bacaArsip()]).then(([kerja, daftar]) => {
      setDraf(kerja);
      setArsip(daftar);
      setSiap(true);
    });
  }, []);

  useEffect(() => {
    if (!siap || !berkas) return;
    const timer = window.setTimeout(() => {
      void simpanKerja(berkas);
      setDraf(berkas);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [berkas, siap]);

  const nilai = useMemo<KonteksBerkas>(
    () => ({
      siap,
      berkas,
      draf,
      arsip,
      ubah: (fn) => setBerkas((prev) => (prev ? fn(prev) : prev)),
      ganti: (berikutnya, sudahTersimpan = false) => {
        if (!berikutnya && berkasRef.current) {
          const salinan = berkasRef.current;
          setDraf(salinan);
          void simpanKerja(salinan);
        } else if (berikutnya) {
          setDraf(berikutnya);
          void simpanKerja(berikutnya);
        }
        setBerkas(berikutnya);
        setSidikTersimpan(sudahTersimpan && berikutnya ? JSON.stringify(berikutnya) : "");
      },
      adaPerubahan: berkas !== null && JSON.stringify(berkas) !== sidikTersimpan,
      tersimpanDiArsip: arsipSama(arsip, berkas),
      tandaiTersimpan: () => setSidikTersimpan(JSON.stringify(berkas)),
      simpanArsip: async (saatIni) => {
        const disimpanPada = new Date().toISOString();
        await simpanCatatan(saatIni, disimpanPada);
        await simpanKerja(saatIni);
        setArsip((prev) => rapatArsip(prev, saatIni, disimpanPada));
        setDraf(saatIni);
        setBerkas(saatIni);
        setSidikTersimpan(JSON.stringify(saatIni));
      },
    }),
    [siap, berkas, draf, arsip, sidikTersimpan],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useBerkas(): KonteksBerkas {
  const konteks = useContext(Konteks);
  if (!konteks) throw new Error("Penyedia berkas belum dipasang.");
  return konteks;
}
