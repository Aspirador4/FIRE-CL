'use client';

import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="mt-20 border-t border-black/[0.06] bg-[#f5f4f2] py-14 text-neutral-600 dark:border-white/[0.06] dark:bg-[#121211] dark:text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3.5 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#0a0a0a] dark:text-white">
                Dividendo de Tiempo
              </span>
            </div>
            <p className="max-w-md text-[14px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              &ldquo;El mayor dividendo que podemos obtener del dinero es el tiempo.&rdquo;
            </p>
            <p className="max-w-md text-xs text-neutral-500 leading-relaxed">
              Calculadora de Independencia Financiera (FIRE) adaptada a la legislación chilena:
              cotizaciones obligatorias de AFP, APV Régimen A y B, PGU y planificación familiar.
            </p>
          </div>

          {/* Enlaces de Contenido */}
          <div>
            <h4 className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0a0a0a] dark:text-white">
              Educación FIRE
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/guia-fire-chile" className="hover:text-black dark:hover:text-white transition-colors">
                  El movimiento FIRE en Chile
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover:text-black dark:hover:text-white transition-colors">
                  Metodología y Supuestos Actuariales
                </Link>
              </li>
              <li>
                <Link href="/guia-fire-chile#apv" className="hover:text-black dark:hover:text-white transition-colors">
                  APV Régimen A vs Régimen B
                </Link>
              </li>
              <li>
                <Link href="/guia-fire-chile#puente" className="hover:text-black dark:hover:text-white transition-colors">
                  El Puente Financiero y la Ley 3.500
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces Legales */}
          <div>
            <h4 className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0a0a0a] dark:text-white">
              Transparencia
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacidad" className="hover:text-black dark:hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-black dark:hover:text-white transition-colors">
                  Términos de Uso y Descargo Legal
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-neutral-400 block pt-1">
                  Herramienta de simulación con fines estrictamente educativos. No constituye asesoría financiera vinculante.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-black/[0.05] pt-8 text-xs text-neutral-500 md:flex-row dark:border-white/[0.06]">
          <p>© {currentYear} Dividendo de Tiempo · Hecho en Chile 🇨🇱</p>
          <p className="mt-2 text-neutral-400 md:mt-0 font-mono text-[11px]">
            Inspirado en Engaging Data & TasteSkill
          </p>
        </div>
      </div>
    </footer>
  );
}
