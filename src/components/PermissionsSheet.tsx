import React, { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import {
  FailReason,
  PermState,
  deviceInfo,
  getPosition,
  hasMotionSensor,
  permissionHelp,
  queryPermission,
  reasonText,
  requestCamera,
  requestMotion,
  useOnline,
} from '../services/device';

interface Props {
  onClose: () => void;
}

type Kind = 'geolocation' | 'camera' | 'motion';
interface Status {
  state: PermState | 'checking' | 'no-sensor';
  note?: string;
}

const LABEL: Record<Status['state'], string> = {
  checking: 'Comprobando',
  granted: 'Listo',
  prompt: 'Sin pedir',
  denied: 'Bloqueado',
  unsupported: 'No disponible',
  insecure: 'Requiere https',
  'no-sensor': 'Sin sensor',
};

const TEXT: Record<Kind, { name: string; why: string; action: string }> = {
  geolocation: { name: 'Ubicación', why: 'Comprueba que estás en el lugar de la foto.', action: 'Permitir ubicación' },
  camera: { name: 'Cámara', why: 'La foto se toma en el momento; no se sube desde la galería.', action: 'Permitir cámara' },
  motion: { name: 'Movimiento', why: 'Cuenta saltos y pasos con el acelerómetro del teléfono.', action: 'Permitir movimiento' },
};

const fromReason = (reason: FailReason): Status => {
  if (reason === 'denied') return { state: 'denied' };
  if (reason === 'insecure') return { state: 'insecure' };
  if (reason === 'unsupported') return { state: 'unsupported' };
  if (reason === 'no-sensor') return { state: 'no-sensor' };
  // The permission may be fine; there is just no signal right now.
  return { state: 'granted', note: reasonText(reason) };
};

export const PermissionsSheet: React.FC<Props> = ({ onClose }) => {
  const info = deviceInfo();
  const online = useOnline();
  const [status, setStatus] = useState<Record<Kind, Status>>({
    geolocation: { state: 'checking' },
    camera: { state: 'checking' },
    motion: { state: 'checking' },
  });
  const [busy, setBusy] = useState<Kind | 'all' | null>(null);

  const set = (k: Kind, s: Status) => setStatus(prev => ({ ...prev, [k]: s }));

  useEffect(() => {
    let alive = true;
    queryPermission('geolocation').then(s => alive && set('geolocation', { state: s }));
    queryPermission('camera').then(s => alive && set('camera', { state: s }));
    const ctor = (window as unknown as { DeviceMotionEvent?: { requestPermission?: unknown } }).DeviceMotionEvent;
    if (!window.isSecureContext) set('motion', { state: 'insecure' });
    else if (!ctor) set('motion', { state: 'unsupported' });
    else if (typeof ctor.requestPermission === 'function') set('motion', { state: 'prompt' });
    else {
      hasMotionSensor(1200).then(ok => alive && set('motion', ok ? { state: 'granted' } : { state: 'no-sensor' }));
    }
    return () => {
      alive = false;
    };
  }, []);

  const askLocation = async () => {
    set('geolocation', { state: 'checking' });
    const r = await getPosition(15_000);
    set('geolocation', r.ok ? { state: 'granted' } : fromReason(r.reason));
  };
  const askCamera = async () => {
    set('camera', { state: 'checking' });
    const r = await requestCamera();
    set('camera', r.ok ? { state: 'granted' } : fromReason(r.reason));
  };
  const askMotion = async () => {
    // First call in the tap: iOS only shows its prompt while the gesture is fresh.
    const r = await requestMotion();
    if (!r.ok) return set('motion', fromReason(r.reason));
    set('motion', { state: 'checking' });
    set('motion', (await hasMotionSensor(2000)) ? { state: 'granted' } : { state: 'no-sensor' });
  };

  const run = async (k: Kind) => {
    setBusy(k);
    if (k === 'geolocation') await askLocation();
    else if (k === 'camera') await askCamera();
    else await askMotion();
    setBusy(null);
  };

  const runAll = async () => {
    setBusy('all');
    await askMotion();
    await askLocation();
    await askCamera();
    setBusy(null);
  };

  const needsAsk = (Object.keys(status) as Kind[]).some(k => status[k].state === 'prompt');

  return (
    <Sheet title="Permisos del dispositivo" subtitle="Cada teléfono o navegador te los pide una vez." onClose={onClose}>
      {!info.secure && (
        <p role="alert" className="mb-4 rounded-2xl bg-rubia/10 px-4 py-3 text-[13px] leading-snug text-rubia">
          Esta página no usa https, así que el navegador bloquea ubicación, cámara y movimiento. Abre el enlace con
          https://.
        </p>
      )}
      {info.inAppBrowser && (
        <p role="alert" className="mb-4 rounded-2xl bg-curcuma/15 px-4 py-3 text-[13px] leading-snug text-curcuma-hondo">
          Estás dentro de {info.inAppBrowser}. Su navegador interno suele bloquear la cámara y la ubicación. Abre el
          enlace en Safari o Chrome.
        </p>
      )}

      <ul className="divide-y divide-trazo/70 border-y border-trazo/70">
        {(Object.keys(TEXT) as Kind[]).map(k => {
          const s = status[k];
          const canAsk = s.state === 'prompt' || s.state === 'denied';
          return (
            <li key={k} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-[15px] font-bold">{TEXT[k].name}</h4>
                <span
                  data-perm={k}
                  className={`text-[13px] font-bold ${
                    s.state === 'granted' ? 'text-jade' : s.state === 'denied' ? 'text-rubia' : 'text-bruma'
                  }`}
                >
                  {LABEL[s.state]}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-bruma">{TEXT[k].why}</p>
              {s.note && <p className="mt-1 text-[12px] leading-snug text-bruma">{s.note}</p>}
              {s.state === 'denied' && (
                <p className="mt-1.5 text-[12px] leading-snug text-bruma">{permissionHelp(k, info)}</p>
              )}
              {s.state === 'no-sensor' && (
                <p className="mt-1.5 text-[12px] leading-snug text-bruma">
                  Este dispositivo no tiene acelerómetro (los computadores casi nunca lo tienen). Usa el teléfono.
                </p>
              )}
              {canAsk && (
                <button
                  onClick={() => run(k)}
                  disabled={busy !== null}
                  className="mt-2.5 rounded-full border border-tinta px-4 py-1.5 text-[13px] font-bold transition-colors hover:bg-tinta hover:text-lino disabled:opacity-50"
                >
                  {s.state === 'denied' ? 'Reintentar' : TEXT[k].action}
                </button>
              )}
            </li>
          );
        })}

        <li className="py-4">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="text-[15px] font-bold">Conexión</h4>
            <span data-perm="net" className={`text-[13px] font-bold ${online ? 'text-bruma' : 'text-jade'}`}>
              {online ? 'En línea' : 'Sin conexión'}
            </span>
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-bruma">
            El modo avión se comprueba mirando si el teléfono quedó sin red. Una web no puede encenderlo: lo activas tú
            desde el centro de control.
          </p>
        </li>
      </ul>

      {needsAsk && (
        <button
          onClick={runAll}
          disabled={busy !== null}
          className="mt-5 w-full rounded-full bg-jade py-3.5 text-[15px] font-bold text-lino transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {busy === 'all' ? 'Pidiendo permisos...' : 'Permitir todo'}
        </button>
      )}

      {info.ios && (
        <p className="mt-4 text-[12px] leading-snug text-bruma">
          En iPhone, Safari puede volver a preguntar cada vez que abres la página; es normal.
        </p>
      )}
    </Sheet>
  );
};
