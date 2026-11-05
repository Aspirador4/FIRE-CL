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
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('CLP');
  const [ufRate, setUfRate] = useState<number>(DEFAULT_CHILE_PARAMS.uf);
  const [isLiveUf, setIsLiveUf] = useState<boolean>(false);

  // Consulta automática de la UF oficial en vivo del Banco Central
  useEffect(() => {
    async function loadLiveUf() {
      try {
        const res = await fetch('/api/uf');
        if (res.ok) {
          const data = await res.json();
          if (data.uf && typeof data.uf === 'number') {
            setUfRate(data.uf);
            setIsLiveUf(data.isLive);
          }
        }
      } catch (err) {
        console.warn('Error al obtener UF en vivo:', err);
      }
    }
    loadLiveUf();
  }, []);

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
        setTimeout(() => {
          setSimInput((prev) => ({
            ...prev,
            edadActual: edadParam ? Number(edadParam) : prev.edadActual,
            sueldoLiquidoMensual: liquidoParam ? Number(liquidoParam) : prev.sueldoLiquidoMensual,
            gastoMensualActual: gastoParam ? Number(gastoParam) : prev.gastoMensualActual,
            patrimonioLiquidoInicial: liqPatParam ? Number(liqPatParam) : prev.patrimonioLiquidoInicial,
            saldoAfpInicial: afpParam ? Number(afpParam) : prev.saldoAfpInicial,
          }));
        }, 0);
      }
    }
  }, []);

  // Ejecución de la simulación con la UF dinámica activa
  const simulationResult: FireSimulationResult = runFireSimulation({
    ...simInput,
    ufRate,
  });

  const handleDownloadPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] text-black antialiased dark:bg-[#0d0e12] dark:text-[#f4f4f7] flex flex-col justify-between transition-colors">
      {/* Header */}
      <Header
        currencyMode={currencyMode}
        onCurrencyToggle={setCurrencyMode}
        ufRate={ufRate}
        isLiveUf={isLiveUf}
        onDownloadPdf={handleDownloadPdf}
      />

      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-6 lg:px-8 space-y-7">
        {/* Hero Section Brutalista */}
        <section className="print:hidden text-center space-y-4 max-w-4xl mx-auto pt-2 pb-1">
          <div className="inline-flex items-center space-x-2 border-2 border-black bg-[#facc15] px-3.5 py-1 text-xs font-mono font-black uppercase text-black shadow-[2px_2px_0px_0px_#000] dark:border-white">
            <span className="inline-block h-2 w-2 border border-black bg-emerald-500 animate-pulse" />
            <span>
              CALCULADORA RETIRO CHILE · UF HOY: ${ufRate.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black dark:text-white leading-[1.08] font-sans">
            El mayor dividendo del dinero es el tiempo.
          </h1>

          <p className="text-sm sm:text-base font-mono text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Calcula con precisión matemática cuántos años necesitas para alcanzar la libertad financiera en Chile. Modela el puente de retiro temprano hasta tu pensión AFP, los beneficios APV y el costo de los hijos.
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
        <div className="print:hidden grid grid-cols-1 gap-7 lg:grid-cols-12">
          {/* Columna Izquierda: Entradas de la Calculadora (7 columnas) */}
          <div className="space-y-6 lg:col-span-7">
            <FireInputForm
              input={simInput}
              onChangeInput={setSimInput}
              currencyMode={currencyMode}
              ufRate={ufRate}
            />

            <ChildManager
              hijos={simInput.hijos}
              onChangeHijos={(hijos) => setSimInput({ ...simInput, hijos })}
              edadActual={simInput.edadActual}
              currencyMode={currencyMode}
              ufRate={ufRate}
              impactoHijos={simulationResult.impactoHijos}
            />
          </div>

          {/* Columna Derecha: Matriz de Sensibilidad y Conceptos Clave (5 columnas) */}
          <div className="space-y-6 lg:col-span-5">
            <SensitivityTable baseInput={simInput} />

            <AdBanner slotId="1000000011" format="rectangle" label="Publicidad" />

            {/* Card Educativo: Los 2 Pilares del FIRE Chileno */}
            <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff] space-y-4 font-mono text-xs">
              <div className="flex items-center space-x-2 border-b-2 border-black/10 pb-2 dark:border-zinc-800">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-zinc-200">
                  [ CONCEPTO CLAVE // ARQUITECTURA FIRE ]
                </span>
              </div>

              <h4 className="text-sm font-black text-black dark:text-white uppercase">
                ¿Por qué en Chile el retiro se divide en dos fases?
              </h4>

              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                En Chile los fondos de pensión obligatorios no se pueden liquidar antes de los 60 (mujeres) o 65 años (hombres). Tu plan financiero se apoya en dos motores:
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="border-2 border-black bg-neutral-50 p-3 shadow-[2px_2px_0px_0px_#000] dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-[2px_2px_0px_0px_#fff]">
                  <span className="font-black text-black dark:text-white block uppercase">
                    1. El Puente Líquido (Portafolio Libre)
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px] leading-relaxed">
                    ETFs globales, fondos mutuos o Cuenta 2 que financian tus gastos desde que dejas de trabajar hasta cumplir los 60/65 años.
                  </p>
                </div>

                <div className="border-2 border-black bg-neutral-50 p-3 shadow-[2px_2px_0px_0px_#000] dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-[2px_2px_0px_0px_#fff]">
                  <span className="font-black text-black dark:text-white block uppercase">
                    2. La Pensión Legal (AFP + PGU)
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px] leading-relaxed">
                    A los 60/65 años tu saldo en AFP pasa a financiar tu jubilación legal vía retiro programado o renta vitalicia más PGU, aliviando de forma permanente la carga sobre tu portafolio libre.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/guia-fire-chile"
                  className="inline-flex items-center space-x-1.5 border-2 border-black bg-[#facc15] px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200"
                >
                  <span>Leer la guía completa FIRE Chile</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
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
