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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <Link
            href="/"
            className="group flex items-center space-x-2.5 outline-none transition-transform active:translate-y-0.5"
          >
            <div className="flex h-9 w-9 items-center justify-center border-2 border-black bg-[#facc15] text-black shadow-[2px_2px_0px_0px_#000] transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:shadow-[2px_2px_0px_0px_#fff]">
              <Clock className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[16px] sm:text-[17px] font-bold tracking-tight text-black dark:text-white font-sans whitespace-nowrap">
                <span className="inline sm:hidden">Dividendo</span>
                <span className="hidden sm:inline">Dividendo de Tiempo</span>
              </span>
              <span className="hidden lg:inline-flex items-center h-6 border-2 border-black bg-white px-2 text-[11px] font-mono font-semibold tracking-tight text-black shadow-[1.5px_1.5px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[1.5px_1.5px_0px_0px_#fff]">
                FIRE Chile
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls - Todos alineados con h-9 */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Micro-indicador de UF en vivo */}
          <div className="hidden xl:inline-flex h-9 items-center space-x-1.5 border-2 border-black bg-white px-3 text-xs font-mono font-semibold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_0px_#fff] whitespace-nowrap">
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

          {/* Currency Switcher Brutalista con altura uniforme h-9 */}
          {onCurrencyToggle && (
            <div className="inline-flex h-9 items-center border-2 border-black bg-white p-0.5 text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#fff]">
              <button
                type="button"
                onClick={() => onCurrencyToggle('CLP')}
                className={`h-full px-2.5 flex items-center justify-center transition-all ${
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
                className={`h-full px-2.5 flex items-center justify-center transition-all ${
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

          {/* Dark / Light Mode Switch Button - Altura uniforme h-9 */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar modo oscuro / claro"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="inline-flex h-9 items-center space-x-1.5 border-2 border-black bg-white px-2.5 text-xs font-mono font-semibold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_0px_#fff]"
          >
            {mounted && isDark ? (
              <>
                <Sun className="h-4 w-4 text-[#facc15] stroke-[2.5]" />
                <span className="hidden md:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 stroke-[2.5]" />
                <span className="hidden md:inline">Oscuro</span>
              </>
            )}
          </button>

          {/* Share Button - Altura uniforme h-9 */}
          <button
            type="button"
            onClick={handleShare}
            className="hidden sm:inline-flex h-9 items-center space-x-1.5 border-2 border-black bg-white px-3 text-xs font-mono font-semibold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_0px_#fff]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span className="text-emerald-700 font-bold dark:text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 stroke-[2]" />
                <span className="hidden md:inline">Compartir</span>
              </>
            )}
          </button>

          {/* PDF Report Button - Altura uniforme h-9 */}
          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="hidden md:inline-flex h-9 items-center space-x-1.5 border-2 border-black bg-white px-3 text-xs font-mono font-semibold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_0px_#fff]"
              title="Guardar o imprimir reporte en PDF"
            >
              <Printer className="h-4 w-4 stroke-[2]" />
              <span>Reporte PDF</span>
            </button>
          )}

          {/* Guía FIRE Button - Altura uniforme h-9 */}
          <Link
            href="/guia-fire-chile"
            className="inline-flex h-9 items-center space-x-1 border-2 border-black bg-[#facc15] px-3 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#fde047] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-white dark:shadow-[2px_2px_0px_0px_#fff]"
          >
            <span className="hidden sm:inline">Guía FIRE</span>
            <span className="sm:hidden">Guía</span>
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
