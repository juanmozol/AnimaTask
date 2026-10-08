import React, { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { Sheet } from './Sheet';
import { Task, TaskBarrier, TaskProof } from '../types';
import { DEMO_SHORTCUTS, MOVES, RepCounter } from '../game/barriers';
import { FailReason, deviceInfo, permissionHelp, reasonText, requestMotion } from '../services/device';
import { sound } from '../services/sound';

type MoveBarrier = Extract<TaskBarrier, { kind: 'move' }>;

interface Props {
  task: Task;
  barrier: MoveBarrier;
  onDone: (proof: TaskProof) => void;
  onClose: () => void;
}

type Phase = 'intro' | 'counting' | 'nosensor' | 'done';

type WakeLockLike = { release: () => Promise<void> };

export const MoveChallengeSheet: React.FC<Props> = ({ task, barrier, onDone, onClose }) => {
  const info = deviceInfo();
  const spec = MOVES[barrier.move];
  const [phase, setPhase] = useState<Phase>('intro');
  const [count, setCount] = useState(0);
  const [fail, setFail] = useState<FailReason | null>(null);
  const [simulated, setSimulated] = useState(false); // the demo shortcut was used: no sensor needed
  const countRef = useRef(0);

  const bump = (n: number) => {
    const next = Math.min(barrier.reps, countRef.current + n);
    countRef.current = next;
    setCount(next);
    if (next >= barrier.reps) setPhase('done');
  };

  const start = async () => {
    sound.playTap();
    setFail(null);
    // The first thing in the tap: iOS only shows its motion prompt while the gesture is fresh.
    const r = await requestMotion();
    if (!r.ok) {
      setFail(r.reason);
      return;
    }
    countRef.current = 0;
    setCount(0);
    setPhase('counting');
  };

  useEffect(() => {
    if (phase !== 'counting') return;
    const counter = new RepCounter(spec.threshold, spec.minGapMs);
    let samples = 0;

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      samples += 1;
      if (counter.push(a.x, a.y, a.z, Date.now())) {
        sound.playTap();
        bump(1);
      }
    };
    window.addEventListener('devicemotion', onMotion);

    // No real data after a few seconds: this device has no accelerometer (most computers).
    const noData = setTimeout(() => {
      if (samples === 0 && !simulated) setPhase('nosensor');
    }, 2500);

    // Keep the screen awake so the sensor keeps reporting during the challenge (best effort).
    let lock: WakeLockLike | null = null;
    let released = false;
    const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<WakeLockLike> } }).wakeLock;
    wl?.request('screen')
      .then(l => {
        if (released) l.release().catch(() => {});
        else lock = l;
      })
      .catch(() => {});

    return () => {
      released = true;
      window.removeEventListener('devicemotion', onMotion);
      clearTimeout(noData);
      lock?.release().catch(() => {});
    };
  }, [phase === 'counting', simulated]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.min(100, Math.round((count / barrier.reps) * 100));

  const demoButtons = DEMO_SHORTCUTS && (
    <button
      onClick={() => {
        setSimulated(true);
        setPhase('counting');
        bump(5);
      }}
      className="mt-4 w-full text-center text-[13px] text-bruma/80 hover:text-tinta"
    >
      Atajo demo: sumar 5 repeticiones
    </button>
  );

  if (phase === 'intro') {
    return (
      <Sheet title="Reto físico" subtitle={task.title} onClose={onClose}>
        <p className="text-[15px] leading-relaxed">
          Haz <strong className="tnum">{barrier.reps}</strong> {spec.name.toLowerCase()}. {spec.hint}
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px] leading-snug text-bruma">
          <li>Usa el acelerómetro del teléfono; el navegador te pedirá permiso.</li>
          <li>Mantén la pantalla encendida y esta página abierta mientras lo haces.</li>
          <li>Funciona en teléfonos; la mayoría de los computadores no tienen ese sensor.</li>
        </ul>
        {fail && (
          <div role="alert" className="mt-4 rounded-2xl bg-rubia/10 px-4 py-3 text-[13px] leading-snug text-rubia">
            <p>{reasonText(fail)}</p>
            {(fail === 'denied' || fail === 'insecure') && <p className="mt-1">{permissionHelp('motion', info)}</p>}
          </div>
        )}
        <button
          onClick={start}
          className="btn-sello mt-5 w-full py-3.5 text-[15px]"
        >
          <Activity className="h-[18px] w-[18px]" />
          {fail ? 'Reintentar' : 'Permitir movimiento y empezar'}
        </button>
        {demoButtons}
      </Sheet>
    );
  }

  if (phase === 'nosensor') {
    return (
      <Sheet title="Reto físico" subtitle={task.title} onClose={onClose}>
        <p role="alert" className="text-[15px] leading-relaxed">
          Este dispositivo no está enviando datos de movimiento.
        </p>
        <p className="mt-2 text-[13px] leading-snug text-bruma">
          Pasa en computadores y en algunos navegadores internos. Abre el sitio en el teléfono, con Safari o Chrome, y
          vuelve a intentarlo.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="btn-contorno flex-1 py-3 text-[14px]">
            Cerrar
          </button>
          <button
            onClick={() => setPhase('intro')}
            className="btn-sello flex-1 py-3 text-[14px]"
          >
            Reintentar
          </button>
        </div>
        {demoButtons}
      </Sheet>
    );
  }

  if (phase === 'done') {
    return (
      <Sheet title="Reto cumplido" subtitle={task.title} onClose={onClose}>
        <p className="tnum text-[56px] font-bold leading-none">{barrier.reps}</p>
        <p className="mt-1 text-[15px] text-bruma">{spec.name.toLowerCase()} contados por el sensor.</p>
        <button
          onClick={() => onDone({ at: new Date().toISOString() })}
          className="btn-sello mt-6 w-full py-3.5 text-[15px]"
        >
          Cumplir la tarea
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet title="Reto físico" subtitle={task.title} onClose={onClose}>
      <p className="text-[13px] text-bruma">{spec.name}</p>
      <p className="tnum mt-1 text-[64px] font-bold leading-none" role="status" aria-live="polite" aria-label={`${count} de ${barrier.reps}`}>
        {count}
        <span className="ml-2 text-[22px] font-medium text-bruma">/ {barrier.reps}</span>
      </p>
      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-trazo" aria-hidden="true">
        <div className="h-full rounded-full bg-jade transition-all duration-200" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-4 text-[13px] leading-snug text-bruma">{spec.hint} Sigue hasta llegar a {barrier.reps}.</p>
      {demoButtons}
    </Sheet>
  );
};
