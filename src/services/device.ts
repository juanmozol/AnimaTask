import { useEffect, useState } from 'react';

/**
 * Device capabilities: location, camera, motion and connection.
 * Every request must come from a tap (iOS asks for motion only then) and every failure
 * maps to a reason the UI can explain, because phones, desktops and in-app browsers differ a lot.
 */

export type PermState = 'granted' | 'denied' | 'prompt' | 'unsupported' | 'insecure';

export type FailReason = 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure' | 'no-sensor';

export interface DeviceInfo {
  secure: boolean;
  ios: boolean;
  android: boolean;
  standalone: boolean;
  inAppBrowser: string | null;
}

const IN_APP: Array<[RegExp, string]> = [
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB/i, 'Facebook'],
  [/WhatsApp/i, 'WhatsApp'],
  [/TikTok|musical_ly|BytedanceWebview/i, 'TikTok'],
  [/Snapchat/i, 'Snapchat'],
  [/Line\//i, 'Line'],
  [/MicroMessenger/i, 'WeChat'],
  [/Twitter|TwitterAndroid/i, 'X'],
  [/LinkedInApp/i, 'LinkedIn'],
];

export function deviceInfo(): DeviceInfo {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const nav = navigator as Navigator & { standalone?: boolean };
  const hit = IN_APP.find(([re]) => re.test(ua));
  return {
    secure: typeof window !== 'undefined' && window.isSecureContext,
    ios: /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1),
    android: /Android/i.test(ua),
    standalone: nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true,
    inAppBrowser: hit ? hit[1] : null,
  };
}

/** What to do when the browser blocked a permission. */
export function permissionHelp(kind: 'geolocation' | 'camera' | 'motion', info: DeviceInfo = deviceInfo()): string {
  const what = kind === 'geolocation' ? 'la ubicación' : kind === 'camera' ? 'la cámara' : 'el movimiento';
  if (!info.secure) return 'Abre el sitio con https:// para poder usar ' + what + '.';
  if (info.inAppBrowser) {
    return `Estás dentro de ${info.inAppBrowser}. Abre este enlace en Safari o Chrome (menú ⋯ → "Abrir en el navegador") para dar permiso.`;
  }
  if (info.ios) {
    return kind === 'motion'
      ? 'Ve a Ajustes → Safari → Movimiento y orientación, actívalo y recarga la página.'
      : `Ve a Ajustes → Safari → ${kind === 'camera' ? 'Cámara' : 'Ubicación'}, elige "Preguntar" o "Permitir" y recarga la página.`;
  }
  if (info.android) {
    return `Toca el candado junto a la dirección → Permisos → ${kind === 'camera' ? 'Cámara' : kind === 'motion' ? 'Sensores de movimiento' : 'Ubicación'} → Permitir, y recarga.`;
  }
  return `Toca el candado de la barra de direcciones, permite ${what} y recarga la página.`;
}

export const reasonText = (reason: FailReason): string => {
  switch (reason) {
    case 'denied':
      return 'El permiso está bloqueado.';
    case 'unavailable':
      return 'No pude obtener la señal. Prueba en un lugar abierto.';
    case 'timeout':
      return 'Tardó demasiado. Reintenta en un lugar abierto.';
    case 'unsupported':
      return 'Este dispositivo o navegador no lo permite.';
    case 'insecure':
      return 'Hace falta abrir el sitio con https://.';
    case 'no-sensor':
      return 'Este dispositivo no tiene sensor de movimiento.';
  }
};

/** Current state when the browser can tell; 'prompt' when it cannot (Safari for the camera). */
export async function queryPermission(name: 'geolocation' | 'camera'): Promise<PermState> {
  if (!window.isSecureContext) return 'insecure';
  if (name === 'geolocation' && !navigator.geolocation) return 'unsupported';
  if (name === 'camera' && !navigator.mediaDevices?.getUserMedia) return 'unsupported';
  try {
    const status = await navigator.permissions.query({ name: name as PermissionName });
    return status.state === 'granted' ? 'granted' : status.state === 'denied' ? 'denied' : 'prompt';
  } catch {
    return 'prompt';
  }
}

export interface Fix {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export type GeoResult = ({ ok: true } & Fix) | { ok: false; reason: FailReason };

export const toFix = (p: GeolocationPosition): Fix => ({
  lat: p.coords.latitude,
  lng: p.coords.longitude,
  accuracy: p.coords.accuracy,
  timestamp: p.timestamp,
});

export const geoReason = (e: GeolocationPositionError): FailReason =>
  e.code === 1 ? 'denied' : e.code === 3 ? 'timeout' : 'unavailable';

export function getPosition(timeoutMs = 20_000): Promise<GeoResult> {
  if (!window.isSecureContext) return Promise.resolve({ ok: false, reason: 'insecure' });
  if (!navigator.geolocation) return Promise.resolve({ ok: false, reason: 'unsupported' });
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      p => resolve({ ok: true, ...toFix(p) }),
      e => resolve({ ok: false, reason: geoReason(e) }),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    );
  });
}

export async function openCamera(): Promise<{ ok: true; stream: MediaStream } | { ok: false; reason: FailReason }> {
  if (!window.isSecureContext) return { ok: false, reason: 'insecure' };
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, reason: 'unsupported' };
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    return { ok: true, stream };
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') return { ok: false, reason: 'denied' };
    if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'NotReadableError') {
      return { ok: false, reason: 'unavailable' };
    }
    return { ok: false, reason: 'unsupported' };
  }
}

/** Asks for the camera and releases it right away: only to know whether it is allowed. */
export async function requestCamera(): Promise<{ ok: true } | { ok: false; reason: FailReason }> {
  const r = await openCamera();
  if (!r.ok) return r;
  r.stream.getTracks().forEach(t => t.stop());
  return { ok: true };
}

type MotionEventCtor = { requestPermission?: () => Promise<'granted' | 'denied'> };

/** Must be called straight from a tap: iOS only shows the motion prompt after a user gesture. */
export async function requestMotion(): Promise<{ ok: true } | { ok: false; reason: FailReason }> {
  if (!window.isSecureContext) return { ok: false, reason: 'insecure' };
  const ctor = (window as unknown as { DeviceMotionEvent?: MotionEventCtor }).DeviceMotionEvent;
  if (!ctor) return { ok: false, reason: 'unsupported' };
  if (typeof ctor.requestPermission === 'function') {
    try {
      const answer = await ctor.requestPermission();
      if (answer !== 'granted') return { ok: false, reason: 'denied' };
    } catch {
      return { ok: false, reason: 'denied' };
    }
  }
  return { ok: true };
}

/** Resolves true when the device delivers real accelerometer data within the time limit. */
export function hasMotionSensor(timeoutMs = 2000): Promise<boolean> {
  return new Promise(resolve => {
    const done = (v: boolean) => {
      window.removeEventListener('devicemotion', onMotion);
      clearTimeout(timer);
      resolve(v);
    };
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (a && a.x != null && a.y != null && a.z != null) done(true);
    };
    const timer = setTimeout(() => done(false), timeoutMs);
    window.addEventListener('devicemotion', onMotion);
  });
}

// ---- connection ----

const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL;

/**
 * True when the network really answers. navigator.onLine alone lies (Wi-Fi without internet),
 * so on http(s) it also fetches a tiny file that the service worker never caches.
 * Any HTTP answer, even a 404, proves the network is there.
 */
export async function probeOnline(timeoutMs = 3500): Promise<boolean> {
  if (navigator.onLine === false) return false;
  if (!/^https?:$/.test(location.protocol)) return true;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await fetch(`${BASE}ping.txt?t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function useOnline(active = true, pollMs = 2500): boolean {
  const [online, setOnline] = useState<boolean>(() => navigator.onLine !== false);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    const check = () => {
      probeOnline().then(ok => {
        if (alive) setOnline(ok);
      });
    };
    check();
    const id = setInterval(check, pollMs);
    window.addEventListener('online', check);
    window.addEventListener('offline', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener('online', check);
      window.removeEventListener('offline', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [active, pollMs]);

  return online;
}
