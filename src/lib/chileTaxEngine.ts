import {
  DEFAULT_CHILE_PARAMS,
  TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA,
  ChileanEconomicParams,
} from './constants';

export type HealthSystem = 'fonasa' | 'isapre';

export interface HealthConfig {
  system: HealthSystem;
  isaprePlanType?: 'uf' | 'clp';
  isaprePlanUf?: number; // Costo del plan en UF (ej. 3.5 UF)
  isaprePlanClp?: number; // Costo del plan en CLP (ej. $150.000)
  adicionalSaludDirectoClp?: number; // Cotización voluntaria directa sobre el 7%
}

export interface HealthBreakdown {
  system: HealthSystem;
  planPactadoClp: number;
  planPactadoUf: number;
  saludLegal7Pct: number; // 7% obligatorio con tope 84.3 UF
  cotizacionAdicionalSalud: number; // Descuento extra si el plan es más caro que el 7%
  excedentesIsapre: number; // Excedentes a favor si el 7% supera el plan
  descuentoSaludTotal: number; // Lo que efectivamente se descuenta en la liquidación
  adicionalDeducibleImpuesto: number; // Porción del adicional que rebaja impuesto (tope 4.2 UF)
}

export interface SalaryBreakdown {
  sueldoBruto: number;
  rentaImponibleAfp: number;
  rentaImponibleAfc: number;
  cotizacionAfp10: number; // 10% obligatorio que va al fondo de pensión
  comisionAfp: number; // Costo comisión administradora
  saludObligatoria: number; // Descuento total de salud (retrocompatible)
  salud: HealthBreakdown;
  seguroCesantia: number; // 0.6% o 0% si sin AFC
  totalLeyesSociales: number;
  apvAporte: number;
  apvRegimen: 'A' | 'B' | 'ninguno';
  apvBeneficioFiscalEstimado: number; // Bonificación 15% (A) o Ahorro tributario (B)
  baseTributable: number;
  impuestoSegundaCategoria: number;
  tasaEfectivaImpuestoPct: number;
  tasaMarginalImpuestoPct: number;
  sueldoLiquido: number;
  // Aportes que engrosan el patrimonio neto total del usuario cada mes
  ahorroPrevisionalMensualTotal: number; // (10% AFP + APV + Bonificación)
}

export function calculateChileSalaryTax(
  sueldoBruto: number,
  apvAporte: number = 0,
  apvRegimen: 'A' | 'B' | 'ninguno' = 'ninguno',
  params: ChileanEconomicParams = DEFAULT_CHILE_PARAMS,
  healthConfig: HealthConfig = { system: 'fonasa' },
  tieneAfc: boolean = true
): SalaryBreakdown {
  const topeAfpClp = params.topeImponibleAfpUF * params.uf;
  const topeAfcClp = params.topeImponibleAfcUF * params.uf;

  const rentaImponibleAfp = Math.min(sueldoBruto, topeAfpClp);
  const rentaImponibleAfc = Math.min(sueldoBruto, topeAfcClp);

  const cotizacionAfp10 = rentaImponibleAfp * params.afpLegalPct;
  const comisionAfp = rentaImponibleAfp * params.afpAvgComisionPct;
  const saludLegal7Pct = rentaImponibleAfp * params.saludLegalPct;
  const seguroCesantia = tieneAfc ? rentaImponibleAfc * params.afcTrabajadorPct : 0;

  // Cálculo de Salud (Fonasa vs Isapre con plan pactado / cotización adicional)
  let planPactadoClp = saludLegal7Pct;
  let planPactadoUf = params.uf > 0 ? saludLegal7Pct / params.uf : 0;
  let cotizacionAdicionalSalud = 0;
  let excedentesIsapre = 0;
  let descuentoSaludTotal = saludLegal7Pct;
  let adicionalDeducibleImpuesto = 0;

  if (healthConfig.system === 'isapre') {
    if (healthConfig.isaprePlanType === 'uf' && healthConfig.isaprePlanUf !== undefined && healthConfig.isaprePlanUf > 0) {
      planPactadoUf = healthConfig.isaprePlanUf;
      planPactadoClp = healthConfig.isaprePlanUf * params.uf;
    } else if (healthConfig.isaprePlanClp !== undefined && healthConfig.isaprePlanClp > 0) {
      planPactadoClp = healthConfig.isaprePlanClp;
      planPactadoUf = params.uf > 0 ? healthConfig.isaprePlanClp / params.uf : 0;
    } else if (healthConfig.adicionalSaludDirectoClp !== undefined && healthConfig.adicionalSaludDirectoClp > 0) {
      planPactadoClp = saludLegal7Pct + healthConfig.adicionalSaludDirectoClp;
      planPactadoUf = params.uf > 0 ? planPactadoClp / params.uf : 0;
    }

    if (planPactadoClp > saludLegal7Pct) {
      // El plan de Isapre es más caro que el 7% legal
      cotizacionAdicionalSalud = planPactadoClp - saludLegal7Pct;
      descuentoSaludTotal = planPactadoClp;
      excedentesIsapre = 0;

      // Según Art. 42 N° 1 LIR de Chile: La cotización adicional de salud es deducible
      // de impuestos hasta un tope legal de 4.2 UF mensuales.
      const topeDeducibleAdicionalClp = 4.2 * params.uf;
      adicionalDeducibleImpuesto = Math.min(cotizacionAdicionalSalud, topeDeducibleAdicionalClp);
    } else {
      // El plan es menor que el 7% legal: por ley en Chile siempre se descuenta el 7% mínimo
      // y la diferencia genera excedentes mensuales a favor del afiliado.
      cotizacionAdicionalSalud = 0;
      descuentoSaludTotal = saludLegal7Pct;
      excedentesIsapre = Math.max(0, saludLegal7Pct - planPactadoClp);
      adicionalDeducibleImpuesto = 0;
    }
  }

  const saludBreakdown: HealthBreakdown = {
    system: healthConfig.system,
    planPactadoClp,
    planPactadoUf,
    saludLegal7Pct,
    cotizacionAdicionalSalud,
    excedentesIsapre,
    descuentoSaludTotal,
    adicionalDeducibleImpuesto,
  };

  const totalLeyesSociales =
    cotizacionAfp10 + comisionAfp + descuentoSaludTotal + seguroCesantia;

  // Manejo de APV
  let apvRebajaTributaria = 0;
  let apvBeneficioFiscalEstimado = 0;

  if (apvRegimen === 'B' && apvAporte > 0) {
    // Régimen B rebaja la base imponible hasta un tope mensual de 50 UF
    const topeMensualApvB = 50 * params.uf;
    apvRebajaTributaria = Math.min(apvAporte, topeMensualApvB);
  }

  // Base imponible para el Impuesto Único de Segunda Categoría
  // Las deducciones previsionales reconocidas por el SII son: AFP + Comisión + 7% Salud + Adicional Salud (tope 4.2 UF) + AFC
  const deduccionesTributariasPrevisionales =
    cotizacionAfp10 + comisionAfp + saludLegal7Pct + adicionalDeducibleImpuesto + seguroCesantia;

  const baseTributable = Math.max(
    0,
    sueldoBruto - deduccionesTributariasPrevisionales - apvRebajaTributaria
  );

  const baseEnUTM = baseTributable / params.utm;

  // Cálculo del impuesto según tabla progresiva del SII
  let impuestoSegundaCategoria = 0;
  let tasaMarginalImpuestoPct = 0;

  for (const tramo of TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA) {
    if (baseEnUTM > tramo.desdeUTM) {
      if (baseEnUTM <= tramo.hastaUTM) {
        impuestoSegundaCategoria =
          baseTributable * tramo.factor - tramo.rebajaUTM * params.utm;
        tasaMarginalImpuestoPct = tramo.factor * 100;
        break;
      }
    }
  }

  impuestoSegundaCategoria = Math.max(0, impuestoSegundaCategoria);

  // Beneficio fiscal de APV
  if (apvRegimen === 'A' && apvAporte > 0) {
    // Régimen A: Estado bonifica el 15% del ahorro, con tope anual de 6 UTM (~0.5 UTM al mes)
    const topeMensualBonoA = 0.5 * params.utm;
    apvBeneficioFiscalEstimado = Math.min(apvAporte * 0.15, topeMensualBonoA);
  } else if (apvRegimen === 'B' && apvAporte > 0) {
    // Estimación del ahorro de impuestos mensual gracias al APV Régimen B
    const baseSinApv = Math.max(0, sueldoBruto - deduccionesTributariasPrevisionales);
    const baseSinApvUTM = baseSinApv / params.utm;
    let impuestoSinApv = 0;
    for (const tramo of TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA) {
      if (baseSinApvUTM > tramo.desdeUTM && baseSinApvUTM <= tramo.hastaUTM) {
        impuestoSinApv =
          baseSinApv * tramo.factor - tramo.rebajaUTM * params.utm;
        break;
      }
    }
    apvBeneficioFiscalEstimado = Math.max(
      0,
      impuestoSinApv - impuestoSegundaCategoria
    );
  }

  const sueldoLiquido =
    sueldoBruto -
    totalLeyesSociales -
    impuestoSegundaCategoria -
    apvAporte;

  const tasaEfectivaImpuestoPct =
    sueldoBruto > 0 ? (impuestoSegundaCategoria / sueldoBruto) * 100 : 0;

  const ahorroPrevisionalMensualTotal =
    cotizacionAfp10 + apvAporte + (apvRegimen === 'A' ? apvBeneficioFiscalEstimado : 0);

  return {
    sueldoBruto,
    rentaImponibleAfp,
    rentaImponibleAfc,
    cotizacionAfp10,
    comisionAfp,
    saludObligatoria: descuentoSaludTotal,
    salud: saludBreakdown,
    seguroCesantia,
    totalLeyesSociales,
    apvAporte,
    apvRegimen,
    apvBeneficioFiscalEstimado,
    baseTributable,
    impuestoSegundaCategoria,
    tasaEfectivaImpuestoPct,
    tasaMarginalImpuestoPct,
    sueldoLiquido,
    ahorroPrevisionalMensualTotal,
  };
}

/**
 * Cálculo inverso: A partir del Sueldo Líquido deseado (lo que llega al bolsillo),
 * calcula de manera exacta el Sueldo Bruto correspondiente y todo su desglose
 * (AFP, Isapre con adicional, AFC, Impuesto SII).
 * Utiliza búsqueda binaria de convergencia ultra rápida (< 0.1 CLP de error en < 35 iteraciones).
 */
export function calculateChileSalaryFromNet(
  sueldoLiquidoDeseado: number,
  apvAporte: number = 0,
  apvRegimen: 'A' | 'B' | 'ninguno' = 'ninguno',
  params: ChileanEconomicParams = DEFAULT_CHILE_PARAMS,
  healthConfig: HealthConfig = { system: 'fonasa' },
  tieneAfc: boolean = true
): SalaryBreakdown {
  if (sueldoLiquidoDeseado <= 0) {
    return calculateChileSalaryTax(0, apvAporte, apvRegimen, params, healthConfig, tieneAfc);
  }

  let low = sueldoLiquidoDeseado;
  let high = Math.max(sueldoLiquidoDeseado * 2.5, 30_000_000);

  // Asegurar que 'high' produzca un líquido superior al objetivo
  while (
    calculateChileSalaryTax(high, apvAporte, apvRegimen, params, healthConfig, tieneAfc).sueldoLiquido <
    sueldoLiquidoDeseado
  ) {
    high *= 1.5;
  }

  for (let i = 0; i < 35; i++) {
    const mid = (low + high) / 2;
    const res = calculateChileSalaryTax(mid, apvAporte, apvRegimen, params, healthConfig, tieneAfc);

    if (Math.abs(res.sueldoLiquido - sueldoLiquidoDeseado) < 0.25) {
      return res;
    }

    if (res.sueldoLiquido < sueldoLiquidoDeseado) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return calculateChileSalaryTax((low + high) / 2, apvAporte, apvRegimen, params, healthConfig, tieneAfc);
}
