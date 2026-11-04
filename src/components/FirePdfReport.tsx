'use client';

import React, { useState, useEffect } from 'react';
import { FireSimulationResult, FireSimulationInput, SimulationYearData } from '@/lib/fireEngine';
import { CurrencyMode, formatCompactMoney, formatMoney, formatPct } from '@/lib/formatters';
import { Sparkles, Printer, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react';

interface FirePdfReportProps {
  result: FireSimulationResult;
  input: FireSimulationInput;
  currencyMode: CurrencyMode;
  ufRate: number;
}

/**
 * Gráfico Vectorial SVG ultra nítido y 100% compatible con impresión PDF.
 * No depende de ResizeObserver ni de Recharts para evitar desbordes o colapsos en @media print.
 */
function PdfProjectionChart({
  data,
  metaFire,
  edadFire,
  edadLegal,
  currencyMode,
  ufRate,
}: {
  data: SimulationYearData[];
  metaFire: number;
  edadFire: number | null;
  edadLegal: number;
  currencyMode: CurrencyMode;
  ufRate: number;
}) {
  if (!data || data.length === 0) return null;

  const minAge = data[0].edad;
  const maxAge = data[data.length - 1].edad;

  const maxPatrimonioVal = Math.max(
    ...data.map((d) => d.patrimonioTotal),
    metaFire
  );
  const maxY = maxPatrimonioVal * 1.08;

  const width = 700;
  const height = 180;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 16;
  const padBottom = 24;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (age: number) => {
    return padLeft + ((age - minAge) / (maxAge - minAge)) * chartW;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxY));
    return padTop + chartH - (clamped / maxY) * chartH;
  };

  const liquidPoints = data
    .map((d) => `${getX(d.edad).toFixed(1)},${getY(d.patrimonioLiquido).toFixed(1)}`)
    .join(' ');
  const liquidAreaPath = `M ${getX(minAge)},${getY(0)} L ${liquidPoints} L ${getX(maxAge)},${getY(0)} Z`;

  const afpPoints = data
    .map((d) => `${getX(d.edad).toFixed(1)},${getY(d.patrimonioAfp).toFixed(1)}`)
    .join(' ');
  const afpAreaPath = `M ${getX(minAge)},${getY(0)} L ${afpPoints} L ${getX(maxAge)},${getY(0)} Z`;

  const totalLinePoints = data
    .map((d) => `${getX(d.edad).toFixed(1)},${getY(d.patrimonioTotal).toFixed(1)}`)
    .join(' ');

  const ageTicks: number[] = [];
  const startTick = Math.ceil(minAge / 10) * 10;
  for (let a = startTick; a <= maxAge; a += 10) {
    ageTicks.push(a);
  }

  const yTicks = [
    0,
    maxPatrimonioVal * 0.33,
    maxPatrimonioVal * 0.66,
    maxPatrimonioVal,
  ];

  return (
    <div className="w-full bg-[#fafaf8] border border-neutral-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between border-b border-neutral-200/70 pb-1.5 px-1">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Proyección Patrimonial en el Tiempo (Cruce FIRE)
        </span>
        <div className="flex items-center space-x-3 text-[9.5px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-[#0a0a0a]" />
            <span className="text-neutral-700">Patrimonio Total</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-emerald-800">Portafolio Libre</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-blue-800">Fondo AFP</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-0.5 w-3 bg-rose-600 border-b border-dashed border-rose-600" />
            <span className="text-rose-700">Meta FIRE</span>
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        style={{ maxHeight: '185px' }}
      >
        <defs>
          <linearGradient id="pdfGradLiquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="pdfGradAfp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Eje Y y líneas horizontales */}
        {yTicks.map((yVal, i) => {
          const yPos = getY(yVal);
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={padLeft + chartW}
                y2={yPos}
                stroke="#e5e5e5"
                strokeDasharray="3 3"
                strokeWidth="0.8"
              />
              <text
                x={padLeft - 6}
                y={yPos + 3}
                textAnchor="end"
                className="font-mono text-[8.5px] fill-neutral-400"
              >
                {formatCompactMoney(yVal, currencyMode, ufRate)}
              </text>
            </g>
          );
        })}

        {/* Eje X y líneas verticales */}
        {ageTicks.map((age, i) => {
          const xPos = getX(age);
          return (
            <g key={i}>
              <line
                x1={xPos}
                y1={padTop}
                x2={xPos}
                y2={padTop + chartH}
                stroke="#ededeb"
                strokeWidth="0.8"
              />
              <text
                x={xPos}
                y={padTop + chartH + 13}
                textAnchor="middle"
                className="font-mono text-[9px] fill-neutral-500"
              >
                {age}a
              </text>
            </g>
          );
        })}

        {/* Curvas de áreas */}
        <path d={liquidAreaPath} fill="url(#pdfGradLiquid)" />
        <polyline points={liquidPoints} fill="none" stroke="#059669" strokeWidth="1.2" strokeOpacity="0.85" />

        <path d={afpAreaPath} fill="url(#pdfGradAfp)" />
        <polyline points={afpPoints} fill="none" stroke="#2563eb" strokeWidth="1.2" strokeOpacity="0.85" />

        {/* Línea Total */}
        <polyline points={totalLinePoints} fill="none" stroke="#0a0a0a" strokeWidth="2.2" />

        {/* Meta FIRE (Horizontal roja) */}
        {metaFire > 0 && (
          <g>
            <line
              x1={padLeft}
              y1={getY(metaFire)}
              x2={padLeft + chartW}
              y2={getY(metaFire)}
              stroke="#e11d48"
              strokeDasharray="4 3"
              strokeWidth="1.2"
            />
            <rect
              x={padLeft + chartW - 130}
              y={getY(metaFire) - 13}
              width="128"
              height="12"
              fill="#ffffff"
              opacity="0.92"
              rx="2"
            />
            <text
              x={padLeft + chartW - 4}
              y={getY(metaFire) - 3.5}
              textAnchor="end"
              className="font-mono text-[8px] font-bold fill-rose-600"
            >
              Meta FIRE: {formatCompactMoney(metaFire, currencyMode, ufRate)}
            </text>
          </g>
        )}

        {/* Cruce FIRE vertical */}
        {edadFire && edadFire >= minAge && edadFire <= maxAge && (
          <g>
            <line
              x1={getX(edadFire)}
              y1={padTop}
              x2={getX(edadFire)}
              y2={padTop + chartH}
              stroke="#059669"
              strokeDasharray="3 3"
              strokeWidth="1.3"
            />
            <text
              x={getX(edadFire)}
              y={padTop + 7}
              textAnchor="middle"
              className="font-mono text-[8px] font-bold fill-emerald-800"
            >
              FIRE {edadFire}a
            </text>
          </g>
        )}

        {/* Pensión Legal vertical */}
        {edadLegal >= minAge && edadLegal <= maxAge && (
          <g>
            <line
              x1={getX(edadLegal)}
              y1={padTop}
              x2={getX(edadLegal)}
              y2={padTop + chartH}
              stroke="#2563eb"
              strokeDasharray="3 3"
              strokeWidth="1.3"
            />
            <text
              x={getX(edadLegal)}
              y={padTop + 7}
              textAnchor="middle"
              className="font-mono text-[8px] font-bold fill-blue-800"
            >
              AFP {edadLegal}a
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function FirePdfReport({
  result,
  input,
  currencyMode,
  ufRate,
}: FirePdfReportProps) {
  const edadFire = result.edadFirePuente;
  const anosRestantes = result.anosHastaFire;
  const [reportDate, setReportDate] = useState<string>('Noviembre 2026');

  useEffect(() => {
    try {
      setReportDate(
        new Date().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    } catch {
      // Fallback
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      {/* Botón / Disparador en pantalla (se oculta al imprimir) */}
      <div className="print:hidden rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-black/[0.08] bg-[#fafaf8] px-3 py-0.5 text-[11px] font-mono uppercase text-neutral-600 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300">
            <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span>Documento Personalizado</span>
          </div>
          <h3 className="text-base font-semibold text-[#0a0a0a] dark:text-white tracking-tight">
            Descarga tu Hoja de Ruta hacia la Libertad Financiera
          </h3>
          <p className="text-xs text-neutral-500 max-w-lg leading-relaxed">
            Genera un reporte ejecutivo en PDF con tus números clave, gráfico de proyección, estrategia de dos fases (Puente + AFP), cronograma familiar y compromisos de ahorro.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex shrink-0 items-center space-x-2 rounded-full bg-[#0a0a0a] px-5 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-neutral-200"
        >
          <Printer className="h-4 w-4" />
          <span>Guardar Reporte en PDF</span>
        </button>
      </div>

      {/* PLANTILLA EXCLUSIVA PARA EL REPORTE PDF (Solo visible al imprimir o exportar a PDF) */}
      <div className="hidden print:block font-sans text-[#0a0a0a] bg-white w-full max-w-full mx-auto space-y-4">
        {/* Cabecera / Portada */}
        <div className="border-b-2 border-[#0a0a0a] pb-4 flex items-start justify-between break-inside-avoid">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-md bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-xs">
                DT
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0a0a0a]">
                DIVIDENDO DE TIEMPO
              </span>
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest pl-2 border-l border-neutral-300">
                PLAN FIRE CHILE
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#0a0a0a] pt-1">
              HOJA DE RUTA PARA LA LIBERTAD FINANCIERA
            </h1>
            <p className="text-xs italic text-neutral-600 font-serif">
              &ldquo;El mayor dividendo que podemos obtener del dinero es el tiempo.&rdquo;
            </p>
          </div>

          <div className="text-right font-mono text-[9.5px] text-neutral-500 space-y-0.5">
            <div>Fecha: {reportDate}</div>
            <div>Moneda: {currencyMode} (Ref. 1 UF = ${ufRate.toLocaleString('es-CL')})</div>
            <div>Horizonte actuarial: 90 años</div>
          </div>
        </div>

        {/* Cifras Maestras (KPIs) - Con diseño anti-colapso */}
        <div className="grid grid-cols-4 gap-3 py-1 border-b border-neutral-200 pb-4 break-inside-avoid">
          {/* Card 1: Edad FIRE */}
          <div className="bg-[#fafaf8] border border-neutral-200/90 rounded-xl p-3 flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Edad de Libertad (FIRE)
            </span>
            <div className="mt-1.5">
              <div className="text-[18px] font-extrabold tabular-nums tracking-tight text-[#0a0a0a] whitespace-nowrap">
                {edadFire ? `${edadFire} años` : 'Ajustar ahorro'}
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5 whitespace-nowrap">
                {anosRestantes !== null ? `En ${anosRestantes} años de ahorro` : 'Plan en progreso'}
              </span>
            </div>
          </div>

          {/* Card 2: Meta Patrimonial */}
          <div className="bg-[#fafaf8] border border-neutral-200/90 rounded-xl p-3 flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Meta Patrimonial (Regla 4%)
            </span>
            <div className="mt-1.5">
              <div className="text-[18px] font-extrabold tabular-nums tracking-tight text-[#0a0a0a] whitespace-nowrap">
                {formatCompactMoney(result.metaPatrimonioFire, currencyMode, ufRate)}
              </div>
              <span className="text-[9.5px] text-neutral-500 block mt-0.5 whitespace-nowrap font-mono">
                {formatMoney(result.metaPatrimonioFire, currencyMode, ufRate)}
              </span>
            </div>
          </div>

          {/* Card 3: Tasa de Ahorro */}
          <div className="bg-[#fafaf8] border border-neutral-200/90 rounded-xl p-3 flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Tasa de Ahorro Actual
            </span>
            <div className="mt-1.5">
              <div className="text-[18px] font-extrabold tabular-nums tracking-tight text-emerald-700 whitespace-nowrap">
                {formatPct(result.tasaAhorroActualPct)}
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5 whitespace-nowrap">
                Del ingreso neto + leyes soc.
              </span>
            </div>
          </div>

          {/* Card 4: Pensión Legal */}
          <div className="bg-[#fafaf8] border border-neutral-200/90 rounded-xl p-3 flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Pensión Legal (AFP + PGU)
            </span>
            <div className="mt-1.5">
              <div className="text-[18px] font-extrabold tabular-nums tracking-tight text-blue-700 whitespace-nowrap">
                {result.edadLegalRetiro} años
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5 whitespace-nowrap">
                Activación pensión AFP
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico Vectorial de Proyección */}
        <div className="break-inside-avoid">
          <PdfProjectionChart
            data={result.trayectoriaAnual}
            metaFire={result.metaPatrimonioFire}
            edadFire={edadFire}
            edadLegal={result.edadLegalRetiro}
            currencyMode={currencyMode}
            ufRate={ufRate}
          />
        </div>

        {/* El Modelo Chileno de Dos Fases */}
        <div className="py-2 border-b border-neutral-200 pb-4 space-y-2.5 break-inside-avoid">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
            Estrategia de Ejecución en Dos Fases (Modelo Chileno)
          </h2>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#fafaf8] border border-neutral-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <h3 className="font-bold text-[12px] text-[#0a0a0a]">
                  FASE 1: El Puente Líquido ({edadFire ?? 40} a {result.edadLegalRetiro} años)
                </h3>
              </div>
              <p className="text-[10.5px] text-neutral-600 leading-relaxed">
                Durante este período tu costo de vida ({formatMoney(input.gastoMensualRetiro, currencyMode, ufRate)}/mes) será financiado <strong>exclusivamente por retiros de tu portafolio libre</strong> (acciones, ETFs globales, Cuenta 2). Tu fondo AFP no se toca y continúa capitalizando con rentabilidad compuesta.
              </p>
              <div className="text-[9.5px] font-mono text-neutral-500 pt-0.5">
                Portafolio libre actual: {formatMoney(input.patrimonioLiquidoInicial, currencyMode, ufRate)}
              </div>
            </div>

            <div className="bg-[#fafaf8] border border-neutral-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <h3 className="font-bold text-[12px] text-[#0a0a0a]">
                  FASE 2: Pensión Legal ({result.edadLegalRetiro} años en adelante)
                </h3>
              </div>
              <p className="text-[10.5px] text-neutral-600 leading-relaxed">
                Al cumplir la edad legal, tu fondo acumulado en AFP se transforma en pensión mensual autofinanciada, complementada por la PGU estatal. Esto disminuye drásticamente la exigencia sobre tu portafolio libre, blindando tu longevidad.
              </p>
              <div className="text-[9.5px] font-mono text-neutral-500 pt-0.5">
                Saldo AFP actual: {formatMoney(input.saldoAfpInicial, currencyMode, ufRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Familiar (si aplica) */}
        {input.hijos.length > 0 && (
          <div className="py-2 border-b border-neutral-200 pb-3 space-y-1.5 break-inside-avoid">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Cronograma Familiar e Hijos
            </h2>
            <div className="border border-neutral-200 rounded-xl p-3 text-[10.5px] space-y-1 bg-amber-50/30">
              <div className="flex justify-between font-semibold text-[#0a0a0a]">
                <span>Impacto en la fecha FIRE:</span>
                <span className="text-amber-800">+{result.impactoHijos.diferenciaAnosFire} años de trabajo</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Inversión total proyectada en crianza (hasta los 24 años):</span>
                <span className="font-semibold text-neutral-900">{formatMoney(result.impactoHijos.gastoTotalHijosVida, currencyMode, ufRate)}</span>
              </div>
              <p className="text-[9.5px] text-neutral-500 pt-0.5">
                El gasto cesa automáticamente al cumplir el hijo los 24 años (independencia económica), liberando ese flujo de caja.
              </p>
            </div>
          </div>
        )}

        {/* Reglas de Oro para Alcanzar tu Meta */}
        <div className="py-2 border-b border-neutral-200 pb-3 space-y-2 break-inside-avoid">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
            Los 3 Mandamientos de tu Retiro en Chile
          </h2>
          <div className="space-y-1 text-[10.5px] text-neutral-700">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-neutral-900">1.</span>
              <span><strong>Evita la inflación de estilo de vida:</strong> Cuando tus ingresos aumenten ({input.crecimientoIngresoRealPct}% real anual proyectado), destina al menos el 70% de cada aumento directamente al ahorro e inversión libre.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-neutral-900">2.</span>
              <span><strong>Optimiza tu tributación con APV:</strong> Aprovecha la bonificación del 15% (Régimen A) si tu tasa marginal es menor al 15%, o la rebaja de base imponible (Régimen B) si estás en tramos altos del SII.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-neutral-900">3.</span>
              <span><strong>Paciencia y consistencia:</strong> El interés compuesto requiere tiempo. Los primeros 5 años parecen lentos; entre los años 10 y 15 el crecimiento de los rendimientos superará tus aportes anuales.</span>
            </div>
          </div>
        </div>

        {/* Firma y Compromiso */}
        <div className="pt-4 flex items-end justify-between break-inside-avoid">
          <div className="space-y-1">
            <div className="h-8 w-44 border-b border-neutral-400" />
            <span className="font-mono text-[9.5px] text-neutral-500 block">
              Firma de Compromiso Personal
            </span>
          </div>

          <div className="text-right text-[9.5px] text-neutral-400 font-mono">
            Documento generado en dividendo-de-tiempo.cl · Plataforma FIRE Chile
          </div>
        </div>
      </div>
    </>
  );
}
