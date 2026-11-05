'use client';

import React, { useState, useMemo } from 'react';
import { FireSimulationInput } from '@/lib/fireEngine';
import {
  calculateChileSalaryTax,
  calculateChileSalaryFromNet,
  SalaryBreakdown,
  HealthConfig,
  HealthSystem,
} from '@/lib/chileTaxEngine';
import {
  CurrencyMode,
  formatMoney,
  formatThousands,
  parseThousands,
} from '@/lib/formatters';
import { DEFAULT_CHILE_PARAMS } from '@/lib/constants';
import { InfoTooltip } from '@/components/InfoTooltip';
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HeartPulse,
  Sparkles,
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
  // Modo de ingreso principal: 'liquido' (unificado por defecto) o 'bruto' (opcional)
  const [inputSalaryMode, setInputSalaryMode] = useState<'liquido' | 'bruto'>('liquido');
  const [enteredBruto, setEnteredBruto] = useState<number>(2500000);

  // Previsión de salud
  const [healthSystem, setHealthSystem] = useState<HealthSystem>('isapre');
  const [isaprePlanType, setIsaprePlanType] = useState<'uf' | 'clp'>('uf');
  const [isaprePlanUf, setIsaprePlanUf] = useState<number>(3.8); // 3.8 UF estándar
  const [isaprePlanClp, setIsaprePlanClp] = useState<number>(150000);

  // APV y Cesantía
  const [apvRegimen, setApvRegimen] = useState<'A' | 'B' | 'ninguno'>('B');
  const [tieneAfc, setTieneAfc] = useState<boolean>(true);

  // Despliegue del desglose detallado
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState<boolean>(true);

  const update = (partial: Partial<FireSimulationInput>) => {
    onChangeInput({ ...input, ...partial });
  };

  // Parámetros económicos dinámicos indexados con la UF activa
  const dynamicParams = useMemo(() => {
    return {
      ...DEFAULT_CHILE_PARAMS,
      uf: ufRate && ufRate > 0 ? ufRate : DEFAULT_CHILE_PARAMS.uf,
    };
  }, [ufRate]);

  // Configuración de salud activa
  const healthConfig: HealthConfig = useMemo(() => {
    return {
      system: healthSystem,
      isaprePlanType,
      isaprePlanUf,
      isaprePlanClp,
    };
  }, [healthSystem, isaprePlanType, isaprePlanUf, isaprePlanClp]);

  // Cálculo reactivo unificado:
  // Si está en modo 'liquido', calcula el bruto y todas las leyes sociales desde el líquido.
  // Si está en modo 'bruto', calcula el líquido y leyes sociales desde el bruto.
  const breakdown: SalaryBreakdown = useMemo(() => {
    if (inputSalaryMode === 'liquido') {
      return calculateChileSalaryFromNet(
        input.sueldoLiquidoMensual,
        input.aporteApvMensual,
        apvRegimen,
        dynamicParams,
        healthConfig,
        tieneAfc
      );
    } else {
      return calculateChileSalaryTax(
        enteredBruto,
        input.aporteApvMensual,
        apvRegimen,
        dynamicParams,
        healthConfig,
        tieneAfc
      );
    }
  }, [
    inputSalaryMode,
    input.sueldoLiquidoMensual,
    enteredBruto,
    input.aporteApvMensual,
    apvRegimen,
    dynamicParams,
    healthConfig,
    tieneAfc,
  ]);

  // Manejador del cambio de Sueldo Líquido
  const handleLiquidoChange = (newLiquido: number) => {
    const newBreakdown = calculateChileSalaryFromNet(
      newLiquido,
      input.aporteApvMensual,
      apvRegimen,
      dynamicParams,
      healthConfig,
      tieneAfc
    );
    setEnteredBruto(Math.round(newBreakdown.sueldoBruto));
    update({
      sueldoLiquidoMensual: newLiquido,
      aporteAfpMensual: Math.round(newBreakdown.cotizacionAfp10),
    });
  };

  // Manejador del cambio de Sueldo Bruto (cuando el usuario elige ingresar bruto)
  const handleBrutoChange = (newBruto: number) => {
    setEnteredBruto(newBruto);
    const newBreakdown = calculateChileSalaryTax(
      newBruto,
      input.aporteApvMensual,
      apvRegimen,
      dynamicParams,
      healthConfig,
      tieneAfc
    );
    update({
      sueldoLiquidoMensual: Math.round(newBreakdown.sueldoLiquido),
      aporteAfpMensual: Math.round(newBreakdown.cotizacionAfp10),
    });
  };

  // Sincronizar aporte AFP cuando cambian configuraciones que afectan la renta imponible
  const handleHealthSystemChange = (system: HealthSystem) => {
    setHealthSystem(system);
    const updatedHealth: HealthConfig = { ...healthConfig, system };
    const newBreakdown =
      inputSalaryMode === 'liquido'
        ? calculateChileSalaryFromNet(
            input.sueldoLiquidoMensual,
            input.aporteApvMensual,
            apvRegimen,
            dynamicParams,
            updatedHealth,
            tieneAfc
          )
        : calculateChileSalaryTax(
            enteredBruto,
            input.aporteApvMensual,
            apvRegimen,
            dynamicParams,
            updatedHealth,
            tieneAfc
          );
    update({
      aporteAfpMensual: Math.round(newBreakdown.cotizacionAfp10),
      ...(inputSalaryMode === 'bruto'
        ? { sueldoLiquidoMensual: Math.round(newBreakdown.sueldoLiquido) }
        : {}),
    });
  };

  // Conversión auxiliar a UF de cualquier monto CLP
  const toUf = (clp: number) => {
    if (!ufRate || ufRate <= 0) return '0 UF';
    const val = clp / ufRate;
    return `${val.toLocaleString('es-CL', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} UF`;
  };

  const topeAfpClp = dynamicParams.topeImponibleAfpUF * dynamicParams.uf;

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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Tu Edad Actual:</span>
                <InfoTooltip
                  title="Tu Edad Actual"
                  content="Punto de partida de tu plan. Determina los años que tienes para que el interés compuesto haga crecer tu patrimonio antes de retirarte."
                />
              </span>
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
            <span className="inline-flex items-center space-x-1.5 text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span>Edad Legal de Pensión AFP:</span>
              <InfoTooltip
                title="Edad Legal de Pensión en Chile"
                content="Por ley en Chile, las mujeres pueden jubilarse por vejez legal a los 60 años y los hombres a los 65 años. A esta edad se desbloquean tus fondos acumulados en la AFP y la PGU. Todo retiro previo debe ser autofinanciado por tu portafolio libre (fase Puente FIRE)."
              />
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

      {/* 2. Ingresos y Previsión (Control Unificado Sueldo Líquido -> Bruto y Leyes Sociales) */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              02 / Ingresos y Previsión (Unificado)
            </span>
            <InfoTooltip
              title="Cálculo Previsional y Tributario Chile"
              content={`Calcula automáticamente la relación exacta entre Sueldo Líquido y Bruto, tu 10% obligatorio de AFP, el 7% legal de salud, cotización extra de Isapre, AFC e Impuesto Único de Segunda Categoría según la escala progresiva del SII. La UF actual de referencia es $${ufRate.toLocaleString('es-CL', { maximumFractionDigits: 0 })}.`}
            />
          </div>

          {/* Selector de modo: Líquido (recomendado) o Bruto */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-400 text-[11px]">Ingresando desde:</span>
            <div className="flex items-center rounded-full border border-black/[0.08] bg-[#f5f4f2] p-0.5 font-medium dark:border-white/[0.1] dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setInputSalaryMode('liquido')}
                className={`rounded-full px-2.5 py-0.5 text-[11.5px] transition-all duration-150 ${
                  inputSalaryMode === 'liquido'
                    ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                    : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                Sueldo Líquido (Al Bolsillo)
              </button>
              <button
                type="button"
                onClick={() => setInputSalaryMode('bruto')}
                className={`rounded-full px-2.5 py-0.5 text-[11.5px] transition-all duration-150 ${
                  inputSalaryMode === 'bruto'
                    ? 'bg-[#0a0a0a] text-white shadow-sm dark:bg-white dark:text-[#0a0a0a]'
                    : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                Sueldo Bruto (Contrato)
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Fila 1: Input de Sueldo Principal y Sistema de Salud */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Input Sueldo Líquido o Bruto según el modo */}
            {inputSalaryMode === 'liquido' ? (
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#0a0a0a] dark:text-white">
                  <span className="inline-flex items-center space-x-1.5">
                    <span>Sueldo Líquido Mensual (Lo que recibes)</span>
                    <InfoTooltip
                      title="Sueldo Líquido al Bolsillo"
                      content="Lo que te depositan en tu cuenta a fin de mes tras todos los descuentos legales (AFP, salud, seguro de cesantía e impuesto de segunda categoría). A partir de este monto calculamos automáticamente tu sueldo bruto equivalente y tus aportes reales al fondo de pensión."
                    />
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    ≈ {toUf(input.sueldoLiquidoMensual)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                  <span className="mr-1 text-neutral-400">$</span>
                  <input
                    type="text"
                    value={formatThousands(input.sueldoLiquidoMensual)}
                    onChange={(e) =>
                      handleLiquidoChange(parseThousands(e.target.value))
                    }
                    className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                  />
                  <span className="ml-2 font-mono text-[11px] text-neutral-400">CLP</span>
                </div>
                <input
                  type="range"
                  min={400000}
                  max={6000000}
                  step={50000}
                  value={input.sueldoLiquidoMensual}
                  onChange={(e) => handleLiquidoChange(Number(e.target.value))}
                  className="mt-2.5 w-full"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#0a0a0a] dark:text-white">
                  <span className="inline-flex items-center space-x-1.5">
                    <span>Sueldo Bruto Mensual (De Contrato)</span>
                    <InfoTooltip
                      title="Sueldo Bruto Contractual"
                      content="Monto bruto pactado antes de los descuentos de leyes sociales e impuestos. Si ganas sobre 84.3 UF (aprox. $3.480.000), el exceso queda exento de cotización obligatoria AFP y salud."
                    />
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                    ≈ {toUf(enteredBruto)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                  <span className="mr-1 text-neutral-400">$</span>
                  <input
                    type="text"
                    value={formatThousands(enteredBruto)}
                    onChange={(e) =>
                      handleBrutoChange(parseThousands(e.target.value))
                    }
                    className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                  />
                  <span className="ml-2 font-mono text-[11px] text-neutral-400">CLP</span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={8000000}
                  step={50000}
                  value={enteredBruto}
                  onChange={(e) => handleBrutoChange(Number(e.target.value))}
                  className="mt-2.5 w-full"
                />
              </div>
            )}

            {/* Sistema de Salud: Fonasa vs Isapre */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-[#0a0a0a] dark:text-white">
                <span className="inline-flex items-center space-x-1.5">
                  <span>Previsión de Salud</span>
                  <InfoTooltip
                    title="Previsión de Salud en Chile"
                    content="Por ley, debes destinar al menos el 7% de tu renta imponible a salud (tope 84.3 UF). En Fonasa cotizas exactamente el 7%. En Isapre tienes un plan pactado en UF o CLP; si tu plan es más caro que el 7%, pagas una 'cotización adicional voluntaria' de tu bolsillo."
                  />
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Legal: 7% (tope 84.3 UF)
                </span>
              </div>

              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleHealthSystemChange('fonasa')}
                  className={`flex items-center justify-center space-x-1.5 rounded-xl border py-2 text-xs font-medium transition-all ${
                    healthSystem === 'fonasa'
                      ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-sm dark:border-white dark:bg-white dark:text-[#0a0a0a]'
                      : 'border-black/[0.08] bg-[#fafaf8] text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  <span>Fonasa (7% Legal)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleHealthSystemChange('isapre')}
                  className={`flex items-center justify-center space-x-1.5 rounded-xl border py-2 text-xs font-medium transition-all ${
                    healthSystem === 'isapre'
                      ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-sm dark:border-white dark:bg-white dark:text-[#0a0a0a]'
                      : 'border-black/[0.08] bg-[#fafaf8] text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  <HeartPulse className="h-3.5 w-3.5" />
                  <span>Isapre (Plan / Adicional)</span>
                </button>
              </div>

              {/* Sub-configuración si es Isapre: Plan en UF o CLP */}
              {healthSystem === 'isapre' && (
                <div className="mt-3 rounded-xl border border-black/[0.06] bg-[#fafaf8] p-3 text-xs dark:border-white/[0.08] dark:bg-neutral-800/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1 text-[11.5px] font-medium text-neutral-700 dark:text-neutral-300">
                      <span>Costo de tu Plan Isapre:</span>
                      <InfoTooltip
                        title="Cotización Adicional en Isapre"
                        content="Ingresa el costo pactado de tu plan. Si supera el 7% de tu sueldo imponible, calculamos la cotización adicional que se descuenta de tu sueldo. La ley chilena permite rebajar impuestos por dicha cotización adicional hasta un tope de 4.2 UF mensuales (Art. 42 LIR)."
                      />
                    </span>

                    {/* Selector UF vs CLP para el plan */}
                    <div className="flex items-center space-x-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setIsaprePlanType('uf')}
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          isaprePlanType === 'uf'
                            ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-black'
                            : 'text-neutral-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        En UF
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsaprePlanType('clp')}
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          isaprePlanType === 'clp'
                            ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-black'
                            : 'text-neutral-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        En CLP ($)
                      </button>
                    </div>
                  </div>

                  {isaprePlanType === 'uf' ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-1 items-center rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-900">
                        <input
                          type="number"
                          step={0.1}
                          min={1}
                          max={15}
                          value={isaprePlanUf}
                          onChange={(e) => setIsaprePlanUf(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                        />
                        <span className="font-mono text-neutral-400">UF</span>
                      </div>
                      <span className="font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        ≈ ${Math.round(isaprePlanUf * dynamicParams.uf).toLocaleString('es-CL')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-1 items-center rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-900">
                        <span className="mr-1 text-neutral-400">$</span>
                        <input
                          type="text"
                          value={formatThousands(isaprePlanClp)}
                          onChange={(e) => setIsaprePlanClp(parseThousands(e.target.value))}
                          className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                        />
                      </div>
                      <span className="font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        ≈ {toUf(isaprePlanClp)}
                      </span>
                    </div>
                  )}

                  {/* Diagnóstico Isapre: Excedente o Cotización Adicional */}
                  <div className="pt-1 text-[11px] border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                    <span className="text-neutral-500">
                      7% legal obligatorio: ${Math.round(breakdown.salud.saludLegal7Pct).toLocaleString('es-CL')}
                    </span>
                    {breakdown.salud.cotizacionAdicionalSalud > 0 ? (
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        Cotización adicional: +${Math.round(breakdown.salud.cotizacionAdicionalSalud).toLocaleString('es-CL')}
                      </span>
                    ) : breakdown.salud.excedentesIsapre > 0 ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Excedentes a tu favor: ${Math.round(breakdown.salud.excedentesIsapre).toLocaleString('es-CL')}/mes
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-medium">Plan cubierto 100% por tu 7%</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fila 2: APV y AFC (Cesantía) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
            {/* Monto APV */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-[#0a0a0a] dark:text-white">
                <span className="inline-flex items-center space-x-1.5">
                  <span>Ahorro Voluntario APV</span>
                  <InfoTooltip
                    title="Aporte Voluntario APV"
                    content="Ahorro previsional adicional voluntario para potenciar tu fondo de retiro o adelantar tu jubilación. Cuenta con importantes incentivos tributarios en Chile."
                  />
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {input.aporteApvMensual > 0 ? toUf(input.aporteApvMensual) : 'Opcional'}
                </span>
              </div>
              <div className="mt-1.5 flex items-center rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3.5 py-2 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                <span className="mr-1 text-neutral-400">$</span>
                <input
                  type="text"
                  value={formatThousands(input.aporteApvMensual)}
                  onChange={(e) => update({ aporteApvMensual: parseThousands(e.target.value) })}
                  className="w-full bg-transparent tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                />
              </div>
              <input
                type="range"
                min={0}
                max={1000000}
                step={20000}
                value={input.aporteApvMensual}
                onChange={(e) => update({ aporteApvMensual: Number(e.target.value) })}
                className="mt-2 w-full"
              />
            </div>

            {/* Régimen APV */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-[#0a0a0a] dark:text-white">
                <span className="inline-flex items-center space-x-1.5">
                  <span>Régimen Tributario APV</span>
                  <InfoTooltip
                    title="Régimen APV A vs B"
                    content="Régimen A: El Estado bonifica el 15% de tu ahorro anual (tope 6 UTM/año, aprox. $435.000). Conveniente para rentas exentas o tramos bajos de impuesto. Régimen B: Rebaja directamente tu base imponible de impuesto a la renta (tope mensual 50 UF, aprox. $2.063.000). Conveniente para tramos de impuesto sobre el 8% o 13.5%."
                  />
                </span>
              </div>
              <select
                value={apvRegimen}
                onChange={(e) => setApvRegimen(e.target.value as 'A' | 'B' | 'ninguno')}
                className="mt-1.5 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3 py-2 text-xs font-semibold text-[#0a0a0a] focus:outline-none dark:border-white/[0.1] dark:bg-neutral-800 dark:text-white"
              >
                <option value="ninguno">Sin beneficio tributario (O sin APV)</option>
                <option value="A">Régimen A (+15% Bonificación Fiscal)</option>
                <option value="B">Régimen B (Rebaja de Impuesto SII)</option>
              </select>
              <span className="mt-1.5 block text-[11px] text-neutral-400">
                {apvRegimen === 'A'
                  ? 'Bono fiscal hasta 6 UTM/año (~$435.000).'
                  : apvRegimen === 'B'
                  ? 'Descuenta de base imponible (tope 50 UF).'
                  : 'Sin beneficio tributario directo.'}
              </span>
            </div>

            {/* Seguro de Cesantía (AFC) */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-[#0a0a0a] dark:text-white">
                <span className="inline-flex items-center space-x-1.5">
                  <span>Seguro de Cesantía (AFC)</span>
                  <InfoTooltip
                    title="Seguro de Cesantía del Trabajador"
                    content="En contratos indefinidos, el trabajador aporta un 0.6% de su sueldo imponible (tope 126.6 UF, aprox. $5.225.000). Si tienes contrato a plazo fijo o eres independiente, el trabajador no aporta a la AFC (0%)."
                  />
                </span>
              </div>
              <div className="mt-1.5 flex h-[38px] items-center justify-between rounded-xl border border-black/[0.08] bg-[#fafaf8] px-3 text-xs font-semibold dark:border-white/[0.1] dark:bg-neutral-800">
                <span className="text-neutral-700 dark:text-neutral-300">
                  {tieneAfc ? 'Contrato Indefinido (0.6%)' : 'Plazo Fijo / Sin AFC (0%)'}
                </span>
                <input
                  type="checkbox"
                  checked={tieneAfc}
                  onChange={(e) => setTieneAfc(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#0a0a0a] cursor-pointer"
                />
              </div>
              <span className="mt-1.5 block text-[11px] text-neutral-400">
                Tope imponible AFC: 126.6 UF ({formatMoney(dynamicParams.topeImponibleAfcUF * dynamicParams.uf, currencyMode, ufRate)})
              </span>
            </div>
          </div>

          {/* Tarjeta de Resumen y Desglose Unificado de Sueldo */}
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                      Sueldo Bruto Calculado:{' '}
                      <strong className="text-blue-700 dark:text-blue-300 tabular-nums">
                        {formatMoney(breakdown.sueldoBruto, currencyMode, ufRate)}
                      </strong>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      (≈ {toUf(breakdown.sueldoBruto)})
                    </span>
                    <InfoTooltip
                      title="Sueldo Bruto Equivalente"
                      content="Este es el sueldo bruto total que genera tu sueldo líquido deseado tras descontar 10% de AFP, comisión de administradora, salud (7% + cotización adicional), AFC e Impuesto de 2da Categoría."
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Sueldo Líquido en Mano:{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {formatMoney(breakdown.sueldoLiquido, currencyMode, ufRate)}
                    </strong>{' '}
                    · Aporte real al fondo AFP:{' '}
                    <strong className="text-blue-700 dark:text-blue-400">
                      +{formatMoney(breakdown.cotizacionAfp10, currencyMode, ufRate)}/mes
                    </strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="flex items-center space-x-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 shadow-sm hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                <span>{showDetailedBreakdown ? 'Ocultar liquidación' : 'Ver liquidación completa'}</span>
                {showDetailedBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Tabla desplegable de la liquidación de sueldo */}
            {showDetailedBreakdown && (
              <div className="mt-3.5 border-t border-blue-200/60 pt-3 dark:border-blue-900/40">
                <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4 lg:grid-cols-6">
                  {/* AFP 10% */}
                  <div className="rounded-lg bg-white/70 p-2 border border-blue-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <span>AFP (10% fondo)</span>
                      <InfoTooltip
                        title="Cotización Obligatoria AFP (10%)"
                        content={`El 10% de tu renta imponible (tope 84.3 UF = $${Math.round(topeAfpClp).toLocaleString('es-CL')}). Este dinero es de tu propiedad exclusiva y se acumula en tu cuenta individual generando rentabilidad para tu jubilación.`}
                      />
                    </div>
                    <span className="font-semibold text-blue-700 tabular-nums dark:text-blue-400 block mt-0.5">
                      +{formatMoney(breakdown.cotizacionAfp10, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Comisión AFP */}
                  <div className="rounded-lg bg-white/70 p-2 border border-blue-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <span>Comisión AFP (~1.15%)</span>
                      <InfoTooltip
                        title="Comisión Administradora"
                        content="Cobro por administración de fondos de tu AFP. No engrosa tu fondo de pensión."
                      />
                    </div>
                    <span className="font-semibold text-neutral-700 tabular-nums dark:text-neutral-300 block mt-0.5">
                      -{formatMoney(breakdown.comisionAfp, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Salud 7% Legal */}
                  <div className="rounded-lg bg-white/70 p-2 border border-blue-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <span>Salud (7% Legal)</span>
                      <InfoTooltip
                        title="Salud Obligatoria (7%)"
                        content="Cotización obligatoria para Fonasa o Isapre (tope 84.3 UF). Deducible de impuestos."
                      />
                    </div>
                    <span className="font-semibold text-neutral-700 tabular-nums dark:text-neutral-300 block mt-0.5">
                      -{formatMoney(breakdown.salud.saludLegal7Pct, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Cotización Adicional Salud (si aplica) */}
                  <div className="rounded-lg bg-white/70 p-2 border border-blue-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <span>Adicional Isapre</span>
                      <InfoTooltip
                        title="Cotización Extra / Adicional Isapre"
                        content="Diferencia a pagar cuando el plan de Isapre pactado supera el 7% legal de tu sueldo. Deducible de impuestos hasta 4.2 UF."
                      />
                    </div>
                    <span className={`font-semibold tabular-nums block mt-0.5 ${
                      breakdown.salud.cotizacionAdicionalSalud > 0
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-neutral-400'
                    }`}>
                      {breakdown.salud.cotizacionAdicionalSalud > 0
                        ? `-${formatMoney(breakdown.salud.cotizacionAdicionalSalud, currencyMode, ufRate)}`
                        : '$0'}
                    </span>
                  </div>

                  {/* Seguro de Cesantía */}
                  <div className="rounded-lg bg-white/70 p-2 border border-blue-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <span>Cesantía AFC (0.6%)</span>
                      <InfoTooltip
                        title="Seguro de Cesantía"
                        content="Aporte obligatorio a la cuenta individual de cesantía para contratos indefinidos (tope 126.6 UF)."
                      />
                    </div>
                    <span className="font-semibold text-neutral-700 tabular-nums dark:text-neutral-300 block mt-0.5">
                      -{formatMoney(breakdown.seguroCesantia, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Impuesto Único SII 2da Cat */}
                  <div className="rounded-lg bg-white/70 p-2 border border-blue-100 dark:bg-slate-900/60 dark:border-slate-800">
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <span>Impuesto SII 2da Cat</span>
                      <InfoTooltip
                        title="Impuesto Único de Segunda Categoría"
                        content={`Retención fiscal del SII según escala progresiva en UTM. Tasa marginal aplicada: ${breakdown.tasaMarginalImpuestoPct}%. Tasa efectiva global: ${breakdown.tasaEfectivaImpuestoPct.toFixed(1)}%.`}
                      />
                    </div>
                    <span className="font-semibold text-red-600 tabular-nums block mt-0.5">
                      -{formatMoney(breakdown.impuestoSegundaCategoria, currencyMode, ufRate)}
                    </span>
                  </div>
                </div>

                {/* Aviso APV si tiene beneficio fiscal */}
                {breakdown.apvBeneficioFiscalEstimado > 0 && (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-100/60 px-3 py-1.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <span className="inline-flex items-center space-x-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Beneficio Fiscal APV (Régimen {breakdown.apvRegimen}):</span>
                    </span>
                    <span className="font-bold tabular-nums">
                      +{formatMoney(breakdown.apvBeneficioFiscalEstimado, currencyMode, ufRate)}/mes ({breakdown.apvRegimen === 'A' ? 'Bono estatal' : 'Ahorro de impuestos'})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Crecimiento Salarial Real Anual */}
          <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Crecimiento Salarial Real Anual (Aumentos sobre IPC):</span>
                <InfoTooltip
                  title="Aumento Real Anual de Sueldo"
                  content="Porcentaje anual que estimas que tu sueldo aumentará por sobre la inflación a lo largo de tu carrera debido a ascensos, antigüedad o saltos de empresa."
                />
              </span>
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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Gasto Mensual Actual:</span>
                <InfoTooltip
                  title="Gasto Mensual del Hogar"
                  content="Costo total de vida mensual actual: vivienda (arriendo/dividendo), alimentación, servicios básicos, seguros, ocio, transporte y compras. La brecha entre tu sueldo líquido y este gasto define tu tasa de ahorro libre."
                />
              </span>
              <span className="font-semibold tabular-nums text-[#0a0a0a] dark:text-white">
                {formatMoney(input.gastoMensualActual, currencyMode, ufRate)}
                <span className="font-mono text-[11px] text-neutral-400 ml-1">
                  (≈ {toUf(input.gastoMensualActual)})
                </span>
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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Gasto Deseado en Jubilación:</span>
                <InfoTooltip
                  title="Presupuesto Mensual de Retiro"
                  content="Monto mensual necesario para financiar tu estilo de vida cuando no trabajes. Si para ese entonces tu vivienda ya está pagada o no tienes costos de transporte laboral, suele ser entre 75% y 85% de tu gasto actual."
                />
              </span>
              <span className="font-semibold tabular-nums text-[#0a0a0a] dark:text-white">
                {formatMoney(input.gastoMensualRetiro, currencyMode, ufRate)}
                <span className="font-mono text-[11px] text-neutral-400 ml-1">
                  (≈ {toUf(input.gastoMensualRetiro)})
                </span>
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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Portafolio Libre (Acciones, ETFs, Cuenta 2):</span>
                <InfoTooltip
                  title="Portafolio Libre de Inversión"
                  content="Dinero acumulado en cuentas sin restricciones de retiro por edad: Cuenta 2 AFP, fondos indexados (S&P 500, VWRA), acciones y depósitos. Es el capital que financiará tus años de retiro antes de los 60/65 años."
                />
              </span>
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatMoney(input.patrimonioLiquidoInicial, currencyMode, ufRate)}
                <span className="font-mono text-[11px] text-neutral-400 ml-1">
                  (≈ {toUf(input.patrimonioLiquidoInicial)})
                </span>
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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Saldo Cuenta AFP Obligatoria:</span>
                <InfoTooltip
                  title="Fondo Acumulado en AFP Obligatoria"
                  content="Dinero total que ya tienes ahorrado en tu cuenta de capitalización individual en tu AFP. No se puede retirar antes de los 60/65 años, pero continuará rentando y cubrirá tu pensión vitalicia legal."
                />
              </span>
              <span className="font-semibold tabular-nums text-blue-700 dark:text-blue-400">
                {formatMoney(input.saldoAfpInicial, currencyMode, ufRate)}
                <span className="font-mono text-[11px] text-neutral-400 ml-1">
                  (≈ {toUf(input.saldoAfpInicial)})
                </span>
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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Portafolio Libre:</span>
                <InfoTooltip
                  title="Rentabilidad Real de Inversiones Libres"
                  content="Retorno anual neto estimado por encima de la inflación (IPC). Los fondos indexados globales y el S&P 500 promedian históricamente 6.5% a 7.5% real a largo plazo."
                />
              </span>
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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Fondo AFP:</span>
                <InfoTooltip
                  title="Rentabilidad Real AFP"
                  content="Retorno real anual esperado de tu fondo obligatorio de AFP. Referencia histórica en Chile: Fondo A (~5.8%), Fondo C (~4.4%), Fondo E (~2.8%)."
                />
              </span>
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
            <div className="flex items-center justify-between text-[13px] font-medium text-[#0a0a0a] dark:text-white">
              <span className="inline-flex items-center space-x-1.5">
                <span>Retiro Seguro (SWR):</span>
                <InfoTooltip
                  title="Tasa de Retiro Seguro (SWR / Regla del 4%)"
                  content="Porcentaje del portafolio libre que puedes retirar cada año en jubilación para que tu capital no se extinga durante al menos 30 a 50 años (Estudio Trinity)."
                />
              </span>
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
              <span className="inline-flex items-center space-x-1">
                <span>Pensión PGU (65 años)</span>
                <InfoTooltip
                  title="Pensión Garantizada Universal (PGU)"
                  content="Aporte estatal solidario para mayores de 65 años que no pertenezcan al 10% más rico (actualmente ~$214.296/mes reajustable por IPC)."
                />
              </span>
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
