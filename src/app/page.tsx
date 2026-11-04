'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdBanner } from '@/components/AdBanner';
import { MetricCards } from '@/components/MetricCards';
import { FireCharts } from '@/components/FireCharts';
import { FireInputForm } from '@/components/FireInputForm';
import { ChildManager } from '@/components/ChildManager';
import { SensitivityTable } from '@/components/SensitivityTable';
import { FirePdfReport } from '@/components/FirePdfReport';
import {
  FireSimulationInput,
  runFireSimulation,
  FireSimulationResult,
} from '@/lib/fireEngine';
import { CurrencyMode } from '@/lib/formatters';
import { DEFAULT_CHILE_PARAMS } from '@/lib/constants';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('CLP');
  const ufRate = DEFAULT_CHILE_PARAMS.uf;

  // Estado principal de la simulación FIRE
  const [simInput, setSimInput] = useState<FireSimulationInput>({
    edadActual: 32,
    genero: 'hombre',
    patrimonioLiquidoInicial: 15000000, // $15M en portafolio libre
    saldoAfpInicial: 22000000, // $22M en AFP
    sueldoLiquidoMensual: 1890180, // Sueldo líquido mensual
    aporteAfpMensual: 250000, // 10% obligatorio
    aporteApvMensual: 100000, // APV mensual
    gastoMensualActual: 1100000, // Gasto de vida actual
    gastoMensualRetiro: 1100000, // Gasto deseado en retiro
    crecimientoIngresoRealPct: 2.0, // 2% anual sobre IPC
    rentabilidadPortafolioRealPct: 7.0, // Retorno real S&P 500 / ETFs
    rentabilidadAfpRealPct: 4.5, // Retorno real Fondo AFP
    tasaRetiroSeguroPct: 4.0, // Regla del 4%
    incluirPgu: true,
    montoPguMensual: DEFAULT_CHILE_PARAMS.pguMonthly,
    hijos: [
      {
        id: 'hijo-demo-1',
        name: 'Hijo 1',
        edadPadreAlNacer: 34,
        costoMensual0a3: 350000,
        costoMensual4a17: 300000,
        costoMensual18a23: 450000,
      },
    ],
    flujosExtra: [],
  });

  // Cargar parámetros de URL si existen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const edadParam = params.get('edad');
      const liquidoParam = params.get('liquido');
      const gastoParam = params.get('gasto');
      const liqPatParam = params.get('portafolio');
      const afpParam = params.get('afp');

      if (edadParam || liquidoParam || gastoParam) {
        setSimInput((prev) => ({
          ...prev,
          edadActual: edadParam ? Number(edadParam) : prev.edadActual,
          sueldoLiquidoMensual: liquidoParam ? Number(liquidoParam) : prev.sueldoLiquidoMensual,
          gastoMensualActual: gastoParam ? Number(gastoParam) : prev.gastoMensualActual,
          patrimonioLiquidoInicial: liqPatParam ? Number(liqPatParam) : prev.patrimonioLiquidoInicial,
          saldoAfpInicial: afpParam ? Number(afpParam) : prev.saldoAfpInicial,
        }));
      }
    }
  }, []);

  // Ejecución de la simulación
  const simulationResult: FireSimulationResult = runFireSimulation(simInput);

  const handleDownloadPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f2] text-[#0a0a0a] antialiased dark:bg-[#121211] dark:text-[#f4f4f2] flex flex-col justify-between">
      {/* Header */}
      <Header
        currencyMode={currencyMode}
        onCurrencyToggle={setCurrencyMode}
        ufRate={ufRate}
        onDownloadPdf={handleDownloadPdf}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section al estilo TasteSkill */}
        <section className="print:hidden text-center space-y-4 max-w-3xl mx-auto pt-4 pb-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-black/[0.08] bg-white/80 px-4 py-1 text-[12px] font-mono tracking-tight text-neutral-700 shadow-[0_1px_2px_rgba(10,10,10,0.03)] dark:border-white/[0.1] dark:bg-neutral-900/80 dark:text-neutral-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CALCULADORA DE RETIRO CHILE · MODELO DUAL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.035em] leading-[1.06] text-[#0a0a0a] dark:text-white">
            El mayor dividendo del dinero es el tiempo.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Calcula con precisión matemática cuántos años necesitas para alcanzar la libertad financiera en Chile. Modela el puente de retiro temprano hasta tu pensión legal AFP, los beneficios tributarios de APV y el impacto de los hijos.
          </p>
        </section>

        {/* Banner Publicitario Superior */}
        <div className="print:hidden">
          <AdBanner slotId="1000000010" format="horizontal" label="Publicidad" />
        </div>

        {/* Tarjetas KPI de Resumen */}
        <div className="print:hidden">
          <MetricCards
            result={simulationResult}
            currencyMode={currencyMode}
            ufRate={ufRate}
            edadActual={simInput.edadActual}
          />
        </div>

        {/* Generador y Exportación de Reporte Ejecutivo PDF */}
        <FirePdfReport
          result={simulationResult}
          input={simInput}
          currencyMode={currencyMode}
          ufRate={ufRate}
        />

        {/* Gráfico Principal de Cruce FIRE */}
        <div className="print:hidden">
          <FireCharts
            data={simulationResult.trayectoriaAnual}
            currencyMode={currencyMode}
            ufRate={ufRate}
            edadActual={simInput.edadActual}
            edadFire={simulationResult.edadFirePuente}
            edadLegal={simulationResult.edadLegalRetiro}
            metaFire={simulationResult.metaPatrimonioFire}
            tieneHijos={simInput.hijos.length > 0}
          />
        </div>

        {/* Controles y Formularios */}
        <div className="print:hidden grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Columna Izquierda: Entradas de la Calculadora (7 columnas) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Formulario Principal de Inputs */}
            <FireInputForm
              input={simInput}
              onChangeInput={setSimInput}
              currencyMode={currencyMode}
              ufRate={ufRate}
            />

            {/* Módulo Especial: ¿Y si tengo un hijo a los X años? */}
            <ChildManager
              hijos={simInput.hijos}
              onChangeHijos={(hijos) => setSimInput({ ...simInput, hijos })}
              edadActual={simInput.edadActual}
              currencyMode={currencyMode}
              ufRate={ufRate}
              impactoHijos={simulationResult.impactoHijos}
            />
          </div>

          {/* Columna Derecha: Matriz de Sensibilidad y Anuncios / Guías (5 columnas) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Matriz de Sensibilidad */}
            <SensitivityTable baseInput={simInput} />

            {/* Banner Publicitario Lateral */}
            <AdBanner slotId="1000000011" format="rectangle" label="Publicidad" />

            {/* Card Educativo: Los 2 Pilares del FIRE Chileno */}
            <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19] space-y-3.5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Concepto Clave
                </span>
              </div>
              <h4 className="text-[15px] font-semibold text-[#0a0a0a] dark:text-white tracking-tight">
                ¿Por qué en Chile el retiro se divide en dos fases?
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[13px]">
                En Chile los fondos de pensión obligatorios no se pueden liquidar antes de los 60 (mujeres) o 65 años (hombres). Tu plan financiero se apoya en dos motores:
              </p>
              <div className="space-y-2.5 pt-1">
                <div className="rounded-xl border border-black/[0.05] bg-[#fafaf8] p-3 dark:border-white/[0.06] dark:bg-[#222220]">
                  <span className="font-semibold text-[#0a0a0a] dark:text-white block text-[13px]">
                    1. El Puente Líquido (Tu Portafolio Libre)
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[12px] leading-relaxed">
                    ETFs globales, fondos mutuos o Cuenta 2 que financian tus gastos desde que decides dejar de trabajar hasta cumplir los 60/65 años.
                  </p>
                </div>

                <div className="rounded-xl border border-black/[0.05] bg-[#fafaf8] p-3 dark:border-white/[0.06] dark:bg-[#222220]">
                  <span className="font-semibold text-[#0a0a0a] dark:text-white block text-[13px]">
                    2. La Pensión Legal (Fondo AFP + PGU)
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[12px] leading-relaxed">
                    Al cumplir la edad legal, tu fondo acumulado en AFP entra a pagar una pensión mensual vitalicia, reduciendo la exigencia a tu portafolio libre.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/guia-fire-chile"
                  className="inline-flex items-center space-x-1.5 font-medium text-[13px] text-[#0a0a0a] hover:underline dark:text-white"
                >
                  <span>Leer la guía completa sobre el movimiento FIRE en Chile</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Publicitario Inferior */}
        <div className="print:hidden">
          <AdBanner slotId="1000000012" format="horizontal" label="Publicidad" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
