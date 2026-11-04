'use client';

import React, { useState, useEffect } from 'react';
import { FireSimulationResult, FireSimulationInput } from '@/lib/fireEngine';
import { CurrencyMode, formatMoney, formatPct } from '@/lib/formatters';
import { Clock, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, Download, Printer } from 'lucide-react';

interface FirePdfReportProps {
  result: FireSimulationResult;
  input: FireSimulationInput;
  currencyMode: CurrencyMode;
  ufRate: number;
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
      {/* Botón flotante / disparador en pantalla normal (se oculta al imprimir) */}
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
            Genera un reporte ejecutivo en PDF con tus números clave, estrategia de dos fases (Puente + AFP), cronograma familiar y compromisos de ahorro.
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
      <div className="hidden print:block font-sans text-[#0a0a0a] bg-white p-8 max-w-4xl mx-auto">
        {/* Cabecera / Portada */}
        <div className="border-b-2 border-[#0a0a0a] pb-6 flex items-start justify-between">
          <div className="space-y-1.5">
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
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0a0a0a] pt-2">
              HOJA DE RUTA PARA LA LIBERTAD FINANCIERA
            </h1>
            <p className="text-xs italic text-neutral-600 font-serif">
              &ldquo;El mayor dividendo que podemos obtener del dinero es el tiempo.&rdquo;
            </p>
          </div>

          <div className="text-right font-mono text-[10px] text-neutral-500 space-y-0.5">
            <div>Fecha: {reportDate}</div>
            <div>Moneda base: {currencyMode} (Ref. 1 UF = ${ufRate.toLocaleString('es-CL')})</div>
            <div>Horizonte actuarial: 90 años</div>
          </div>
        </div>

        {/* Cifras Maestras (KPIs) */}
        <div className="grid grid-cols-4 gap-4 py-6 border-b border-neutral-200">
          <div className="border border-neutral-200 rounded-lg p-3">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 block">
              Edad de Libertad (FIRE)
            </span>
            <div className="text-2xl font-extrabold tabular-nums text-[#0a0a0a] mt-1">
              {edadFire ? `${edadFire} años` : 'Ajustar ahorro'}
            </div>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              {anosRestantes !== null ? `En ${anosRestantes} años de acumulación` : 'Plan en progreso'}
            </span>
          </div>

          <div className="border border-neutral-200 rounded-lg p-3">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 block">
              Meta Patrimonial (Regla 4%)
            </span>
            <div className="text-xl font-extrabold tabular-nums text-[#0a0a0a] mt-1">
              {formatMoney(result.metaPatrimonioFire, currencyMode, ufRate)}
            </div>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              Capital para vivir de rentas
            </span>
          </div>

          <div className="border border-neutral-200 rounded-lg p-3">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 block">
              Tasa de Ahorro Actual
            </span>
            <div className="text-xl font-extrabold tabular-nums text-emerald-700 mt-1">
              {formatPct(result.tasaAhorroActualPct)}
            </div>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              Del ingreso líquido + leyes sociales
            </span>
          </div>

          <div className="border border-neutral-200 rounded-lg p-3">
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 block">
              Pensión Legal (AFP + PGU)
            </span>
            <div className="text-xl font-extrabold tabular-nums text-blue-700 mt-1">
              {result.edadLegalRetiro} años
            </div>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              Activación de pensión legal
            </span>
          </div>
        </div>

        {/* El Modelo Chileno de Dos Fases */}
        <div className="py-5 border-b border-neutral-200 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Estrategia de Ejecución en Dos Fases (Modelo Chileno)
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <h3 className="font-bold text-xs text-[#0a0a0a]">
                  FASE 1: El Puente Líquido ({edadFire ?? 40} a {result.edadLegalRetiro} años)
                </h3>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Durante este período tu costo de vida ({formatMoney(input.gastoMensualRetiro, currencyMode, ufRate)}/mes) será financiado <strong>exclusivamente por retiros de tu portafolio libre</strong> (acciones, ETFs globales, Cuenta 2). Tu fondo AFP no se toca y continúa capitalizando con rentabilidad compuesta.
              </p>
              <div className="text-[10px] font-mono text-neutral-500 pt-1">
                Portafolio libre inicial: {formatMoney(input.patrimonioLiquidoInicial, currencyMode, ufRate)}
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <h3 className="font-bold text-xs text-[#0a0a0a]">
                  FASE 2: Pensión Legal ({result.edadLegalRetiro} años en adelante)
                </h3>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Al cumplir la edad legal, tu fondo acumulado en AFP se transforma en pensión mensual autofinanciada, complementada por la PGU estatal. Esto disminuye la exigencia sobre tu portafolio libre, blindando tu longevidad.
              </p>
              <div className="text-[10px] font-mono text-neutral-500 pt-1">
                Saldo AFP actual: {formatMoney(input.saldoAfpInicial, currencyMode, ufRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Familiar (si aplica) */}
        {input.hijos.length > 0 && (
          <div className="py-5 border-b border-neutral-200 space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Cronograma Familiar e Hijos
            </h2>
            <div className="border border-neutral-200 rounded-lg p-3 text-[11px] space-y-1 bg-amber-50/20">
              <div className="flex justify-between font-semibold text-[#0a0a0a]">
                <span>Impacto en la fecha FIRE:</span>
                <span className="text-amber-800">+{result.impactoHijos.diferenciaAnosFire} años de trabajo</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Inversión total proyectada en crianza (vida completa):</span>
                <span className="font-semibold">{formatMoney(result.impactoHijos.gastoTotalHijosVida, currencyMode, ufRate)}</span>
              </div>
              <p className="text-[10px] text-neutral-500 pt-1">
                El gasto cesa automáticamente al cumplir el hijo los 24 años (independencia económica), liberando ese flujo de caja.
              </p>
            </div>
          </div>
        )}

        {/* Reglas de Oro para Alcanzar tu Meta */}
        <div className="py-5 border-b border-neutral-200 space-y-2.5">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Los 3 Mandamientos de tu Retiro en Chile
          </h2>
          <div className="space-y-1.5 text-[11px] text-neutral-700">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-neutral-900">1.</span>
              <span><strong>Evita la inflación de estilo de vida:</strong> Cuando tus ingresos aumenten ({input.crecimientoIngresoRealPct}% real anual proyectado), destina al menos el 70% de cada aumento directamente al ahorro e inversión libre.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-neutral-900">2.</span>
              <span><strong>Optimiza tu tributación con APV:</strong> Aprovecha el beneficio de bonificación 15% (Régimen A) si tu tasa marginal es menor al 15%, o la rebaja de base imponible (Régimen B) si estás en tramos altos del SII.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-neutral-900">3.</span>
              <span><strong>Paciencia y consistencia:</strong> El interés compuesto requiere tiempo. Los primeros 5 años parecen lentos; entre los años 10 y 15 el crecimiento de los intereses superará tus aportes anuales.</span>
            </div>
          </div>
        </div>

        {/* Firma y Compromiso */}
        <div className="pt-8 flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-10 w-44 border-b border-neutral-400" />
            <span className="font-mono text-[10px] text-neutral-500 block">
              Firma de Compromiso Personal
            </span>
          </div>

          <div className="text-right text-[10px] text-neutral-400 font-mono">
            Documento generado en dividendo-de-tiempo.cl · Plataforma FIRE Chile
          </div>
        </div>
      </div>
    </>
  );
}
