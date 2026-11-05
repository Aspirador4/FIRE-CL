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
    <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
      <div className="mb-4 flex items-center justify-between border-b-2 border-black/10 pb-3 dark:border-zinc-800">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-zinc-200">
            [ SENSIBILIDAD ]
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <h3 className="text-base font-black tracking-tight text-black dark:text-white uppercase font-sans">
              Ahorro vs Rentabilidad Real
            </h3>
            <InfoTooltip
              title="Matriz de Sensibilidad"
              content="Muestra en cuántos años alcanzarías la independencia financiera combinando distintas tasas de ahorro con distintas rentabilidades. Aumentar tu tasa de ahorro acelera tu retiro mucho más rápido que especular con rentabilidades improbables."
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs font-mono">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-100 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
              <th className="py-2.5 px-2.5 text-left font-black uppercase">
                Ahorro \ Retorno
              </th>
              {returns.map((ret) => (
                <th
                  key={ret}
                  className="py-2.5 px-2 font-black tabular-nums"
                >
                  {ret}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-zinc-800">
            {matrix.map((row) => (
              <tr key={row.savingsRate} className="hover:bg-neutral-50 dark:hover:bg-zinc-800/40">
                <td className="py-2 px-2.5 text-left font-black text-black dark:text-white tabular-nums">
                  {row.savingsRate}%
                </td>
                {row.values.map((anos, idx) => {
                  let badgeStyle = 'border border-black bg-neutral-100 text-neutral-600 dark:bg-zinc-800 dark:text-zinc-400';
                  if (anos !== null) {
                    if (anos <= 11) {
                      badgeStyle = 'border-2 border-black bg-[#facc15] text-black font-black shadow-[1px_1px_0px_0px_#000]';
                    } else if (anos <= 17) {
                      badgeStyle = 'border border-black bg-emerald-100 text-emerald-950 font-bold dark:bg-emerald-900 dark:text-emerald-100';
                    } else if (anos <= 24) {
                      badgeStyle = 'border border-black bg-blue-50 text-blue-950 font-bold dark:bg-blue-950 dark:text-blue-100';
                    }
                  }

                  return (
                    <td key={idx} className="py-1.5 px-1">
                      <span
                        className={`inline-block min-w-[46px] px-1.5 py-0.5 text-xs tabular-nums font-bold ${badgeStyle}`}
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

      <div className="mt-4 border-t-2 border-black/10 pt-2 text-xs font-mono font-medium text-neutral-600 dark:border-zinc-800 dark:text-neutral-400 leading-relaxed">
        Subir la tasa de ahorro produce un impacto matemáticamente garantizado e inmune a las crisis del mercado.
      </div>
    </div>
  );
}
