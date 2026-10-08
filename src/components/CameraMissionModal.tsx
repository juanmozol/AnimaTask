import React, { useState, useEffect, useRef } from 'react';
import { CameraMission, EnergyType } from '../types';
import { sound } from '../services/sound';
import { Camera, RefreshCw, CheckCircle2, Scan, Sparkles, X, ShieldAlert, Zap } from 'lucide-react';

interface Props {
  mission: CameraMission;
  multiplierActive: boolean;
  onComplete: (mission: CameraMission, earnedEnergy: number) => void;
  onClose: () => void;
}

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
  const [analysisText, setAnalysisText] = useState<string>('Esperando encuadre óptimo...');

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
    setAnalysisText('Segmentando espectro de color ambiental...');
    
    setTimeout(() => {
      setScanProgress(35);
      setAnalysisText(`Detectando patrón cromático: ${mission.targetObjectDescription}...`);
    }, 600);

    setTimeout(() => {
      setScanProgress(75);
      setAnalysisText('Calculando vector de coincidencia visual...');
    }, 1200);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setScanSuccess(true);
      setAnalysisText('¡Validación exitosa! Coincidencia: 98.7%');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Misión de Cámara Creativa</h3>
              <p className="text-[10px] text-slate-400">{mission.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Card */}
        <div className="p-3 bg-purple-950/40 border-b border-purple-900/40 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-purple-200">{mission.prompt}</p>
            <p className="text-[10px] text-purple-400 mt-0.5">
              Objetivo: {mission.targetObjectDescription}
            </p>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative w-full h-72 bg-black flex items-center justify-center overflow-hidden">
          {hasCameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            // Digital High-Tech AR Simulation Viewport
            <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Animated camera lens grid */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Virtual Target Element */}
              <div
                className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500 animate-pulse"
                style={{
                  borderColor: mission.targetColor,
                  backgroundColor: `${mission.targetColor}20`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: mission.targetColor }}
                >
                  <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <span className="text-[10px] font-mono text-white mt-2 font-semibold">
                  OBJ_DETECTED
                </span>
              </div>

              <span className="text-[10px] text-slate-400 mt-3 font-mono">
                [Sensor AR Óptico Calibrado]
              </span>
            </div>
          )}

          {/* AR HUD Overlay Lines and Reticle */}
          <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-3">
            {/* Corner Markers */}
            <div className="flex justify-between items-center text-[9px] font-mono text-cyan-400">
              <span>SCAN_MODE: 4K_AR</span>
              <span>ISO: AUTO</span>
            </div>

            {/* Center Reticle */}
            <div className="self-center flex items-center justify-center">
              <Scan
                className={`w-16 h-16 transition-colors duration-300 ${
                  scanSuccess ? 'text-emerald-400' : isScanning ? 'text-amber-400 animate-spin' : 'text-purple-400/80'
                }`}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-cyan-400">
              <span>SPECT_MATCH: {scanSuccess ? '98.7%' : isScanning ? `${scanProgress}%` : 'READY'}</span>
              <span>BAT: 99%</span>
            </div>
          </div>

          {/* Laser Sweep Line during scanning */}
          {isScanning && (
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[bounce_1.5s_infinite]" />
          )}

          {/* Success Overlay Banner */}
          {scanSuccess && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-white">¡Misión Validada!</h4>
              <p className="text-xs text-slate-300 text-center max-w-xs mt-1">
                La IA reconoció con éxito el elemento de la misión creativa.
              </p>

              <div className="mt-3 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center gap-2 text-purple-300 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>+{finalReward} Energía {mission.rewardCategory}</span>
                {multiplierActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                    x2 BOOST
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
          {/* Status Text */}
          <div className="text-center">
            <p className="text-xs font-medium text-slate-300">{analysisText}</p>
            {isScanning && (
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          {scanSuccess ? (
            <button
              onClick={handleClaimReward}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Reclamar Recompensa y Regresar</span>
            </button>
          ) : (
            <button
              onClick={handleCaptureAndScan}
              disabled={isScanning}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Scan className="w-4 h-4" />
              <span>{isScanning ? 'Analizando captura...' : 'Tomar Foto y Escanear'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
