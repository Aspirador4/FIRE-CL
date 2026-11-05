import { calculateChileSalaryTax, calculateChileSalaryFromNet } from '../src/lib/chileTaxEngine.ts';
import { runFireSimulation } from '../src/lib/fireEngine.ts';
import { DEFAULT_CHILE_PARAMS } from '../src/lib/constants.ts';
import assert from 'node:assert';

console.log('🧪 Iniciando pruebas de verificación para Calculadora FIRE Chile...\n');

// Test 1: Verificación de Impuesto Único de Segunda Categoría (Chile)
console.log('Test 1: Cálculo de Sueldo Bruto $2.500.000 con APV Régimen B');
const taxResult = calculateChileSalaryTax(2500000, 100000, 'B', DEFAULT_CHILE_PARAMS);

assert(taxResult.sueldoLiquido > 1800000 && taxResult.sueldoLiquido < 2100000, 'Sueldo líquido debe estar en rango esperado');
assert(taxResult.cotizacionAfp10 > 240000, 'Cotización 10% AFP debe calcularse correctamente');
assert(taxResult.saludObligatoria > 170000, 'Salud 7% debe calcularse correctamente');
assert(taxResult.impuestoSegundaCategoria > 0, 'Debe pagar impuesto de segunda categoría');
assert(taxResult.apvBeneficioFiscalEstimado > 0, 'APV Régimen B debe generar ahorro impositivo');
console.log(`✓ Sueldo Líquido: $${Math.round(taxResult.sueldoLiquido).toLocaleString('es-CL')}`);
console.log(`✓ Impuesto Único SII: $${Math.round(taxResult.impuestoSegundaCategoria).toLocaleString('es-CL')}`);
console.log(`✓ Ahorro Fiscal APV B: $${Math.round(taxResult.apvBeneficioFiscalEstimado).toLocaleString('es-CL')}`);
console.log('✅ Test 1 aprobado con éxito.\n');

// Test 1b: Cálculo Inverso Sueldo Líquido -> Sueldo Bruto y Leyes Sociales
console.log('Test 1b: Cálculo Inverso Sueldo Líquido $2.000.000 con Isapre (Plan 4.5 UF) y APV $100k');
const targetLiquido = 2000000;
const isapreHealth = {
  system: 'isapre',
  isaprePlanType: 'uf',
  isaprePlanUf: 4.5, // 4.5 UF ~ $185.700
};
const inverseResult = calculateChileSalaryFromNet(
  targetLiquido,
  100000,
  'B',
  DEFAULT_CHILE_PARAMS,
  isapreHealth
);

assert(
  Math.abs(inverseResult.sueldoLiquido - targetLiquido) < 1,
  `El sueldo líquido resultante (${inverseResult.sueldoLiquido}) debe ser igual al objetivo (${targetLiquido})`
);
assert(inverseResult.sueldoBruto > targetLiquido, 'Sueldo bruto debe ser superior al sueldo líquido');
assert(inverseResult.salud.cotizacionAdicionalSalud > 0, 'Debe haber cotización adicional de salud si el plan excede el 7%');
assert(inverseResult.salud.descuentoSaludTotal > inverseResult.salud.saludLegal7Pct, 'Descuento total de salud debe ser igual al plan de Isapre');
assert(inverseResult.cotizacionAfp10 > 0, 'AFP 10% debe calcularse automáticamente');
console.log(`✓ Sueldo Líquido Deseado: $${targetLiquido.toLocaleString('es-CL')}`);
console.log(`✓ Sueldo Bruto Calculado: $${Math.round(inverseResult.sueldoBruto).toLocaleString('es-CL')}`);
console.log(`✓ 10% AFP al fondo: $${Math.round(inverseResult.cotizacionAfp10).toLocaleString('es-CL')}`);
console.log(`✓ Salud 7% Legal: $${Math.round(inverseResult.salud.saludLegal7Pct).toLocaleString('es-CL')}`);
console.log(`✓ Cotización Adicional Isapre: $${Math.round(inverseResult.salud.cotizacionAdicionalSalud).toLocaleString('es-CL')}`);
console.log(`✓ Impuesto 2da Cat SII: $${Math.round(inverseResult.impuestoSegundaCategoria).toLocaleString('es-CL')}`);
console.log('✅ Test 1b aprobado con éxito.\n');

// Test 2: Simulación FIRE sin hijos vs con hijos ('¿Y si tengo un hijo a los X años?')
console.log('Test 2: Simulación de impacto de tener un hijo a los 34 años');
const baseInput = {
  edadActual: 30,
  genero: 'hombre',
  patrimonioLiquidoInicial: 10000000,
  saldoAfpInicial: 15000000,
  sueldoLiquidoMensual: 2000000,
  aporteAfpMensual: 250000,
  aporteApvMensual: 100000,
  gastoMensualActual: 1000000,
  gastoMensualRetiro: 1000000,
  crecimientoIngresoRealPct: 1.0,
  rentabilidadPortafolioRealPct: 7.0,
  rentabilidadAfpRealPct: 4.5,
  tasaRetiroSeguroPct: 4.0,
  incluirPgu: true,
  montoPguMensual: 214296,
  hijos: [
    {
      id: 'hijo-1',
      name: 'Primer Hijo',
      edadPadreAlNacer: 34,
      costoMensual0a3: 350000,
      costoMensual4a17: 300000,
      costoMensual18a23: 450000,
    },
  ],
  flujosExtra: [],
};

const simResult = runFireSimulation(baseInput);

assert(simResult.edadFirePuente !== null, 'Debe alcanzar edad FIRE puente');
assert(simResult.edadFirePuente > 30, 'Edad FIRE debe ser mayor a la edad actual');
assert(simResult.impactoHijos.diferenciaAnosFire >= 0, 'El impacto de hijos debe calcular desfase en años');
assert(simResult.impactoHijos.gastoTotalHijosVida > 50000000, 'El gasto total de crianza debe ser significativo');

console.log(`✓ Edad FIRE calculada: ${simResult.edadFirePuente} años`);
console.log(`✓ Desfase por tener hijo a los 34 años: +${simResult.impactoHijos.diferenciaAnosFire} años`);
console.log(`✓ Inversión total estimada en crianza: $${Math.round(simResult.impactoHijos.gastoTotalHijosVida).toLocaleString('es-CL')}`);
console.log(`✓ Meta FIRE patrimonial: $${Math.round(simResult.metaPatrimonioFire).toLocaleString('es-CL')}`);
console.log('✅ Test 2 aprobado con éxito.\n');

// Test 3: Modelo Actuarial de Desacumulación AFP post-retiro legal (CNU dinámico + Fondo D/E)
console.log('Test 3: Desacumulación actuarial de la AFP después de los 65 años');
const afpAt65 = simResult.trayectoriaAnual.find((y) => y.edad === 65)?.patrimonioAfp || 0;
const afpAt75 = simResult.trayectoriaAnual.find((y) => y.edad === 75)?.patrimonioAfp || 0;
const afpAt85 = simResult.trayectoriaAnual.find((y) => y.edad === 85)?.patrimonioAfp || 0;
const afpAt90 = simResult.trayectoriaAnual.find((y) => y.edad === 90)?.patrimonioAfp || 0;

assert(afpAt65 > 0, 'Debe haber saldo acumulado en AFP a los 65 años');
assert(afpAt75 < afpAt65, 'El saldo AFP a los 75 debe ser menor que a los 65 debido a retiros de pensión');
assert(afpAt85 < afpAt75, 'El saldo AFP a los 85 debe seguir descendiendo progresivamente');
assert(afpAt90 < afpAt85, 'El saldo AFP a los 90 debe tender al agotamiento natural');
assert(afpAt90 < afpAt65 * 0.25, 'A los 90 años el fondo debe haberse pagado en más de un 75% en pensiones');

console.log(`✓ Saldo AFP a los 65 años (Pico Histórico): $${Math.round(afpAt65).toLocaleString('es-CL')}`);
console.log(`✓ Saldo AFP a los 75 años (-${Math.round((1 - afpAt75 / afpAt65) * 100)}%): $${Math.round(afpAt75).toLocaleString('es-CL')}`);
console.log(`✓ Saldo AFP a los 85 años (-${Math.round((1 - afpAt85 / afpAt65) * 100)}%): $${Math.round(afpAt85).toLocaleString('es-CL')}`);
console.log(`✓ Saldo AFP a los 90 años (-${Math.round((1 - afpAt90 / afpAt65) * 100)}%): $${Math.round(afpAt90).toLocaleString('es-CL')}`);
console.log('✅ Test 3 aprobado con éxito.\n');

console.log('🎉 Todos los tests del motor de cálculo fueron superados satisfactoriamente.');
