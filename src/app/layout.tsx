import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dividendo de Tiempo | Calculadora FIRE Chile',
  description:
    'El mayor dividendo que podemos obtener del dinero es el tiempo. Calculadora de Independencia Financiera y Retiro Temprano adaptada a Chile (Leyes SII, AFP, APV, PGU e impacto de hijos).',
  keywords: [
    'FIRE Chile',
    'Calculadora jubilación Chile',
    'Retiro anticipado Chile',
    'APV Régimen A vs B',
    'Independencia Financiera Chile',
    'Regla del 4% Chile',
    'Cálculo AFP y sueldo líquido',
  ],
  authors: [{ name: 'Dividendo de Tiempo' }],
  openGraph: {
    title: 'Dividendo de Tiempo | Calculadora FIRE Chile',
    description:
      'El mayor dividendo que podemos obtener del dinero es el tiempo. Calcula tu fecha de retiro en Chile.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'Dividendo de Tiempo',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {adsenseClientId && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        )}
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
