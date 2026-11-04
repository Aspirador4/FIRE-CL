'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export function AdBanner({
  slotId = '0000000000',
  format = 'auto',
  className = '',
  label = 'Publicidad',
}: AdBannerProps) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (adsenseClientId && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    }
  }, [adsenseClientId]);

  // Si no hay Client ID de AdSense configurado, mostramos un marco editorial sobrio
  if (!adsenseClientId) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50/40 p-3.5 text-center transition-colors hover:bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-900/30 ${className}`}
      >
        <div className="flex flex-col items-center justify-center space-y-0.5">
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
            {label}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Espacio reservado para red de anuncios (AdSense / Mediavine)
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            Formato: {format}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <span className="mb-1 text-[9px] uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseClientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
