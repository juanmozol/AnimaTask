import React, { useState } from 'react';
import {
  BarrierDraft,
  MAX_ANCHOR_ACCURACY,
  MOVES,
  OFFLINE_MINUTES,
  PLACE_RADII,
} from '../game/barriers';
import { MoveKind } from '../types';
import { getPosition, permissionHelp, reasonText } from '../services/device';
import { sound } from '../services/sound';

interface Props {
  value: BarrierDraft;
  onChange: (next: BarrierDraft) => void;
}

const KINDS: Array<{ id: BarrierDraft['kind']; label: string }> = [
  { id: 'none', label: 'Ninguna' },
  { id: 'place', label: 'Foto en un lugar' },
  { id: 'move', label: 'Reto físico' },
  { id: 'offline', label: 'Modo avión' },
];

const field =
  'w-full border-0 border-b border-piedra bg-transparent px-0 py-2 text-[15px] placeholder:text-bruma/70 focus:border-jade focus:outline-none focus-visible:outline-none';

const pill = (on: boolean) =>
  `chip ${on ? 'border-tinta bg-tinta text-lino' : ''}`;

const COPY: Record<Exclude<BarrierDraft['kind'], 'none'>, string> = {
  place: 'Para cumplirla tomas una foto en vivo dentro del radio. La galería no sirve.',
  move: 'Para cumplirla haces las repeticiones con el teléfono; el acelerómetro las cuenta.',
  offline: 'Para cumplirla activas el modo avión y lo mantienes todo el bloque. Si te reconectas, se anula.',
};

export const BarrierPicker: React.FC<Props> = ({ value, onChange }) => {
  const [anchoring, setAnchoring] = useState(false);
  const [anchorError, setAnchorError] = useState<string | null>(null);

  const select = (kind: BarrierDraft['kind']) => {
    sound.playTap();
    setAnchorError(null);
    if (kind === value.kind) return;
    if (kind === 'none') onChange({ kind: 'none' });
    else if (kind === 'place') onChange({ kind: 'place', label: '', radius: 100 });
    else if (kind === 'move') onChange({ kind: 'move', move: 'saltos', reps: MOVES.saltos.defaultReps });
    else onChange({ kind: 'offline', minutes: 25 });
  };

  const anchorHere = async () => {
    if (value.kind !== 'place') return;
    setAnchoring(true);
    setAnchorError(null);
    const r = await getPosition(20_000);
    setAnchoring(false);
    if (!r.ok) {
      setAnchorError(`${reasonText(r.reason)} ${r.reason === 'denied' ? permissionHelp('geolocation') : ''}`.trim());
      return;
    }
    if (r.accuracy > MAX_ANCHOR_ACCURACY) {
      setAnchorError(
        `La precisión es de ±${Math.round(r.accuracy)} m. Sal a un lugar abierto, activa el GPS y reintenta.`
      );
      return;
    }
    onChange({ ...value, anchor: { lat: r.lat, lng: r.lng, accuracy: r.accuracy } });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-bruma">Barrera para cumplirla</p>
        <div role="radiogroup" aria-label="Barrera" className="mt-2 flex flex-wrap gap-2">
          {KINDS.map(k => (
            <button
              key={k.id}
              type="button"
              role="radio"
              aria-checked={value.kind === k.id}
              onClick={() => select(k.id)}
              className={pill(value.kind === k.id)}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {value.kind !== 'none' && (
        <div className="animate-fade-in space-y-4 rounded-2xl bg-arena/70 p-4">
          <p className="text-[13px] leading-snug text-bruma">{COPY[value.kind]}</p>

          {value.kind === 'place' && (
            <>
              <input
                type="text"
                value={value.label}
                onChange={e => onChange({ ...value, label: e.target.value })}
                placeholder="Nombre del lugar (Gimnasio, Biblioteca...)"
                aria-label="Nombre del lugar"
                className={field}
              />
              <div>
                <p className="text-xs text-bruma">Radio permitido</p>
                <div className="mt-2 flex gap-2">
                  {PLACE_RADII.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onChange({ ...value, radius: r })}
                      aria-pressed={value.radius === r}
                      className={pill(value.radius === r)}
                    >
                      {r} m
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={anchorHere}
                  disabled={anchoring}
                  className="btn-contorno px-4 py-2 text-[13px]"
                >
                  {anchoring ? 'Buscando señal...' : value.anchor ? 'Volver a anclar aquí' : 'Anclar aquí'}
                </button>
                {value.anchor && (
                  <p className="tnum mt-2 text-[13px] text-jade" role="status">
                    Lugar anclado (±{Math.round(value.anchor.accuracy)} m)
                  </p>
                )}
                {!value.anchor && !anchorError && (
                  <p className="mt-2 text-[12px] leading-snug text-bruma">
                    Párate en el lugar y toca "Anclar aquí". Te pedirá permiso de ubicación.
                  </p>
                )}
                {anchorError && (
                  <p role="alert" className="mt-2 text-[12px] leading-snug text-rubia">
                    {anchorError}
                  </p>
                )}
              </div>
            </>
          )}

          {value.kind === 'move' && (
            <>
              <div>
                <p className="text-xs text-bruma">Reto</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(MOVES) as MoveKind[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChange({ ...value, move: m, reps: MOVES[m].defaultReps })}
                      aria-pressed={value.move === m}
                      className={pill(value.move === m)}
                    >
                      {MOVES[m].name}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[12px] leading-snug text-bruma">{MOVES[value.move].hint}</p>
              </div>
              <label className="block">
                <span className="text-xs text-bruma">Repeticiones</span>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={value.reps}
                  onChange={e => onChange({ ...value, reps: Number(e.target.value) })}
                  className={`${field} tnum mt-1`}
                />
              </label>
            </>
          )}

          {value.kind === 'offline' && (
            <div>
              <p className="text-xs text-bruma">Duración del bloque</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {OFFLINE_MINUTES.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChange({ ...value, minutes: m })}
                    aria-pressed={value.minutes === m}
                    className={pill(value.minutes === m)}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[12px] leading-snug text-bruma">
            No podrás quitar ni cambiar la barrera. Abandonar la tarea resta balance y alimenta a la Sombra.
          </p>
        </div>
      )}
    </div>
  );
};
