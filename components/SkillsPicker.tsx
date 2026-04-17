"use client";
import { useState } from "react";
import { SKILLS_PRESET } from "@/lib/skills";
import { X, Plus } from "lucide-react";

interface Props {
  selected: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsPicker({ selected, onChange }: Props) {
  const [custom, setCustom] = useState("");

  function toggle(skill: string) {
    if (selected.includes(skill)) {
      onChange(selected.filter(s => s !== skill));
    } else {
      onChange([...selected, skill]);
    }
  }

  function addCustom() {
    const s = custom.trim();
    if (!s || selected.includes(s)) return;
    onChange([...selected, s]);
    setCustom("");
  }

  return (
    <div className="space-y-5">
      {SKILLS_PRESET.map(cat => (
        <div key={cat.categoria}>
          <p className="text-xs font-semibold text-[#444] uppercase tracking-widest mb-2">
            {cat.categoria}
          </p>
          <div className="flex flex-wrap gap-2">
            {cat.items.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggle(skill)}
                className={`skill-chip ${selected.includes(skill) ? "skill-chip-active" : ""}`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Custom skill */}
      <div>
        <p className="text-xs font-semibold text-[#444] uppercase tracking-widest mb-2">
          Agregar personalizada
        </p>
        <div className="flex gap-2">
          <input
            className="input flex-1 py-2.5 text-sm"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Ej: Trenzas afro, Colorimetría…"
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
          />
          <button
            type="button"
            onClick={addCustom}
            className="btn-primary px-4 py-2.5 flex items-center gap-1"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>
      </div>

      {/* Selected preview */}
      {selected.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#444] uppercase tracking-widest mb-2">
            Seleccionadas ({selected.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map(s => (
              <span key={s}
                className="inline-flex items-center gap-1.5 bg-[#22c55e] text-black text-xs font-bold px-3 py-1.5 rounded-full">
                {s}
                <button type="button" onClick={() => toggle(s)} className="hover:text-black/60">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
