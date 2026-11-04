'use client';

import React, { useState } from 'react';
import { FireSimulationInput } from '@/lib/fireEngine';
import { calculateChileSalaryTax, SalaryBreakdown } from '@/lib/chileTaxEngine';
import { CurrencyMode, formatMoney, formatThousands, parseThousands } from '@/lib/formatters';
import { DEFAULT_CHILE_PARAMS } from '@/lib/constants';
import {
  Wallet,
  TrendingUp,
  Percent,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FireInputFormProps {
  input: FireSimulationInput;
  onChangeInput: (newInput: FireSimulationInput) => void;
  currencyMode: CurrencyMode;
  ufRate: number;
}

export function FireInputForm({
  input,
  onChangeInput,
  currencyMode,
  ufRate,
}: FireInputFormProps) {
  const [incomeMode, setIncomeMode] = useState<'bruto' | 'liquido'>('bruto');
  const [sueldoBruto, setSueldoBruto] = useState<number>(2500000);
  const [apvRegimen, setApvRegimen] = useState<'A' | 'B' | 'ninguno'>('B');
  const [showTaxBreakdown, setShowTaxBreakdown] = useState<boolean>(true);

  const update = (partial: Partial<FireSimulationInput>) => {
    onChangeInput({ ...input, ...partial });
  };

  // Cálculo reactivo desde Sueldo Bruto
  const handleBrutoChange = (brutoVal: number, apvVal: number, regimen: 'A' | 'B' | 'ninguno') => {
    setSueldoBruto(brutoVal);
    setApvRegimen(regimen);

    const breakdown: SalaryBreakdown = calculateChileSalaryTax(
      brutoVal,
      apvVal,
      regimen,
      DEFAULT_CHILE_PARAMS
    );

    update({
      sueldoLiquidoMensual: Math.round(breakdown.sueldoLiquido),
      aporteAfpMensual: Math.round(breakdown.cotizacionAfp10),
      aporteApvMensual: apvVal,
    });
  };

  const currentBreakdown = calculateChileSalaryTax(
    sueldoBruto,
    input.aporteApvMensual,
    apvRegimen,
    DEFAULT_CHILE_PARAMS
  );

  return (
    <div className="space-y-6">
      {/* 1. Perfil y Horizonte de Jubilación */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="mb-5 flex items-center justify-between border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            01 / Perfil y Horizonte
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Edad Actual */}
          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Tu Edad Actual:</span>
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {input.edadActual} años
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={65}
              value={input.edadActual}
              onChange={(e) => update({ edadActual: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </div>

          {/* Género (Edad legal de jubilación) */}
          <div>
            <span className="block text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              Edad Legal de Pensión AFP:
            </span>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ genero: 'hombre' })}
                className={`rounded-full py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                  input.genero === 'hombre'
                    ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                    : 'border border-black/[0.08] bg-[#fafaf8] text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                Hombre (65 años)
              </button>
              <button
                type="button"
                onClick={() => update({ genero: 'mujer' })}
                className={`rounded-full py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                  input.genero === 'mujer'
                    ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                    : 'border border-black/[0.08] bg-[#fafaf8] text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                Mujer (60 años)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ingresos y Previsión (Control Unificado) */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            02 / Ingresos y Previsión
          </span>

          {/* Selector de Modo Simple / Avanzado */}
          <div className="flex items-center rounded-full border border-black/[0.08] bg-[#f5f4f2] p-0.5 text-xs font-medium dark:border-white/[0.1] dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setIncomeMode('bruto')}
              className={`rounded-full px-3 py-1 transition-all duration-150 active:scale-[0.98] ${
                incomeMode === 'bruto'
                  ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                  : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Sueldo Bruto (Detallado SII)
            </button>
            <button
              type="button"
              onClick={() => setIncomeMode('liquido')}
              className={`rounded-full px-3 py-1 transition-all duration-150 active:scale-[0.98] ${
                incomeMode === 'liquido'
                  ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                  : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Sueldo Líquido (Rápido)
            </button>
          </div>
        </div>

        {incomeMode === 'bruto' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Sueldo Bruto */}
              <div>
                <label className="text-xs font-medium text-[#0a0a0a] dark:text-white">
                  Sueldo Bruto Mensual
                </label>
                <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                  <span className="mr-1 text-neutral-400">$</span>
                  <input
                    type="text"
                    value={formatThousands(sueldoBruto)}
                    onChange={(e) =>
                      handleBrutoChange(
                        parseThousands(e.target.value),
                        input.aporteApvMensual,
                        apvRegimen
                      )
                    }
                    className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                  />
                </div>
                <input
                  type="range"
                  min={500000}
                  max={8000000}
                  step={50000}
                  value={sueldoBruto}
                  onChange={(e) =>
                    handleBrutoChange(
                      Number(e.target.value),
                      input.aporteApvMensual,
                      apvRegimen
                    )
                  }
                  className="mt-2.5 w-full"
                />
              </div>

              {/* APV Mensual */}
              <div>
                <label className="text-xs font-medium text-[#0a0a0a] dark:text-white">
                  Ahorro Voluntario APV
                </label>
                <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                  <span className="mr-1 text-neutral-400">$</span>
                  <input
                    type="text"
                    value={formatThousands(input.aporteApvMensual)}
                    onChange={(e) =>
                      handleBrutoChange(
                        sueldoBruto,
                        parseThousands(e.target.value),
                        apvRegimen
                      )
                    }
                    className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={20000}
                  value={input.aporteApvMensual}
                  onChange={(e) =>
                    handleBrutoChange(
                      sueldoBruto,
                      Number(e.target.value),
                      apvRegimen
                    )
                  }
                  className="mt-2.5 w-full"
                />
              </div>

              {/* Régimen APV */}
              <div>
                <label className="text-xs font-medium text-[#0a0a0a] dark:text-white">
                  Régimen Tributario APV
                </label>
                <select
                  value={apvRegimen}
                  onChange={(e) =>
                    handleBrutoChange(
                      sueldoBruto,
                      input.aporteApvMensual,
                      e.target.value as any
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3 py-2 text-xs font-semibold text-[#0a0a0a] focus:outline-none dark:border-white/[0.1] dark:bg-neutral-800 dark:text-white"
                >
                  <option value="ninguno">Sin APV</option>
                  <option value="A">Régimen A (+15% Bonificación Estado)</option>
                  <option value="B">Régimen B (Rebaja de Impuesto SII)</option>
                </select>
                <span className="mt-1.5 block text-[11px] text-neutral-400">
                  {apvRegimen === 'A'
                    ? 'Bono fiscal hasta 6 UTM/año.'
                    : apvRegimen === 'B'
                    ? 'Descuenta de base imponible.'
                    : 'Sin beneficio tributario.'}
                </span>
              </div>
            </div>

            {/* Desglose de Leyes Sociales */}
            <div className="rounded-xl border border-black/[0.06] bg-[#fafaf8] p-4 text-xs dark:border-white/[0.08] dark:bg-neutral-800/40">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  Sueldo Líquido resultante:{' '}
                  <strong className="text-sm font-semibold text-[#0a0a0a] tabular-nums dark:text-white">
                    {formatMoney(currentBreakdown.sueldoLiquido, currencyMode, ufRate)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                  className="flex items-center space-x-1 text-neutral-500 hover:text-black dark:hover:text-white font-medium"
                >
                  <span>{showTaxBreakdown ? 'Ocultar leyes sociales' : 'Ver leyes sociales'}</span>
                  {showTaxBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {showTaxBreakdown && (
                <div className="mt-3.5 grid grid-cols-2 gap-3 border-t border-black/[0.05] pt-3 text-[11px] sm:grid-cols-4 dark:border-white/[0.06]">
                  <div>
                    <span className="text-neutral-400 block font-mono">AFP (10%):</span>
                    <span className="font-semibold text-blue-700 tabular-nums dark:text-blue-400">
                      +{formatMoney(currentBreakdown.cotizacionAfp10, currencyMode, ufRate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-mono">Salud (7%):</span>
                    <span className="font-semibold text-neutral-700 tabular-nums dark:text-neutral-300">
                      -{formatMoney(currentBreakdown.saludObligatoria, currencyMode, ufRate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-mono">Impuesto SII 2da Cat:</span>
                    <span className="font-semibold text-red-600 tabular-nums">
                      -{formatMoney(currentBreakdown.impuestoSegundaCategoria, currencyMode, ufRate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-mono">Comisión + Cesantía:</span>
                    <span className="font-semibold text-neutral-700 tabular-nums dark:text-neutral-300">
                      -{formatMoney(currentBreakdown.comisionAfp + currentBreakdown.seguroCesantia, currencyMode, ufRate)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Modo Simple Líquido Directo */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-[#0a0a0a] dark:text-white">
                Sueldo Líquido Mensual
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                <span className="mr-1 text-neutral-400">$</span>
                <input
                  type="text"
                  value={formatThousands(input.sueldoLiquidoMensual)}
                  onChange={(e) =>
                    update({ sueldoLiquidoMensual: parseThousands(e.target.value) })
                  }
                  className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                />
              </div>
              <input
                type="range"
                min={300000}
                max={6000000}
                step={50000}
                value={input.sueldoLiquidoMensual}
                onChange={(e) =>
                  update({ sueldoLiquidoMensual: Number(e.target.value) })
                }
                className="mt-2.5 w-full"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#0a0a0a] dark:text-white">
                Cotización 10% AFP
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                <span className="mr-1 text-neutral-400">$</span>
                <input
                  type="text"
                  value={formatThousands(input.aporteAfpMensual)}
                  onChange={(e) =>
                    update({ aporteAfpMensual: parseThousands(e.target.value) })
                  }
                  className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Aporte obligatorio a tu fondo individual
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-[#0a0a0a] dark:text-white">
                APV Ahorro Voluntario
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                <span className="mr-1 text-neutral-400">$</span>
                <input
                  type="text"
                  value={formatThousands(input.aporteApvMensual)}
                  onChange={(e) =>
                    update({ aporteApvMensual: parseThousands(e.target.value) })
                  }
                  className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Ahorro mensual previsional extra
              </span>
            </div>
          </div>
        )}

        {/* Crecimiento Salarial Real Anual */}
        <div className="mt-5 pt-4 border-t border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
            <div className="flex items-center space-x-1.5">
              <span>Crecimiento Salarial Anual (Aumentos sobre IPC):</span>
            </div>
            <span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
              +{input.crecimientoIngresoRealPct}% anual
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={8}
            step={0.5}
            value={input.crecimientoIngresoRealPct}
            onChange={(e) =>
              update({ crecimientoIngresoRealPct: Number(e.target.value) })
            }
            className="mt-2.5 w-full"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-neutral-500">
              Proyecta cuánto aumenta tu sueldo en términos reales por experiencia o ascensos.
            </span>
            <div className="flex items-center space-x-1.5">
              {[0, 2, 3.5, 5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => update({ crecimientoIngresoRealPct: rate })}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all duration-150 active:scale-[0.98] ${
                    input.crecimientoIngresoRealPct === rate
                      ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white dark:border-white dark:bg-white dark:text-[#0a0a0a]'
                      : 'border-black/[0.08] bg-[#fafaf8] text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {rate === 0 ? '0% Fijo' : `${rate}%`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gastos Mensuales y en Retiro */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="mb-5 flex items-center justify-between border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            03 / Estilo de Vida y Gastos
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Gasto Mensual Actual */}
          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Gasto Mensual Actual:</span>
              <span className="font-semibold tabular-nums text-[#0a0a0a] dark:text-white">
                {formatMoney(input.gastoMensualActual, currencyMode, ufRate)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
              <span className="mr-1 text-neutral-400">$</span>
              <input
                type="text"
                value={formatThousands(input.gastoMensualActual)}
                onChange={(e) =>
                  update({ gastoMensualActual: parseThousands(e.target.value) })
                }
                className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
              />
            </div>
            <input
              type="range"
              min={200000}
              max={5000000}
              step={50000}
              value={input.gastoMensualActual}
              onChange={(e) =>
                update({ gastoMensualActual: Number(e.target.value) })
              }
              className="mt-2.5 w-full"
            />
          </div>

          {/* Gasto Deseado en Retiro */}
          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Gasto Deseado en Jubilación:</span>
              <span className="font-semibold tabular-nums text-[#0a0a0a] dark:text-white">
                {formatMoney(input.gastoMensualRetiro, currencyMode, ufRate)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
              <span className="mr-1 text-neutral-400">$</span>
              <input
                type="text"
                value={formatThousands(input.gastoMensualRetiro)}
                onChange={(e) =>
                  update({ gastoMensualRetiro: parseThousands(e.target.value) })
                }
                className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
              />
            </div>
            <input
              type="range"
              min={200000}
              max={5000000}
              step={50000}
              value={input.gastoMensualRetiro}
              onChange={(e) =>
                update({ gastoMensualRetiro: Number(e.target.value) })
              }
              className="mt-2.5 w-full"
            />
            {/* Atajos */}
            <div className="mt-2 flex items-center space-x-2 text-[11px]">
              <span className="text-neutral-400">Atajos:</span>
              <button
                type="button"
                onClick={() =>
                  update({
                    gastoMensualRetiro: Math.round(input.gastoMensualActual * 0.8),
                  })
                }
                className="rounded-full border border-black/[0.08] bg-[#fafaf8] px-2.5 py-0.5 font-medium text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300"
              >
                80% del actual
              </button>
              <button
                type="button"
                onClick={() =>
                  update({ gastoMensualRetiro: input.gastoMensualActual })
                }
                className="rounded-full border border-black/[0.08] bg-[#fafaf8] px-2.5 py-0.5 font-medium text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300"
              >
                100% (Mismo estilo)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Patrimonio Actual Acumulado */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="mb-5 flex items-center justify-between border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            04 / Patrimonio Actual Acumulado
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Portafolio Libre */}
          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Portafolio Libre (Acciones, ETFs):</span>
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatMoney(input.patrimonioLiquidoInicial, currencyMode, ufRate)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
              <span className="mr-1 text-neutral-400">$</span>
              <input
                type="text"
                value={formatThousands(input.patrimonioLiquidoInicial)}
                onChange={(e) =>
                  update({
                    patrimonioLiquidoInicial: parseThousands(e.target.value),
                  })
                }
                className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100000000}
              step={500000}
              value={input.patrimonioLiquidoInicial}
              onChange={(e) =>
                update({ patrimonioLiquidoInicial: Number(e.target.value) })
              }
              className="mt-2.5 w-full"
            />
          </div>

          {/* Saldo AFP */}
          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Saldo Cuenta AFP Obligatoria:</span>
              <span className="font-semibold tabular-nums text-blue-700 dark:text-blue-400">
                {formatMoney(input.saldoAfpInicial, currencyMode, ufRate)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
              <span className="mr-1 text-neutral-400">$</span>
              <input
                type="text"
                value={formatThousands(input.saldoAfpInicial)}
                onChange={(e) =>
                  update({ saldoAfpInicial: parseThousands(e.target.value) })
                }
                className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
              />
            </div>
            <input
              type="range"
              min={0}
              max={150000000}
              step={500000}
              value={input.saldoAfpInicial}
              onChange={(e) =>
                update({ saldoAfpInicial: Number(e.target.value) })
              }
              className="mt-2.5 w-full"
            />
          </div>
        </div>
      </div>

      {/* 5. Supuestos de Mercado & Pensión */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="mb-5 flex items-center justify-between border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            05 / Rentabilidades Reales & Regla del 4%
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Portafolio Libre:</span>
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {input.rentabilidadPortafolioRealPct}% real
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={11}
              step={0.5}
              value={input.rentabilidadPortafolioRealPct}
              onChange={(e) =>
                update({ rentabilidadPortafolioRealPct: Number(e.target.value) })
              }
              className="mt-2.5 w-full"
            />
            <span className="text-[11px] text-neutral-400 block mt-1">S&P 500 / Globales (~7%)</span>
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Fondo AFP:</span>
              <span className="font-semibold tabular-nums text-blue-700 dark:text-blue-400">
                {input.rentabilidadAfpRealPct}% real
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={7}
              step={0.5}
              value={input.rentabilidadAfpRealPct}
              onChange={(e) =>
                update({ rentabilidadAfpRealPct: Number(e.target.value) })
              }
              className="mt-2.5 w-full"
            />
            <span className="text-[11px] text-neutral-400 block mt-1">Fondo A (~5.8%) / C (~4.4%)</span>
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Tasa Retiro Seguro (SWR):</span>
              <span className="font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                {input.tasaRetiroSeguroPct}%
              </span>
            </div>
            <input
              type="range"
              min={3.0}
              max={5.0}
              step={0.1}
              value={input.tasaRetiroSeguroPct}
              onChange={(e) =>
                update({ tasaRetiroSeguroPct: Number(e.target.value) })
              }
              className="mt-2.5 w-full"
            />
            <span className="text-[11px] text-neutral-400 block mt-1">Regla del 4% estándar</span>
          </div>

          <div className="flex flex-col justify-center rounded-xl border border-black/[0.06] bg-[#fafaf8] p-3 dark:border-white/[0.08] dark:bg-neutral-800/40">
            <label className="flex items-center space-x-2 text-xs font-semibold text-[#0a0a0a] dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={input.incluirPgu}
                onChange={(e) => update({ incluirPgu: e.target.checked })}
                className="h-4 w-4 rounded accent-[#0a0a0a]"
              />
              <span>Pensión PGU (65 años)</span>
            </label>
            <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
              Pensión Garantizada Universal (~$214.296/mes del Estado).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
