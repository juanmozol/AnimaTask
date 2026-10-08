import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Bottom sheet shared by the barriers and the permissions screen. */
export const Sheet: React.FC<Props> = ({ title, subtitle, onClose, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[65] flex animate-fade-in select-none items-end justify-center bg-tinta/55 sm:items-center">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[96dvh] w-full max-w-[440px] animate-sheet-up flex-col overflow-y-auto rounded-t-[28px] bg-lino outline-none sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
          <div className="min-w-0">
            <h3 className="text-[19px] font-bold leading-tight">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-bruma">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-bruma transition-colors hover:bg-tinta/5 hover:text-tinta"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">{children}</div>
      </div>
    </div>
  );
};
