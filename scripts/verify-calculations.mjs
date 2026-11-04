import { calculateChileSalaryTax } from '../src/lib/chileTaxEngine.ts';
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

console.log('🎉 Todos los tests del motor de cálculo fueron superados satisfactoriamente.');
