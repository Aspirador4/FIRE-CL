'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CurrencyMode, formatMoney, formatPct } from '@/lib/formatters';
import { FireSimulationResult } from '@/lib/fireEngine';
import { InfoTooltip } from '@/components/InfoTooltip';

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

  // Confeti si alcanza FIRE antes de los 55
  useEffect(() => {
    if (edadFire && edadFire <= 55 && edadFire > edadActual) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [edadFire, edadActual]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* Tarjeta 1: Edad FIRE */}
      <div className="relative border-2 border-black bg-white p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[3px_3px_0px_0px_#facc15] sm:dark:shadow-[4px_4px_0px_0px_#facc15]">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 dark:border-zinc-800">
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            <span>Libertad FIRE</span>
            <InfoTooltip
              title="Edad FIRE Puente"
              content="La edad exacta en la que alcanzas la independencia financiera en Chile. Desde esta edad vives de retiros de tu portafolio libre hasta los 60/65 años, momento en que se activa tu pensión legal AFP y la PGU."
            />
          </span>
          {edadFire && (
            <span className="border-2 border-black bg-[#facc15] px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-mono font-black uppercase text-black shadow-[1px_1px_0px_0px_#000] dark:border-zinc-200">
              {anosRestantes !== null && anosRestantes > 0 ? `En ${anosRestantes}a` : 'Listo'}
            </span>
          )}
        </div>

        <div className="mt-3 sm:mt-4">
          {edadFire ? (
            <div className="flex items-baseline space-x-1 sm:space-x-2">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-black tabular-nums dark:text-white font-mono">
                {edadFire}
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">
                años
              </span>
            </div>
          ) : (
            <span className="text-lg sm:text-2xl font-black text-rose-600 uppercase font-mono">
              Ahorrar más
            </span>
          )}

          <div className="mt-2 border-t border-black/10 pt-1.5 text-[10px] sm:text-xs font-mono font-medium text-neutral-600 dark:border-zinc-800 dark:text-neutral-400">
            {anosRestantes !== null && edadFire !== null
              ? `${result.edadLegalRetiro - edadFire} años antes de la ley.`
              : 'Gasto supera acumulación.'}
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Meta Patrimonial FIRE */}
      <div className="relative border-2 border-black bg-white p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[3px_3px_0px_0px_#facc15] sm:dark:shadow-[4px_4px_0px_0px_#facc15]">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 dark:border-zinc-800">
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            <span>Meta FIRE (4%)</span>
            <InfoTooltip
              title="Meta Patrimonial FIRE"
              content="Capital requerido en tu portafolio libre para financiar tu presupuesto mediante una Tasa de Retiro Seguro (SWR) del 4%, complementado luego por la pensión AFP."
            />
          </span>
          <span className="border-2 border-black bg-neutral-100 px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-mono font-black text-black shadow-[1px_1px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-800 dark:text-white">
            {currencyMode}
          </span>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-black tabular-nums dark:text-white font-mono break-words leading-tight">
            {formatMoney(result.metaPatrimonioFire, currencyMode, ufRate)}
          </div>
          <div className="mt-2 border-t border-black/10 pt-1.5 text-[10px] sm:text-xs font-mono font-medium text-neutral-600 dark:border-zinc-800 dark:text-neutral-400">
            Rentas perpetuas libres.
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Tasa de Ahorro */}
      <div className="relative border-2 border-black bg-white p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[3px_3px_0px_0px_#facc15] sm:dark:shadow-[4px_4px_0px_0px_#facc15]">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 dark:border-zinc-800">
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            <span>Ahorro Real</span>
            <InfoTooltip
              title="Tasa de Ahorro Total Mensual"
              content="Porcentaje del ingreso total destinado a patrimonio: 10% obligatorio AFP, APV con beneficio fiscal y excedente líquido libre."
            />
          </span>
          <span className="border-2 border-black bg-emerald-100 px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-mono font-black text-emerald-950 shadow-[1px_1px_0px_0px_#000] dark:border-zinc-200 dark:bg-emerald-900 dark:text-emerald-100">
            AFP+LIBRE
          </span>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="flex items-baseline space-x-1 sm:space-x-2">
            <span className="text-2xl sm:text-4xl font-black tracking-tight text-black tabular-nums dark:text-white font-mono">
              {formatPct(result.tasaAhorroActualPct)}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">
              ingreso
            </span>
          </div>
          <div className="mt-2 border-t border-black/10 pt-1.5 text-[10px] sm:text-xs font-mono font-medium text-neutral-600 dark:border-zinc-800 dark:text-neutral-400">
            10% AFP + APV + excedente.
          </div>
        </div>
      </div>

      {/* Tarjeta 4: Impacto de Hijos o Pensión Legal */}
      <div className="relative border-2 border-black bg-white p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[3px_3px_0px_0px_#facc15] sm:dark:shadow-[4px_4px_0px_0px_#facc15]">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 dark:border-zinc-800">
          <span className="inline-flex items-center space-x-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            <span>
              {result.impactoHijos.diferenciaAnosFire > 0
                ? 'Hijos'
                : 'Pensión'}
            </span>
            <InfoTooltip
              title={
                result.impactoHijos.diferenciaAnosFire > 0
                  ? 'Impacto Financiero de la Crianza'
                  : 'Pensión Legal DL 3.500'
              }
              content={
                result.impactoHijos.diferenciaAnosFire > 0
                  ? 'Años adicionales requeridos para alcanzar FIRE debido al presupuesto familiar (colegios y universidad).'
                  : 'A los 60 años en mujeres y 65 en hombres se desbloquea el retiro programado o renta vitalicia de tu AFP y la Pensión Garantizada Universal (PGU).'
              }
            />
          </span>
          <span
            className={`border-2 border-black px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-mono font-black uppercase shadow-[1px_1px_0px_0px_#000] dark:border-zinc-200 ${
              result.impactoHijos.diferenciaAnosFire > 0
                ? 'bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-200'
                : 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-100'
            }`}
          >
            {result.impactoHijos.diferenciaAnosFire > 0 ? 'Crianza' : 'Ley 3500'}
          </span>
        </div>

        <div className="mt-3 sm:mt-4">
          {result.impactoHijos.diferenciaAnosFire > 0 ? (
            <>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-orange-600 tabular-nums dark:text-orange-400 font-mono">
                  +{result.impactoHijos.diferenciaAnosFire}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">
                  años
                </span>
              </div>
              <div className="mt-2 border-t border-black/10 pt-1.5 text-[10px] sm:text-xs font-mono font-medium text-neutral-600 dark:border-zinc-800 dark:text-neutral-400 truncate">
                {formatMoney(result.impactoHijos.gastoTotalHijosVida, currencyMode, ufRate)}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-black tabular-nums dark:text-white font-mono">
                  {result.edadLegalRetiro}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">
                  años
                </span>
              </div>
              <div className="mt-2 border-t border-black/10 pt-1.5 text-[10px] sm:text-xs font-mono font-medium text-neutral-600 dark:border-zinc-800 dark:text-neutral-400">
                Pensión AFP + PGU.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
