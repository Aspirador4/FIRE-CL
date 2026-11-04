import { NextResponse } from 'next/server';
import { DEFAULT_CHILE_PARAMS } from '@/lib/constants';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Consulta de la UF oficial en vivo (espejo del Banco Central de Chile)
    const res = await fetch('https://mindicador.cl/api/uf', {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const latest = data.serie?.[0];
      const ufVal = latest ? Number(latest.valor) : Number(data.valor);

      if (ufVal && !isNaN(ufVal) && ufVal > 30000 && ufVal < 70000) {
        return NextResponse.json(
          {
            uf: ufVal,
            utm: DEFAULT_CHILE_PARAMS.utm,
            fecha: latest?.fecha || new Date().toISOString(),
            fuente: 'Banco Central de Chile',
            isLive: true,
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          }
        );
      }
    }
  } catch (err) {
    console.warn('API UF en vivo no disponible, recurriendo a parámetros base:', err);
  }

  // Fallback seguro con los parámetros base
  return NextResponse.json(
    {
      uf: DEFAULT_CHILE_PARAMS.uf,
      utm: DEFAULT_CHILE_PARAMS.utm,
      fecha: new Date().toISOString(),
      fuente: 'Banco Central de Chile (Referencia Base)',
      isLive: false,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=1800',
      },
    }
  );
}
