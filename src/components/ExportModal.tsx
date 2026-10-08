import React, { useState } from 'react';
import { generateStandaloneHtml } from '../utils/generateStandaloneHtml';
import { sound } from '../services/sound';
import { Download, Copy, Check, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-tinta/55 sm:items-center">
      <div
        role="dialog"
        aria-label="Exportar HTML"
        className="flex max-h-[92dvh] w-full max-w-[440px] animate-sheet-up flex-col overflow-hidden rounded-t-[28px] bg-lino sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <h3 className="text-[19px] font-bold leading-tight">Exportar HTML</h3>
            <p className="text-[13px] text-bruma">Un solo archivo con todo incluido</p>
          </div>

          <button
            onClick={onClose}
            className="-mr-2 grid h-9 w-9 place-items-center rounded-full text-bruma transition-colors hover:bg-tinta/5 hover:text-tinta"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 pb-6 pt-2">
          <p className="text-[14px] leading-relaxed text-bruma">
            Este botón genera un único archivo <code className="rounded bg-arena px-1.5 py-0.5 text-[13px] text-tinta">index.html</code>{' '}
            con todo el CSS, los scripts y el sintetizador de audio. No requiere npm install, servidor ni
            empaquetadores.
          </p>

          <div>
            <h4 className="text-[13px] font-bold">Cómo publicarlo en GitHub Pages</h4>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-bruma marker:text-piedra">
              <li>
                Toca <strong className="font-bold text-tinta">Descargar index.html</strong>.
              </li>
              <li>Sube el archivo a la raíz de tu repositorio en GitHub.</li>
              <li>
                Ve a <strong className="font-bold text-tinta">Settings, Pages</strong>.
              </li>
              <li>
                En <strong className="font-bold text-tinta">Branch</strong> elige <code className="text-tinta">main</code> y la
                carpeta <code className="text-tinta">/(root)</code>, y guarda.
              </li>
              <li>Tu prototipo queda publicado en la URL de GitHub Pages.</li>
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-full bg-jade px-4 py-3 text-[14px] font-bold text-lino transition-transform active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span>Descargar</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] font-bold ring-1 ring-tinta transition-colors hover:bg-tinta hover:text-lino"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar código</span>
                </>
              )}
            </button>
          </div>

          <div>
            <button
              onClick={() => setViewSource(prev => !prev)}
              className="text-[13px] font-bold text-jade underline decoration-jade/40 underline-offset-4"
            >
              {viewSource ? 'Ocultar código' : 'Ver código HTML'}
            </button>

            {viewSource && (
              <pre className="mt-3 max-h-48 select-text overflow-auto rounded-xl bg-tinta p-3 font-mono text-[10px] leading-relaxed text-lino/80">
                {htmlContent}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
