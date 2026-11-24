import { kunciRapor, type CatatanArsip } from "../domain/arsip";
import { normalkan } from "../domain/berkas";
import type { Berkas } from "../domain/types";

const NAMA = "e-rapor-kerja";
const VERSI = 2;
const TOKO = "berkas";
const ARSIP = "arsip";
const KUNCI = "aktif";

function buka(): Promise<IDBDatabase> {
  return new Promise((selesai, gagal) => {
    const permintaan = indexedDB.open(NAMA, VERSI);
    permintaan.onupgradeneeded = () => {
      const basis = permintaan.result;
      if (!basis.objectStoreNames.contains(TOKO)) basis.createObjectStore(TOKO);
      if (!basis.objectStoreNames.contains(ARSIP)) basis.createObjectStore(ARSIP);
    };
    permintaan.onsuccess = () => selesai(permintaan.result);
    permintaan.onerror = () => gagal(permintaan.error);
  });
}

export async function simpanKerja(berkas: Berkas): Promise<void> {
  const basis = await buka();
  await new Promise<void>((selesai, gagal) => {
    const transaksi = basis.transaction(TOKO, "readwrite");
    transaksi.objectStore(TOKO).put(berkas, KUNCI);
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

export async function simpanCatatan(berkas: Berkas, disimpanPada: string): Promise<void> {
  const catatan: CatatanArsip = { id: kunciRapor(berkas), disimpanPada, berkas };
  const basis = await buka();
  await new Promise<void>((selesai, gagal) => {
    const transaksi = basis.transaction(ARSIP, "readwrite");
    transaksi.objectStore(ARSIP).put(catatan, catatan.id);
    transaksi.oncomplete = () => selesai();
    transaksi.onerror = () => gagal(transaksi.error);
  });
  basis.close();
}

export async function bacaArsip(): Promise<CatatanArsip[]> {
  try {
    const basis = await buka();
    const data = await new Promise<CatatanArsip[]>((selesai, gagal) => {
      const permintaan = basis.transaction(ARSIP, "readonly").objectStore(ARSIP).getAll();
      permintaan.onsuccess = () => selesai(permintaan.result ?? []);
      permintaan.onerror = () => gagal(permintaan.error);
    });
    basis.close();
    return data.flatMap((item) => {
      const hasil = normalkan(item?.berkas);
      if ("error" in hasil || !item?.id) return [];
      return [{ id: item.id, disimpanPada: String(item.disimpanPada ?? ""), berkas: hasil.berkas }];
    }).sort((a, b) => b.disimpanPada.localeCompare(a.disimpanPada));
  } catch {
    return [];
  }
}
