export type CurrencyMode = 'CLP' | 'UF';

export function formatMoney(
  amount: number,
  mode: CurrencyMode = 'CLP',
  ufRate: number = 38500
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return mode === 'CLP' ? '$0' : '0 UF';
  }

  if (mode === 'UF') {
    const ufValue = amount / ufRate;
    return `${ufValue.toLocaleString('es-CL', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} UF`;
  }

  return `$${Math.round(amount).toLocaleString('es-CL')}`;
}

export function formatCompactMoney(
  amount: number,
  mode: CurrencyMode = 'CLP',
  ufRate: number = 38500
): string {
  if (mode === 'UF') {
    const ufValue = amount / ufRate;
    if (Math.abs(ufValue) >= 1000) {
      return `${(ufValue / 1000).toFixed(1)}k UF`;
    }
    return `${Math.round(ufValue)} UF`;
  }

  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    // En Chile: $1.200M o $1.5B
    const milMillones = amount / 1_000_000;
    return `$${Math.round(milMillones).toLocaleString('es-CL')}M`;
  }
  if (abs >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}k`;
  }
  return `$${Math.round(amount)}`;
}

export function formatPct(val: number): string {
  return `${val.toLocaleString('es-CL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

// Helpers para inputs numéricos con puntos de miles chilenos
export function formatThousands(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return Math.round(val).toLocaleString('es-CL');
}

export function parseThousands(str: string): number {
  if (!str) return 0;
  // Elimina cualquier carácter que no sea dígito
  const cleaned = str.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}
