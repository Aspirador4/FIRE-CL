'use client';

import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="mt-20 border-t-2 border-black bg-[#f7f6f0] py-12 font-mono text-xs text-black dark:border-zinc-200 dark:bg-[#0d0e12] dark:text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3.5 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center border-2 border-black bg-[#facc15] text-black shadow-[1.5px_1.5px_0px_0px_#000] dark:border-white">
                <Clock className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="text-[16px] font-black tracking-tight text-black dark:text-white uppercase font-sans">
                Dividendo de Tiempo
              </span>
            </div>
            <p className="max-w-md text-xs font-bold leading-relaxed">
              &ldquo;El mayor dividendo que podemos obtener del dinero es el tiempo.&rdquo;
            </p>
            <p className="max-w-md text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Calculadora de Independencia Financiera (FIRE) adaptada a la legislación chilena:
              cotizaciones obligatorias AFP, APV Régimen A y B, seguro cesantía AFC, PGU y costos de crianza.
            </p>
          </div>

          {/* Enlaces de Contenido */}
          <div>
            <h4 className="mb-3 font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
              [ EDUCACIÓN FIRE ]
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/guia-fire-chile" className="hover:underline font-medium">
                  El movimiento FIRE en Chile →
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover:underline font-medium">
                  Metodología y Supuestos Actuariales →
                </Link>
              </li>
              <li>
                <Link href="/guia-fire-chile#apv" className="hover:underline font-medium">
                  APV Régimen A vs Régimen B →
                </Link>
              </li>
              <li>
                <Link href="/guia-fire-chile#puente" className="hover:underline font-medium">
                  El Puente Financiero y la Ley 3.500 →
                </Link>
              </li>
            </ul>
          </div>

          {/* Enlaces Legales */}
          <div>
            <h4 className="mb-3 font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
              [ TRANSPARENCIA ]
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacidad" className="hover:underline font-medium">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:underline font-medium">
                  Términos de Uso y Descargo Legal
                </Link>
              </li>
              <li>
                <span className="text-[10px] text-neutral-500 block pt-1">
                  Herramienta de simulación con fines educativos. No constituye asesoría financiera vinculante.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t-2 border-black/10 pt-6 text-[11px] text-neutral-600 dark:border-zinc-800 dark:text-neutral-400 md:flex-row">
          <p>© {currentYear} Dividendo de Tiempo · Hecho en Chile 🇨🇱</p>
          <p className="mt-2 md:mt-0 font-bold uppercase">
            ESTÉTICA NEO-BRUTALISTA // ALTA PRECISIÓN MATEMÁTICA
          </p>
        </div>
      </div>
    </footer>
  );
}
