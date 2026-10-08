import React, { useState, useEffect } from 'react';
import { CreatureState } from '../types';
import { CreatureEvolutionInfo } from '../data/initialData';
import { sound } from '../services/sound';

interface Props {
  currentCreature: CreatureState;
  nextCreatureInfo: CreatureEvolutionInfo;
  onConfirmEvolution: () => void;
  onClose: () => void;
}

export const EvolutionModal: React.FC<Props> = ({
  currentCreature,
  nextCreatureInfo,
  onConfirmEvolution,
  onClose,
}) => {
  const [phase, setPhase] = useState<'charging' | 'flash' | 'revealed'>('charging');

  useEffect(() => {
    // Start charge audio & animation
    sound.playEvolutionCharge();

    const flashTimer = setTimeout(() => {
      setPhase('flash');
    }, 2400);

    const revealTimer = setTimeout(() => {
      setPhase('revealed');
      sound.playEvolutionFanfare();
    }, 2800);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  const handleFinish = () => {
    onConfirmEvolution();
    onClose();
  };

  const pathColor =
    nextCreatureInfo.tier <= 1
      ? 'var(--color-jade)'
      : nextCreatureInfo.alignment === 'shadow'
        ? 'var(--color-humo)'
        : 'var(--color-curcuma)';

  return (
    <div className="fixed inset-0 z-50 select-none overflow-y-auto bg-arena animate-fade-in">
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="duna-evo" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H1 V0.945 C0.86,0.99 0.73,0.94 0.57,0.962 C0.4,0.985 0.2,0.935 0,0.972 Z" />
          </clipPath>
        </defs>
      </svg>

      {phase !== 'revealed' && (
        <div className="grid min-h-full place-items-center px-8">
          <div className="flex flex-col items-center text-center">
            {/* One ring, drawn in a single stroke while the form changes */}
            <svg viewBox="0 0 120 120" className="h-44 w-44" aria-hidden="true">
              <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-trazo)" strokeWidth="2" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="var(--color-tinta)"
                strokeWidth="7"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100 100"
                className="animate-draw"
                transform="rotate(-100 60 60)"
              />
            </svg>

            <p className="mt-8 text-[13px] text-bruma">Canalizando esencia...</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight">Tu criatura está cambiando</h3>
            <p className="mt-2 max-w-[17rem] text-[14px] leading-relaxed text-bruma">
              Tus hábitos y energías acumuladas están reconfigurando a tu compañero.
            </p>
          </div>
        </div>
      )}

      {phase === 'flash' && <div className="fixed inset-0 z-[60] animate-fade-in bg-lino" />}

      {phase === 'revealed' && (
        <div className="mx-auto flex min-h-full w-full max-w-[440px] animate-fade-in flex-col">
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,var(--color-lino),var(--color-arena))] [clip-path:url(#duna-evo)]">
            {nextCreatureInfo.imageUrl ? (
              <img
                src={nextCreatureInfo.imageUrl}
                alt={nextCreatureInfo.name}
                draggable={false}
                className="h-full w-full object-contain [filter:sepia(0.2)_saturate(0.94)_drop-shadow(0_10px_10px_rgb(45_38_32/0.22))]"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-lino">
                <span className="text-7xl font-bold text-trazo">{nextCreatureInfo.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col px-5 pb-8 pt-5">
            <p className="text-[13px] text-bruma">{currentCreature.name} evolucionó a</p>
            <h2 className="ui-title mt-1 text-[32px] leading-tight tracking-tight">{nextCreatureInfo.name}</h2>
            <p className="text-[15px] text-bruma">{nextCreatureInfo.title}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-bruma">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pathColor }} />
              {nextCreatureInfo.elementLabel}
            </p>

            <p className="mt-5 text-[15px] leading-[1.7]">{nextCreatureInfo.description}</p>

            <div className="mb-8 mt-5 border-l-[3px] border-jade pl-4">
              <p className="text-[13px] text-bruma">Nueva habilidad desbloqueada</p>
              <p className="text-[15px] font-bold leading-snug">{nextCreatureInfo.specialAbility}</p>
            </div>

            <button
              onClick={handleFinish}
              className="btn-sello mt-auto w-full py-3.5 text-[15px]"
            >
              Abrazar nueva forma
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
