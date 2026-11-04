export interface ChileanEconomicParams {
  uf: number; // Valor UF en CLP
  utm: number; // Valor UTM en CLP
  pguMonthly: number; // Monto mensual PGU en CLP
  topeImponibleAfpUF: number; // Tope imponible AFP/Salud en UF (mensual)
  topeImponibleAfcUF: number; // Tope imponible AFC en UF (mensual)
  afpLegalPct: number; // 10%
  afpAvgComisionPct: number; // Comisión promedio (~1.15%)
  saludLegalPct: number; // 7%
  afcTrabajadorPct: number; // 0.6% contrato indefinido
  rentabilidadAfpRetiroRealPct: number; // Rentabilidad real anual regulada en fondos conservadores D/E post-retiro (~2.0%)
}

export const DEFAULT_CHILE_PARAMS: ChileanEconomicParams = {
  uf: 41269, // Valor UF en CLP (Referencia Banco Central)
  utm: 72440, // Valor UTM en CLP (Referencia SII)
  pguMonthly: 214296,
  topeImponibleAfpUF: 84.3,
  topeImponibleAfcUF: 126.6,
  afpLegalPct: 0.10,
  afpAvgComisionPct: 0.0115,
  saludLegalPct: 0.07,
  afcTrabajadorPct: 0.006,
  rentabilidadAfpRetiroRealPct: 0.02, // 2.0% real anual Fondo D/E
};

// Tramos mensuales del Impuesto Único de Segunda Categoría (en UTM)
export interface TaxBracket {
  desdeUTM: number;
  hastaUTM: number;
  factor: number;
  rebajaUTM: number;
}

export const TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA: TaxBracket[] = [
  { desdeUTM: 0, hastaUTM: 13.5, factor: 0.0, rebajaUTM: 0 },
  { desdeUTM: 13.5, hastaUTM: 30, factor: 0.04, rebajaUTM: 0.54 },
  { desdeUTM: 30, hastaUTM: 50, factor: 0.08, rebajaUTM: 1.74 },
  { desdeUTM: 50, hastaUTM: 70, factor: 0.135, rebajaUTM: 4.49 },
  { desdeUTM: 70, hastaUTM: 90, factor: 0.23, rebajaUTM: 11.14 },
  { desdeUTM: 90, hastaUTM: 120, factor: 0.304, rebajaUTM: 17.80 },
  { desdeUTM: 120, hastaUTM: 310, factor: 0.35, rebajaUTM: 23.32 },
  { desdeUTM: 310, hastaUTM: Infinity, factor: 0.40, rebajaUTM: 38.82 },
];

// Presets de costos de crianza en Chile (valores mensuales en CLP a valor presente)
export interface ChildPreset {
  id: 'publico' | 'estandar' | 'particular' | 'custom';
  name: string;
  description: string;
  monthlyStage0to3: number; // 0 a 3 años
  monthlyStage4to17: number; // 4 a 17 años
  monthlyStage18to23: number; // 18 a 23 años
}

export const CHILD_COST_PRESETS: ChildPreset[] = [
  {
    id: 'publico',
    name: 'Público / Gratuidad',
    description: 'Jardín Junji/Integra, colegio público, universidad con gratuidad o becas.',
    monthlyStage0to3: 180000,
    monthlyStage4to17: 120000,
    monthlyStage18to23: 150000,
  },
  {
    id: 'estandar',
    name: 'Estándar / Subvencionado',
    description: 'Sala cuna compartida, colegio particular subvencionado, universidad tradicional/arancel mixto.',
    monthlyStage0to3: 350000,
    monthlyStage4to17: 300000,
    monthlyStage18to23: 450000,
  },
  {
    id: 'particular',
    name: 'Particular / Privado',
    description: 'Sala cuna privada, colegio particular pagado, universidad privada arancel completo.',
    monthlyStage0to3: 650000,
    monthlyStage4to17: 750000,
    monthlyStage18to23: 950000,
  },
];

// Fondos de AFP y rentabilidades reales anuales esperadas de referencia
export const FONDOS_AFP_DATA = [
  { id: 'A', name: 'Fondo A (Más riesgoso)', realReturnPct: 5.8 },
  { id: 'B', name: 'Fondo B (Riesgoso)', realReturnPct: 5.0 },
  { id: 'C', name: 'Fondo C (Intermedio)', realReturnPct: 4.4 },
  { id: 'D', name: 'Fondo D (Conservador)', realReturnPct: 3.5 },
  { id: 'E', name: 'Fondo E (Más conservador)', realReturnPct: 2.8 },
];
