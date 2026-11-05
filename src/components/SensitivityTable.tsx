'use client';

import React from 'react';
import { runFireSimulation, FireSimulationInput } from '@/lib/fireEngine';
import { InfoTooltip } from '@/components/InfoTooltip';

interface SensitivityTableProps {
  baseInput: FireSimulationInput;
}

export function SensitivityTable({ baseInput }: SensitivityTableProps) {
  const savingsRates = [20, 30, 40, 50, 60, 70];
  const returns = [4, 5, 6, 7, 8];

  // Genera matriz de años hasta FIRE variando gasto/ahorro y rentabilidad
  const matrix = savingsRates.map((sr) => {
    return {
      savingsRate: sr,
      values: returns.map((ret) => {
        const ingresoTotal =
          baseInput.sueldoLiquidoMensual +
          baseInput.aporteAfpMensual +
          baseInput.aporteApvMensual;
        const gastoAjustado = Math.max(
          100000,
          ingresoTotal * (1 - sr / 100) -
            baseInput.aporteAfpMensual -
            baseInput.aporteApvMensual
        );

        const simInput: FireSimulationInput = {
          ...baseInput,
          gastoMensualActual: gastoAjustado,
          gastoMensualRetiro: gastoAjustado,
          rentabilidadPortafolioRealPct: ret,
        };

        const res = runFireSimulation(simInput);
        return res.anosHastaFire;
      }),
    };
  });

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
      <div className="mb-5 flex items-center justify-between border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            Sensibilidad
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <h3 className="text-[15px] font-semibold tracking-tight text-[#0a0a0a] dark:text-white">
              Ahorro vs Rentabilidad Real
            </h3>
            <InfoTooltip
              title="Matriz de Sensibilidad"
              content="Muestra en cuántos años alcanzarías la libertad financiera combinando diferentes tasas de ahorro (filas) con diferentes rentabilidades reales anuales de tus inversiones (columnas). Revela que aumentar tu tasa de ahorro acelera tu retiro mucho más rápido que buscar rentabilidades especulativas."
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs">
          <thead>
            <tr className="border-b border-black/[0.06] text-neutral-400 dark:border-white/[0.06]">
              <th className="py-2.5 px-2.5 text-left font-mono font-medium">
                Tasa Ahorro \ Retorno
              </th>
              {returns.map((ret) => (
                <th
                  key={ret}
                  className="py-2.5 px-2.5 font-mono font-medium tabular-nums"
                >
                  {ret}% real
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {matrix.map((row) => (
              <tr key={row.savingsRate} className="hover:bg-[#fafaf8] dark:hover:bg-neutral-800/40">
                <td className="py-2.5 px-2.5 text-left font-semibold text-[#0a0a0a] dark:text-white tabular-nums font-mono">
                  {row.savingsRate}%
                </td>
                {row.values.map((anos, idx) => {
                  let badgeStyle = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
                  if (anos !== null) {
                    if (anos <= 11) {
                      badgeStyle = 'bg-[#0a0a0a] text-white font-medium shadow-sm dark:bg-white dark:text-[#0a0a0a]';
                    } else if (anos <= 17) {
                      badgeStyle = 'border border-emerald-600/25 bg-emerald-50 text-emerald-800 font-medium dark:bg-emerald-950 dark:text-emerald-300';
                    } else if (anos <= 24) {
                      badgeStyle = 'border border-black/[0.06] bg-[#fafaf8] text-neutral-800 font-medium dark:bg-neutral-800 dark:text-neutral-200';
                    }
                  }

                  return (
                    <td key={idx} className="py-2 px-1.5">
                      <span
                        className={`inline-block min-w-[50px] rounded-full px-2 py-0.5 text-[11px] tabular-nums font-mono transition-transform duration-100 ${badgeStyle}`}
                      >
                        {anos !== null ? `${anos}a` : '>35a'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Aumentar tu tasa de ahorro tiene un impacto más predecible e inmediato que esperar rentabilidades milagrosas del mercado.
      </p>
    </div>
  );
}
