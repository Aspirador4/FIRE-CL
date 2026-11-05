import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdBanner } from '@/components/AdBanner';
import { Calculator, ShieldCheck, Database, Percent } from 'lucide-react';

export const metadata = {
  title: 'Metodología y Supuestos de Cálculo | Dividendo de Tiempo',
  description:
    'Explicación técnica y matemática de las fórmulas, leyes tributarias del SII y supuestos actuariales de la Calculadora FIRE Chile.',
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Calculator className="h-4 w-4" />
            <span>Transparencia Matemática</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
            Metodología y Supuestos de Cálculo
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Conoce con total claridad cómo modelamos tus impuestos, la acumulación en UF/CLP y las fases de jubilación temprana.
          </p>
        </div>

        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Percent className="h-5 w-5 text-emerald-600" />
            <span>1. Rentabilidades Reales vs Nominales</span>
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            Todas las proyecciones de esta calculadora se realizan en <strong>términos reales</strong> (descontando el IPC/inflación). Esto significa que un gasto mensual de $1.500.000 dentro de 20 años representa exactamente el mismo poder adquisitivo que $1.500.000 hoy en día.
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1 text-slate-600 dark:text-slate-400">
            <li>Rentabilidad real de acciones globales (S&P 500 / MSCI World): Asumida en ~7.0% real anual histórico.</li>
            <li>Rentabilidad real de Fondos AFP: Desde ~2.8% real (Fondo E) hasta ~5.8% real (Fondo A).</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>2. Tramos Tributarios y Cotizaciones Legales</span>
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            Para la conversión de sueldo bruto a líquido, aplicamos rigurosamente el artículo 43 de la Ley sobre Impuesto a la Renta (Impuesto Único de Segunda Categoría) utilizando los tramos oficiales fijados en UTM:
          </p>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2">Tramo Mensual (UTM)</th>
                  <th className="py-2">Tasa Marginal</th>
                  <th className="py-2">Rebaja Oficial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr><td>0 a 13.5 UTM</td><td>Exento (0%)</td><td>0 UTM</td></tr>
                <tr><td>13.5 a 30 UTM</td><td>4.0%</td><td>0.54 UTM</td></tr>
                <tr><td>30 a 50 UTM</td><td>8.0%</td><td>1.74 UTM</td></tr>
                <tr><td>50 a 70 UTM</td><td>13.5%</td><td>4.49 UTM</td></tr>
                <tr><td>70 a 90 UTM</td><td>23.0%</td><td>11.14 UTM</td></tr>
                <tr><td>90 a 120 UTM</td><td>30.4%</td><td>17.80 UTM</td></tr>
                <tr><td>120 a 310 UTM</td><td>35.0%</td><td>23.32 UTM</td></tr>
                <tr><td>Más de 310 UTM</td><td>40.0%</td><td>38.82 UTM</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
            <span>3. Tasa de Retiro Seguro (SWR) y la Regla del 4%</span>
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            Originada en el influyente <em>Trinity Study</em>, la regla del 4% establece que un portafolio diversificado entre acciones y bonos tiene una probabilidad superior al 95% de durar al menos 30 a 40 años si retiras el 4% de su saldo inicial el primer año e indexas ese monto a la inflación.
          </p>
          <div className="rounded-xl bg-slate-100 p-3 font-mono text-xs dark:bg-slate-800 text-center">
            Meta FIRE Tradicional = (Gasto Anual Deseado) / (Tasa de Retiro Seguro)
          </div>
        </section>

        <AdBanner slotId="1000000004" format="horizontal" label="Publicidad" />
      </main>

      <Footer />
    </div>
  );
}
