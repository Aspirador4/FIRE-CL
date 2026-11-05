'use client';

import React, { useState } from 'react';
import { ChildConfig } from '@/lib/fireEngine';
import { CHILD_COST_PRESETS, ChildPreset } from '@/lib/constants';
import { CurrencyMode, formatMoney, formatThousands, parseThousands } from '@/lib/formatters';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

interface ChildManagerProps {
  hijos: ChildConfig[];
  onChangeHijos: (hijos: ChildConfig[]) => void;
  edadActual: number;
  currencyMode: CurrencyMode;
  ufRate: number;
  impactoHijos: {
    diferenciaAnosFire: number;
    gastoTotalHijosVida: number;
    ahorroMensualEquivalente: number;
  };
}

export function ChildManager({
  hijos,
  onChangeHijos,
  edadActual,
  currencyMode,
  ufRate,
  impactoHijos,
}: ChildManagerProps) {
  const [selectedPresetMap, setSelectedPresetMap] = useState<Record<string, string>>({
    'hijo-demo-1': 'estandar',
  });

  const handleAddChild = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const preset = CHILD_COST_PRESETS[1]; // Estándar
    const newChild: ChildConfig = {
      id: newId,
      name: `Hijo ${hijos.length + 1}`,
      edadPadreAlNacer: Math.max(edadActual, 32),
      costoMensual0a3: preset.monthlyStage0to3,
      costoMensual4a17: preset.monthlyStage4to17,
      costoMensual18a23: preset.monthlyStage18to23,
    };
    setSelectedPresetMap((prev) => ({ ...prev, [newId]: 'estandar' }));
    onChangeHijos([...hijos, newChild]);
  };

  const handleRemoveChild = (id: string) => {
    onChangeHijos(hijos.filter((h) => h.id !== id));
  };

  const handleUpdateChild = (id: string, updates: Partial<ChildConfig>) => {
    onChangeHijos(
      hijos.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const applyPresetToChild = (id: string, preset: ChildPreset) => {
    setSelectedPresetMap((prev) => ({ ...prev, [id]: preset.id }));
    handleUpdateChild(id, {
      costoMensual0a3: preset.monthlyStage0to3,
      costoMensual4a17: preset.monthlyStage4to17,
      costoMensual18a23: preset.monthlyStage18to23,
    });
  };

  return (
    <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#fff]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-3 dark:border-zinc-800">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-zinc-200">
            [ 06 // PLANIFICACIÓN FAMILIAR ]
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <h3 className="text-base font-black tracking-tight text-black dark:text-white uppercase font-sans">
              ¿Y si tengo un hijo a los X años?
            </h3>
            <InfoTooltip
              title="Impacto Financiero de los Hijos"
              content="Modela con realismo cómo cambian tus flujos de caja según la etapa escolar y universitaria en Chile, calculando el desplazamiento de tu meta FIRE."
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddChild}
          className="inline-flex items-center space-x-1.5 border-2 border-black bg-[#facc15] px-3.5 py-1.5 text-xs font-mono font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:border-zinc-200"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>AÑADIR HIJO</span>
        </button>
      </div>

      {hijos.length === 0 ? (
        <div className="my-5 border-2 border-dashed border-black/30 p-8 text-center dark:border-zinc-700">
          <p className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400 uppercase">
            No tienes hijos configurados en la simulación.
          </p>
          <p className="mt-1 text-xs font-mono text-neutral-500">
            Simula tener un hijo a los 32 o 35 años para ver el impacto exacto en tu retiro.
          </p>
          <button
            type="button"
            onClick={handleAddChild}
            className="mt-4 inline-flex items-center space-x-1.5 border-2 border-black bg-black px-4 py-2 text-xs font-mono font-bold text-white shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#fff]"
          >
            <Sparkles className="h-4 w-4 text-[#facc15]" />
            <span>SIMULAR HIJO A LOS 34 AÑOS</span>
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Resumen de Impacto Brutalista */}
          {impactoHijos.diferenciaAnosFire > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-orange-50 p-4 font-mono text-xs text-orange-950 shadow-[3px_3px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-950 dark:text-orange-200 dark:shadow-[3px_3px_0px_0px_#fff]">
              <div className="space-y-1">
                <span className="font-black text-sm uppercase block">
                  IMPACTO ESTIMADO EN TU LIBERTAD FINANCIERA:
                </span>
                <p className="text-xs text-orange-900 dark:text-orange-300 leading-relaxed">
                  Tener hijos posterga tu retiro en{' '}
                  <strong className="bg-[#facc15] text-black px-1 border border-black font-black">
                    +{impactoHijos.diferenciaAnosFire} AÑOS
                  </strong>{' '}
                  (o requiere ahorrar{' '}
                  <strong className="underline">
                    {formatMoney(impactoHijos.ahorroMensualEquivalente, currencyMode, ufRate)}/mes
                  </strong>{' '}
                  adicional para retirarte a la misma edad).
                </p>
              </div>

              <div className="border-2 border-black bg-white px-3.5 py-2 text-right shadow-[2px_2px_0px_0px_#000] dark:border-zinc-200 dark:bg-zinc-900">
                <span className="block text-[10px] uppercase font-bold text-neutral-500">
                  Gasto Total Crianza
                </span>
                <span className="text-base font-black text-black tabular-nums dark:text-white">
                  {formatMoney(impactoHijos.gastoTotalHijosVida, currencyMode, ufRate)}
                </span>
              </div>
            </div>
          )}

          {/* Formulario y Timeline para cada hijo */}
          {hijos.map((hijo, index) => {
            const currentPreset = selectedPresetMap[hijo.id] || 'estandar';
            return (
              <div
                key={hijo.id}
                className="space-y-4 border-2 border-black bg-neutral-50 p-5 dark:border-zinc-200 dark:bg-zinc-950 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-2 dark:border-zinc-800">
                  <div className="flex items-center space-x-2.5">
                    <span className="flex h-6 w-6 items-center justify-center border-2 border-black bg-[#facc15] text-xs font-mono font-black text-black shadow-[1px_1px_0px_0px_#000]">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={hijo.name}
                      onChange={(e) => handleUpdateChild(hijo.id, { name: e.target.value })}
                      className="border-b border-black bg-transparent font-mono text-sm font-black text-black focus:outline-none dark:border-zinc-600 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveChild(hijo.id)}
                    className="border border-black bg-white p-1 text-black hover:bg-rose-100 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    title="Eliminar este hijo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Edad del usuario y Presets */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <div className="flex justify-between text-xs font-mono font-bold uppercase text-black dark:text-white">
                      <span>Tu edad cuando nace:</span>
                      <span className="border border-black bg-[#facc15] px-1.5 py-0.2 text-black font-black">
                        {hijo.edadPadreAlNacer} AÑOS
                      </span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={55}
                      value={hijo.edadPadreAlNacer}
                      onChange={(e) =>
                        handleUpdateChild(hijo.id, {
                          edadPadreAlNacer: Number(e.target.value),
                        })
                      }
                      className="mt-3 w-full cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <span className="block text-xs font-mono font-bold uppercase text-black dark:text-white mb-2">
                      Preset Colegios y Universidad:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CHILD_COST_PRESETS.map((p) => {
                        const isSelected = currentPreset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => applyPresetToChild(hijo.id, p)}
                            className={`border-2 border-black py-1 px-2 text-xs font-mono font-bold transition-all ${
                              isSelected
                                ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#fff]'
                                : 'bg-white text-neutral-700 hover:text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Timeline visual de hitos de vida */}
                <div className="border-2 border-black bg-white p-4 font-mono dark:border-zinc-200 dark:bg-zinc-900 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-2.5">
                    LÍNEA DE TIEMPO Y GASTO MENSUAL POR ETAPA
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* 0 a 3 años */}
                    <div className="border border-black bg-neutral-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                        <span>0-3a Sala Cuna</span>
                        <span className="text-[10px] text-neutral-500">{hijo.edadPadreAlNacer}-{hijo.edadPadreAlNacer + 3}a</span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-neutral-400 mr-1">$</span>
                        <input
                          type="text"
                          value={formatThousands(hijo.costoMensual0a3)}
                          onChange={(e) =>
                            handleUpdateChild(hijo.id, {
                              costoMensual0a3: parseThousands(e.target.value),
                            })
                          }
                          className="w-full bg-transparent text-xs font-black tabular-nums text-black focus:outline-none dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">/mes</span>
                      </div>
                    </div>

                    {/* 4 a 17 años */}
                    <div className="border border-black bg-neutral-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                        <span>4-17a Escolar</span>
                        <span className="text-[10px] text-neutral-500">{hijo.edadPadreAlNacer + 4}-{hijo.edadPadreAlNacer + 17}a</span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-neutral-400 mr-1">$</span>
                        <input
                          type="text"
                          value={formatThousands(hijo.costoMensual4a17)}
                          onChange={(e) =>
                            handleUpdateChild(hijo.id, {
                              costoMensual4a17: parseThousands(e.target.value),
                            })
                          }
                          className="w-full bg-transparent text-xs font-black tabular-nums text-black focus:outline-none dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">/mes</span>
                      </div>
                    </div>

                    {/* 18 a 23 años */}
                    <div className="border border-black bg-neutral-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                        <span>18-23a Universidad</span>
                        <span className="text-[10px] text-neutral-500">{hijo.edadPadreAlNacer + 18}-{hijo.edadPadreAlNacer + 23}a</span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-neutral-400 mr-1">$</span>
                        <input
                          type="text"
                          value={formatThousands(hijo.costoMensual18a23)}
                          onChange={(e) =>
                            handleUpdateChild(hijo.id, {
                              costoMensual18a23: parseThousands(e.target.value),
                            })
                          }
                          className="w-full bg-transparent text-xs font-black tabular-nums text-black focus:outline-none dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">/mes</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-black/10 dark:border-zinc-800">
                    <span>A tus {hijo.edadPadreAlNacer + 24} años el hijo cumple 24 años y se independiza.</span>
                    <span className="font-mono text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-400">FIN DEL GASTO</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
