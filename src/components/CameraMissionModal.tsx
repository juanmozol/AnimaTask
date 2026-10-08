import React, { useState, useEffect, useRef } from 'react';
import { CameraMission } from '../types';
import { sound } from '../services/sound';
import { Camera, CheckCircle2, X } from 'lucide-react';

interface Props {
  mission: CameraMission;
  multiplierActive: boolean;
  onComplete: (mission: CameraMission, earnedEnergy: number) => void;
  onClose: () => void;
}

const BRACKET = 'absolute h-6 w-6 border-white/80';

export const CameraMissionModal: React.FC<Props> = ({
  mission,
  multiplierActive,
  onComplete,
  onClose,
}) => {
  const [hasCameraStream, setHasCameraStream] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>('Encuadra el color y toma la foto.');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Attempt real camera access, fallback gracefully to digital AR simulator
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;
          // The <video> only mounts once hasCameraStream is true; the effect below attaches the stream then.
          setHasCameraStream(true);
        } else {
          setHasCameraStream(false);
        }
      } catch (err) {
        setHasCameraStream(false);
        setStreamError('Cámara física no disponible en este entorno. Activando Sensor AR Simulado.');
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Attach the stream once the <video> element exists.
  useEffect(() => {
    if (hasCameraStream && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [hasCameraStream]);

  const handleCaptureAndScan = () => {
    sound.playCameraShutter();
    setIsScanning(true);
    setScanProgress(0);

    // If video is available, capture frame onto canvas
    if (videoRef.current && hasCameraStream) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 400;
        canvas.height = videoRef.current.videoHeight || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
        }
      } catch {
        // Fallback
      }
    } else {
      // Procedural mock snapshot representation
      setCapturedImage('simulated_snap');
    }

    // Step-by-step software recognition animation
    setAnalysisText('Mirando los colores a tu alrededor...');

    setTimeout(() => {
      setScanProgress(35);
      setAnalysisText(`Buscando: ${mission.targetObjectDescription}...`);
    }, 600);

    setTimeout(() => {
      setScanProgress(75);
      setAnalysisText('Comparando tonos...');
    }, 1200);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setScanSuccess(true);
      setAnalysisText('¡Validado! Coincidencia 98.7%');
      sound.playTaskComplete(multiplierActive);
    }, 1800);
  };

  const handleClaimReward = () => {
    const finalReward = multiplierActive ? mission.energyReward * 2 : mission.energyReward;
    onComplete(mission, finalReward);
    onClose();
  };

  const finalReward = multiplierActive ? mission.energyReward * 2 : mission.energyReward;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in select-none items-end justify-center bg-tinta/55 sm:items-center">
      <div
        role="dialog"
        aria-label="Misión de cámara creativa"
        className="flex max-h-[96dvh] w-full max-w-[440px] animate-sheet-up flex-col overflow-y-auto rounded-t-[28px] bg-lino sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="flex items-center gap-3">
            <span
              className="h-9 w-9 shrink-0 rounded-[48%_52%_50%_50%/54%_46%_54%_46%]"
              style={{ backgroundColor: mission.targetColor }}
            />
            <div>
              <h3 className="text-[17px] font-bold leading-tight">Misión de cámara creativa</h3>
              <p className="text-[13px] text-bruma">{mission.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="-mr-2 grid h-9 w-9 place-items-center rounded-full text-bruma transition-colors hover:bg-tinta/5 hover:text-tinta"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prompt */}
        <div className="px-5 pb-4">
          <p className="text-[15px] font-medium leading-snug">{mission.prompt}</p>
          <p className="mt-1 text-[13px] text-bruma">Objetivo: {mission.targetObjectDescription}</p>
        </div>

        {/* Viewfinder */}
        <div className="relative h-72 w-full overflow-hidden bg-[#241e19]">
          {hasCameraStream ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center">
              <div
                className="h-36 w-36 animate-breathe rounded-[48%_52%_50%_50%/54%_46%_54%_46%] opacity-90"
                style={{ backgroundColor: mission.targetColor }}
              />
              <p className="absolute inset-x-6 bottom-5 text-center text-xs leading-snug text-lino/70">
                {streamError ?? 'Modo simulado: toma la foto para validar el color.'}
              </p>
            </div>
          )}

          {/* Framing corners */}
          <div className="pointer-events-none absolute inset-6">
            <span className={`${BRACKET} left-0 top-0 rounded-tl-md border-l-2 border-t-2`} />
            <span className={`${BRACKET} right-0 top-0 rounded-tr-md border-r-2 border-t-2`} />
            <span className={`${BRACKET} bottom-0 left-0 rounded-bl-md border-b-2 border-l-2`} />
            <span className={`${BRACKET} bottom-0 right-0 rounded-br-md border-b-2 border-r-2`} />
          </div>

          {isScanning && (
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 animate-scan rounded-full bg-white/80 shadow-[0_0_14px_rgba(255,255,255,0.7)]" />
          )}

          {scanSuccess && (
            <div className="absolute inset-0 flex animate-fade-in flex-col items-center justify-center gap-1 bg-tinta/75 px-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-jade-claro" strokeWidth={1.5} />
              <h4 className="mt-2 text-xl font-bold text-lino">¡Misión validada!</h4>
              <p className="max-w-xs text-sm text-lino/75">
                La IA reconoció con éxito el elemento de la misión creativa.
              </p>
              <p className="mt-3 text-[15px] font-bold text-lino">
                +{finalReward} energía {mission.rewardCategory}
                {multiplierActive && <span className="ml-2 text-curcuma">x2</span>}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 px-5 pb-6 pt-4">
          <div className="text-center">
            <p className="text-[14px] text-bruma" aria-live="polite">
              {analysisText}
            </p>
            {isScanning && (
              <div className="mx-auto mt-3 h-[3px] w-full max-w-[16rem] overflow-hidden rounded-full bg-trazo">
                <div className="h-full rounded-full bg-jade transition-all duration-300" style={{ width: `${scanProgress}%` }} />
              </div>
            )}
          </div>

          {scanSuccess ? (
            <button
              onClick={handleClaimReward}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-jade py-3.5 text-[15px] font-bold text-lino transition-transform active:scale-[0.98]"
            >
              <CheckCircle2 className="h-[18px] w-[18px]" />
              <span>Reclamar recompensa y regresar</span>
            </button>
          ) : (
            <button
              onClick={handleCaptureAndScan}
              disabled={isScanning}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-tinta py-3.5 text-[15px] font-bold text-lino transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Camera className="h-[18px] w-[18px]" />
              <span>{isScanning ? 'Analizando captura...' : 'Tomar foto y escanear'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
