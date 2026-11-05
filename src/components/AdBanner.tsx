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
        className={`relative border-2 border-dashed border-black/20 bg-neutral-50/50 p-2.5 text-center font-mono dark:border-zinc-800 dark:bg-zinc-950/50 ${className}`}
      >
        <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
          <span className="border border-black/20 px-1 dark:border-zinc-700">{label}</span>
          <span>Espacio reservado (AdSense / Mediavine)</span>
          <span className="text-neutral-400">[{format}]</span>
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
