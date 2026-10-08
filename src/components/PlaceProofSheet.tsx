import React, { useEffect, useRef, useState } from 'react';
import { Camera, MapPin } from 'lucide-react';
import { Sheet } from './Sheet';
import { Task, TaskBarrier, TaskProof } from '../types';
import { DEMO_SHORTCUTS, MAX_FIX_AGE_MS, distanceMeters, formatDistance, isInsidePlace } from '../game/barriers';
import {
  FailReason,
  Fix,
  deviceInfo,
  geoReason,
  openCamera,
  permissionHelp,
  reasonText,
  toFix,
} from '../services/device';
import { sound } from '../services/sound';

type PlaceBarrier = Extract<TaskBarrier, { kind: 'place' }>;

interface Props {
  task: Task;
  barrier: PlaceBarrier;
  onDone: (proof: TaskProof) => void;
  onClose: () => void;
}

type Phase = 'intro' | 'live' | 'review';
type Shot = { photo: string; fix: Fix };

const MAX_SIDE = 480;

// Draws a video frame or an image into a small JPEG that fits comfortably in localStorage.
function toThumbnail(source: CanvasImageSource, w: number, h: number): string | null {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h, 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.6);
}

export const PlaceProofSheet: React.FC<Props> = ({ task, barrier, onDone, onClose }) => {
  const info = deviceInfo();
  const [phase, setPhase] = useState<Phase>('intro');
  const [fix, setFix] = useState<Fix | null>(null);
  const [geoFail, setGeoFail] = useState<FailReason | null>(null);
  const [camFail, setCamFail] = useState<FailReason | null>(null);
  const [camReady, setCamReady] = useState(false);
  const [camTry, setCamTry] = useState(0);
  const [fileMode, setFileMode] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera: live only. If the browser has no live camera we fall back to the phone's camera app.
  useEffect(() => {
    if (phase !== 'live' || fileMode) return;
    let alive = true;
    setCamFail(null);
    setCamReady(false);
    openCamera().then(r => {
      if (!alive) {
        if (r.ok) r.stream.getTracks().forEach(t => t.stop());
        return;
      }
      if (r.ok) {
        streamRef.current = r.stream;
        setCamReady(true);
      } else if (r.reason === 'unsupported' || r.reason === 'unavailable') {
        setFileMode(true);
      } else {
        setCamFail(r.reason);
      }
    });
    return () => {
      alive = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [phase, fileMode, camTry]);

  useEffect(() => {
    const v = videoRef.current;
    if (camReady && v && streamRef.current) {
      v.srcObject = streamRef.current;
      v.play().catch(() => {});
    }
  }, [camReady, phase]);

  // Location: follow the position while the camera is open.
  useEffect(() => {
    if (phase === 'intro') return;
    if (!window.isSecureContext) {
      setGeoFail('insecure');
      return;
    }
    if (!navigator.geolocation) {
      setGeoFail('unsupported');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      p => {
        setGeoFail(null);
        setFix(toFix(p));
      },
      e => {
        const reason = geoReason(e);
        // A timeout only means "no signal yet"; keep waiting.
        if (reason === 'denied') setGeoFail('denied');
        else setGeoFail(null);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'intro') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const distance = fix ? distanceMeters(fix, barrier) : null;
  const fresh = !!fix && now - fix.timestamp <= MAX_FIX_AGE_MS;
  const inside = !!fix && fresh && distance !== null && isInsidePlace(distance, fix.accuracy, barrier.radius);

  let status: { text: string; ok: boolean } = { text: 'Buscando tu ubicación...', ok: false };
  if (geoFail === 'denied') {
    status = { text: `Ubicación bloqueada. ${permissionHelp('geolocation', info)}`, ok: false };
  } else if (geoFail) {
    status = { text: reasonText(geoFail), ok: false };
  } else if (fix && !fresh) {
    status = { text: 'Se perdió la señal de GPS. Espera un momento o sal a un lugar abierto.', ok: false };
  } else if (fix && distance !== null) {
    if (inside) {
      status = { text: `Estás en ${barrier.label} (a ${formatDistance(distance)}, ±${Math.round(fix.accuracy)} m).`, ok: true };
    } else if (distance <= barrier.radius) {
      status = { text: `La precisión es de ±${Math.round(fix.accuracy)} m. Sal a un lugar abierto para confirmar.`, ok: false };
    } else {
      status = {
        text: `Estás a ${formatDistance(distance)} de ${barrier.label}. Acércate a menos de ${barrier.radius} m.`,
        ok: false,
      };
    }
  }

  const capture = () => {
    const v = videoRef.current;
    if (!v || !fix || !inside) return;
    const photo = toThumbnail(v, v.videoWidth || 640, v.videoHeight || 480);
    if (!photo) return;
    sound.playCameraShutter();
    setShot({ photo, fix });
    setPhase('review');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !fix || !inside) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const photo = toThumbnail(img, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(url);
      if (!photo) return;
      sound.playCameraShutter();
      setShot({ photo, fix });
      setPhase('review');
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const use = () => {
    if (!shot) return;
    onDone({
      at: new Date().toISOString(),
      photo: shot.photo,
      lat: shot.fix.lat,
      lng: shot.fix.lng,
      accuracy: shot.fix.accuracy,
    });
  };

  const demoSkip = DEMO_SHORTCUTS && (
    <button
      onClick={() => onDone({ at: new Date().toISOString() })}
      className="mt-4 w-full text-center text-[13px] text-bruma/80 hover:text-tinta"
    >
      Atajo demo: omitir la prueba
    </button>
  );

  if (phase === 'intro') {
    return (
      <Sheet title="Foto en un lugar" subtitle={task.title} onClose={onClose}>
        <p className="text-[15px] leading-relaxed">
          Para cumplir esta tarea tienes que estar en <strong>{barrier.label}</strong> (a menos de {barrier.radius} m) y
          tomar una foto en ese momento.
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px] leading-snug text-bruma">
          <li>El teléfono te pedirá permiso de ubicación y de cámara.</li>
          <li>La foto debe ser en vivo; no se puede subir una de la galería.</li>
          <li>Se guarda una miniatura con la hora y el lugar. No se envía a ningún servidor.</li>
        </ul>
        {!info.secure && (
          <p role="alert" className="mt-4 rounded-2xl bg-rubia/10 px-4 py-3 text-[13px] leading-snug text-rubia">
            Sin https el navegador bloquea la ubicación y la cámara. Abre el sitio con https://.
          </p>
        )}
        {info.inAppBrowser && (
          <p role="alert" className="mt-4 rounded-2xl bg-curcuma/15 px-4 py-3 text-[13px] leading-snug text-curcuma-hondo">
            Estás dentro de {info.inAppBrowser}. Su navegador interno suele bloquear la cámara y la ubicación; abre el
            enlace en Safari o Chrome.
          </p>
        )}
        <button
          onClick={() => {
            sound.playTap();
            setPhase('live');
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-jade py-3.5 text-[15px] font-bold text-lino transition-transform active:scale-[0.98]"
        >
          <Camera className="h-[18px] w-[18px]" />
          Permitir y abrir la cámara
        </button>
        {demoSkip}
      </Sheet>
    );
  }

  if (phase === 'review' && shot) {
    return (
      <Sheet title="¿Usar esta foto?" subtitle={task.title} onClose={onClose}>
        <img src={shot.photo} alt="Foto tomada" className="aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-trazo" />
        <p className="tnum mt-3 text-[13px] leading-snug text-bruma">
          {barrier.label} · {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} · ±
          {Math.round(shot.fix.accuracy)} m
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              setShot(null);
              setPhase('live');
            }}
            className="flex-1 rounded-full border border-tinta py-3 text-[14px] font-bold"
          >
            Repetir
          </button>
          <button
            onClick={use}
            className="flex-1 rounded-full bg-jade py-3 text-[14px] font-bold text-lino transition-transform active:scale-[0.98]"
          >
            Usar foto
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Foto en un lugar" subtitle={task.title} onClose={onClose}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#241e19]">
        {camReady && !fileMode ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center px-6 text-center text-[13px] leading-snug text-lino/75">
            {camFail === 'denied' && (
              <div>
                <p>Cámara bloqueada.</p>
                <p className="mt-1">{permissionHelp('camera', info)}</p>
                <button
                  onClick={() => setCamTry(n => n + 1)}
                  className="mt-3 rounded-full border border-lino/60 px-4 py-1.5 text-[13px] font-bold text-lino"
                >
                  Reintentar
                </button>
              </div>
            )}
            {camFail && camFail !== 'denied' && <p>{reasonText(camFail)}</p>}
            {!camFail && fileMode && (
              <p>Este navegador no abre la cámara en vivo. Usa el botón de abajo para abrir la cámara del teléfono.</p>
            )}
            {!camFail && !fileMode && <p>Abriendo la cámara...</p>}
          </div>
        )}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-tinta/70 px-3 py-1 text-[12px] text-lino">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {barrier.label}
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        data-inside={inside}
        className={`mt-3 text-[14px] leading-snug ${status.ok ? 'font-bold text-jade' : 'text-bruma'}`}
      >
        {status.text}
      </p>

      {fileMode ? (
        <label
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-lino ${
            inside ? 'cursor-pointer bg-jade' : 'cursor-not-allowed bg-tinta opacity-40'
          }`}
        >
          <Camera className="h-[18px] w-[18px]" />
          Abrir la cámara del teléfono
          <input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={!inside}
            onChange={onFile}
            className="sr-only"
            aria-label="Abrir la cámara del teléfono"
          />
        </label>
      ) : (
        <button
          onClick={capture}
          disabled={!inside || !camReady}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-tinta py-3.5 text-[15px] font-bold text-lino transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <Camera className="h-[18px] w-[18px]" />
          Tomar foto
        </button>
      )}
      {demoSkip}
    </Sheet>
  );
};
