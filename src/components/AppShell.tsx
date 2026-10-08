import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/sound';
import { Volume2, VolumeX, SlidersHorizontal, PawPrint, ListChecks, Camera, Users } from 'lucide-react';

type Tab = 'creature' | 'tasks' | 'camera' | 'family';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
  multiplierActive: boolean;
  onOpenExport: () => void;
  onQuickCheatBoost: () => void;
  onSimulateDayEnd: () => void;
  onResetDemo: () => void;
}

const NAV_ITEMS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = [
  { id: 'creature', label: 'Criatura', icon: PawPrint },
  { id: 'tasks', label: 'Tareas', icon: ListChecks },
  { id: 'camera', label: 'Cámara AR', icon: Camera },
  { id: 'family', label: 'Familia', icon: Users },
];

export const AppShell: React.FC<Props> = ({
  currentTab,
  onTabChange,
  children,
  multiplierActive,
  onOpenExport,
  onQuickCheatBoost,
  onSimulateDayEnd,
  onResetDemo,
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
    <div className="min-h-dvh bg-arena text-tinta select-none">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col md:border-x md:border-trazo/70">
        <header className="relative z-30 flex items-center justify-between px-5 pb-3 pt-5">
          <span className="text-[19px] font-bold tracking-tight">AnimaTask</span>

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
                className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-bruma transition-colors hover:bg-tinta/5 hover:text-tinta"
                aria-expanded={demoOpen}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Demo</span>
              </button>

              {demoOpen && (
                <div className="absolute right-0 top-11 w-[19rem] animate-fade-in overflow-hidden rounded-2xl bg-lino text-sm shadow-[0_18px_40px_-18px_rgba(45,38,32,0.45)] ring-1 ring-trazo">
                  <p className="px-4 pb-1 pt-3.5 text-[13px] leading-snug text-bruma">
                    Atajos para ver la app en acción sin esperar días.
                  </p>
                  <ul className="divide-y divide-trazo/70">
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
          className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[440px] -translate-x-1/2 grid-cols-4 border-t border-trazo bg-arena px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5"
        >
          {NAV_ITEMS.map(item => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playTap();
                  onTabChange(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[54px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                  isActive ? 'text-tinta' : 'text-bruma hover:text-tinta'
                }`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2 : 1.6} />
                <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                <span
                  className={`h-1 w-1 rounded-full transition-colors ${isActive ? 'bg-jade' : 'bg-transparent'}`}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
