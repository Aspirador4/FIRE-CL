import { DEFAULT_CHILE_PARAMS } from './constants';

export interface ChildConfig {
  id: string;
  name: string;
  edadPadreAlNacer: number; // Edad del usuario cuando nace el hijo
  costoMensual0a3: number;
  costoMensual4a17: number;
  costoMensual18a23: number;
}

export interface ExtraCashFlow {
  id: string;
  tipo: 'ingreso' | 'gasto';
  descripcion: string;
  montoMensual: number;
  edadInicio: number;
  edadFin: number;
}

export interface FireSimulationInput {
  edadActual: number;
  genero: 'hombre' | 'mujer';
  patrimonioLiquidoInicial: number; // Inversiones libres, Cuenta 2, ETFs
  saldoAfpInicial: number; // Saldo actual acumulado en AFP obligatoria
  sueldoLiquidoMensual: number; // Lo que entra al bolsillo mensual
  aporteAfpMensual: number; // Cotización 10% obligatorio mensual
  aporteApvMensual: number; // APV mensual
  gastoMensualActual: number; // Gasto mensual base del hogar
  gastoMensualRetiro: number; // Gasto mensual estimado que desea en retiro
  crecimientoIngresoRealPct: number; // Crecimiento anual del sueldo sobre inflación
  rentabilidadPortafolioRealPct: number; // Rentabilidad real anual portafolio libre (ej 7%)
  rentabilidadAfpRealPct: number; // Rentabilidad real anual fondo AFP (ej 4.5%)
  tasaRetiroSeguroPct: number; // SWR (ej 4.0% o 3.5%)
  incluirPgu: boolean; // Si a partir de los 65 años recibe PGU
  montoPguMensual: number; // Monto PGU mensual
  ufRate?: number; // Valor de la UF para cálculo de topes imponibles y conversiones
  hijos: ChildConfig[];
  flujosExtra: ExtraCashFlow[];
}

export interface SimulationYearData {
  edad: number;
  ingresosAnuales: number;
  gastosAnualesTotales: number;
  gastoBaseAnual: number;
  gastoHijosAnual: number;
  flujosExtraNetosAnuales: number;
  ahorroAnualLiquido: number;
  aporteAfpAnual: number;
  patrimonioLiquido: number;
  patrimonioAfp: number;
  patrimonioTotal: number;
  metaFireTradicional: number;
  esJubilado: boolean;
  fase: 'trabajando' | 'puente_fire' | 'retiro_legal';
  retiroAnualPortafolio: number;
  pensionAnualAfp: number;
  pguAnual: number;
}

export interface FireSimulationResult {
  edadFireTradicional: number | null; // Retiro 100% cubierto por portafolio libre
  edadFirePuente: number | null; // Retiro temprano optimizado con puente + AFP a los 60/65
  edadLegalRetiro: number; // 60 mujer, 65 hombre
  anosHastaFire: number | null;
  patrimonioEnFire: number | null;
  metaPatrimonioFire: number;
  tasaAhorroActualPct: number;
  impactoHijos: {
    diferenciaAnosFire: number;
    gastoTotalHijosVida: number;
    ahorroMensualEquivalente: number;
  };
  trayectoriaAnual: SimulationYearData[];
}

/**
 * Capital Necesario Unitario (CNU) según las Tablas de Mortalidad Oficiales
 * de la Superintendencia de Pensiones de Chile (CB-H-2020 y CB-M-2020).
 * El CNU representa cuántas unidades de capital se necesitan a cada edad para financiar 1 unidad anual de pensión.
 * La tasa anual de retiro en la modalidad de Retiro Programado es exactamente: 1 / CNU(edad, genero).
 */
export function getCnuActuarial(edad: number, genero: 'hombre' | 'mujer'): number {
  if (genero === 'hombre') {
    if (edad <= 60) return 21.0;
    if (edad <= 65) return 21.0 - ((edad - 60) / 5) * (21.0 - 18.5);
    if (edad <= 70) return 18.5 - ((edad - 65) / 5) * (18.5 - 15.2);
    if (edad <= 75) return 15.2 - ((edad - 70) / 5) * (15.2 - 12.1);
    if (edad <= 80) return 12.1 - ((edad - 75) / 5) * (12.1 - 9.2);
    if (edad <= 85) return 9.2 - ((edad - 80) / 5) * (9.2 - 6.6);
    if (edad <= 90) return 6.6 - ((edad - 85) / 5) * (6.6 - 4.4);
    // Para mayores de 90 años
    return Math.max(2.5, 4.4 - ((edad - 90) / 5) * (4.4 - 3.0));
  } else {
    if (edad <= 60) return 22.0;
    if (edad <= 65) return 22.0 - ((edad - 60) / 5) * (22.0 - 19.5);
    if (edad <= 70) return 19.5 - ((edad - 65) / 5) * (19.5 - 16.5);
    if (edad <= 75) return 16.5 - ((edad - 70) / 5) * (16.5 - 13.5);
    if (edad <= 80) return 13.5 - ((edad - 75) / 5) * (13.5 - 10.4);
    if (edad <= 85) return 10.4 - ((edad - 80) / 5) * (10.4 - 7.5);
    if (edad <= 90) return 7.5 - ((edad - 85) / 5) * (7.5 - 4.9);
    // Para mayores de 90 años
    return Math.max(2.8, 4.9 - ((edad - 90) / 5) * (4.9 - 3.2));
  }
}

/**
 * Estima la pensión mensual que genera un saldo de AFP a una edad específica
 * bajo la modalidad de Retiro Programado (recalculada anualmente según CNU).
 */
export function estimateMonthlyPensionAfp(
  saldoAfpAcumulado: number,
  genero: 'hombre' | 'mujer',
  edad: number = 65
): number {
  if (saldoAfpAcumulado <= 0) return 0;
  const cnu = getCnuActuarial(edad, genero);
  const pensionAnual = saldoAfpAcumulado / cnu;
  return pensionAnual / 12;
}

export function runFireSimulation(
  input: FireSimulationInput
): FireSimulationResult {
  const edadLegalRetiro = input.genero === 'mujer' ? 60 : 65;
  const swrFactor = input.tasaRetiroSeguroPct / 100;
  const metaPatrimonioFire = (input.gastoMensualRetiro * 12) / swrFactor;

  // Tasa de ahorro actual
  const ingresoTotalActual =
    input.sueldoLiquidoMensual + input.aporteAfpMensual + input.aporteApvMensual;
  const ahorroTotalActual =
    Math.max(0, input.sueldoLiquidoMensual - input.gastoMensualActual) +
    input.aporteAfpMensual +
    input.aporteApvMensual;
  const tasaAhorroActualPct =
    ingresoTotalActual > 0 ? (ahorroTotalActual / ingresoTotalActual) * 100 : 0;

  // 1. Simulación base con hijos y flujos extra
  const trayectoria = simulateTrajectory(input, edadLegalRetiro, swrFactor);

  // 2. Simulación contrafactual SIN hijos para medir el impacto exacto
  const inputSinHijos: FireSimulationInput = {
    ...input,
    hijos: [],
  };
  const trayectoriaSinHijos = simulateTrajectory(
    inputSinHijos,
    edadLegalRetiro,
    swrFactor
  );

  // Encontrar edad FIRE
  const fireYearConHijos = trayectoria.find((y) => y.esJubilado);
  const fireYearSinHijos = trayectoriaSinHijos.find((y) => y.esJubilado);

  const edadFire = fireYearConHijos ? fireYearConHijos.edad : null;
  const edadFireSinHijos = fireYearSinHijos ? fireYearSinHijos.edad : null;

  const diferenciaAnos =
    edadFire && edadFireSinHijos
      ? Math.max(0, edadFire - edadFireSinHijos)
      : 0;

  // Calcular gasto total invertido en crianza a lo largo de toda la vida
  let gastoTotalHijosVida = 0;
  for (const h of input.hijos) {
    const costo0a3 = h.costoMensual0a3 * 12 * 4; // 0, 1, 2, 3 años
    const costo4a17 = h.costoMensual4a17 * 12 * 14; // 4 a 17 años
    const costo18a23 = h.costoMensual18a23 * 12 * 6; // 18 a 23 años
    gastoTotalHijosVida += costo0a3 + costo4a17 + costo18a23;
  }

  // Ahorro mensual equivalente que compensaría el gasto de hijos
  const anosProductivos = Math.max(1, (edadFire ?? 65) - input.edadActual);
  const ahorroMensualEquivalente = gastoTotalHijosVida / (anosProductivos * 12);

  // Encontrar hito de retiro tradicional puro (solo con portafolio líquido)
  let edadFireTradicional: number | null = null;
  for (const y of trayectoria) {
    if (y.patrimonioLiquido >= y.metaFireTradicional) {
      edadFireTradicional = y.edad;
      break;
    }
  }

  return {
    edadFireTradicional,
    edadFirePuente: edadFire,
    edadLegalRetiro,
    anosHastaFire: edadFire ? edadFire - input.edadActual : null,
    patrimonioEnFire: fireYearConHijos ? fireYearConHijos.patrimonioTotal : null,
    metaPatrimonioFire,
    tasaAhorroActualPct,
    impactoHijos: {
      diferenciaAnosFire: diferenciaAnos,
      gastoTotalHijosVida,
      ahorroMensualEquivalente,
    },
    trayectoriaAnual: trayectoria,
  };
}

function simulateTrajectory(
  input: FireSimulationInput,
  edadLegalRetiro: number,
  swrFactor: number
): SimulationYearData[] {
  const trajectory: SimulationYearData[] = [];
  const maxAge = 90;

  let currentLiquid = input.patrimonioLiquidoInicial;
  let currentAfp = input.saldoAfpInicial;
  let isRetired = false;

  const returnLiquid = input.rentabilidadPortafolioRealPct / 100;
  const returnAfp = input.rentabilidadAfpRealPct / 100;
  const incomeGrowth = input.crecimientoIngresoRealPct / 100;

  // Primero calculamos si ya está retirado desde el inicio
  const gastoRetiroAnual = input.gastoMensualRetiro * 12;

  for (let age = input.edadActual; age <= maxAge; age++) {
    const yearsFromStart = age - input.edadActual;
    const growthMultiplier = Math.pow(1 + incomeGrowth, yearsFromStart);

    // 1. Gastos de hijos en este año de edad
    let gastoHijosAnual = 0;
    for (const h of input.hijos) {
      const childAge = age - h.edadPadreAlNacer;
      if (childAge >= 0 && childAge <= 3) {
        gastoHijosAnual += h.costoMensual0a3 * 12;
      } else if (childAge >= 4 && childAge <= 17) {
        gastoHijosAnual += h.costoMensual4a17 * 12;
      } else if (childAge >= 18 && childAge <= 23) {
        gastoHijosAnual += h.costoMensual18a23 * 12;
      }
    }

    // 2. Flujos Extra (ingresos y gastos temporales)
    let extraIngresosAnual = 0;
    let extraGastosAnual = 0;
    for (const flow of input.flujosExtra) {
      if (age >= flow.edadInicio && age <= flow.edadFin) {
        if (flow.tipo === 'ingreso') {
          extraIngresosAnual += flow.montoMensual * 12;
        } else {
          extraGastosAnual += flow.montoMensual * 12;
        }
      }
    }

    const gastoBaseAnual = isRetired
      ? gastoRetiroAnual
      : input.gastoMensualActual * 12;

    const gastosTotalesAnio =
      gastoBaseAnual + gastoHijosAnual + extraGastosAnual;

    // Ingresos de trabajo si no está jubilado (con crecimiento real del salario)
    const sueldoLiquidoAnual = isRetired
      ? 0
      : input.sueldoLiquidoMensual * 12 * growthMultiplier;

    // Cotización obligatoria AFP sujeta al tope legal (84.3 UF indexada por la UF activa)
    const currentUf = input.ufRate && input.ufRate > 0 ? input.ufRate : DEFAULT_CHILE_PARAMS.uf;
    const topeAfpClp = DEFAULT_CHILE_PARAMS.topeImponibleAfpUF * currentUf;
    const aporteAfpEfectivoMensual = Math.min(
      input.aporteAfpMensual * growthMultiplier,
      topeAfpClp * DEFAULT_CHILE_PARAMS.afpLegalPct
    );
    const aporteApvEfectivoMensual = input.aporteApvMensual * growthMultiplier;

    const aporteAfpAnual = isRetired
      ? 0
      : (aporteAfpEfectivoMensual + aporteApvEfectivoMensual) * 12;

    const ingresosTotalesAnio =
      sueldoLiquidoAnual + aporteAfpAnual + extraIngresosAnual;

    // Si aún no se retira, verificar si ya puede retirarse a esta edad
    if (!isRetired) {
      const canRetire = checkCanRetire(
        age,
        edadLegalRetiro,
        currentLiquid,
        currentAfp,
        gastoRetiroAnual,
        gastoHijosAnual,
        extraGastosAnual,
        extraIngresosAnual,
        returnLiquid,
        returnAfp,
        swrFactor,
        input.incluirPgu,
        input.montoPguMensual,
        input.genero
      );

      if (canRetire) {
        isRetired = true;
      }
    }

    // Definición de fase
    let fase: 'trabajando' | 'puente_fire' | 'retiro_legal' = 'trabajando';
    if (isRetired) {
      if (age < edadLegalRetiro) {
        fase = 'puente_fire';
      } else {
        fase = 'retiro_legal';
      }
    }

    // Flujos según fase
    let ahorroAnualLiquido = 0;
    let retiroAnualPortafolio = 0;
    let pensionAnualAfp = 0;
    let pguAnual = 0;

    if (!isRetired) {
      // Trabajando: Ahorro líquido = Sueldo Líquido - Gastos + Extras
      ahorroAnualLiquido =
        sueldoLiquidoAnual + extraIngresosAnual - gastosTotalesAnio;
      currentLiquid = currentLiquid * (1 + returnLiquid) + ahorroAnualLiquido;
      currentAfp = currentAfp * (1 + returnAfp) + aporteAfpAnual;
    } else {
      // Jubilado:
      // Aporte AFP cesa. La AFP sigue rentando hasta los 60/65 o hasta agotarse en retiro
      if (age < edadLegalRetiro) {
        // Fase Puente FIRE: Vivir del portafolio líquido
        currentAfp = currentAfp * (1 + returnAfp);
        const gastoCubrir = gastosTotalesAnio - extraIngresosAnual;
        retiroAnualPortafolio = Math.max(0, gastoCubrir);
        currentLiquid =
          currentLiquid * (1 + returnLiquid) - retiroAnualPortafolio;
      } else {
        // Fase Retiro Legal: Se activa Pensión AFP + PGU
        if (input.incluirPgu && age >= 65) {
          pguAnual = input.montoPguMensual * 12;
        }

        // Pensión AFP recalculada anualmente mediante el CNU actuarial de la edad en curso
        const pensionMensual = estimateMonthlyPensionAfp(
          currentAfp,
          input.genero,
          age
        );
        pensionAnualAfp = pensionMensual * 12;

        // Por ley chilena (DL 3.500), durante el retiro el fondo pasa a carteras conservadoras (Fondo D o E: ~2.0% real anual)
        const returnAfpRetiro = DEFAULT_CHILE_PARAMS.rentabilidadAfpRetiroRealPct;
        currentAfp = Math.max(0, currentAfp * (1 + returnAfpRetiro) - pensionAnualAfp);

        // La diferencia entre el gasto deseado y (Pensión AFP + PGU + extras) se saca del portafolio líquido
        const ingresoPensional = pensionAnualAfp + pguAnual + extraIngresosAnual;
        const deficit = Math.max(0, gastosTotalesAnio - ingresoPensional);
        retiroAnualPortafolio = deficit;

        currentLiquid =
          currentLiquid * (1 + returnLiquid) - retiroAnualPortafolio;
      }
    }

    currentLiquid = Math.max(0, currentLiquid);
    currentAfp = Math.max(0, currentAfp);

    trajectory.push({
      edad: age,
      ingresosAnuales: ingresosTotalesAnio,
      gastosAnualesTotales: gastosTotalesAnio,
      gastoBaseAnual,
      gastoHijosAnual,
      flujosExtraNetosAnuales: extraIngresosAnual - extraGastosAnual,
      ahorroAnualLiquido,
      aporteAfpAnual,
      patrimonioLiquido: Math.round(currentLiquid),
      patrimonioAfp: Math.round(currentAfp),
      patrimonioTotal: Math.round(currentLiquid + currentAfp),
      metaFireTradicional: Math.round((gastoRetiroAnual + gastoHijosAnual) / swrFactor),
      esJubilado: isRetired,
      fase,
      retiroAnualPortafolio: Math.round(retiroAnualPortafolio),
      pensionAnualAfp: Math.round(pensionAnualAfp),
      pguAnual: Math.round(pguAnual),
    });
  }

  return trajectory;
}

// Verifica si con los activos actuales puede retirarse solventando tanto la fase puente como la fase legal
function checkCanRetire(
  edad: number,
  edadLegal: number,
  liquid: number,
  afp: number,
  gastoRetiroAnual: number,
  gastoHijosAnual: number,
  extraGastos: number,
  extraIngresos: number,
  rLiquid: number,
  rAfp: number,
  swr: number,
  incluirPgu: boolean,
  montoPguMensual: number,
  genero: 'hombre' | 'mujer'
): boolean {
  // Si ya tiene suficiente solo en líquido para la regla del 4% perpetua:
  if (liquid * swr >= gastoRetiroAnual + gastoHijosAnual + extraGastos - extraIngresos) {
    return true;
  }

  // Si ya pasó la edad legal de retiro:
  if (edad >= edadLegal) {
    const pensionAfpMensual = estimateMonthlyPensionAfp(afp, genero, edad);
    const pguMensual = incluirPgu && edad >= 65 ? montoPguMensual : 0;
    const ingresoPensionalAnual = (pensionAfpMensual + pguMensual) * 12 + extraIngresos;
    const faltante = Math.max(0, gastoRetiroAnual + extraGastos - ingresoPensionalAnual);
    return liquid * swr >= faltante;
  }

  // Si está antes de la edad legal (ej. tiene 40 y la legal es 65):
  // Necesitamos calcular si el fondo líquido sobrevive los años de puente (65 - edad)
  // Y si al llegar a los 65 años, la pensión AFP proyectada + remanente líquido cubre el gasto perpetuo.
  const anosPuente = edadLegal - edad;
  let simLiquid = liquid;
  const gastoAnualPuente = gastoRetiroAnual + gastoHijosAnual + extraGastos - extraIngresos;

  for (let y = 0; y < anosPuente; y++) {
    simLiquid = simLiquid * (1 + rLiquid) - gastoAnualPuente;
    if (simLiquid < 0) {
      return false; // El puente se quiebra antes de llegar a la AFP
    }
  }

  // Saldo AFP a los 60/65 proyectado sin nuevos aportes
  const simAfp = afp * Math.pow(1 + rAfp, anosPuente);
  const pensionAfpMensual = estimateMonthlyPensionAfp(simAfp, genero, edadLegal);
  const pguMensual = incluirPgu ? montoPguMensual : 0;
  const ingresoPensionalAnual = (pensionAfpMensual + pguMensual) * 12;

  const deficitPostLegal = Math.max(0, gastoRetiroAnual - ingresoPensionalAnual);
  return simLiquid * swr >= deficitPostLegal;
}
