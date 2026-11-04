import {
  DEFAULT_CHILE_PARAMS,
  TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA,
  ChileanEconomicParams,
} from './constants';

export interface SalaryBreakdown {
  sueldoBruto: number;
  rentaImponibleAfp: number;
  rentaImponibleAfc: number;
  cotizacionAfp10: number; // 10% obligatorio que va al fondo de pensión
  comisionAfp: number; // Costo comisión administradora
  saludObligatoria: number; // 7% o plan
  seguroCesantia: number; // 0.6%
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
  params: ChileanEconomicParams = DEFAULT_CHILE_PARAMS
): SalaryBreakdown {
  const topeAfpClp = params.topeImponibleAfpUF * params.uf;
  const topeAfcClp = params.topeImponibleAfcUF * params.uf;

  const rentaImponibleAfp = Math.min(sueldoBruto, topeAfpClp);
  const rentaImponibleAfc = Math.min(sueldoBruto, topeAfcClp);

  const cotizacionAfp10 = rentaImponibleAfp * params.afpLegalPct;
  const comisionAfp = rentaImponibleAfp * params.afpAvgComisionPct;
  const saludObligatoria = rentaImponibleAfp * params.saludLegalPct;
  const seguroCesantia = rentaImponibleAfc * params.afcTrabajadorPct;

  const totalLeyesSociales =
    cotizacionAfp10 + comisionAfp + saludObligatoria + seguroCesantia;

  // Manejo de APV
  let apvRebajaTributaria = 0;
  let apvBeneficioFiscalEstimado = 0;

  if (apvRegimen === 'B' && apvAporte > 0) {
    // Régimen B rebaja la base imponible hasta un tope mensual de 50 UF
    const topeMensualApvB = 50 * params.uf;
    apvRebajaTributaria = Math.min(apvAporte, topeMensualApvB);
  }

  // Base imponible para el Impuesto Único de Segunda Categoría
  const baseTributable = Math.max(
    0,
    sueldoBruto - totalLeyesSociales - apvRebajaTributaria
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
    const impuestoSinApvBase = Math.max(0, sueldoBruto - totalLeyesSociales);
    const baseSinApvUTM = impuestoSinApvBase / params.utm;
    let impuestoSinApv = 0;
    for (const tramo of TRAMOS_IMPUESTO_SEGUNDA_CATEGORIA) {
      if (baseSinApvUTM > tramo.desdeUTM && baseSinApvUTM <= tramo.hastaUTM) {
        impuestoSinApv =
          impuestoSinApvBase * tramo.factor - tramo.rebajaUTM * params.utm;
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
    saludObligatoria,
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
