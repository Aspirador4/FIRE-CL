import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdBanner } from '@/components/AdBanner';
import { Flame, Clock, ShieldCheck, Baby, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Guía FIRE Chile: Cómo Alcanzar la Libertad Financiera y Retirarte Joven',
  description:
    'Aprende a aplicar el movimiento FIRE (Financial Independence, Retire Early) en Chile. Regla del 4%, APV Régimen A vs B, jubilación anticipada con AFP y planificación familiar.',
};

export default function GuiaFireChilePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Banner Superior AdSense */}
        <AdBanner slotId="1000000001" format="horizontal" label="Publicidad" />

        <article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              <span>Educación Financiera Chile</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              Guía FIRE Chile: El Camino a la Libertad Financiera
            </h1>
            <p className="mt-2 text-lg italic text-slate-600 dark:text-slate-300">
              &ldquo;El mayor dividendo que podemos obtener del dinero es el tiempo.&rdquo;
            </p>
          </div>

          {/* Sección 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Flame className="h-6 w-6 text-emerald-500" />
              <span>1. ¿Qué es el Movimiento FIRE?</span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              El acrónimo <strong>FIRE</strong> proviene del inglés <em>Financial Independence, Retire Early</em> (Independencia Financiera, Retiro Temprano). No se trata necesariamente de no trabajar nunca más o estar acostado en una playa, sino de alcanzar el punto donde tus inversiones y ahorros generan suficiente dinero pasivo para cubrir tus gastos de vida para siempre. En ese instante, el trabajo se vuelve 100% opcional y recuperas la posesión de tu tiempo.
            </p>
          </section>

          {/* Sección 2: El Reto Chileno y el Puente FIRE */}
          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <span>2. La Gran Diferencia en Chile: El Retiro Puente y la AFP</span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              En Estados Unidos o Europa, la mayoría de calculadoras asumen que todos tus ahorros están disponibles o que no existe un sistema como el chileno. En Chile ocurre algo particular:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Fondo Obligatorio AFP (10%):</strong> No puedes retirarlo antes de los 60 años (si eres mujer) o 65 años (si eres hombre), salvo que cumplas con los estrictos requisitos de retiro anticipado de la Superintendencia de Pensiones.
              </li>
              <li>
                <strong>Portafolio Libre (El Puente):</strong> Si deseas retirarte a los 38, 45 o 50 años, necesitas un fondo líquido (acciones, ETFs globales, fondos mutuos, Cuenta 2) que financie tus gastos durante esos años intermedios.
              </li>
              <li>
                <strong>La Buena Noticia:</strong> Al llegar a los 60 o 65 años, se desbloquea tu fondo AFP acumulado (que siguió rentando todo ese tiempo) más la Pensión Garantizada Universal (PGU), reduciendo drásticamente la cantidad de capital privado que necesitas para sostenerte en la vejez.
              </li>
            </ul>
          </section>

          {/* AdSense In-Article */}
          <AdBanner slotId="1000000002" format="rectangle" label="Anuncio patrocinado" />

          {/* Sección 3: APV Régimen A vs B */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <span>3. Ahorro Previsional Voluntario (APV): ¿Régimen A o Régimen B?</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  APV Régimen A (Bonificación del 15%)
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  El Estado chileno te regala un <strong>15% adicional</strong> de todo lo que ahorres al año, con un tope anual de 6 UTM (aprox. $400.000 CLP de subsidio fiscal gratis).
                </p>
                <span className="mt-2 inline-block rounded bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                  Ideal para sueldos líquidos menores a $2.500.000
                </span>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                <h3 className="font-bold text-sm text-blue-800 dark:text-blue-300">
                  APV Régimen B (Rebaja de Impuestos)
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  El monto que ahorras se descuenta directamente de tu base imponible mensual (tope 50 UF/mes). Esto reduce inmediatamente tu Impuesto Único de Segunda Categoría en tu liquidación de sueldo.
                </p>
                <span className="mt-2 inline-block rounded bg-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-800 dark:text-blue-100">
                  Ideal para tramos altos de impuesto (Sueldos brutos &gt; $3.500.000)
                </span>
              </div>
            </div>
          </section>

          {/* Sección 4: Hijos y Planificación Familiar */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Baby className="h-6 w-6 text-amber-500" />
              <span>4. Planificación Familiar: ¿Y si tengo un hijo a los X años?</span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Tener un hijo en Chile representa una de las decisiones vitales más hermosas y significativas, pero también exige realismo financiero. Los costos varían por etapas:
            </p>
            <ol className="list-decimal pl-5 text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Primera Infancia (0 a 3 años):</strong> Fuerte gasto en sala cuna, pañales, fórmula médica y consultas pediátricas.
              </li>
              <li>
                <strong>Etapa Escolar (4 a 17 años):</strong> Matrículas, mensualidades de colegios subvencionados o particulares, talleres extraprogramáticos y vestuario.
              </li>
              <li>
                <strong>Educación Superior (18 a 23 años):</strong> Aranceles universitarios o técnicos. En Chile, la gratuidad universitaria beneficia al 60% más vulnerable, mientras que la clase media suele recurrir a ahorros previos o fondos familiares.
              </li>
            </ol>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Nuestra calculadora modela exactamente este impacto, demostrando que con planificación inteligente no es necesario renunciar a la libertad financiera para formar una familia.
            </p>
          </section>

          {/* CTA a la calculadora */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center text-white shadow-lg">
            <h3 className="text-xl font-bold">
              ¿Listo para simular tu fecha de libertad?
            </h3>
            <p className="mt-2 text-xs text-emerald-100 max-w-md mx-auto">
              Utiliza nuestra calculadora adaptada a las leyes previsionales chilenas y descubre a qué edad podrías jubilarte.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center space-x-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-emerald-800 shadow hover:bg-emerald-50 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Ir a la Calculadora FIRE Chile</span>
            </Link>
          </div>
        </article>

        {/* Banner Inferior AdSense */}
        <AdBanner slotId="1000000003" format="auto" label="Publicidad" />
      </main>

      <Footer />
    </div>
  );
}
