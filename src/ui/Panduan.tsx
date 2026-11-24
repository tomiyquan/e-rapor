import { useEffect, useRef, useState } from "react";

export function TombolPanduan({ src, judul }: { src: string; judul: string }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button type="button" className="tombol kedua" onClick={() => setBuka(true)}>Lihat panduan</button>
      {buka && <DialogPanduan src={src} judul={judul} onTutup={() => setBuka(false)} />}
    </>
  );
}

function DialogPanduan({ src, judul, onTutup }: { src: string; judul: string; onTutup: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lepas = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    void videoRef.current?.play();
    return () => {
      lepas.current = true;
      videoRef.current?.pause();
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      className="modal modal-panduan"
      ref={dialogRef}
      aria-labelledby="judul-panduan"
      onClose={() => {
        videoRef.current?.pause();
        if (!lepas.current) onTutup();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="modal-kepala">
        <h3 id="judul-panduan">Panduan {judul}</h3>
      </div>
      <div className="modal-isi">
        <video ref={videoRef} src={src} controls playsInline preload="metadata" />
      </div>
      <div className="modal-aksi">
        <button type="button" className="tombol kedua" onClick={() => dialogRef.current?.close()}>Tutup</button>
      </div>
    </dialog>
  );
}
