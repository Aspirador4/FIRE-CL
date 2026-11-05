'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CurrencyMode } from '@/lib/formatters';
import {
  Clock,
  Share2,
  Check,
  ArrowUpRight,
  Printer,
  Sun,
  Moon,
  Flame,
} from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

interface HeaderProps {
  currencyMode?: CurrencyMode;
  onCurrencyToggle?: (mode: CurrencyMode) => void;
  ufRate?: number;
  isLiveUf?: boolean;
  onDownloadPdf?: () => void;
}

export function Header({
  currencyMode = 'CLP',
  onCurrencyToggle,
  ufRate = 41269,
  isLiveUf = false,
  onDownloadPdf,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('theme', 'light');
      } catch (e) {}
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-[#f7f6f0] dark:border-zinc-200 dark:bg-[#0d0e12] transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2.5 py-2 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href="/"
            className="group flex items-center space-x-2 outline-none transition-transform active:translate-y-0.5"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center border-2 border-black bg-[#facc15] text-black shadow-[2px_2px_0px_0px_#000] transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:shadow-[2px_2px_0px_0px_#fff]">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm sm:text-[17px] font-black tracking-tight text-black dark:text-white uppercase font-sans whitespace-nowrap">
                <span className="inline sm:hidden">Dividendo</span>
                <span className="hidden sm:inline">Dividendo de Tiempo</span>
              </span>
              <span className="hidden lg:inline-flex border-2 border-black bg-white px-2 py-0.2 text-[10px] font-mono font-bold tracking-wider text-black shadow-[1.5px_1.5px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
                FIRE CHILE
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Micro-indicador de UF en vivo */}
          <div className="hidden xl:flex items-center space-x-1.5 border-2 border-black bg-white px-2.5 py-1 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_0px_#fff]">
            <span
              className={`h-2 w-2 border border-black ${
                isLiveUf ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span>1 UF = ${ufRate.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
            <InfoTooltip
              title="Unidad de Fomento (UF) en Chile"
              content={`Valor oficial de referencia: $${ufRate.toLocaleString('es-CL', {
                maximumFractionDigits: 0,
              })} CLP. En esta simulación la UF indexa el tope imponible de AFP (84.3 UF), cesantía AFC (126.6 UF), plan de salud Isapre y beneficio APV Régimen B (50 UF/mes).`}
            />
          </div>

          {/* Currency Switcher Brutalista */}
          {onCurrencyToggle && (
            <div className="flex items-center border-2 border-black bg-white p-0.5 text-[11px] sm:text-xs font-mono font-bold shadow-[1.5px_1.5px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[1.5px_1.5px_0px_0px_#fff] sm:dark:shadow-[2px_2px_0px_0px_#fff]">
              <button
                type="button"
                onClick={() => onCurrencyToggle('CLP')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 transition-all ${
                  currencyMode === 'CLP'
                    ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white border-2 border-transparent'
                }`}
              >
                <span className="sm:hidden">CLP</span>
                <span className="hidden sm:inline">$ CLP</span>
              </button>
              <button
                type="button"
                onClick={() => onCurrencyToggle('UF')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 transition-all ${
                  currencyMode === 'UF'
                    ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white border-2 border-transparent'
                }`}
                title={`Valor oficial UF: $${ufRate.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`}
              >
                UF
              </button>
            </div>
          )}

          {/* Dark / Light Mode Brutalist Switch Button - ALWAYS VISIBLE */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar modo oscuro / claro"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="flex items-center space-x-1 sm:space-x-1.5 border-2 border-black bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-mono font-bold text-black shadow-[1.5px_1.5px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[1.5px_1.5px_0px_0px_#fff] sm:dark:shadow-[2px_2px_0px_0px_#fff]"
          >
            {mounted && isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#facc15] stroke-[2.5]" />
                <span className="hidden md:inline">CLARO</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
                <span className="hidden md:inline">OSCURO</span>
              </>
            )}
          </button>

          {/* Share Button (desktop & tablet) */}
          <button
            type="button"
            onClick={handleShare}
            className="hidden sm:inline-flex items-center space-x-1.5 border-2 border-black bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_0px_#fff]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span className="text-emerald-700 font-bold dark:text-emerald-400">¡COPIADO!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 stroke-[2]" />
                <span className="hidden md:inline">COMPARTIR</span>
              </>
            )}
          </button>

          {/* PDF Report Button (desktop) */}
          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="hidden md:inline-flex items-center space-x-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_0px_#fff]"
              title="Guardar o imprimir reporte en PDF"
            >
              <Printer className="h-3.5 w-3.5 stroke-[2]" />
              <span>PDF</span>
            </button>
          )}

          {/* Guía FIRE Button */}
          <Link
            href="/guia-fire-chile"
            className="inline-flex items-center space-x-1 border-2 border-black bg-[#facc15] px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-mono font-black text-black shadow-[1.5px_1.5px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fde047] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-white dark:shadow-[1.5px_1.5px_0px_0px_#fff]"
          >
            <span className="hidden sm:inline">GUÍA FIRE</span>
            <span className="sm:hidden">GUÍA</span>
            <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
