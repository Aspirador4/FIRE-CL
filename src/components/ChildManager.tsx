'use client';

import React, { useState } from 'react';
import { ChildConfig } from '@/lib/fireEngine';
import { CHILD_COST_PRESETS, ChildPreset } from '@/lib/constants';
import { CurrencyMode, formatMoney, formatThousands, parseThousands } from '@/lib/formatters';
import { Plus, Trash2, Sparkles } from 'lucide-react';

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
    <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(10,10,10,0.02)] dark:border-white/[0.08] dark:bg-[#1a1a19]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.05] pb-3 dark:border-white/[0.06]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            06 / Planificación Familiar
          </span>
          <h3 className="text-[15px] font-semibold tracking-tight text-[#0a0a0a] dark:text-white mt-0.5">
            ¿Y si tengo un hijo a los X años?
          </h3>
        </div>

        <button
          type="button"
          onClick={handleAddChild}
          className="inline-flex items-center space-x-1.5 rounded-full border border-black/[0.08] bg-[#fafaf8] px-3.5 py-1.5 text-xs font-medium text-neutral-800 shadow-[0_1px_2px_rgba(10,10,10,0.02)] transition-all duration-150 hover:border-black/20 hover:bg-white active:scale-[0.97] dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-200"
        >
          <Plus className="h-3.5 w-3.5 text-neutral-500" />
          <span>Añadir Hijo</span>
        </button>
      </div>

      {hijos.length === 0 ? (
        <div className="my-5 rounded-2xl border border-dashed border-black/[0.08] p-8 text-center dark:border-white/[0.08]">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            No tienes hijos configurados en la simulación.
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Simula tener un hijo a los 32 o 35 años para ver cómo se desplaza tu meta FIRE.
          </p>
          <button
            type="button"
            onClick={handleAddChild}
            className="mt-3.5 inline-flex items-center space-x-1.5 rounded-full bg-[#0a0a0a] px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-[#0a0a0a]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simular: &ldquo;Tener un hijo a los 34 años&rdquo;</span>
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Resumen de Impacto */}
          {impactoHijos.diferenciaAnosFire > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-50/40 p-4 text-xs text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/20 dark:text-amber-200">
              <div className="space-y-1">
                <span className="font-semibold text-[13px] block">
                  Impacto estimado en tu libertad financiera:
                </span>
                <p className="text-[12px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                  Tener hijos posterga tu retiro en{' '}
                  <strong className="underline decoration-amber-500 font-bold">
                    +{impactoHijos.diferenciaAnosFire} años
                  </strong>{' '}
                  (o requiere ahorrar{' '}
                  <strong>
                    {formatMoney(impactoHijos.ahorroMensualEquivalente, currencyMode, ufRate)}
                  </strong>
                  /mes adicional para retirarte a la misma edad).
                </p>
              </div>

              <div className="rounded-lg border border-amber-300/50 bg-white/90 px-3.5 py-1.5 text-right dark:border-amber-800 dark:bg-neutral-900">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  Gasto Total en Crianza
                </span>
                <span className="text-[15px] font-semibold text-[#0a0a0a] tabular-nums dark:text-white">
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
                className="space-y-4 rounded-xl border border-black/[0.06] bg-[#fafaf8] p-5 dark:border-white/[0.06] dark:bg-neutral-800/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-xs font-mono font-semibold text-[#0a0a0a] dark:bg-neutral-700 dark:text-white">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={hijo.name}
                      onChange={(e) => handleUpdateChild(hijo.id, { name: e.target.value })}
                      className="bg-transparent text-[13px] font-semibold text-[#0a0a0a] focus:outline-none dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveChild(hijo.id)}
                    className="rounded p-1 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Eliminar este hijo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Edad del usuario y Presets */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <div className="flex justify-between text-xs font-medium text-[#0a0a0a] dark:text-white">
                      <span>Tu edad cuando nace:</span>
                      <span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
                        {hijo.edadPadreAlNacer} años
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
                      className="mt-2.5 w-full"
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <span className="block text-xs font-medium text-[#0a0a0a] dark:text-white mb-2">
                      Preset de Colegio y Universidad en Chile:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CHILD_COST_PRESETS.map((p) => {
                        const isSelected = currentPreset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => applyPresetToChild(hijo.id, p)}
                            className={`rounded-full border py-1 px-2.5 text-[11px] font-medium transition-all duration-150 active:scale-[0.98] ${
                              isSelected
                                ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-sm dark:border-white dark:bg-white dark:text-[#0a0a0a]'
                                : 'border-black/[0.08] bg-white text-neutral-600 hover:border-black/20 dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-300'
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
                <div className="rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.08] dark:bg-neutral-900">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 block mb-2.5">
                    Línea de Vida y Gastos Mensuales por Etapa
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* 0 a 3 años */}
                    <div className="rounded-lg border border-black/[0.05] bg-[#fafaf8] p-2.5 dark:border-white/[0.06] dark:bg-neutral-800/60">
                      <div className="flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">0-3a Sala Cuna</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Tus {hijo.edadPadreAlNacer}-{hijo.edadPadreAlNacer + 3}a</span>
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
                          className="w-full bg-transparent text-xs font-semibold tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">/mes</span>
                      </div>
                    </div>

                    {/* 4 a 17 años */}
                    <div className="rounded-lg border border-black/[0.05] bg-[#fafaf8] p-2.5 dark:border-white/[0.06] dark:bg-neutral-800/60">
                      <div className="flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">4-17a Escolar</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Tus {hijo.edadPadreAlNacer + 4}-{hijo.edadPadreAlNacer + 17}a</span>
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
                          className="w-full bg-transparent text-xs font-semibold tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">/mes</span>
                      </div>
                    </div>

                    {/* 18 a 23 años */}
                    <div className="rounded-lg border border-black/[0.05] bg-[#fafaf8] p-2.5 dark:border-white/[0.06] dark:bg-neutral-800/60">
                      <div className="flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">18-23a Universidad</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Tus {hijo.edadPadreAlNacer + 18}-{hijo.edadPadreAlNacer + 23}a</span>
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
                          className="w-full bg-transparent text-xs font-semibold tabular-nums text-[#0a0a0a] focus:outline-none dark:text-white"
                        />
                        <span className="text-[10px] text-neutral-400">/mes</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <span>A tus {hijo.edadPadreAlNacer + 24} años el hijo cumple 24 años e independiza económicamente.</span>
                    <span className="font-mono text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">Fin del gasto</span>
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
