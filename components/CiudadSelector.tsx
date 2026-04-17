"use client";
import { CIUDADES } from "@/lib/ciudades";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CiudadSelector({ value, onChange, placeholder = "Seleccioná una ciudad", className = "" }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`input ${className}`} style={{ background: "#111", color: "#fff" }}
    >
      <option value="">{placeholder}</option>
      {CIUDADES.map(c => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
  );
}
