import { Fragment } from "react";
import { formatTanggal, mengikuti, mapelRombel, namaRombel, semesterTeks, barisRapor, hasilMapel, muridRombel } from "../domain/rapor";
import type { Berkas, Murid, Rombel } from "../domain/types";

function hari(nilai: number | undefined): string {
  return `${nilai ?? 0} hari`;
}

export function RaporKertas({ berkas, rombel, murid }: { berkas: Berkas; rombel: Rombel; murid: Murid }) {
  const baris = barisRapor(berkas, rombel, murid);
  const kokurikuler = berkas.kokurikuler.find((item) => item.muridId === murid.id);
  const ekskul = berkas.ekskul.filter((item) => item.muridId === murid.id);
  const absen = berkas.absensi.find((item) => item.muridId === murid.id);
  const catatan = berkas.catatan.find((item) => item.muridId === murid.id);
  const angka = !rombel.sembunyikanAngka;
  const kolom = angka ? 4 : 3;

  return (
    <article className="rapor-kertas">
      <h2>Laporan Hasil Belajar</h2>
      <p className="subjudul">{berkas.sekolah.nama}</p>
      <table className="identitas">
        <tbody>
          <tr>
            <td>Nama Murid</td>
            <td>: {murid.nama}</td>
            <td>Kelas</td>
            <td>: {namaRombel(rombel)}</td>
          </tr>
          <tr>
            <td>NISN</td>
            <td>: {murid.nisn || "—"}</td>
            <td>Fase</td>
            <td>: {rombel.fase}</td>
          </tr>
          <tr>
            <td>Sekolah</td>
            <td>: {berkas.sekolah.nama}</td>
            <td>Semester</td>
            <td>: {semesterTeks(berkas.semester)}</td>
          </tr>
          <tr>
            <td>Alamat</td>
            <td>: {berkas.sekolah.alamat}</td>
            <td>Tahun Ajaran</td>
            <td>: {berkas.tahunAjaran}</td>
          </tr>
        </tbody>
      </table>
      <table className="rapor-tabel">
        <thead>
          <tr>
            <th style={{ width: "36px" }}>No.</th>
            <th>Mata Pelajaran</th>
            {angka && <th style={{ width: "72px" }}>Nilai Akhir</th>}
            <th>Capaian Kompetensi</th>
          </tr>
        </thead>
        <tbody>
          {baris.map((item, indeks) => (
            <Fragment key={item.mapelId}>
              {item.kelompokLabel && (
                <tr className="kelompok">
                  <td colSpan={kolom}>{item.kelompokLabel}</td>
                </tr>
              )}
              <tr>
                <td style={{ textAlign: "center" }}>{indeks + 1}</td>
                <td>{item.nama}</td>
                {angka && <td style={{ textAlign: "center" }}>{item.nilai ?? ""}</td>}
                <td>{item.deskripsi}</td>
              </tr>
            </Fragment>
          ))}
          <tr className="kokurikuler">
            <td colSpan={kolom}>
              <strong>Kokurikuler</strong>
              <p>{kokurikuler?.deskripsi || " "}</p>
            </td>
          </tr>
        </tbody>
      </table>
      <table className="rapor-tabel">
        <thead>
          <tr>
            <th style={{ width: "36px" }}>No.</th>
            <th>Ekstrakurikuler</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {(ekskul.length > 0 ? ekskul : [{ id: "kosong", nama: "", keterangan: "" }]).map((item, indeks) => (
            <tr key={item.id}>
              <td style={{ textAlign: "center" }}>{item.nama ? indeks + 1 : ""}</td>
              <td>{item.nama}</td>
              <td>{item.keterangan}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pasang">
        <div className="kotak">
          <strong>Ketidakhadiran</strong>
          <p>Sakit: {hari(absen?.sakit)}</p>
          <p>Izin: {hari(absen?.izin)}</p>
          <p>Tanpa Keterangan: {hari(absen?.alfa)}</p>
        </div>
        <div className="kotak">
          <strong>Catatan Wali Kelas</strong>
          <p>{catatan?.catatanWali || " "}</p>
        </div>
      </div>
      <div className="kotak tanggapan">
        <strong>Tanggapan Orang Tua/Wali Murid</strong>
        <p>{catatan?.tanggapanOrtu || " "}</p>
      </div>
      <div className="tanda-tangan">
        <div>
          <p>Orang Tua/Wali Murid</p>
          <div className="spasi" />
          <p>............................</p>
        </div>
        <div />
        <div>
          <p>
            {berkas.sekolah.kota ? `${berkas.sekolah.kota}, ` : ""}
            {formatTanggal(berkas.tanggalRapor)}
          </p>
          <p>Wali Kelas</p>
          <div className="spasi" />
          <p>{rombel.waliKelas || "............................"}</p>
        </div>
      </div>
      <div className="tanda-tangan">
        <div />
        <div>
          <p>Kepala Sekolah</p>
          <div className="spasi" />
          <p>{berkas.sekolah.kepalaSekolah || "............................"}</p>
        </div>
        <div />
      </div>
      <p className="sumber">
        Format mengikuti Panduan Pembelajaran dan Asesmen, BSKAP Kemendikdasmen, edisi revisi 2025. Aplikasi ini tidak
        mengirim nilai ke Dapodik.
      </p>
    </article>
  );
}

export function LegerKertas({ berkas, rombel }: { berkas: Berkas; rombel: Rombel }) {
  const murid = muridRombel(berkas, rombel.id);
  const mapel = mapelRombel(berkas, rombel.id).filter((item) => item.aktif && murid.some((siswa) => mengikuti(berkas, siswa, item)));
  return (
    <article className="leger-kertas">
      <h2>Leger Nilai</h2>
      <p className="subjudul">
        {berkas.sekolah.nama} · {namaRombel(rombel)} · Semester {semesterTeks(berkas.semester)} · {berkas.tahunAjaran}
      </p>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama</th>
            <th>NISN</th>
            {mapel.map((item) => (
              <th key={item.id}>{item.nama}</th>
            ))}
            {berkas.semester === 2 && <th>Keputusan</th>}
          </tr>
        </thead>
        <tbody>
          {murid.map((item, indeks) => {
            const keputusan = berkas.catatan.find((catatan) => catatan.muridId === item.id)?.keputusan;
            return (
              <tr key={item.id}>
                <td>{indeks + 1}</td>
                <td>{item.nama}</td>
                <td>{item.nisn}</td>
                {mapel.map((pelajaran) => {
                  const angka = mengikuti(berkas, item, pelajaran) ? hasilMapel(berkas, rombel, pelajaran, item.id).nilai : null;
                  return <td key={pelajaran.id}>{rombel.sembunyikanAngka ? "" : (angka ?? "")}</td>;
                })}
                {berkas.semester === 2 && <td>{labelKeputusan(keputusan)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="sumber">Leger untuk arsip wali kelas. Peringkat tidak dicetak pada rapor murid.</p>
    </article>
  );
}

function labelKeputusan(nilai: string | undefined): string {
  if (nilai === "naik") return "Naik";
  if (nilai === "tidak-naik") return "Tidak naik";
  if (nilai === "lulus") return "Lulus";
  return "";
}
