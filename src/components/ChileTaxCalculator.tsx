'use client';

import React, { useState } from 'react';
import { calculateChileSalaryTax, SalaryBreakdown } from '@/lib/chileTaxEngine';
import { CurrencyMode, formatMoney, formatPct } from '@/lib/formatters';
import { DEFAULT_CHILE_PARAMS } from '@/lib/constants';
import { Calculator, ShieldCheck, ChevronDown, ChevronUp, Sparkles, Info } from 'lucide-react';

interface ChileTaxCalculatorProps {
  sueldoBruto: number;
  onSueldoBrutoChange: (val: number) => void;
  apvAporte: number;
  onApvAporteChange: (val: number) => void;
  apvRegimen: 'A' | 'B' | 'ninguno';
  onApvRegimenChange: (val: 'A' | 'B' | 'ninguno') => void;
  currencyMode: CurrencyMode;
  ufRate: number;
  onApplyCalculatedValues: (sueldoLiquido: number, aporteAfp: number, aporteApv: number) => void;
}

export function ChileTaxCalculator({
  sueldoBruto,
  onSueldoBrutoChange,
  apvAporte,
  onApvAporteChange,
  apvRegimen,
  onApvRegimenChange,
  currencyMode,
  ufRate,
  onApplyCalculatedValues,
}: ChileTaxCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const breakdown: SalaryBreakdown = calculateChileSalaryTax(
    sueldoBruto,
    apvAporte,
    apvRegimen,
    DEFAULT_CHILE_PARAMS
  );

  const handleApply = () => {
    onApplyCalculatedValues(
      breakdown.sueldoLiquido,
      breakdown.cotizacionAfp10,
      breakdown.apvAporte
    );
  };

  return (
    <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/40 to-indigo-50/20 p-5 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-indigo-950/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Calculadora Tributaria & Previsional Chile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desglose exacto de Sueldo Bruto a Líquido, AFP, Salud, AFC e Impuesto de 2da Categoría
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
        >
          <span>{isOpen ? 'Ocultar desglose' : 'Configurar sueldo bruto'}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 border-t border-blue-200/60 pt-4 dark:border-blue-900/40">
          {/* Inputs Bruto y APV */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Sueldo Bruto Mensual (CLP)
              </label>
              <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="text-sm text-slate-400">$</span>
                <input
                  type="number"
                  step={50000}
                  value={sueldoBruto}
                  onChange={(e) => onSueldoBrutoChange(Number(e.target.value))}
                  className="w-full bg-transparent pl-1 font-bold text-slate-900 focus:outline-none dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Aporte Voluntario APV Mensual
              </label>
              <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="text-sm text-slate-400">$</span>
                <input
                  type="number"
                  step={20000}
                  value={apvAporte}
                  onChange={(e) => onApvAporteChange(Number(e.target.value))}
                  className="w-full bg-transparent pl-1 font-bold text-slate-900 focus:outline-none dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Régimen Tributario APV
              </label>
              <select
                value={apvRegimen}
                onChange={(e) => onApvRegimenChange(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-sm focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="ninguno">Sin APV</option>
                <option value="A">Régimen A (+15% Bonificación Fiscal)</option>
                <option value="B">Régimen B (Rebaja de Impuesto a la Renta)</option>
              </select>
            </div>
          </div>

          {/* Tabla de Desglose */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Concepto Legal</th>
                  <th className="py-2.5 px-3">Tasa / Porcentaje</th>
                  <th className="py-2.5 px-3 text-right">Monto Mensual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-medium">Cotización Obligatoria AFP (Tu fondo)</td>
                  <td className="py-2 px-3 text-slate-500">10.0% (tope 84.3 UF)</td>
                  <td className="py-2 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                    +{formatMoney(breakdown.cotizacionAfp10, currencyMode, ufRate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Comisión Administradora AFP</td>
                  <td className="py-2 px-3 text-slate-500">~1.15%</td>
                  <td className="py-2 px-3 text-right text-red-500">
                    -{formatMoney(breakdown.comisionAfp, currencyMode, ufRate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Salud Legal (Fonasa / Isapre 7%)</td>
                  <td className="py-2 px-3 text-slate-500">7.0%</td>
                  <td className="py-2 px-3 text-right text-red-500">
                    -{formatMoney(breakdown.saludObligatoria, currencyMode, ufRate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Seguro de Cesantía (AFC)</td>
                  <td className="py-2 px-3 text-slate-500">0.6% (tope 126.6 UF)</td>
                  <td className="py-2 px-3 text-right text-red-500">
                    -{formatMoney(breakdown.seguroCesantia, currencyMode, ufRate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">
                    Impuesto Único 2da Categoría (SII)
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    Marginal: {formatPct(breakdown.tasaMarginalImpuestoPct)}
                  </td>
                  <td className="py-2 px-3 text-right text-red-600 font-semibold">
                    -{formatMoney(breakdown.impuestoSegundaCategoria, currencyMode, ufRate)}
                  </td>
                </tr>

                {apvAporte > 0 && (
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="py-2 px-3 font-semibold text-emerald-800 dark:text-emerald-300">
                      Beneficio Fiscal APV (Régimen {apvRegimen})
                    </td>
                    <td className="py-2 px-3 text-emerald-700 dark:text-emerald-400">
                      {apvRegimen === 'A' ? '+15% fiscal' : 'Ahorro impositivo'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      +{formatMoney(breakdown.apvBeneficioFiscalEstimado, currencyMode, ufRate)}
                    </td>
                  </tr>
                )}

                <tr className="bg-slate-100/80 font-bold dark:bg-slate-800 text-slate-900 dark:text-white">
                  <td className="py-2.5 px-3">Sueldo Líquido en Bolsillo</td>
                  <td className="py-2.5 px-3 text-slate-500 font-normal">
                    Efectivo: {formatPct(100 - breakdown.tasaEfectivaImpuestoPct - 18.75)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatMoney(breakdown.sueldoLiquido, currencyMode, ufRate)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Botón de sincronización con la calculadora principal */}
          <div className="flex justify-end">
            <button
              onClick={handleApply}
              className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Aplicar este Sueldo Líquido y Aportes a la Simulación FIRE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
