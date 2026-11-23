import { normalkan } from "../domain/berkas";
import type { Berkas } from "../domain/types";

const NAMA = "e-rapor-kerja";
const TOKO = "berkas";
const KUNCI = "aktif";

function buka(): Promise<IDBDatabase> {
  return new Promise((selesai, gagal) => {
    const permintaan = indexedDB.open(NAMA, 1);
    permintaan.onupgradeneeded = () => {
      permintaan.result.createObjectStore(TOKO);
    };
    permintaan.onsuccess = () => selesai(permintaan.result);
    permintaan.onerror = () => gagal(permintaan.error);
  });
}

export async function simpanKerja(berkas: Berkas | null): Promise<void> {
  const basis = await buka();
  await new Promise<void>((selesai, gagal) => {
    const transaksi = basis.transaction(TOKO, "readwrite");
    const toko = transaksi.objectStore(TOKO);
    if (berkas) toko.put(berkas, KUNCI);
    else toko.delete(KUNCI);
    transaksi.oncomplete = () => selesai();
    transaksi.onerror = () => gagal(transaksi.error);
  });
  basis.close();
}

export async function bacaKerja(): Promise<Berkas | null> {
  try {
    const basis = await buka();
    const data = await new Promise<unknown>((selesai, gagal) => {
      const permintaan = basis.transaction(TOKO, "readonly").objectStore(TOKO).get(KUNCI);
      permintaan.onsuccess = () => selesai(permintaan.result ?? null);
      permintaan.onerror = () => gagal(permintaan.error);
    });
    basis.close();
    if (!data) return null;
    const hasil = normalkan(data);
    return "berkas" in hasil ? hasil.berkas : null;
  } catch {
    return null;
  }
}
