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
  // Modo de ingreso: 'liquido' (por defecto) o 'bruto'
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

  // Cálculo reactivo unificado
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

  // Sincronización bidireccional
  const handleNetSalaryChange = (newNet: number) => {
    update({ sueldoLiquidoMensual: newNet });
  };

  const handleGrossSalaryChange = (newGross: number) => {
    setEnteredBruto(newGross);
    const b = calculateChileSalaryTax(
      newGross,
      input.aporteApvMensual,
      apvRegimen,
      dynamicParams,
      healthConfig,
      tieneAfc
    );
    update({ sueldoLiquidoMensual: b.sueldoLiquido });
  };

  const handleModeSwitch = (mode: 'liquido' | 'bruto') => {
    setInputSalaryMode(mode);
    if (mode === 'bruto') {
      setEnteredBruto(breakdown.sueldoBruto);
    }
  };

  const handleHealthSystemChange = (sys: HealthSystem) => {
    setHealthSystem(sys);
    if (inputSalaryMode === 'bruto') {
      const b = calculateChileSalaryTax(
        enteredBruto,
        input.aporteApvMensual,
        apvRegimen,
        dynamicParams,
        { ...healthConfig, system: sys },
        tieneAfc
      );
      update({ sueldoLiquidoMensual: b.sueldoLiquido });
    }
  };

  // Conversión con espacio no separable para evitar cualquier salto de línea
  const toUf = (clp: number) => {
    if (!ufRate || ufRate <= 0) return '0\u00A0UF';
    const val = clp / ufRate;
    return `${val.toLocaleString('es-CL', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}\u00A0UF`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Perfil y Horizonte de Jubilación */}
      <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="mb-4 flex items-center justify-between border-b-2 border-black/10 pb-2.5 dark:border-zinc-800">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            01 / Perfil y Horizonte
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Edad Actual */}
          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5">
                <span>Tu edad actual:</span>
                <InfoTooltip
                  title="Tu edad actual"
                  content="Punto de partida de tu plan. Determina los años que tienes para que el interés compuesto haga crecer tu patrimonio antes de retirarte."
                />
              </span>
              <span className="border-2 border-black bg-[#facc15] px-2 py-0.5 text-black font-black text-xs shadow-[1.5px_1.5px_0px_0px_#000] dark:border-zinc-200 whitespace-nowrap shrink-0">
                {input.edadActual} años
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={65}
              value={input.edadActual}
              onChange={(e) => update({ edadActual: Number(e.target.value) })}
              className="mt-3.5 w-full cursor-pointer"
            />
          </div>

          {/* Género (Edad legal de jubilación) */}
          <div>
            <div className="h-6 flex items-center space-x-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span>Edad legal pensión AFP:</span>
              <InfoTooltip
                title="Edad legal de pensión en Chile"
                content="Por ley en Chile, mujeres a los 60 años y hombres a los 65 años. A esa edad se desbloquea tu AFP y la PGU. Todo retiro previo se financia de tu portafolio libre (fase Puente FIRE)."
              />
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ genero: 'hombre' })}
                className={`h-9 flex items-center justify-center border-2 border-black text-xs font-mono font-bold transition-all ${
                  input.genero === 'hombre'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#fff]'
                    : 'bg-white text-neutral-700 hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                Hombre (65a)
              </button>
              <button
                type="button"
                onClick={() => update({ genero: 'mujer' })}
                className={`h-9 flex items-center justify-center border-2 border-black text-xs font-mono font-bold transition-all ${
                  input.genero === 'mujer'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#fff]'
                    : 'bg-white text-neutral-700 hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                Mujer (60a)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ingresos y Previsión */}
      <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-2.5 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200">
              02 / Ingresos y Previsión (Chile)
            </span>
            <InfoTooltip
              title="Cálculo Previsional y Tributario Chile"
              content={`Calcula la relación entre Líquido y Bruto, 10% obligatorio de AFP, salud 7%, cotización Isapre, seguro cesantía AFC e Impuesto de 2da Categoría SII. UF actual: $${ufRate.toLocaleString('es-CL', { maximumFractionDigits: 0 })}.`}
            />
          </div>

          {/* Selector de modo: Líquido o Bruto */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-neutral-500 font-semibold text-[11px]">Ingreso desde:</span>
            <div className="flex items-center border-2 border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:shadow-[2px_2px_0px_0px_#fff]">
              <button
                type="button"
                onClick={() => handleModeSwitch('liquido')}
                className={`px-2.5 py-0.5 font-bold transition-all ${
                  inputSalaryMode === 'liquido'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                Sueldo Líquido
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('bruto')}
                className={`px-2.5 py-0.5 font-bold transition-all ${
                  inputSalaryMode === 'bruto'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                Sueldo Bruto
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Fila 1: Sueldo Principal y Previsión de Salud */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Input Salario según modo */}
            {inputSalaryMode === 'liquido' ? (
              <div>
                <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  <span className="inline-flex items-center space-x-1.5 truncate mr-2">
                    <span>Sueldo líquido mensual:</span>
                    <InfoTooltip
                      title="Sueldo Líquido"
                      content="Dinero exacto que recibes en tu cuenta corriente tras descuentos legales (AFP, salud, AFC e impuesto único)."
                    />
                  </span>
                  <span className="border-2 border-black bg-emerald-100 px-2 py-0.5 text-emerald-950 font-black shadow-[1.5px_1.5px_0px_0px_#000] dark:border-zinc-200 dark:bg-emerald-900 dark:text-emerald-100 whitespace-nowrap shrink-0">
                    ≈ {toUf(input.sueldoLiquidoMensual)}
                  </span>
                </div>
                <div className="mt-2 h-10 flex items-center border-2 border-black bg-white px-3 text-sm font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
                  <span className="mr-1 text-neutral-500">$</span>
                  <input
                    type="text"
                    value={formatThousands(input.sueldoLiquidoMensual)}
                    onChange={(e) => handleNetSalaryChange(parseThousands(e.target.value))}
                    className="w-full bg-transparent tabular-nums focus:outline-none"
                  />
                  <span className="ml-2 text-xs text-neutral-400">CLP</span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={8000000}
                  step={50000}
                  value={input.sueldoLiquidoMensual}
                  onChange={(e) => handleNetSalaryChange(Number(e.target.value))}
                  className="mt-3 w-full cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  <span className="inline-flex items-center space-x-1.5 truncate mr-2">
                    <span>Sueldo bruto pactado:</span>
                    <InfoTooltip
                      title="Sueldo Bruto Pactado"
                      content="Monto pactado en tu contrato de trabajo antes de deducciones de seguridad social e impuestos."
                    />
                  </span>
                  <span className="border-2 border-black bg-blue-100 px-2 py-0.5 text-blue-950 font-black shadow-[1.5px_1.5px_0px_0px_#000] dark:border-zinc-200 dark:bg-blue-900 dark:text-blue-100 whitespace-nowrap shrink-0">
                    ≈ {toUf(enteredBruto)}
                  </span>
                </div>
                <div className="mt-2 h-10 flex items-center border-2 border-black bg-white px-3 text-sm font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
                  <span className="mr-1 text-neutral-500">$</span>
                  <input
                    type="text"
                    value={formatThousands(enteredBruto)}
                    onChange={(e) => handleGrossSalaryChange(parseThousands(e.target.value))}
                    className="w-full bg-transparent tabular-nums focus:outline-none"
                  />
                  <span className="ml-2 text-xs text-neutral-400">CLP</span>
                </div>
                <input
                  type="range"
                  min={600000}
                  max={10000000}
                  step={50000}
                  value={enteredBruto}
                  onChange={(e) => handleGrossSalaryChange(Number(e.target.value))}
                  className="mt-3 w-full cursor-pointer"
                />
              </div>
            )}

            {/* Previsión de Salud: Fonasa vs Isapre */}
            <div>
              <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                <span className="inline-flex items-center space-x-1.5">
                  <span>Previsión de salud:</span>
                  <InfoTooltip
                    title="Previsión de Salud en Chile"
                    content="Fonasa descuenta el 7% legal de tu sueldo (tope 84.3 UF). En Isapre, si el plan cuesta más del 7%, pagas una cotización adicional con tu bolsillo."
                  />
                </span>
                <span className="text-[11px] font-mono text-neutral-500 whitespace-nowrap shrink-0">
                  Legal: 7% (tope 84.3 UF)
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleHealthSystemChange('fonasa')}
                  className={`h-10 flex items-center justify-center border-2 border-black text-xs font-mono font-bold transition-all ${
                    healthSystem === 'fonasa'
                      ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#fff]'
                      : 'bg-white text-neutral-700 hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  Fonasa (7% Legal)
                </button>

                <button
                  type="button"
                  onClick={() => handleHealthSystemChange('isapre')}
                  className={`h-10 flex items-center justify-center space-x-1.5 border-2 border-black text-xs font-mono font-bold transition-all ${
                    healthSystem === 'isapre'
                      ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#fff]'
                      : 'bg-white text-neutral-700 hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  <HeartPulse className="h-3.5 w-3.5" />
                  <span>Isapre (Plan)</span>
                </button>
              </div>

              {/* Sub-configuración si es Isapre */}
              {healthSystem === 'isapre' && (
                <div className="mt-3 border-2 border-black bg-neutral-50 p-3 text-xs font-mono dark:border-zinc-200 dark:bg-zinc-950 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-neutral-700 dark:text-neutral-300">
                      Costo plan Isapre:
                    </span>
                    <div className="flex items-center space-x-1 border border-black bg-white p-0.5 text-[10px] dark:border-zinc-700 dark:bg-zinc-900">
                      <button
                        type="button"
                        onClick={() => setIsaprePlanType('uf')}
                        className={`px-1.5 py-0.5 font-bold ${
                          isaprePlanType === 'uf'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-neutral-600'
                        }`}
                      >
                        En UF
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsaprePlanType('clp')}
                        className={`px-1.5 py-0.5 font-bold ${
                          isaprePlanType === 'clp'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-neutral-600'
                        }`}
                      >
                        En CLP
                      </button>
                    </div>
                  </div>

                  {isaprePlanType === 'uf' ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-1 items-center border border-black bg-white px-2.5 py-1 text-xs font-bold dark:border-zinc-700 dark:bg-zinc-900">
                        <input
                          type="number"
                          step={0.1}
                          min={1}
                          max={15}
                          value={isaprePlanUf}
                          onChange={(e) => setIsaprePlanUf(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-transparent tabular-nums focus:outline-none"
                        />
                        <span className="text-neutral-400">UF</span>
                      </div>
                      <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 whitespace-nowrap shrink-0">
                        ≈ ${Math.round(isaprePlanUf * dynamicParams.uf).toLocaleString('es-CL')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-1 items-center border border-black bg-white px-2.5 py-1 text-xs font-bold dark:border-zinc-700 dark:bg-zinc-900">
                        <span className="mr-1 text-neutral-400">$</span>
                        <input
                          type="text"
                          value={formatThousands(isaprePlanClp)}
                          onChange={(e) => setIsaprePlanClp(parseThousands(e.target.value))}
                          className="w-full bg-transparent tabular-nums focus:outline-none"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 whitespace-nowrap shrink-0">
                        ≈ {toUf(isaprePlanClp)}
                      </span>
                    </div>
                  )}

                  <div className="pt-1 text-[11px] border-t border-black/10 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-neutral-500">
                      7% legal: ${Math.round(breakdown.salud.saludLegal7Pct).toLocaleString('es-CL')}
                    </span>
                    {breakdown.salud.cotizacionAdicionalSalud > 0 ? (
                      <span className="font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                        Adicional: +${Math.round(breakdown.salud.cotizacionAdicionalSalud).toLocaleString('es-CL')}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        Excedente: ${Math.round(breakdown.salud.excedentesIsapre).toLocaleString('es-CL')}/mes
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fila 2: APV y AFC (Cesantía) - 100% ALINEADOS HORIZONTAL Y VERTICALMENTE */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-1">
            {/* Columna 1: Monto APV */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  <span className="inline-flex items-center space-x-1.5 truncate mr-1">
                    <span>Ahorro voluntario (APV)</span>
                    <InfoTooltip
                      title="Aporte Voluntario APV"
                      content="Ahorro previsional voluntario para adelantar la jubilación o pagar menos impuestos en Chile."
                    />
                  </span>
                  <span className="text-[11px] font-bold text-neutral-500 whitespace-nowrap shrink-0">
                    {input.aporteApvMensual > 0 ? toUf(input.aporteApvMensual) : 'Opcional'}
                  </span>
                </div>
                <div className="mt-2 h-10 flex items-center border-2 border-black bg-white px-3 text-xs font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
                  <span className="mr-1 text-neutral-400">$</span>
                  <input
                    type="text"
                    value={formatThousands(input.aporteApvMensual)}
                    onChange={(e) => update({ aporteApvMensual: parseThousands(e.target.value) })}
                    className="w-full bg-transparent tabular-nums focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-2.5 flex items-center h-5">
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={20000}
                  value={input.aporteApvMensual}
                  onChange={(e) => update({ aporteApvMensual: Number(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Columna 2: Régimen APV */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="h-6 flex items-center space-x-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  <span>Régimen tributario APV</span>
                  <InfoTooltip
                    title="Régimen APV A vs B"
                    content="Régimen A: Bono fiscal 15% (tope 6 UTM/año). Régimen B: Rebaja base de impuesto (tope 50 UF/mes)."
                  />
                </div>
                <select
                  value={apvRegimen}
                  onChange={(e) => setApvRegimen(e.target.value as 'A' | 'B' | 'ninguno')}
                  className="mt-2 h-10 w-full border-2 border-black bg-white px-2.5 text-xs font-mono font-semibold text-black shadow-[2px_2px_0px_0px_#000] focus:outline-none dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff] cursor-pointer"
                >
                  <option value="ninguno">Sin beneficio tributario (O sin APV)</option>
                  <option value="A">Régimen A (+15% Bono Fiscal)</option>
                  <option value="B">Régimen B (Rebaja Impuesto SII)</option>
                </select>
              </div>
              <p className="mt-2.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 leading-tight truncate">
                {apvRegimen === 'A'
                  ? 'Bono fiscal hasta 6 UTM/año (~$435.000).'
                  : apvRegimen === 'B'
                  ? 'Rebaja base imponible (tope 50 UF/mes).'
                  : 'Sin beneficio tributario directo.'}
              </p>
            </div>

            {/* Columna 3: Seguro Cesantía (AFC) */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="h-6 flex items-center space-x-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  <span>Seguro de cesantía (AFC)</span>
                  <InfoTooltip
                    title="Seguro de Cesantía"
                    content="Contrato indefinido: 0.6% trabajador (tope 126.6 UF). Plazo fijo / independiente: 0%."
                  />
                </div>
                <label className="mt-2 h-10 flex items-center justify-between border-2 border-black bg-white px-3 text-xs font-mono font-semibold shadow-[2px_2px_0px_0px_#000] cursor-pointer dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
                  <span className="truncate mr-2">{tieneAfc ? 'Contrato Indefinido (0.6%)' : 'Sin AFC (0%)'}</span>
                  <input
                    type="checkbox"
                    checked={tieneAfc}
                    onChange={(e) => setTieneAfc(e.target.checked)}
                    className="h-4 w-4 shrink-0 border-2 border-black accent-black cursor-pointer"
                  />
                </label>
              </div>
              <p className="mt-2.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 leading-tight truncate">
                Tope imponible 126.6 UF ({formatMoney(dynamicParams.topeImponibleAfcUF * dynamicParams.uf, currencyMode, ufRate)})
              </p>
            </div>
          </div>

          {/* Desglose Unificado de Sueldo / Liquidación */}
          <div className="border-2 border-black bg-neutral-50 p-4 font-mono shadow-[3px_3px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:shadow-[3px_3px_0px_0px_#fff]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#facc15] text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                  <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-black dark:text-white">
                    Sueldo bruto calculado:{' '}
                    <span className="text-blue-700 dark:text-blue-400">
                      {formatMoney(breakdown.sueldoBruto, currencyMode, ufRate)}
                    </span>{' '}
                    <span className="text-neutral-500 font-normal whitespace-nowrap">
                      (≈ {toUf(breakdown.sueldoBruto)})
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Líquido: <strong>{formatMoney(breakdown.sueldoLiquido, currencyMode, ufRate)}</strong> · Aporte fondo AFP: <strong>+{formatMoney(breakdown.cotizacionAfp10, currencyMode, ufRate)}/mes</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="flex items-center space-x-1 border-2 border-black bg-white px-2.5 py-1 text-xs font-bold text-black shadow-[1.5px_1.5px_0px_0px_#000] hover:bg-neutral-100 dark:border-zinc-200 dark:bg-zinc-900 dark:text-white"
              >
                <span>{showDetailedBreakdown ? 'Ocultar desglose' : 'Ver desglose'}</span>
                {showDetailedBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {showDetailedBreakdown && (
              <div className="mt-3.5 border-t-2 border-black/10 pt-3 dark:border-zinc-800">
                <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
                  {/* AFP 10% */}
                  <div className="border border-black bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-neutral-500 block text-[10px]">AFP (10% fondo)</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                      +{formatMoney(breakdown.cotizacionAfp10, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Comisión AFP */}
                  <div className="border border-black bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-neutral-500 block text-[10px]">Comisión AFP</span>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      -{formatMoney(breakdown.comisionAfp, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Salud 7% */}
                  <div className="border border-black bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-neutral-500 block text-[10px]">Salud (7% Legal)</span>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      -{formatMoney(breakdown.salud.saludLegal7Pct, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Adicional Isapre */}
                  <div className="border border-black bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-neutral-500 block text-[10px]">Adicional Isapre</span>
                    <span className={`font-bold whitespace-nowrap ${breakdown.salud.cotizacionAdicionalSalud > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-neutral-400'}`}>
                      {breakdown.salud.cotizacionAdicionalSalud > 0 ? `-${formatMoney(breakdown.salud.cotizacionAdicionalSalud, currencyMode, ufRate)}` : '$0'}
                    </span>
                  </div>

                  {/* Cesantía */}
                  <div className="border border-black bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-neutral-500 block text-[10px]">AFC Cesantía</span>
                    <span className="font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      -{formatMoney(breakdown.seguroCesantia, currencyMode, ufRate)}
                    </span>
                  </div>

                  {/* Impuesto SII */}
                  <div className="border border-black bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-neutral-500 block text-[10px]">Impuesto SII 2da</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      -{formatMoney(breakdown.impuestoSegundaCategoria, currencyMode, ufRate)}
                    </span>
                  </div>
                </div>

                {breakdown.apvBeneficioFiscalEstimado > 0 && (
                  <div className="mt-2.5 flex items-center justify-between border-2 border-black bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
                    <span className="inline-flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 text-emerald-700" />
                      <span>Beneficio fiscal APV (Régimen {breakdown.apvRegimen}):</span>
                    </span>
                    <span className="font-black whitespace-nowrap">
                      +{formatMoney(breakdown.apvBeneficioFiscalEstimado, currencyMode, ufRate)}/mes
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Crecimiento Salarial Real Anual */}
          <div className="pt-2 border-t-2 border-black/10 dark:border-zinc-800">
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5">
                <span>Crecimiento salarial real anual:</span>
                <InfoTooltip
                  title="Aumento Real Anual de Sueldo"
                  content="Porcentaje anual que estimas que tu sueldo aumentará por sobre la inflación debido a experiencia o ascensos."
                />
              </span>
              <span className="border-2 border-black bg-[#facc15] px-2 py-0.5 text-black font-black text-xs shadow-[1.5px_1.5px_0px_0px_#000] dark:border-zinc-200 whitespace-nowrap shrink-0">
                +{input.crecimientoIngresoRealPct}% anual
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={input.crecimientoIngresoRealPct}
              onChange={(e) => update({ crecimientoIngresoRealPct: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-neutral-500">Aumentos proyectados por sobre la inflación</span>
              <div className="flex items-center space-x-1">
                {[0, 2, 3.5, 5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => update({ crecimientoIngresoRealPct: rate })}
                    className={`border border-black px-2 py-0.5 font-bold transition-all ${
                      input.crecimientoIngresoRealPct === rate
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-white text-neutral-600 hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-neutral-300'
                    }`}
                  >
                    {rate === 0 ? '0%' : `+${rate}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gastos Mensuales y en Retiro */}
      <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="mb-4 flex items-center justify-between border-b-2 border-black/10 pb-2.5 dark:border-zinc-800">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            03 / Estilo de Vida y Gastos
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Gasto Mensual Actual */}
          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5 truncate mr-2">
                <span>Gasto mensual actual:</span>
                <InfoTooltip
                  title="Gasto Mensual del Hogar"
                  content="Costo de vida mensual actual: vivienda, comida, servicios, transporte y compras. La diferencia con tu sueldo es tu ahorro."
                />
              </span>
              <span className="text-[11px] font-bold text-neutral-500 whitespace-nowrap shrink-0">
                ≈ {toUf(input.gastoMensualActual)}
              </span>
            </div>
            <div className="mt-2 h-10 flex items-center border-2 border-black bg-white px-3 text-sm font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
              <span className="mr-1 text-neutral-500">$</span>
              <input
                type="text"
                value={formatThousands(input.gastoMensualActual)}
                onChange={(e) => update({ gastoMensualActual: parseThousands(e.target.value) })}
                className="w-full bg-transparent tabular-nums focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={200000}
              max={5000000}
              step={50000}
              value={input.gastoMensualActual}
              onChange={(e) => update({ gastoMensualActual: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />
          </div>

          {/* Gasto Deseado en Retiro */}
          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5 truncate mr-2">
                <span>Gasto deseado en retiro:</span>
                <InfoTooltip
                  title="Presupuesto Mensual de Retiro"
                  content="Presupuesto para vivir sin trabajar. Si la vivienda está pagada, suele ser entre 75% y 85% del gasto actual."
                />
              </span>
              <span className="text-[11px] font-bold text-neutral-500 whitespace-nowrap shrink-0">
                ≈ {toUf(input.gastoMensualRetiro)}
              </span>
            </div>
            <div className="mt-2 h-10 flex items-center border-2 border-black bg-white px-3 text-sm font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
              <span className="mr-1 text-neutral-500">$</span>
              <input
                type="text"
                value={formatThousands(input.gastoMensualRetiro)}
                onChange={(e) => update({ gastoMensualRetiro: parseThousands(e.target.value) })}
                className="w-full bg-transparent tabular-nums focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={200000}
              max={5000000}
              step={50000}
              value={input.gastoMensualRetiro}
              onChange={(e) => update({ gastoMensualRetiro: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />
            {/* Atajos */}
            <div className="mt-2 flex items-center space-x-1.5 text-xs font-mono">
              <span className="text-neutral-500">Atajos:</span>
              <button
                type="button"
                onClick={() => update({ gastoMensualRetiro: Math.round(input.gastoMensualActual * 0.8) })}
                className="border border-black bg-neutral-100 px-2 py-0.5 font-bold hover:bg-neutral-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-neutral-300"
              >
                80% actual
              </button>
              <button
                type="button"
                onClick={() => update({ gastoMensualRetiro: input.gastoMensualActual })}
                className="border border-black bg-neutral-100 px-2 py-0.5 font-bold hover:bg-neutral-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-neutral-300"
              >
                100% igual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Patrimonio Actual Acumulado */}
      <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="mb-4 flex items-center justify-between border-b-2 border-black/10 pb-2.5 dark:border-zinc-800">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            04 / Patrimonio Actual Acumulado
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Portafolio Libre */}
          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5 truncate mr-2">
                <span>Portafolio libre (ETFs, C2):</span>
                <InfoTooltip
                  title="Portafolio Libre de Inversión"
                  content="Dinero sin restricciones de retiro por edad: Cuenta 2, ETFs globales (VWRA, CSPX), acciones. Financia los años antes de la pensión legal."
                />
              </span>
              <span className="border-2 border-black bg-emerald-100 px-2 py-0.5 text-emerald-950 font-black shadow-[1.5px_1.5px_0px_0px_#000] dark:border-zinc-200 dark:bg-emerald-900 dark:text-emerald-100 whitespace-nowrap shrink-0">
                ≈ {toUf(input.patrimonioLiquidoInicial)}
              </span>
            </div>
            <div className="mt-2 h-10 flex items-center border-2 border-black bg-white px-3 text-sm font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
              <span className="mr-1 text-neutral-500">$</span>
              <input
                type="text"
                value={formatThousands(input.patrimonioLiquidoInicial)}
                onChange={(e) => update({ patrimonioLiquidoInicial: parseThousands(e.target.value) })}
                className="w-full bg-transparent tabular-nums focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100000000}
              step={500000}
              value={input.patrimonioLiquidoInicial}
              onChange={(e) => update({ patrimonioLiquidoInicial: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />
          </div>

          {/* Saldo AFP */}
          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5 truncate mr-2">
                <span>Saldo cuenta AFP obligatoria:</span>
                <InfoTooltip
                  title="Fondo Acumulado en AFP Obligatoria"
                  content="Ahorro en tu cuenta individual AFP. Se desbloquea a los 60/65 años y garantiza tu pensión legal vitalicia."
                />
              </span>
              <span className="border-2 border-black bg-blue-100 px-2 py-0.5 text-blue-950 font-black shadow-[1.5px_1.5px_0px_0px_#000] dark:border-zinc-200 dark:bg-blue-900 dark:text-blue-100 whitespace-nowrap shrink-0">
                ≈ {toUf(input.saldoAfpInicial)}
              </span>
            </div>
            <div className="mt-2 h-10 flex items-center border-2 border-black bg-white px-3 text-sm font-mono font-bold text-black shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
              <span className="mr-1 text-neutral-500">$</span>
              <input
                type="text"
                value={formatThousands(input.saldoAfpInicial)}
                onChange={(e) => update({ saldoAfpInicial: parseThousands(e.target.value) })}
                className="w-full bg-transparent tabular-nums focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={0}
              max={150000000}
              step={500000}
              value={input.saldoAfpInicial}
              onChange={(e) => update({ saldoAfpInicial: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 5. Supuestos de Mercado & Pensión */}
      <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="mb-4 flex items-center justify-between border-b-2 border-black/10 pb-2.5 dark:border-zinc-800">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            05 / Rentabilidades Reales y Regla del 4%
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5 truncate mr-1">
                <span>Portafolio libre:</span>
                <InfoTooltip
                  title="Rentabilidad Real de Inversiones Libres"
                  content="Retorno neto sobre inflación (IPC). Los fondos globales promedian históricamente 6.5% a 7.5% real."
                />
              </span>
              <span className="border border-black bg-emerald-100 px-1.5 py-0.2 text-emerald-950 dark:border-zinc-200 dark:bg-emerald-900 dark:text-emerald-100 whitespace-nowrap shrink-0">
                {input.rentabilidadPortafolioRealPct}%
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={11}
              step={0.5}
              value={input.rentabilidadPortafolioRealPct}
              onChange={(e) => update({ rentabilidadPortafolioRealPct: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />
            <span className="text-[10px] font-mono text-neutral-500 block mt-1">S&P 500 / ETFs (~7% real)</span>
          </div>

          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5 truncate mr-1">
                <span>Fondo AFP:</span>
                <InfoTooltip
                  title="Rentabilidad Real AFP"
                  content="Retorno anual esperado del fondo obligatorio. Promedios históricos: Fondo A (~5.8%), C (~4.4%), E (~2.8%)."
                />
              </span>
              <span className="border border-black bg-blue-100 px-1.5 py-0.2 text-blue-950 dark:border-zinc-200 dark:bg-blue-900 dark:text-blue-100 whitespace-nowrap shrink-0">
                {input.rentabilidadAfpRealPct}%
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={7}
              step={0.5}
              value={input.rentabilidadAfpRealPct}
              onChange={(e) => update({ rentabilidadAfpRealPct: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />
            <span className="text-[10px] font-mono text-neutral-500 block mt-1">Fondo A (~5.8%) / C (~4.4%)</span>
          </div>

          <div>
            <div className="h-6 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex items-center space-x-1.5 truncate mr-1">
                <span>Retiro Seguro (SWR):</span>
                <InfoTooltip
                  title="Tasa de Retiro Seguro (SWR)"
                  content="Porcentaje del portafolio que retiras cada año para que tu capital no se extinga (Estudio Trinity / Regla del 4%)."
                />
              </span>
              <span className="border border-black bg-amber-100 px-1.5 py-0.2 text-amber-950 dark:border-zinc-200 dark:bg-amber-900 dark:text-amber-100 whitespace-nowrap shrink-0">
                {input.tasaRetiroSeguroPct}%
              </span>
            </div>
            <input
              type="range"
              min={3.0}
              max={5.0}
              step={0.1}
              value={input.tasaRetiroSeguroPct}
              onChange={(e) => update({ tasaRetiroSeguroPct: Number(e.target.value) })}
              className="mt-3 w-full cursor-pointer"
            />
            <span className="text-[10px] font-mono text-neutral-500 block mt-1">Regla 4% Trinity Study</span>
          </div>

          <div className="flex flex-col justify-between">
            <div className="h-6 flex items-center text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
              <span>Pensión estatal</span>
            </div>
            <label className="h-10 flex items-center space-x-2 border-2 border-black bg-white px-3 font-mono text-xs font-semibold shadow-[2px_2px_0px_0px_#000] cursor-pointer dark:border-zinc-200 dark:bg-zinc-950 dark:text-white dark:shadow-[2px_2px_0px_0px_#fff]">
              <input
                type="checkbox"
                checked={input.incluirPgu}
                onChange={(e) => update({ incluirPgu: e.target.checked })}
                className="h-4 w-4 border-2 border-black accent-black cursor-pointer shrink-0"
              />
              <span className="inline-flex items-center space-x-1 truncate">
                <span>PGU (65 años)</span>
                <InfoTooltip
                  title="Pensión Garantizada Universal (PGU)"
                  content="Aporte estatal solidario para mayores de 65 años (~$214.296/mes reajustable)."
                />
              </span>
            </label>
            <p className="mt-1 text-[10px] font-mono text-neutral-500 leading-tight truncate">
              Aporte estatal solidario (~$214.296/mes).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
