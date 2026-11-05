import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Términos de Uso y Descargo Legal | Dividendo de Tiempo',
  description: 'Términos y condiciones de uso y descargo de responsabilidad financiera.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f0] text-black dark:bg-[#0d0e12] dark:text-[#f4f4f7] flex flex-col justify-between">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white border-b border-slate-200 pb-4 dark:border-slate-800">
          Términos de Uso & Descargo Financiero
        </h1>
        <p className="text-xs text-slate-500">Última actualización: Noviembre 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Propósito Educativo e Informativo</h2>
          <p className="text-xs leading-relaxed">
            La información y herramientas proporcionadas en <strong>DividendoDeTiempo.cl</strong> tienen fines exclusivamente educativos y de simulación financiera. No constituyen asesoría financiera, tributaria, legal ni previsional profesional vinculante.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Supuestos y Riesgos de Mercado</h2>
          <p className="text-xs leading-relaxed">
            Las rentabilidades pasadas no garantizan rendimientos futuros. La rentabilidad de fondos mutuos, acciones, ETFs y fondos de AFP varía a lo largo del tiempo. Siempre es recomendable consultar con un asesor financiero acreditado ante la CMF antes de tomar decisiones de inversión.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Propiedad Intelectual</h2>
          <p className="text-xs leading-relaxed">
            El diseño, código y contenidos educativos son propiedad de la plataforma. El lema &ldquo;El mayor dividendo que podemos obtener del dinero es el tiempo&rdquo; es un principio fundamental que guía nuestra filosofía.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
