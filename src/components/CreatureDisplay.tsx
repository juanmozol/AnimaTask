import React, { useState, useEffect } from 'react';
import { CreatureState, CreatureAlignment, SpeciesEntry } from '../types';
import { CREATURE_CATALOG, AVAILABLE_SPECIES, getCatalogKey } from '../data/initialData';
import { sound } from '../services/sound';
import { Sparkles, Heart, Zap, Lock, ShieldCheck, Sun, Moon, Layers, ChevronRight } from 'lucide-react';

interface Props {
  creature: CreatureState;
  onPet?: () => void;
  canEvolve: boolean;
  onOpenEvolution?: () => void;
  onOpenFamilyUnlock?: () => void;
  onToggleAlignment?: (alignment: CreatureAlignment) => void;
  onSelectSpecies?: (speciesId: string) => void;
}

export const CreatureDisplay: React.FC<Props> = ({
  creature,
  onPet,
  canEvolve,
  onOpenEvolution,
  onOpenFamilyUnlock,
  onToggleAlignment,
  onSelectSpecies,
}) => {
  const [isPetting, setIsPetting] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    setIsPetting(true);
    setTimeout(() => setIsPetting(false), 500);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHeart = { id: Date.now(), x, y };
    setHearts(prev => [...prev.slice(-4), newHeart]);

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1200);

    onPet?.();
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Top Header: Neutral Species Switcher + Senda Toggle */}
      <div className="w-full flex items-center justify-between mb-2.5 px-0.5">
        {/* Species selector pill */}
        <button
          onClick={() => {
            sound.playTap();
            setShowSpeciesModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentSpecies.name}</span>
          <span className="text-[10px] text-slate-500 font-normal">· Cambiar</span>
        </button>

        {/* Dual Path (Good vs Bad) Alignment Switcher */}
        {currentSpecies.hasBipolarPaths && (
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => {
                sound.playTap();
                onToggleAlignment?.('harmony');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                creature.alignment === 'harmony'
                  ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Senda de Armonía (Luz y Sabiduría)"
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Armonía</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onToggleAlignment?.('shadow');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                creature.alignment === 'shadow'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Senda del Abismo (Sombra y Espectro)"
            >
              <Moon className="w-3 h-3 text-emerald-400" />
              <span>Sombra</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Neutral Studio Showcase Habitat */}
      <div
        onClick={handleInteraction}
        className={`relative w-full h-72 rounded-3xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-slate-900/90 border border-slate-800/80 shadow-xl group ${
          isPetting ? 'scale-[1.01]' : 'hover:border-slate-700'
        }`}
      >
        {/* Subtle, neutral radial lighting */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-700"
          style={{
            background:
              creature.alignment === 'shadow'
                ? 'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.12), transparent 70%)'
                : 'radial-gradient(circle at 50% 45%, rgba(217, 119, 6, 0.12), transparent 70%)',
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 font-medium">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: creature.alignment === 'shadow' ? '#10b981' : '#f59e0b',
              }}
            />
            <span>{info.elementLabel}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-slate-300 font-mono">
            <span>Etapa {creature.tier}</span>
            <span className="text-slate-600">·</span>
            <span>{creature.tier === 0 ? 'Huevo' : creature.tier === 1 ? 'Base' : creature.tier === 2 ? 'Rama' : 'Alfa'}</span>
          </div>
        </div>

        {/* Dynamic Hearts on click / pet */}
        {hearts.map(h => (
          <div
            key={h.id}
            className="absolute z-20 pointer-events-none animate-bounce"
            style={{ left: h.x, top: h.y }}
          >
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400 drop-shadow-md animate-ping" />
          </div>
        ))}

        {/* Creature 3D Render or Stylized Graphic */}
        <div className={`transition-transform duration-300 flex items-center justify-center ${isPetting ? 'scale-105' : 'animate-[bounce_4.5s_ease-in-out_infinite]'}`}>
          {activeImage && !imageError ? (
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950/40">
              <img
                src={activeImage}
                alt={info.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Subtle glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            // Neutral Procedural Icon Fallback
            <div className="w-40 h-40 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex flex-col items-center justify-center text-5xl shadow-xl">
              <span>{creature.alignment === 'shadow' ? '💀' : '🦊'}</span>
              <span className="text-[10px] text-slate-400 mt-2 font-mono">{info.name}</span>
            </div>
          )}
        </div>

        {/* Ambient bottom caption */}
        <div className="absolute bottom-2 text-[10px] text-slate-500 font-medium tracking-wide">
          Toca para interactuar con {creature.name}
        </div>
      </div>

      {/* Neutral Identity Card */}
      <div className="w-full mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {creature.name}
              </h2>
              {creature.tier === 3 && (
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  ALFA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{creature.title}</p>
          </div>

          {/* Action: Evolve or Locked */}
          {creature.isEvolutionLocked ? (
            <button
              onClick={onOpenFamilyUnlock}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-500/25 transition-colors animate-pulse"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloqueo Familiar</span>
            </button>
          ) : canEvolve ? (
            <button
              onClick={onOpenEvolution}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>¡Evolucionar!</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-xs text-slate-300 font-mono font-bold">
                {creature.totalEnergy} / {creature.nextTierThreshold}
              </span>
              <p className="text-[10px] text-slate-500">
                Faltan {Math.max(0, creature.nextTierThreshold - creature.totalEnergy)} pts
              </p>
            </div>
          )}
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-800 mt-1">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, (creature.totalEnergy / creature.nextTierThreshold) * 100)}%`,
              backgroundColor: creature.alignment === 'shadow' ? '#10b981' : '#f59e0b',
            }}
          />
        </div>

        {/* Description & Ability */}
        <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-2.5 border-t border-slate-800/80">
          {creature.description}
        </p>

        <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2">
            <strong className="text-slate-200">Habilidad: </strong>
            {creature.specialAbility}
          </p>
        </div>
      </div>

      {/* Species Selector Modal */}
      {showSpeciesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Santuario Multicriatura</h3>
                <p className="text-[11px] text-slate-400">Selecciona tu compañero activo</p>
              </div>
              <button
                onClick={() => setShowSpeciesModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {AVAILABLE_SPECIES.map(sp => {
                const isSelected = sp.id === creature.speciesId;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      sound.playTap();
                      onSelectSpecies?.(sp.id);
                      setShowSpeciesModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{sp.name}</span>
                        {sp.hasBipolarPaths && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                            Dual: Luz / Sombra
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sp.subtitle}</p>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
