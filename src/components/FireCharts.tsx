'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
  Line,
} from 'recharts';
import { SimulationYearData } from '@/lib/fireEngine';
import { CurrencyMode, formatCompactMoney, formatMoney } from '@/lib/formatters';
import { TrendingUp, BarChart3, Baby } from 'lucide-react';

interface FireChartsProps {
  data: SimulationYearData[];
  currencyMode: CurrencyMode;
  ufRate: number;
  edadActual: number;
  edadFire: number | null;
  edadLegal: number;
  metaFire: number;
  tieneHijos: boolean;
}

export function FireCharts({
  data,
  currencyMode,
  ufRate,
  edadFire,
  edadLegal,
  tieneHijos,
}: FireChartsProps) {
  const [activeTab, setActiveTab] = useState<'acumulacion' | 'flujos' | 'hijos'>(
    'acumulacion'
  );

  const formatYAxis = (val: number) => {
    return formatCompactMoney(val, currencyMode, ufRate);
  };

  const customTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: readonly { payload?: SimulationYearData }[];
    label?: string | number;
  }) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const yearData: SimulationYearData = payload[0].payload;
      return (
        <div className="min-w-[220px] rounded-xl border border-black/[0.08] bg-white/95 p-4 text-xs shadow-[0_4px_20px_rgba(10,10,10,0.08)] backdrop-blur-md dark:border-white/[0.1] dark:bg-[#1a1a19]/95 space-y-2">
          <div className="flex items-center justify-between border-b border-black/[0.05] pb-2 dark:border-white/[0.06]">
            <span className="font-semibold text-[#0a0a0a] dark:text-white">
              Edad: {label} años
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-medium ${
                yearData.fase === 'trabajando'
                  ? 'border border-black/[0.08] bg-[#fafaf8] text-neutral-600 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300'
                  : yearData.fase === 'puente_fire'
                  ? 'border border-emerald-600/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border border-blue-600/20 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {yearData.fase === 'trabajando'
                ? 'Activo'
                : yearData.fase === 'puente_fire'
                ? 'Puente FIRE'
                : 'Pensión Legal'}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Portafolio Libre:
              </span>
              <span className="font-semibold tabular-nums text-[#0a0a0a] dark:text-white">
                {formatMoney(yearData.patrimonioLiquido, currencyMode, ufRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Fondo AFP:
              </span>
              <span className="font-semibold tabular-nums text-[#0a0a0a] dark:text-white">
                {formatMoney(yearData.patrimonioAfp, currencyMode, ufRate)}
              </span>
            </div>
            <div className="flex justify-between border-t border-black/[0.05] pt-1.5 font-semibold dark:border-white/[0.06]">
              <span className="text-neutral-800 dark:text-neutral-200">
                Patrimonio Total:
              </span>
              <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatMoney(yearData.patrimonioTotal, currencyMode, ufRate)}
              </span>
            </div>

            {yearData.gastoHijosAnual > 0 && (
              <div className="flex justify-between text-amber-700 dark:text-amber-400 pt-0.5 text-[11px]">
                <span>Crianza Hijos:</span>
                <span className="tabular-nums">
                  {formatMoney(yearData.gastoHijosAnual, currencyMode, ufRate)}/año
                </span>
              </div>
            )}

            {yearData.pensionAnualAfp > 0 && (
              <div className="flex justify-between text-blue-700 dark:text-blue-400 pt-0.5 text-[11px]">
                <span>Pensión AFP + PGU:</span>
                <span className="tabular-nums">
                  {formatMoney(
                    yearData.pensionAnualAfp + yearData.pguAnual,
                    currencyMode,
                    ufRate
                  )}
                  /año
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
      {/* Header y Selector de Pestañas */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            Visualización
          </span>
          <h3 className="text-[15px] font-semibold tracking-tight text-[#0a0a0a] dark:text-white mt-0.5">
            Proyección de Jubilación y Curva Patrimonial
          </h3>
        </div>

        <div className="flex items-center rounded-full border border-black/[0.08] bg-[#f5f4f2] p-0.5 text-xs font-medium dark:border-white/[0.1] dark:bg-neutral-800">
          <button
            onClick={() => setActiveTab('acumulacion')}
            className={`flex items-center space-x-1.5 rounded-full px-3 py-1 transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'acumulacion'
                ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Patrimonio y Cruce</span>
          </button>
          <button
            onClick={() => setActiveTab('flujos')}
            className={`flex items-center space-x-1.5 rounded-full px-3 py-1 transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'flujos'
                ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Flujos Anuales</span>
          </button>
          {tieneHijos && (
            <button
              onClick={() => setActiveTab('hijos')}
              className={`flex items-center space-x-1.5 rounded-full px-3 py-1 transition-all duration-150 active:scale-[0.98] ${
                activeTab === 'hijos'
                  ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                  : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Baby className="h-3.5 w-3.5" />
              <span>Gasto Crianza</span>
            </button>
          )}
        </div>
      </div>

      {/* Gráfico 1: Acumulación de Patrimonio y Meta FIRE */}
      {activeTab === 'acumulacion' && (
        <div className="space-y-4">
          <div className="h-[370px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 14, right: 14, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLiquid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAfp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eae9e5"
                  className="dark:stroke-neutral-800"
                />
                <XAxis
                  dataKey="edad"
                  tickLine={false}
                  tickFormatter={(val) => `${val}a`}
                  className="text-xs text-neutral-400"
                />
                <YAxis
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  className="text-xs text-neutral-400 font-mono"
                  width={68}
                />
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />

                {edadFire && (
                  <ReferenceLine
                    x={edadFire}
                    stroke="#059669"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    label={{
                      value: `Libertad FIRE (${edadFire}a)`,
                      position: 'top',
                      fill: '#059669',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                )}

                <ReferenceLine
                  x={edadLegal}
                  stroke="#737373"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  label={{
                    value: `Pensión Legal (${edadLegal}a)`,
                    position: 'insideTopLeft',
                    fill: '#737373',
                    fontSize: 10,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="patrimonioLiquido"
                  name="Portafolio Libre (Puente)"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLiquid)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="patrimonioAfp"
                  name="Fondo AFP Obligatorio"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAfp)"
                  stackId="1"
                />
                <Line
                  type="monotone"
                  dataKey="metaFireTradicional"
                  name="Meta 100% Independiente"
                  stroke="#d97706"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/[0.05] bg-[#fafaf8] p-3 text-xs text-neutral-600 dark:border-white/[0.06] dark:bg-neutral-800/40 dark:text-neutral-400">
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
              <span>
                <strong>Portafolio Libre:</strong> Disponible en cualquier momento para el puente FIRE.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
              <span>
                <strong>Fondo AFP:</strong> Crece con rentabilidad y se desbloquea a los {edadLegal} años.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico 2: Flujos Anuales por Fase */}
      {activeTab === 'flujos' && (
        <div className="space-y-4">
          <div className="h-[370px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 14, right: 14, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eae9e5"
                  className="dark:stroke-neutral-800"
                />
                <XAxis
                  dataKey="edad"
                  tickLine={false}
                  tickFormatter={(val) => `${val}a`}
                />
                <YAxis
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  width={68}
                />
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />

                <Bar
                  dataKey="ahorroAnualLiquido"
                  name="Ahorro Libre Anual"
                  fill="#059669"
                  stackId="ingresos"
                />
                <Bar
                  dataKey="aporteAfpAnual"
                  name="Aporte AFP + APV"
                  fill="#2563eb"
                  stackId="ingresos"
                />
                <Bar
                  dataKey="pensionAnualAfp"
                  name="Pensión AFP"
                  fill="#6366f1"
                  stackId="pension"
                />
                <Bar
                  dataKey="pguAnual"
                  name="PGU Estatal"
                  fill="#ec4899"
                  stackId="pension"
                />
                <Bar
                  dataKey="gastoHijosAnual"
                  name="Gasto Crianza Hijos"
                  fill="#d97706"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Observa el traspaso entre la etapa de acumulación activa con sueldo, la etapa puente sustentada por retiros del portafolio libre, y la posterior pensión autofinanciada.
          </p>
        </div>
      )}

      {/* Gráfico 3: Impacto Crianza */}
      {activeTab === 'hijos' && tieneHijos && (
        <div className="space-y-4">
          <div className="h-[370px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 14, right: 14, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eae9e5"
                  className="dark:stroke-neutral-800"
                />
                <XAxis
                  dataKey="edad"
                  tickLine={false}
                  tickFormatter={(val) => `${val}a`}
                />
                <YAxis
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  width={68}
                />
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />

                <Area
                  type="monotone"
                  dataKey="gastoHijosAnual"
                  name="Gasto Anual en Crianza"
                  stroke="#d97706"
                  fill="#d97706"
                  fillOpacity={0.25}
                />
                <Area
                  type="monotone"
                  dataKey="gastoBaseAnual"
                  name="Gasto de Vida Base"
                  stroke="#a3a3a3"
                  fill="#a3a3a3"
                  fillOpacity={0.06}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            La curva dorada muestra la concentración de gastos durante la crianza (0-23 años del hijo), tras lo cual se libera ese flujo de efectivo.
          </p>
        </div>
      )}
    </div>
  );
}
