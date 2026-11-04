'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CurrencyMode, formatMoney, formatPct } from '@/lib/formatters';
import { FireSimulationResult } from '@/lib/fireEngine';

interface MetricCardsProps {
  result: FireSimulationResult;
  currencyMode: CurrencyMode;
  ufRate: number;
  edadActual: number;
}

export function MetricCards({
  result,
  currencyMode,
  ufRate,
  edadActual,
}: MetricCardsProps) {
  const edadFire = result.edadFirePuente;
  const anosRestantes = result.anosHastaFire;

  // Lanza confeti si el usuario alcanza FIRE antes de los 55 años
  useEffect(() => {
    if (edadFire && edadFire <= 55 && edadFire > edadActual) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [edadFire, edadActual]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Tarjeta 1: Edad FIRE */}
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            Libertad Financiera
          </span>
          {edadFire && (
            <span className="rounded-full border border-emerald-600/20 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-300">
              {anosRestantes !== null && anosRestantes > 0 ? `En ${anosRestantes} años` : 'Alcanzado'}
            </span>
          )}
        </div>

        <div className="mt-4">
          {edadFire ? (
            <div className="flex items-baseline space-x-1.5">
              <span className="text-4xl font-semibold tracking-[-0.03em] text-[#0a0a0a] tabular-nums dark:text-white">
                {edadFire}
              </span>
              <span className="text-sm font-medium text-neutral-500">
                años de edad
              </span>
            </div>
          ) : (
            <span className="text-xl font-semibold text-amber-700">
              Aumenta tu ahorro
            </span>
          )}

          <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
            {anosRestantes !== null && edadFire !== null
              ? `Jubilación anticipada ${result.edadLegalRetiro - edadFire} años antes de la ley.`
              : 'El gasto mensual supera el ritmo de acumulación.'}
          </p>
        </div>
      </div>

      {/* Tarjeta 2: Meta Patrimonial FIRE */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            Meta FIRE (Regla del 4%)
          </span>
          <span className="rounded-full border border-black/[0.08] bg-[#fafaf8] px-2.5 py-0.5 text-[11px] font-mono text-neutral-600 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300">
            {currencyMode}
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-semibold tracking-[-0.03em] text-[#0a0a0a] tabular-nums dark:text-white">
            {formatMoney(result.metaPatrimonioFire, currencyMode, ufRate)}
          </div>
          <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
            Patrimonio requerido para vivir de rentas perpetuas.
          </p>
        </div>
      </div>

      {/* Tarjeta 3: Tasa de Ahorro */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            Tasa de Ahorro Real
          </span>
          <span className="rounded-full border border-emerald-600/20 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-300">
            AFP + Libre
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-semibold tracking-[-0.03em] text-[#0a0a0a] tabular-nums dark:text-white">
              {formatPct(result.tasaAhorroActualPct)}
            </span>
            <span className="text-xs text-neutral-500">del ingreso</span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
            Suma tu 10% obligatorio AFP + APV + excedente libre.
          </p>
        </div>
      </div>

      {/* Tarjeta 4: Impacto de Hijos o Pensión Legal */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            {result.impactoHijos.diferenciaAnosFire > 0
              ? 'Impacto Familiar'
              : 'Pensión Legal (AFP)'}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
              result.impactoHijos.diferenciaAnosFire > 0
                ? 'border-amber-600/20 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/60 dark:text-amber-300'
                : 'border-blue-600/20 bg-blue-50 text-blue-800 dark:border-blue-500/20 dark:bg-blue-950/60 dark:text-blue-300'
            }`}
          >
            {result.impactoHijos.diferenciaAnosFire > 0 ? 'Crianza' : 'Ley 3.500'}
          </span>
        </div>

        <div className="mt-4">
          {result.impactoHijos.diferenciaAnosFire > 0 ? (
            <>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-semibold tracking-[-0.03em] text-amber-700 tabular-nums dark:text-amber-400">
                  +{result.impactoHijos.diferenciaAnosFire}
                </span>
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  años a tu retiro
                </span>
              </div>
              <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                Gasto total vida: {formatMoney(result.impactoHijos.gastoTotalHijosVida, currencyMode, ufRate)}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-semibold tracking-[-0.03em] text-[#0a0a0a] tabular-nums dark:text-white">
                  {result.edadLegalRetiro}
                </span>
                <span className="text-xs font-medium text-neutral-500">
                  años (Edad Legal)
                </span>
              </div>
              <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                Se activa tu pensión autofinanciada AFP + PGU.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
