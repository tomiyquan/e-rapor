import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Berkas } from "../domain/types";
import { bacaKerja, simpanKerja } from "../storage/kerja";

interface KonteksBerkas {
  siap: boolean;
  berkas: Berkas | null;
  ubah: (ubah: (berkas: Berkas) => Berkas) => void;
  ganti: (berkas: Berkas | null, sudahTersimpan?: boolean) => void;
  adaPerubahan: boolean;
  tandaiTersimpan: () => void;
}

const Konteks = createContext<KonteksBerkas | null>(null);

export function BerkasProvider({ children }: { children: ReactNode }) {
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [siap, setSiap] = useState(false);
  const [sidikTersimpan, setSidikTersimpan] = useState("");

  useEffect(() => {
    void bacaKerja().then((tersimpan) => {
      if (tersimpan) {
        setBerkas(tersimpan);
        setSidikTersimpan(JSON.stringify(tersimpan));
      }
      setSiap(true);
    });
  }, []);

  useEffect(() => {
    if (!siap) return;
    const timer = window.setTimeout(() => {
      void simpanKerja(berkas);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [berkas, siap]);

  const nilai = useMemo<KonteksBerkas>(
    () => ({
      siap,
      berkas,
      ubah: (fn) => setBerkas((prev) => (prev ? fn(prev) : prev)),
      ganti: (berikutnya, sudahTersimpan = false) => {
        setBerkas(berikutnya);
        setSidikTersimpan(sudahTersimpan && berikutnya ? JSON.stringify(berikutnya) : "");
      },
      adaPerubahan: JSON.stringify(berkas) !== sidikTersimpan,
      tandaiTersimpan: () => setSidikTersimpan(JSON.stringify(berkas)),
    }),
    [siap, berkas, sidikTersimpan],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useBerkas(): KonteksBerkas {
  const konteks = useContext(Konteks);
  if (!konteks) throw new Error("Penyedia berkas belum dipasang.");
  return konteks;
}
