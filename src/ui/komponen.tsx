import type { ReactNode, SelectHTMLAttributes } from "react";

export function Bidang({
  label,
  children,
  id,
  lebar,
}: {
  label: string;
  children: ReactNode;
  id?: string;
  lebar?: "dua" | "penuh";
}) {
  const kelas = lebar === "penuh" ? "bidang bidang-penuh" : lebar === "dua" ? "bidang bidang-dua" : "bidang";
  return (
    <label className={kelas} htmlFor={id}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Pilih(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />;
}

export function Pesan({ jenis, anak }: { jenis: "info" | "galat" | "baik"; anak: ReactNode }) {
  return <p className={`pesan pesan-${jenis}`}>{anak}</p>;
}
