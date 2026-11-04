# Dividendo de Tiempo · Calculadora FIRE Chile 🇨🇱

> *"El mayor dividendo que podemos obtener del dinero es el tiempo."*  
> — Morgan Housel, *The Psychology of Money*

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

**Dividendo de Tiempo** es la primera calculadora de **Independencia Financiera y Retiro Temprano (FIRE)** adaptada con rigor matemático a la realidad económica, previsional y tributaria de **Chile**.

Inspirada en el funcionamiento interactivo de *Engaging Data* y diseñada bajo la dirección de arte editorial de *TasteSkill* (`tasteskill.dev`), modela el retiro temprano considerando las restricciones reales del sistema chileno de pensiones y la planificación familiar.

---

## 🌟 Características Principales

### 1. Modelo Dual Chileno (Puente Líquido + Pensión Legal)
A diferencia de calculadoras extranjeras (que asumen libre disponibilidad de todos los fondos), en Chile los fondos de capitalización individual de las AFP no pueden retirarse antes de los 60 (mujeres) o 65 años (hombres). La calculadora modela:
- **Fase 1: Portafolio Puente Líquido**: Lo que debes acumular en inversiones de libre disposición (ETFs globales como S&P 500, MSCI World, fondos mutuos, Cuenta 2) para financiarte entre la edad de retiro temprano (ej. 38 o 42 años) y la edad legal.
- **Fase 2: Pensión Legal (AFP + PGU)**: A partir de los 60/65 años, tu fondo AFP acumulado (que siguió rentando todo ese tiempo) entra a pagar una pensión mensual vitalicia, complementada por la **Pensión Garantizada Universal (PGU)** del Estado.

### 2. Motor Tributario SII y Previsión en Tiempo Real
- **Impuesto Único de Segunda Categoría (Art. 43 LIR)**: Tramos progresivos actualizados en base a la UTM mensual vigente.
- **Cotizaciones Previsionales Obligatorias**:
  - 10% obligatorio a la cuenta de capitalización individual (tope imponible 84.3 UF).
  - Comisión promedio de AFP (~1.15%).
  - Salud legal (7% obligatorio Fonasa o Isapre).
  - Seguro de Cesantía AFC (0.6% con tope 126.6 UF).
- **Ahorro Previsional Voluntario (APV)**:
  - **Régimen A**: Bonificación fiscal directa del 15% del Estado (tope anual 6 UTM).
  - **Régimen B**: Rebaja directa de la base imponible del impuesto único (tope mensual 50 UF).

### 3. Planificación Familiar: "¿Y si tengo un hijo a los X años?"
Permite proyectar el impacto de la crianza en tu fecha de jubilación mediante una línea de vida estructurada en las 3 etapas reales en Chile:
- **0 a 3 años (Primera Infancia)**: Sala cuna, pañales, controles pediátricos.
- **4 a 17 años (Etapa Escolar)**: Matrícula, mensualidad colegios, vestuario y útiles.
- **18 a 23 años (Educación Superior)**: Arancel universitario o técnico y manutención.
- **24+ años (Independencia)**: El gasto cesa automáticamente al independizarse.
- **Presets Chilenos**: *Público / Gratuidad*, *Estándar / Subvencionado* y *Particular / Privado*.

### 4. Crecimiento Salarial Real Anual
Permite simular ascensos y aumentos de renta por encima de la inflación (`0%` a `8%` anual). Al alcanzar el tope imponible previsional de 84.3 UF, el 100% del aumento salarial pasa a potenciar tu ahorro libre, acortando drásticamente los años hasta la independencia financiera.

### 5. Dirección de Arte Editorial (TasteSkill Style)
- **Paleta Papel Piedra Cálido**: Fondo `#f5f4f2`, tinta `#0a0a0a` y tarjetas blancas con microbordes `border-black/[0.07]`.
- **Tipografía Geist con Números Tabulares (`tabular-nums`)**: Cero saltos o parpadeos de cifras al interactuar con los sliders.
- **Moneda Dual Reactiva**: Conmutador instantáneo entre Pesos Chilenos (`$ CLP`) y Unidades de Fomento (`UF`).

### 6. Arquitectura Optimizada para Monetización Pasiva (Google AdSense Ready)
- Contenedores publicitarios responsivos listos para producción.
- Contenido editorial completo para evitar el rechazo por *"Thin Content"* y rankear en Google:
  - `/guia-fire-chile`: Guía detallada sobre la regla del 4% en Chile y APV.
  - `/como-funciona`: Metodología matemática, tramos del SII y supuestos.
  - `/privacidad`: Política de privacidad conforme a Google y Ley 19.628.
  - `/terminos`: Términos de uso y descargo de responsabilidad financiera.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 20+ o 22+
- npm o pnpm

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Aspirador4/FIRE-CL.git
cd FIRE-CL

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Pruebas y Verificación Matemática

El proyecto cuenta con una suite de pruebas para verificar la precisión del cálculo tributario del SII y las simulaciones actuariales:

```bash
# Ejecutar verificación de cálculos
npx tsx scripts/verify-calculations.mjs

# Compilación estática de producción (SSG)
npm run build
```

---

## 🌐 Despliegue en Producción (Vercel)

1. Conecta este repositorio en [Vercel](https://vercel.com).
2. Configura las variables de entorno (opcional para activar anuncios reales):
   ```env
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```
3. El proyecto se desplegará automáticamente con costo $0 de servidor y puntuación Lighthouse > 95 en rendimiento y SEO.

---

## 📄 Descargo de Responsabilidad (Disclaimer)

Esta plataforma tiene fines exclusivamente **educativos y de simulación financiera**. Los resultados se basan en supuestos de rentabilidad histórica y leyes vigentes. No constituye asesoría financiera, tributaria ni previsional vinculante. Se recomienda consultar con un asesor certificado ante la CMF antes de tomar decisiones de inversión.

---

Hecho con dedicación en Chile 🇨🇱.
