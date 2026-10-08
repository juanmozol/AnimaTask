import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreatureState } from '../types';
import { CREATURE_CATALOG, AVAILABLE_SPECIES, MAX_TIER, getCatalogKey } from '../data/initialData';
import { sound } from '../services/sound';
import { Heart, Lock, X, Check } from 'lucide-react';

interface Props {
  creature: CreatureState;
  onPet?: () => void;
  canEvolve: boolean;
  onOpenEvolution?: () => void;
  onOpenFamilyUnlock?: () => void;
}

// One slightly uneven brush stroke: the progress to the next form is "painted" along it.
const BRUSH = 'M4 8 C 60 4, 110 11, 170 7 S 290 4, 396 8';

// The egg has no render yet, so it is drawn: clay body, three soft runes.
const Egg: React.FC<{ breathing: boolean }> = ({ breathing }) => (
  <svg
    viewBox="0 0 200 240"
    className={`h-[74%] w-auto transition-transform duration-500 ${breathing ? 'animate-breathe' : 'scale-105'}`}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="huevo-arcilla" cx="38%" cy="30%" r="82%">
        <stop offset="0" stopColor="#e4cba4" />
        <stop offset="0.55" stopColor="#c9a97d" />
        <stop offset="1" stopColor="#a58155" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="224" rx="64" ry="8" fill="#2d2620" opacity="0.13" />
    <path
      d="M100 12 C 152 12, 180 98, 180 148 C 180 197, 145 224, 100 224 C 55 224, 20 197, 20 148 C 20 98, 48 12, 100 12 Z"
      fill="url(#huevo-arcilla)"
    />
    <g fill="none" stroke="#6f5233" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
      <path d="M78 118 l11 -15 l11 15" />
      <path d="M112 150 q10 -13 20 0 q-10 13 -20 0" />
      <path d="M72 168 h22 M83 158 v20" />
    </g>
    <ellipse cx="68" cy="72" rx="12" ry="26" fill="#fff" opacity="0.24" transform="rotate(18 68 72)" />
  </svg>
);

export const CreatureDisplay: React.FC<Props> = ({
  creature,
  onPet,
  canEvolve,
  onOpenEvolution,
  onOpenFamilyUnlock,
}) => {
  const [isPetting, setIsPetting] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  // The "tap to interact" hint is only needed until the first pet.
  const [petted, setPetted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('animatask_petted') === '1';
    } catch {
      return false;
    }
  });

  // Determine lookup key
  const catalogKey = getCatalogKey(creature.speciesId, creature.tier, creature.branch, creature.alignment);

  const info = CREATURE_CATALOG[catalogKey] || CREATURE_CATALOG['numbik_1'] || CREATURE_CATALOG['0_neutral'];
  const activeImage = creature.imageUrl || info.imageUrl;

  // A failed image must not hide the next creature's (different) image.
  useEffect(() => {
    setImageError(false);
  }, [activeImage]);

  const currentSpecies = AVAILABLE_SPECIES.find(s => s.id === creature.speciesId) || AVAILABLE_SPECIES[0];

  const handleInteraction = (e: React.MouseEvent) => {
    sound.playPetCreature();
    if (!petted) {
      setPetted(true);
      try {
        localStorage.setItem('animatask_petted', '1');
      } catch {
        /* storage unavailable: the hint comes back next time */
      }
    }
    setIsPetting(true);
    setTimeout(() => setIsPetting(false), 500);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHeart = { id: Date.now(), x, y };
    setHearts(prev => [...prev.slice(-4), newHeart]);

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1300);

    onPet?.();
  };

  const isFinal = creature.tier >= MAX_TIER;
  const progress = isFinal
    ? 100
    : Math.min(100, Math.max(0, (creature.totalEnergy / creature.nextTierThreshold) * 100));

  // Before the path is decided (egg, Principal) the accent is jade; after that it follows the path.
  const pathColor =
    creature.tier <= 1 ? 'var(--color-jade)' : creature.alignment === 'shadow' ? 'var(--color-humo)' : 'var(--color-curcuma)';

  const stageLabel =
    creature.tier === 0
      ? 'Huevo'
      : creature.tier === 1
        ? 'Principal'
        : isFinal
          ? 'Alfa'
          : creature.alignment === 'shadow'
            ? `B${creature.tier}`
            : `P${creature.tier}`;

  return (
    <div className="relative w-full select-none">
      {/* The photo's lower edge is a soft dune instead of a straight cut. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="duna" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H1 V0.945 C0.86,0.99 0.73,0.94 0.57,0.962 C0.4,0.985 0.2,0.935 0,0.972 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        onClick={handleInteraction}
        className="ui-creature relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,var(--color-lino),var(--color-arena))] [clip-path:url(#duna)]"
        role="button"
        aria-label={`Acariciar a ${creature.name}`}
      >
        {activeImage && !imageError ? (
          <div className="ui-tear h-full w-full">
            <img
              src={activeImage}
              alt={info.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              draggable={false}
              className={`h-full w-full object-contain transition-transform duration-500 [filter:sepia(0.2)_saturate(0.94)_drop-shadow(0_10px_10px_rgb(45_38_32/0.22))] ${
                isPetting ? 'scale-[1.035]' : 'animate-breathe'
              }`}
            />
          </div>
        ) : creature.tier === 0 ? (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_50%_42%,#f7f0e4,#e4d8c3)]">
            <Egg breathing={!isPetting} />
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center bg-lino">
            <span className="text-7xl font-bold text-trazo">{info.name.charAt(0)}</span>
          </div>
        )}

        {hearts.map(h => (
          <div
            key={h.id}
            className="pointer-events-none absolute z-10 animate-rise"
            style={{ left: h.x, top: h.y }}
          >
            <Heart className="h-6 w-6 fill-rubia text-rubia" />
          </div>
        ))}
      </div>

      {!petted && <p className="px-5 pt-1 text-center text-xs text-bruma">Toca para interactuar con {creature.name}</p>}

      <div className="px-5 pt-5">
        {/* Where it is on the tree, and which species */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map(i => (
                <span
                  key={i}
                  className={`block rounded-full ${i === creature.tier ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5'} ${
                    i > creature.tier ? 'bg-trazo' : i < creature.tier ? 'bg-bruma/60' : ''
                  }`}
                  style={i === creature.tier ? { backgroundColor: pathColor } : undefined}
                />
              ))}
            </div>
            <span className="text-[13px] font-bold">{stageLabel}</span>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setShowSpeciesModal(true);
            }}
            className="text-[13px] text-bruma transition-colors hover:text-tinta"
          >
            <span className="font-medium text-tinta">{currentSpecies.name}</span>{' '}
            <span className="underline decoration-trazo underline-offset-4">Cambiar</span>
          </button>
        </div>

        {/* Name and the one action that matters right now */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="ui-title text-[28px] leading-tight tracking-tight">{creature.name}</h2>
            </div>
            <p className="text-[15px] text-bruma">{creature.title}</p>
          </div>

          {creature.isEvolutionLocked ? (
            <button
              onClick={onOpenFamilyUnlock}
              className="btn-contorno shrink-0 gap-1.5 border-rubia px-4 py-2 text-[13px] text-rubia hover:bg-rubia/10"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Bloqueo Familiar</span>
            </button>
          ) : isFinal ? (
            <span className="shrink-0 pt-1 text-[13px] font-bold text-curcuma-hondo">Forma final</span>
          ) : canEvolve ? (
            <button
              onClick={onOpenEvolution}
              className="btn-sello shrink-0 px-5 py-2.5 text-sm"
            >
              ¡Evolucionar!
            </button>
          ) : null}
        </div>

        {/* Progress to the next form, painted as a brush stroke */}
        <svg viewBox="0 0 400 14" className="mt-4 block w-full" aria-hidden="true">
          <path d={BRUSH} pathLength={100} fill="none" stroke="var(--color-trazo)" strokeWidth={3} strokeLinecap="round" />
          <path
            d={BRUSH}
            pathLength={100}
            fill="none"
            stroke={pathColor}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${progress} 100`}
            style={{ transition: 'stroke-dasharray 700ms ease-out' }}
          />
        </svg>

        <div className="mt-1.5 flex items-baseline justify-between text-[13px] text-bruma">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pathColor }} />
            {info.elementLabel}
          </span>
          {isFinal ? (
            <span className="tnum">{creature.totalEnergy} pts</span>
          ) : (
            <span className="tnum">
              <strong className="font-bold text-tinta">{creature.totalEnergy}</strong> / {creature.nextTierThreshold}
              <span className="ml-2">
                faltan {Math.max(0, creature.nextTierThreshold - creature.totalEnergy)} pts
              </span>
            </span>
          )}
        </div>

        <p className="mt-6 text-[15px] leading-[1.7]">{creature.description}</p>

        <p className="mt-3 text-[14px] leading-relaxed text-bruma">
          <strong className="font-bold text-tinta">Habilidad: </strong>
          {creature.specialAbility}
        </p>
      </div>

      {/* Species selector */}
      {showSpeciesModal && createPortal(
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-tinta/45"
          onClick={() => setShowSpeciesModal(false)}
        >
          <div
            role="dialog"
            aria-label="Santuario Multicriatura"
            onClick={e => e.stopPropagation()}
            className="max-h-[88dvh] w-full max-w-[440px] animate-sheet-up overflow-y-auto rounded-t-[28px] bg-lino px-5 pb-8 pt-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="ui-title text-lg">Santuario Multicriatura</h3>
                <p className="text-sm text-bruma">Selecciona tu compañero activo</p>
              </div>
              <button
                onClick={() => setShowSpeciesModal(false)}
                className="-mr-2 -mt-1 grid h-9 w-9 place-items-center rounded-full text-bruma hover:bg-tinta/5 hover:text-tinta"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="mt-4 divide-y divide-trazo/70 border-t border-trazo/70">
              {AVAILABLE_SPECIES.map(sp => {
                const isSelected = sp.id === creature.speciesId;
                const isAvailable = sp.id === 'numbik'; // only Numbik has its full evolution tree so far
                return (
                  <li key={sp.id}>
                    <button
                      disabled={!isAvailable}
                      onClick={() => {
                        sound.playTap();
                        setShowSpeciesModal(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 py-3.5 text-left ${
                        isAvailable ? '' : 'opacity-55'
                      }`}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2">
                          <span className="font-bold">{sp.name}</span>
                          {sp.hasBipolarPaths && <span className="text-xs text-bruma">Dos sendas: Armonía y Sombra</span>}
                          {!isAvailable && (
                            <span className="text-xs italic text-bruma">próximamente</span>
                          )}
                        </div>
                        <p className="text-sm text-bruma">{sp.subtitle}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 shrink-0 text-jade" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
