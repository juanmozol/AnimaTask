import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/sound';
import { CreatureAlignment } from '../types';
import { CORRUPTION_LEVELS, CORRUPTION_NAMES, CorruptionLevel } from '../game/corruption';
import { Volume2, VolumeX } from 'lucide-react';

type Tab = 'creature' | 'tasks' | 'modes' | 'camera' | 'family';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
  multiplierActive: boolean;
  onOpenExport: () => void;
  onQuickCheatBoost: () => void;
  onSimulateDayEnd: () => void;
  onResetDemo: () => void;
  demoPath: CreatureAlignment;
  onSetPath: (path: CreatureAlignment) => void;
  onEvolveNow: () => void;
  canEvolveNow: boolean;
  corruption: CorruptionLevel; // how worn the interface is (0 = calm)
  corruptionPreview: CorruptionLevel | null; // demo: a step chosen by hand, null = follow the habits
  onSetCorruptionPreview: (level: CorruptionLevel | null) => void;
}

const PATHS: Array<{ id: CreatureAlignment; label: string; title: string; active: string }> = [
  { id: 'harmony', label: 'Armonía', title: 'Ver la versión buena (P2 a P4)', active: 'bg-jade text-lino' },
  { id: 'shadow', label: 'Sombra', title: 'Ver la versión mala (B2 a B4)', active: 'bg-humo text-lino' },
];

const NAV_ITEMS: Array<{ id: Tab; label: string }> = [
  { id: 'creature', label: 'Criatura' },
  { id: 'tasks', label: 'Tareas' },
  { id: 'modes', label: 'Modos' },
  { id: 'camera', label: 'Cámara AR' },
  { id: 'family', label: 'Familia' },
];

// The app's mark: a ring drawn in one stroke, and the turmeric dot that sits inside it.
// When the interface wears down, the ring opens and the dot drifts out (see index.css).
const Enso: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0" aria-hidden="true">
    <circle
      className="enso-ring"
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="var(--color-jade)"
      strokeWidth="2.6"
      strokeLinecap="round"
      pathLength={100}
      transform="rotate(-115 12 12)"
    />
    <circle className="enso-dot" cx="12" cy="12" r="2.5" />
  </svg>
);

export const AppShell: React.FC<Props> = ({
  currentTab,
  onTabChange,
  children,
  multiplierActive,
  onOpenExport,
  onQuickCheatBoost,
  onSimulateDayEnd,
  onResetDemo,
  demoPath,
  onSetPath,
  onEvolveNow,
  canEvolveNow,
  corruption,
  corruptionPreview,
  onSetCorruptionPreview,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [demoOpen, setDemoOpen] = useState(false);
  const demoRef = useRef<HTMLDivElement | null>(null);

  // The demo panel closes when tapping anywhere else, but stays open while using its shortcuts.
  useEffect(() => {
    if (!demoOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) setDemoOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [demoOpen]);

  // The whole document wears down together, including sheets and modals that live outside this tree.
  useEffect(() => {
    document.documentElement.dataset.corruption = String(corruption);
  }, [corruption]);

  const toggleSound = () => {
    const newMuted = !isMuted;
    sound.setMuted(newMuted);
    setIsMuted(newMuted);
  };

  const iconButton =
    'grid h-9 w-9 place-items-center rounded-full text-bruma transition-colors hover:bg-tinta/5 hover:text-tinta';

  const demoAction =
    'flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-tinta/5';

  return (
    <div className="min-h-dvh bg-[#e9dfce] text-tinta select-none">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col bg-arena md:border-x md:border-trazo/70">
        <header className="relative z-30 flex items-center justify-between px-5 pb-3 pt-5">
          <span className="ui-wordmark flex items-center gap-2 text-[19px] tracking-tight">
            <Enso />
            <span>
              AnimaTas<span className="wm-k">k</span>
            </span>
          </span>

          <div className="flex items-center gap-0.5">
            {multiplierActive && (
              <span className="mr-2 text-xs font-bold text-curcuma-hondo">x2 activo</span>
            )}

            <button
              onClick={toggleSound}
              className={iconButton}
              title={isMuted ? 'Activar Sonido' : 'Silenciar'}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="h-[18px] w-[18px]" /> : <Volume2 className="h-[18px] w-[18px]" />}
            </button>

            <div ref={demoRef} className="relative">
              <button
                onClick={() => setDemoOpen(prev => !prev)}
                className="flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-bruma transition-colors hover:bg-tinta/5 hover:text-tinta"
                aria-expanded={demoOpen}
              >
                Demo
              </button>

              {demoOpen && (
                <div className="absolute right-0 top-11 w-[19rem] animate-fade-in overflow-hidden rounded-2xl bg-lino text-sm ring-1 ring-trazo">
                  <p className="px-4 pb-1 pt-3.5 text-[13px] leading-snug text-bruma">
                    Atajos para ver la app en acción sin esperar días.
                  </p>
                  <div className="px-4 pb-3 pt-2">
                    <p className="text-[13px] font-bold">Camino de la criatura</p>
                    <div role="group" aria-label="Camino de la criatura" className="mt-1.5 grid grid-cols-2 gap-1 rounded-full bg-arena p-1">
                      {PATHS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => onSetPath(p.id)}
                          aria-pressed={demoPath === p.id}
                          title={p.title}
                          className={`rounded-full py-2 text-[13px] font-bold transition-colors ${
                            demoPath === p.id ? p.active : 'text-bruma hover:text-tinta'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[12px] leading-snug text-bruma">
                      Cambia la forma actual y decide la próxima evolución.
                    </p>
                  </div>
                  <div className="border-t border-trazo/70 px-4 pb-3 pt-3">
                    <p className="text-[13px] font-bold">Deterioro de la interfaz</p>
                    <div role="group" aria-label="Deterioro de la interfaz" className="mt-1.5 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onSetCorruptionPreview(null)}
                        aria-pressed={corruptionPreview === null}
                        title="Sigue a los hábitos y a la forma de la criatura"
                        className="chip"
                      >
                        Auto
                      </button>
                      {CORRUPTION_LEVELS.map(l => (
                        <button
                          key={l}
                          onClick={() => onSetCorruptionPreview(l)}
                          aria-pressed={corruptionPreview === l}
                          title={CORRUPTION_NAMES[l]}
                          className="chip tnum"
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[12px] leading-snug text-bruma">
                      {corruptionPreview === null ? 'Ahora' : 'Forzado'}: {CORRUPTION_NAMES[corruption].toLowerCase()}.
                    </p>
                  </div>
                  <ul className="divide-y divide-trazo/70 border-t border-trazo/70">
                    <li>
                      <button
                        onClick={() => {
                          setDemoOpen(false);
                          onEvolveNow();
                        }}
                        disabled={!canEvolveNow}
                        className={`${demoAction} disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent`}
                        title="Llevar la energía al umbral y abrir la evolución"
                      >
                        <span className="font-medium">Evolucionar ahora</span>
                        <span className="text-xs text-bruma">{canEvolveNow ? 'salta al siguiente paso' : 'ya es la forma final'}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={onQuickCheatBoost}
                        className={demoAction}
                        title="Añadir +60 energía para ver evolución rápido"
                      >
                        <span className="font-medium">Sumar 60 de energía</span>
                        <span className="text-xs text-bruma">para evolucionar ya</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={onSimulateDayEnd}
                        className={demoAction}
                        title="Simular fin del día: las tareas sin completar bajan el balance"
                      >
                        <span className="font-medium">Fin del día</span>
                        <span className="text-xs text-bruma">lo pendiente baja el balance</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setDemoOpen(false);
                          onOpenExport();
                        }}
                        className={demoAction}
                        title="Exportar archivo HTML único para GitHub Pages"
                      >
                        <span className="font-medium">Exportar HTML</span>
                        <span className="text-xs text-bruma">un solo archivo</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={onResetDemo} className={demoAction} title="Reiniciar Demo">
                        <span className="font-medium">Reiniciar</span>
                        <span className="text-xs text-bruma">vuelve al huevo</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 pb-28">{children}</main>

        <nav
          aria-label="Secciones"
          className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[440px] -translate-x-1/2 grid-cols-5 border-t border-trazo bg-arena px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5"
        >
          {NAV_ITEMS.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playTap();
                  onTabChange(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl transition-colors ${
                  isActive ? 'text-tinta' : 'text-bruma hover:text-tinta'
                }`}
              >
                <span className={`nav-label text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                {/* The mark under the current section is painted once, in a single stroke */}
                <svg viewBox="0 0 40 8" className="nav-mark mt-1 h-2 w-9" aria-hidden="true">
                  {isActive && (
                    <path
                      d="M3 5 C 10 1.5, 22 6.6, 37 3"
                      pathLength={100}
                      fill="none"
                      stroke="var(--color-jade)"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
