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
        <div className="min-w-[240px] border-2 border-black bg-white p-4 text-xs font-mono shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[4px_4px_0px_0px_#fff] space-y-2.5">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 dark:border-zinc-800">
            <span className="font-bold text-black dark:text-white uppercase">
              Edad: {label} años
            </span>
            <span
              className={`border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000] dark:border-zinc-200 ${
                yearData.fase === 'trabajando'
                  ? 'bg-neutral-100 text-black dark:bg-zinc-800 dark:text-zinc-200'
                  : yearData.fase === 'puente_fire'
                  ? 'bg-[#facc15] text-black'
                  : 'bg-blue-100 text-blue-950 dark:bg-blue-900 dark:text-blue-100'
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
              <span className="text-neutral-500 dark:text-neutral-400">
                Portafolio Libre:
              </span>
              <span className="font-bold tabular-nums text-black dark:text-white">
                {formatMoney(yearData.patrimonioLiquido, currencyMode, ufRate)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Fondo AFP:
              </span>
              <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {formatMoney(yearData.patrimonioAfp, currencyMode, ufRate)}
              </span>
            </div>

            <div className="flex justify-between border-t border-black/10 pt-1.5 dark:border-zinc-800">
              <span className="font-bold text-black dark:text-white">
                Patrimonio Total:
              </span>
              <span className="font-black tabular-nums text-black dark:text-white">
                {formatMoney(yearData.patrimonioTotal, currencyMode, ufRate)}
              </span>
            </div>

            {yearData.fase !== 'trabajando' && (
              <div className="flex justify-between border-t border-dashed border-black/20 pt-1 text-[11px] text-amber-700 dark:text-amber-400 dark:border-zinc-800">
                <span>Retiro Anual:</span>
                <span className="font-bold tabular-nums">
                  {formatMoney(yearData.retiroAnualPortafolio, currencyMode, ufRate)}
                </span>
              </div>
            )}

            {yearData.fase === 'retiro_legal' && (
              <div className="flex justify-between text-[11px] text-blue-700 dark:text-blue-400">
                <span>Pensión AFP + PGU:</span>
                <span className="font-bold tabular-nums">
                  {formatMoney(yearData.pensionAnualAfp + yearData.pguAnual, currencyMode, ufRate)}/año
                </span>
              </div>
            )}

            {yearData.gastoHijosAnual > 0 && (
              <div className="flex justify-between text-[11px] text-orange-700 dark:text-orange-400">
                <span>Gasto Crianza:</span>
                <span className="font-bold tabular-nums">
                  {formatMoney(yearData.gastoHijosAnual, currencyMode, ufRate)}
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
    <div className="relative border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#facc15] space-y-5">
      {/* Selector de Vistas y Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black/10 pb-4 dark:border-zinc-800">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            [ SIMULACIÓN DINÁMICA ]
          </span>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-black dark:text-white uppercase font-sans">
            Proyección de Jubilación y Curva Patrimonial
          </h3>
        </div>

        {/* Tab Controls Brutalistas */}
        <div className="flex items-center border-2 border-black bg-white p-0.5 text-[11px] sm:text-xs font-mono font-bold shadow-[1.5px_1.5px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:shadow-[1.5px_1.5px_0px_0px_#fff] sm:dark:shadow-[2px_2px_0px_0px_#fff]">
          <button
            type="button"
            onClick={() => setActiveTab('acumulacion')}
            className={`flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1.5 transition-all ${
              activeTab === 'acumulacion'
                ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                : 'text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white border-2 border-transparent'
            }`}
          >
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Patrimonio y Cruce</span>
            <span className="sm:hidden">Patrimonio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flujos')}
            className={`flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1.5 transition-all ${
              activeTab === 'flujos'
                ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                : 'text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white border-2 border-transparent'
            }`}
          >
            <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Flujos Anuales</span>
            <span className="sm:hidden">Flujos</span>
          </button>

          {tieneHijos && (
            <button
              type="button"
              onClick={() => setActiveTab('hijos')}
              className={`flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1.5 transition-all ${
                activeTab === 'hijos'
                  ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white border-2 border-transparent'
              }`}
            >
              <Baby className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Gasto Crianza</span>
              <span className="sm:hidden">Crianza</span>
            </button>
          )}
        </div>
      </div>

      {/* Gráfico 1: Acumulación de Patrimonio y Meta FIRE */}
      {activeTab === 'acumulacion' && (
        <div className="space-y-4">
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 16, left: 16, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorLiquid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorAfp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#e4e4e7"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="edad"
                  tickLine={true}
                  tickFormatter={(val) => `${val}a`}
                  className="text-xs font-mono font-bold"
                  stroke="#71717a"
                />
                <YAxis
                  tickLine={true}
                  tickFormatter={formatYAxis}
                  className="text-xs font-mono font-bold"
                  width={82}
                  stroke="#71717a"
                />
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    paddingTop: '12px',
                  }}
                />

                {edadFire && (
                  <ReferenceLine
                    x={edadFire}
                    stroke="#059669"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: `★ LIBERTAD FIRE (${edadFire}a)`,
                      position: 'top',
                      fill: '#059669',
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'monospace',
                    }}
                  />
                )}

                <ReferenceLine
                  x={edadLegal}
                  stroke="#71717a"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{
                    value: `LEGAL (${edadLegal}a)`,
                    position: 'insideTopLeft',
                    fill: '#71717a',
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="patrimonioLiquido"
                  name="Portafolio Libre (Puente)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLiquid)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="patrimonioAfp"
                  name="Fondo AFP Obligatorio"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAfp)"
                  stackId="1"
                />
                <Line
                  type="monotone"
                  dataKey="metaFireTradicional"
                  name="Meta 100% Independiente"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-2 border-black bg-neutral-50 p-3 text-xs font-mono font-bold dark:border-zinc-200 dark:bg-zinc-950 dark:text-neutral-300 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            <div className="flex items-center space-x-2">
              <span className="inline-block h-3 w-3 border border-black bg-emerald-500" />
              <span>
                PORTAFOLIO LIBRE: Disponible para financiar la etapa puente antes de los {edadLegal} años.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-3 w-3 border border-black bg-blue-500" />
              <span>
                FONDO AFP: Se desbloquea por ley a los {edadLegal} años con rentas y PGU.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico 2: Flujos Anuales por Fase */}
      {activeTab === 'flujos' && (
        <div className="space-y-4">
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 16, left: 16, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#e4e4e7"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="edad"
                  tickLine={true}
                  tickFormatter={(val) => `${val}a`}
                  className="text-xs font-mono font-bold"
                  stroke="#71717a"
                />
                <YAxis
                  tickLine={true}
                  tickFormatter={formatYAxis}
                  width={82}
                  className="text-xs font-mono font-bold"
                  stroke="#71717a"
                />
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    paddingTop: '12px',
                  }}
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

          <p className="border-2 border-black bg-neutral-50 p-2.5 text-xs font-mono font-medium text-neutral-700 dark:border-zinc-200 dark:bg-zinc-950 dark:text-neutral-300 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            Visualiza la transición financiera: acumulación activa mediante sueldo, puente de retiros privados, y retiro programado legal indexado.
          </p>
        </div>
      )}

      {/* Gráfico 3: Impacto Crianza */}
      {activeTab === 'hijos' && tieneHijos && (
        <div className="space-y-4">
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 16, left: 16, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#e4e4e7"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="edad"
                  tickLine={true}
                  tickFormatter={(val) => `${val}a`}
                  className="text-xs font-mono font-bold"
                  stroke="#71717a"
                />
                <YAxis
                  tickLine={true}
                  tickFormatter={formatYAxis}
                  width={82}
                  className="text-xs font-mono font-bold"
                  stroke="#71717a"
                />
                <Tooltip content={customTooltip} />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    paddingTop: '12px',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="gastoHijosAnual"
                  name="Gasto Anual en Crianza"
                  stroke="#d97706"
                  fill="#facc15"
                  strokeWidth={2}
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="gastoBaseAnual"
                  name="Gasto de Vida Base"
                  stroke="#71717a"
                  fill="#a1a1aa"
                  strokeWidth={1.5}
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="border-2 border-black bg-neutral-50 p-2.5 text-xs font-mono font-medium text-neutral-700 dark:border-zinc-200 dark:bg-zinc-950 dark:text-neutral-300 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            Concentración de costos por etapas de desarrollo (sala cuna, colegio y universidad) que luego retornan al flujo de ahorro.
          </p>
        </div>
      )}
    </div>
  );
}
