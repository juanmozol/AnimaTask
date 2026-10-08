import React from 'react';
import { EnergyBalance, EnergyType } from '../types';

interface Props {
  energies: EnergyBalance;
  dominantEnergy: EnergyType;
}

// Natural-dye pigments: indigo, madder, cochineal, moss.
const ENERGIES: Array<{ type: EnergyType; label: string; sublabel: string; color: string }> = [
  { type: 'enfoque', label: 'Enfoque', sublabel: 'Académico y profesional', color: 'bg-anil' },
  { type: 'familia', label: 'Familia', sublabel: 'Reconexión y calidad', color: 'bg-rubia' },
  { type: 'creativo', label: 'Creativo', sublabel: 'Arte, cámara y 3D', color: 'bg-cochinilla' },
  { type: 'activo', label: 'Activo', sublabel: 'Ejercicio y deporte', color: 'bg-musgo' },
];

export const EnergyBreakdown: React.FC<Props> = ({ energies, dominantEnergy }) => {
  const maxVal = Math.max(1, ...Object.values(energies));

  return (
    <section className="px-5 pb-6 pt-9 select-none">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-bold">Energías</h3>
        <span className="text-[13px] text-bruma">
          Dominante: <strong className="font-bold capitalize text-tinta">{dominantEnergy}</strong>
        </span>
      </div>

      <ul className="mt-2 divide-y divide-trazo/70">
        {ENERGIES.map(cfg => {
          const value = energies[cfg.type];
          const percentage = Math.min(100, Math.round((value / Math.max(100, maxVal * 1.2)) * 100));

          return (
            <li key={cfg.type} className="py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span className={`h-2.5 w-2.5 translate-y-px rounded-full ${cfg.color}`} />
                  <span className="font-bold">{cfg.label}</span>
                  <span className="truncate text-[13px] text-bruma">{cfg.sublabel}</span>
                </div>
                <span className="tnum font-bold">{value}</span>
              </div>

              <div className="mt-2.5 h-[3px] w-full rounded-full bg-trazo/70">
                <div
                  className={`h-full rounded-full ${cfg.color} transition-all duration-700 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
