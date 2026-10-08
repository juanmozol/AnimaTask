import React, { useState } from 'react';
import { generateStandaloneHtml } from '../utils/generateStandaloneHtml';
import { sound } from '../services/sound';
import { Download, Copy, Check, FileCode, X, ExternalLink, Globe } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [viewSource, setViewSource] = useState(false);

  const htmlContent = generateStandaloneHtml();

  const handleCopy = async () => {
    sound.playTap();
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    sound.playTap();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Exportar para GitHub Pages</h3>
              <p className="text-[10px] text-slate-400">Archivo único HTML + CSS + JS autónomo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Explanation */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <FileCode className="w-4 h-4" />
              <span>Entregable 100% Autónomo en 1 Solo Archivo</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cumpliendo el requerimiento del proyecto, este botón genera un único archivo{' '}
              <code className="text-indigo-300 bg-indigo-950 px-1 py-0.5 rounded font-mono">
                index.html
              </code>{' '}
              que contiene todo el CSS, scripts, gráficos SVG interactivos y sintetizador Web Audio.
              ¡No requiere npm install, servidor ni empaquetadores!
            </p>
          </div>

          {/* Steps for GitHub Pages */}
          <div className="space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider">
              Pasos para Desplegar en GitHub Pages en 2 Minutos:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1 leading-relaxed">
              <li>Haz clic en <strong className="text-white">Descargar index.html</strong> abajo.</li>
              <li>Crea o abre tu repositorio en GitHub y sube el archivo a la raíz (<code className="text-indigo-300">/</code>).</li>
              <li>Ve a <strong className="text-white">Settings → Pages</strong> en tu repositorio.</li>
              <li>En <strong className="text-white">Branch</strong>, selecciona <code className="text-indigo-300">main</code> y carpeta <code className="text-indigo-300">/(root)</code>, luego guarda.</li>
              <li>¡Listo! Tu prototipo estará publicado en tu URL de GitHub Pages al instante.</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar index.html</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Toggle Code Preview */}
          <div className="pt-2">
            <button
              onClick={() => setViewSource(prev => !prev)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
            >
              {viewSource ? 'Ocultar vista previa de código' : 'Ver código HTML unificado'}
            </button>

            {viewSource && (
              <pre className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-mono overflow-x-auto max-h-48 select-text">
                {htmlContent}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
