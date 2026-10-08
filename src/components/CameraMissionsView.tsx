import React from 'react';
import { CameraMission } from '../types';
import { CAMERA_MISSIONS } from '../data/initialData';
import { sound } from '../services/sound';

interface Props {
  multiplierActive: boolean;
  onSelectMission: (mission: CameraMission) => void;
}

export const CameraMissionsView: React.FC<Props> = ({ multiplierActive, onSelectMission }) => {
  return (
    <div className="space-y-9 pb-4">
      <div>
        <h2 className="text-[28px] font-bold leading-tight tracking-tight">Misiones de visión creativa</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-bruma">
          Conecta tu entorno físico con tu criatura. Escanea colores, texturas y objetos de estudio para
          desbloquear ráfagas de energía creativa.
        </p>
      </div>

      <div>
        <h3 className="text-[15px] font-bold">Desafíos disponibles hoy</h3>

        <ul className="mt-2 divide-y divide-trazo/70 border-t border-trazo/70">
          {CAMERA_MISSIONS.map(m => {
            const reward = multiplierActive ? m.energyReward * 2 : m.energyReward;
            return (
              <li key={m.id}>
                <button
                  onClick={() => {
                    sound.playTap();
                    onSelectMission(m);
                  }}
                  className="group flex w-full items-center gap-4 py-4 text-left"
                >
                  {/* The color to find, as a swatch */}
                  <span
                    className="h-12 w-12 shrink-0 rounded-[48%_52%_50%_50%/54%_46%_54%_46%] ring-4 ring-lino transition-transform duration-300 [filter:saturate(0.72)] group-hover:scale-105"
                    style={{ backgroundColor: m.targetColor }}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold leading-snug">{m.title}</span>
                    <span className="mt-0.5 block line-clamp-2 text-[14px] leading-snug text-bruma">{m.prompt}</span>
                  </span>

                  <span className="shrink-0 text-right leading-tight">
                    <span className="tnum block text-[15px] font-bold">+{reward}</span>
                    <span className="block text-[11px] text-bruma group-hover:text-tinta">Escanear</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
