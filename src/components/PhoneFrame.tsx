import React, { useState, useEffect } from 'react';
import { sound } from '../services/sound';
import { Volume2, VolumeX, Smartphone, Monitor, Download, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  currentTab: 'creature' | 'tasks' | 'camera' | 'family';
  onTabChange: (tab: 'creature' | 'tasks' | 'camera' | 'family') => void;
  children: React.ReactNode;
  multiplierActive: boolean;
  onOpenExport: () => void;
  onQuickCheatBoost: () => void;
  onResetDemo: () => void;
}

export const PhoneFrame: React.FC<Props> = ({
  currentTab,
  onTabChange,
  children,
  multiplierActive,
  onOpenExport,
  onQuickCheatBoost,
  onResetDemo,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);

  // Dynamic real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const newMuted = !isMuted;
    sound.setMuted(newMuted);
    setIsMuted(newMuted);
  };

  const navItems = [
    { id: 'creature' as const, label: 'Criatura', icon: '🐾' },
    { id: 'tasks' as const, label: 'Tareas', icon: '📋' },
    { id: 'camera' as const, label: 'Cámara AR', icon: '📷' },
    { id: 'family' as const, label: 'Familia', icon: '👨‍👩‍👧' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 md:p-6 select-none relative overflow-x-hidden font-sans">
      {/* Background Ambient Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-600/20 blur-[120px]" />
      </div>

      {/* Top Desktop Helper Toolbar */}
      <header className="w-full max-w-md md:max-w-xl flex items-center justify-between px-4 py-2.5 mb-2 z-20 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5 font-display">
            <span className="text-indigo-400">Anima</span>Task
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            MVP Prototipo
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Boost / Fast Demo Button */}
          <button
            onClick={onQuickCheatBoost}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
            title="Añadir +60 energía para ver evolución rápido"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Probar</span> +60 pts
          </button>

          {/* Export to GitHub Pages Button */}
          <button
            onClick={onOpenExport}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
            title="Exportar archivo HTML único para GitHub Pages"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Exportar</span> HTML
          </button>

          {/* Reset Demo State */}
          <button
            onClick={onResetDemo}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            title="Reiniciar Demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Phone Frame Toggle (Hidden on mobile) */}
          <button
            onClick={() => setPhoneFrameMode(prev => !prev)}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            title={phoneFrameMode ? 'Ver a pantalla completa' : 'Ver marco de teléfono'}
          >
            {phoneFrameMode ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* SMARTPHONE CANVAS WRAPPER */}
      <div
        className={`w-full transition-all duration-300 flex flex-col items-center z-10 ${
          phoneFrameMode
            ? 'max-w-[412px] rounded-[44px] border-[10px] border-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
            : 'max-w-md w-full rounded-2xl border border-slate-800 shadow-xl'
        } bg-slate-950 overflow-hidden min-h-[720px] max-h-[880px] h-[85vh]`}
      >
        {/* TOP SMARTPHONE NOTCH / STATUS BAR */}
        <div className="w-full shrink-0 px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md select-none z-30">
          <span className="font-bold text-white tracking-wide text-xs">{currentTime}</span>

          {/* Dynamic Island Capsule */}
          <div className="px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center gap-2 shadow-inner">
            <span
              className={`w-2 h-2 rounded-full ${
                multiplierActive ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[10px] font-bold text-slate-200 tracking-wider">
              {multiplierActive ? 'x2 BOOST' : 'ANIMATASK'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
              <div className="h-full bg-emerald-400 rounded-[1px] w-4" />
            </div>
          </div>
        </div>

        {/* SCROLLABLE MAIN SCREEN CONTENT */}
        <main className="flex-1 w-full overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          {children}
        </main>

        {/* ERGONOMIC BOTTOM NAVIGATION BAR */}
        <nav className="w-full shrink-0 bg-slate-950/95 backdrop-blur-lg border-t border-slate-900 px-3 py-2 grid grid-cols-4 gap-1 z-30">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playTap();
                  onTabChange(item.id);
                }}
                className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-white/10 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span
                  className={`text-[10px] mt-1 tracking-tight ${
                    isActive ? 'text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Phone Home Bar Touch Affordance */}
        <div className="w-full shrink-0 py-1.5 flex justify-center bg-slate-950">
          <div className="w-32 h-1 bg-slate-700/60 rounded-full" />
        </div>
      </div>
    </div>
  );
};
