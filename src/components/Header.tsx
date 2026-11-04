'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CurrencyMode } from '@/lib/formatters';
import { Clock, Share2, Check, BookOpen, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  currencyMode?: CurrencyMode;
  onCurrencyToggle?: (mode: CurrencyMode) => void;
  ufRate?: number;
}

export function Header({
  currencyMode = 'CLP',
  onCurrencyToggle,
  ufRate = 38500,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f5f4f2]/90 backdrop-blur-md dark:border-white/[0.06] dark:bg-[#121211]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="group flex items-center space-x-2.5 outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0a0a0a] text-white transition-transform duration-150 group-hover:scale-105 active:scale-95 dark:bg-white dark:text-[#0a0a0a]">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#0a0a0a] dark:text-white">
                Dividendo de Tiempo
              </span>
              <span className="hidden sm:inline-flex rounded-full border border-black/[0.08] bg-white/70 px-2.5 py-0.5 text-[11px] font-mono tracking-tight text-neutral-600 dark:border-white/[0.1] dark:bg-neutral-900/60 dark:text-neutral-300">
                FIRE CHILE
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Currency Switcher */}
          {onCurrencyToggle && (
            <div className="flex items-center rounded-full border border-black/[0.08] bg-white/80 p-0.5 text-[12.5px] font-medium shadow-[0_1px_2px_rgba(10,10,10,0.03)] dark:border-white/[0.1] dark:bg-neutral-900/80">
              <button
                onClick={() => onCurrencyToggle('CLP')}
                className={`rounded-full px-3 py-1 transition-all duration-150 active:scale-[0.97] ${
                  currencyMode === 'CLP'
                    ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                    : 'text-neutral-600 hover:text-[#0a0a0a] dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                $ CLP
              </button>
              <button
                onClick={() => onCurrencyToggle('UF')}
                className={`rounded-full px-3 py-1 transition-all duration-150 active:scale-[0.97] ${
                  currencyMode === 'UF'
                    ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                    : 'text-neutral-600 hover:text-[#0a0a0a] dark:text-neutral-400 dark:hover:text-white'
                }`}
                title={`Valor de referencia: 1 UF = $${ufRate.toLocaleString('es-CL')}`}
              >
                UF
              </button>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 rounded-full border border-black/[0.08] bg-white/90 px-3.5 py-1.5 text-[13px] font-medium text-neutral-800 shadow-[0_1px_2px_rgba(10,10,10,0.02)] transition-all duration-150 hover:border-black/20 hover:bg-white active:scale-[0.97] dark:border-white/[0.1] dark:bg-neutral-900 dark:text-neutral-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 font-semibold dark:text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Compartir</span>
              </>
            )}
          </button>

          {/* Guía FIRE Button */}
          <Link
            href="/guia-fire-chile"
            className="inline-flex items-center space-x-1 rounded-full bg-[#0a0a0a] px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-neutral-200"
          >
            <span>Guía FIRE</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>
      </div>
    </header>
  );
}
