import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Política de Privacidad | Dividendo de Tiempo',
  description: 'Política de privacidad y tratamiento de datos personales conforme a las leyes chilenas y directrices de Google AdSense.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white border-b border-slate-200 pb-4 dark:border-slate-800">
          Política de Privacidad
        </h1>
        <p className="text-xs text-slate-500">Última actualización: Noviembre 2026</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Compromiso con tu Privacidad Financiera</h2>
          <p className="text-xs leading-relaxed">
            En <strong>DividendoDeTiempo.cl</strong> respetamos profundamente tu confidencialidad. Los datos que introduces en la calculadora (sueldos, gastos, saldo de AFP, rentabilidades) se procesan <strong>100% en tu navegador (lado del cliente)</strong>. Ninguno de tus números financieros se almacena en bases de datos externas ni se vende a terceros.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Uso de Cookies y Publicidad de Google AdSense</h2>
          <p className="text-xs leading-relaxed">
            Este sitio utiliza cookies de proveedores externos, incluido Google, para mostrar anuncios basados en las visitas anteriores del usuario a este o a otros sitios web.
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>Google utiliza cookies como la cookie de DoubleClick para publicar anuncios pertinentes a los usuarios.</li>
            <li>Los usuarios pueden inhabilitar la publicidad personalizada visitando la Configuración de anuncios de Google.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Contacto</h2>
          <p className="text-xs leading-relaxed">
            Para cualquier consulta sobre esta política, puedes contactarnos a través de nuestros canales oficiales o repositorios comunitarios.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
