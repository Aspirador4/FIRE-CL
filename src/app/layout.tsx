import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
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
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {adsenseClientId && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        )}
      </head>
      <body className="min-h-screen bg-[#f7f6f0] text-[#09090b] antialiased selection:bg-[#facc15] selection:text-black dark:bg-[#0d0e12] dark:text-[#f4f4f7] dark:selection:bg-[#facc15] dark:selection:text-black">
        {children}
      </body>
    </html>
  );
}
