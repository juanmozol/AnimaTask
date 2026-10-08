import React, { useEffect, useRef, useState } from 'react';
import { Plane } from 'lucide-react';
import { Sheet } from './Sheet';
import { Task, TaskBarrier, TaskProof } from '../types';
import { BALANCE } from '../game/balance';
import { DEMO_SHORTCUTS, OfflineRun } from '../game/barriers';
import { deviceInfo, probeOnline, useOnline } from '../services/device';
import { sound } from '../services/sound';

type OfflineBarrier = Extract<TaskBarrier, { kind: 'offline' }>;

/**
 * Watches an airplane-mode block from the App, not from the sheet, so closing the sheet does not
 * switch the watch off. Any sign of network before the block ends calls onBreak once.
 */
export function useOfflineGuard(run: OfflineRun | null, minutes: number, onBreak: () => void): void {
  const cb = useRef(onBreak);
  cb.current = onBreak;

  useEffect(() => {
    if (!run) return;
    const endsAt = run.startedAt + minutes * 60_000;
    let alive = true;
    const check = async () => {
      if (!alive || Date.now() >= endsAt) return;
      const online = await probeOnline();
      if (alive && online && Date.now() < endsAt) {
        alive = false;
        cb.current();
      }
    };
    check();
    const id = setInterval(check, 1500);
    window.addEventListener('online', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener('online', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [run?.taskId, run?.startedAt, minutes]); // eslint-disable-line react-hooks/exhaustive-deps
}

interface Props {
  task: Task;
  barrier: OfflineBarrier;
  run: OfflineRun | null;
  broken: boolean;
  onStart: () => void;
  onRetry: () => void;
  onComplete: (proof: TaskProof) => void;
  onClose: () => void;
}

const clock = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const OfflineBlockSheet: React.FC<Props> = ({ task, barrier, run, broken, onStart, onRetry, onComplete, onClose }) => {
  const info = deviceInfo();
  const running = !!run && run.taskId === task.id;
  const online = useOnline(!running, 1200);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const demoSkip = DEMO_SHORTCUTS && (
    <button
      onClick={() => onComplete({ at: new Date().toISOString() })}
      className="mt-4 w-full text-center text-[13px] text-bruma/80 hover:text-tinta"
    >
      Atajo demo: omitir el bloque
    </button>
  );

  if (broken) {
    return (
      <Sheet title="Bloque anulado" subtitle={task.title} onClose={onClose}>
        <p role="alert" className="text-[15px] leading-relaxed">
          Detecté conexión antes de que terminara el bloque. Pierdes {Math.abs(BALANCE.barrierBreak)} de balance y hay que
          empezar de nuevo.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-tinta py-3 text-[14px] font-bold">
            Cerrar
          </button>
          <button
            onClick={onRetry}
            className="flex-1 rounded-full bg-jade py-3 text-[14px] font-bold text-lino transition-transform active:scale-[0.98]"
          >
            Reintentar
          </button>
        </div>
        {demoSkip}
      </Sheet>
    );
  }

  if (running && run) {
    const total = barrier.minutes * 60_000;
    const endsAt = run.startedAt + total;
    const remaining = Math.min(total, Math.max(0, endsAt - now));
    const progress = Math.min(1, 1 - remaining / total);
    const finished = now >= endsAt;

    if (finished) {
      return (
        <Sheet title="Bloque cumplido" subtitle={task.title} onClose={onClose}>
          <p className="tnum text-[56px] font-bold leading-none">{barrier.minutes}</p>
          <p className="mt-1 text-[15px] text-bruma">minutos sin conexión.</p>
          <button
            onClick={() => {
              sound.playTaskComplete(true);
              onComplete({ at: new Date().toISOString() });
            }}
            className="mt-6 w-full rounded-full bg-jade py-3.5 text-[15px] font-bold text-lino transition-transform active:scale-[0.98]"
          >
            Cumplir la tarea
          </button>
        </Sheet>
      );
    }

    return (
      <Sheet title="Modo avión" subtitle={task.title} onClose={onClose}>
        <div className="relative mx-auto my-4 h-56 w-56">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-trazo)" strokeWidth="3" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-jade)"
              strokeWidth="7"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${Math.max(progress * 100, 0.01)} 100`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 250ms linear' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="tnum text-[40px] font-bold leading-none tracking-tight" role="timer">
                {clock(remaining)}
              </p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-jade">
                <Plane className="h-3.5 w-3.5" aria-hidden="true" />
                Sin conexión
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-[13px] leading-snug text-bruma">
          Deja el teléfono así. Si te reconectas, el bloque se anula y pierdes {Math.abs(BALANCE.barrierBreak)} de
          balance. Puedes cerrar esta ventana: la vigilancia sigue.
        </p>
        {demoSkip}
      </Sheet>
    );
  }

  const hint = info.ios
    ? 'En iPhone: desliza hacia abajo desde la esquina superior derecha y toca el avión.'
    : info.android
      ? 'En Android: desliza hacia abajo desde arriba y toca "Modo avión".'
      : 'Activa el modo avión de tu dispositivo o apaga el Wi-Fi y los datos.';

  return (
    <Sheet title="Modo avión" subtitle={task.title} onClose={onClose}>
      <p className="text-[15px] leading-relaxed">
        Mantén el teléfono sin conexión durante <strong className="tnum">{barrier.minutes} minutos</strong>.
      </p>
      <ul className="mt-3 space-y-1.5 text-[13px] leading-snug text-bruma">
        <li>Una web no puede encender el modo avión: lo activas tú y yo compruebo que no hay red.</li>
        <li>{hint}</li>
        <li>Si te reconectas antes de tiempo, el bloque se anula.</li>
      </ul>

      <p
        role="status"
        aria-live="polite"
        data-online={online}
        className={`mt-4 flex items-center gap-2 text-[14px] font-bold ${online ? 'text-bruma' : 'text-jade'}`}
      >
        <Plane className="h-4 w-4" aria-hidden="true" />
        {online ? 'Con conexión: activa el modo avión para empezar.' : 'Sin conexión: listo para empezar.'}
      </p>

      <button
        onClick={() => {
          sound.playTap();
          onStart();
        }}
        disabled={online}
        className="mt-4 w-full rounded-full bg-jade py-3.5 text-[15px] font-bold text-lino transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        Empezar bloque
      </button>
      {demoSkip}
    </Sheet>
  );
};
