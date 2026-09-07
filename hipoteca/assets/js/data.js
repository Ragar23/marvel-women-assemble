/**
 * Datos fiscales por Comunidad Autónoma para la compra de vivienda en España.
 *
 * ⚠️  IMPORTANTE: tipos orientativos consolidados a fecha de 2025. La normativa
 * autonómica cambia con cada ley de presupuestos. Antes de firmar, confirma los
 * tipos en la Agencia Tributaria de tu comunidad (campo `fuente` de cada CCAA).
 *
 * Modelo de datos
 * ---------------
 * itp.tramos      Tipo de ITP (vivienda usada) por tramos PROGRESIVOS: cada
 *                 tramo tributa a su tipo, como el IRPF.
 * itp.reducciones Tipos reducidos que SUSTITUYEN al tipo general cuando se
 *                 cumplen las condiciones. Se aplica el más favorable.
 * itp.bonif       Bonificaciones en cuota (% de descuento sobre la cuota final).
 * ajd             Actos Jurídicos Documentados (obra nueva). Desde la Ley
 *                 5/2019 el AJD del préstamo hipotecario lo paga el banco;
 *                 aquí solo se calcula el AJD de la escritura de compraventa.
 * impuestoNueva   IVA 10 % en territorio común, IGIC 7 % en Canarias,
 *                 IPSI en Ceuta y Melilla.
 */

export const LIMITE_ANIO = 2025;

/* ------------------------------------------------------------------ *
 * Predicados reutilizables sobre el perfil del comprador
 * ------------------------------------------------------------------ */

const habitual = (p) => p.viviendaHabitual;
/** «Menor de N años»: estrictamente por debajo de N, como dice la ley. */
const menorDe = (n) => (p) => p.viviendaHabitual && p.edad < n;
const primeraMenorDe = (n) => (p) =>
  p.viviendaHabitual && p.primeraVivienda && p.edad < n;
const primeraHasta = (n) => (p) =>
  p.viviendaHabitual && p.primeraVivienda && p.edad <= n;
const numerosa = (p) => p.viviendaHabitual && (p.familiaNumerosa || p.monoparental);
const discap = (min) => (p) => p.viviendaHabitual && p.discapacidad >= min;
const esVpo = (p) => p.vpo;
const rentaHasta = (max) => (p) => p.baseIrpf <= max;
const valorHasta = (max) => (base) => base <= max;

/** Combina predicados de perfil (todos deben cumplirse). */
const y = (...fns) => (p) => fns.every((f) => f(p));
/** Al menos uno de los predicados de perfil. */
const o = (...fns) => (p) => fns.some((f) => f(p));

/**
 * Azúcar sintáctico para declarar un tipo reducido.
 * @param {string} id
 * @param {number} tipo   Tipo impositivo resultante en %
 * @param {string} label  Texto mostrado al usuario
 * @param {object} cond   { perfil?: fn(perfil), valorMax?: number }
 */
const red = (id, tipo, label, cond = {}) => ({
  id,
  tipo,
  label,
  perfil: cond.perfil || (() => false),
  valorMax: cond.valorMax ?? Infinity,
});

const bon = (id, pct, label, cond = {}) => ({
  id,
  pct,
  label,
  perfil: cond.perfil || (() => false),
  valorMax: cond.valorMax ?? Infinity,
});

/* ------------------------------------------------------------------ *
 * Comunidades Autónomas
 * ------------------------------------------------------------------ */

export const COMUNIDADES = [
  {
    id: 'andalucia',
    nombre: 'Andalucía',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 7 }],
      reducciones: [
        red('and-6', 6, 'Vivienda habitual hasta 150.000 € (menor de 35, familia numerosa, monoparental o discapacidad)', {
          perfil: o(menorDe(35), numerosa, discap(33)),
          valorMax: 150000,
        }),
        red('and-35', 3.5, 'VPO destinada a vivienda habitual', { perfil: esVpo, valorMax: 150000 }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.2,
      reducciones: [
        red('and-ajd', 0.3, 'Vivienda habitual hasta 150.000 € (menor de 35, familia numerosa o discapacidad)', {
          perfil: o(menorDe(35), numerosa, discap(33)),
          valorMax: 150000,
        }),
        red('and-ajd-vpo', 0.1, 'VPO', { perfil: esVpo }),
      ],
    },
    notas: 'Tipo único del 7 % desde 2021, sin tramos. El tipo reducido exige que el inmueble sea la vivienda habitual y no supere 150.000 € de valor.',
    fuente: 'https://www.juntadeandalucia.es/agenciatributariadeandalucia',
  },

  {
    id: 'aragon',
    nombre: 'Aragón',
    itp: {
      tramos: [
        { hasta: 400000, tipo: 8 },
        { hasta: 450000, tipo: 8.5 },
        { hasta: 500000, tipo: 9 },
        { hasta: 750000, tipo: 9.5 },
        { hasta: Infinity, tipo: 10 },
      ],
      reducciones: [
        red('ara-4', 4, 'Vivienda habitual de familia numerosa (con límites de patrimonio)', {
          perfil: numerosa,
        }),
        red('ara-3', 3, 'Vivienda habitual de persona con discapacidad ≥ 65 %', {
          perfil: discap(65),
        }),
      ],
      bonif: [
        bon('ara-bon', 12.5, 'Bonificación del 12,5 % de la cuota en vivienda habitual hasta 100.000 €', {
          perfil: habitual,
          valorMax: 100000,
        }),
      ],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('ara-ajd', 0.5, 'Vivienda habitual de familia numerosa o con discapacidad', {
          perfil: o(numerosa, discap(65)),
        }),
      ],
    },
    notas: 'ITP por tramos progresivos. Existen bonificaciones adicionales para adquisiciones en municipios en riesgo de despoblación.',
    fuente: 'https://www.aragon.es/tramitador/-/tramite/impuesto-transmisiones-patrimoniales',
  },

  {
    id: 'asturias',
    nombre: 'Principado de Asturias',
    itp: {
      tramos: [
        { hasta: 300000, tipo: 8 },
        { hasta: 500000, tipo: 9 },
        { hasta: Infinity, tipo: 10 },
      ],
      reducciones: [
        red('ast-3', 3, 'Vivienda habitual protegida, familia numerosa o discapacidad ≥ 65 %', {
          perfil: o(esVpo, numerosa, discap(65)),
        }),
        red('ast-jov', 3, 'Menor de 35 años en concejo en riesgo de despoblación', {
          perfil: y(menorDe(35), (p) => p.municipioPequeno),
        }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.2,
      reducciones: [
        red('ast-ajd', 0.3, 'VPO, familia numerosa o discapacidad', {
          perfil: o(esVpo, numerosa, discap(65)),
        }),
      ],
    },
    notas: 'ITP por tramos progresivos. Los tipos reducidos exigen límites de renta del adquirente.',
    fuente: 'https://sede.asturias.es/tributos',
  },

  {
    id: 'baleares',
    nombre: 'Illes Balears',
    itp: {
      tramos: [
        { hasta: 400000, tipo: 8 },
        { hasta: 600000, tipo: 9 },
        { hasta: 1000000, tipo: 10 },
        { hasta: 2000000, tipo: 12 },
        { hasta: Infinity, tipo: 13 },
      ],
      reducciones: [
        red('bal-0', 0, 'Primera vivienda habitual, menor de 30 años (o hasta 35 con discapacidad / monoparental), hasta 270.000 €', {
          perfil: y(primeraMenorDe(30), rentaHasta(52800)),
          valorMax: 270000,
        }),
        red('bal-vpo', 0, 'VPO', { perfil: esVpo }),
        red('bal-4', 4, 'Primera vivienda habitual hasta 270.000 €', {
          perfil: y(habitual, (p) => p.primeraVivienda),
          valorMax: 270000,
        }),
      ],
      bonif: [
        bon('bal-50', 50, 'Bonificación del 50 % para primera vivienda habitual entre 30 y 35 años (hasta 270.000 €)', {
          perfil: y((p) => p.edad >= 30 && p.edad < 36, (p) => p.viviendaHabitual && p.primeraVivienda),
          valorMax: 270000,
        }),
      ],
    },
    ajd: {
      general: 1.2,
      reducciones: [
        red('bal-ajd0', 0, 'Primera vivienda habitual de menores de 36 años o con discapacidad', {
          perfil: o(primeraMenorDe(36), discap(33)),
          valorMax: 270000,
        }),
      ],
    },
    notas: 'ITP muy progresivo (hasta el 13 %). Desde 2024 la primera vivienda habitual de menores de 30 años tributa al 0 % hasta 270.000 €.',
    fuente: 'https://www.atib.es/',
  },

  {
    id: 'canarias',
    nombre: 'Canarias',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 6.5 }],
      reducciones: [
        red('can-0', 0, 'VPO destinada a vivienda habitual', { perfil: esVpo }),
        red('can-5', 5, 'Vivienda habitual de menor de 35, familia numerosa, monoparental o discapacidad (hasta 150.000 €)', {
          perfil: o(menorDe(35), numerosa, discap(33)),
          valorMax: 150000,
        }),
      ],
      bonif: [],
    },
    ajd: {
      general: 0.75,
      reducciones: [
        red('can-ajd', 0.4, 'Vivienda habitual de menor de 35, familia numerosa o discapacidad', {
          perfil: o(menorDe(35), numerosa, discap(33)),
        }),
        red('can-ajd-vpo', 0, 'VPO', { perfil: esVpo }),
      ],
    },
    impuestoNueva: { nombre: 'IGIC', tipo: 7, tipoVpo: 0 },
    notas: 'En Canarias la obra nueva NO paga IVA: paga IGIC al 7 % (0 % en VPO). El ITP general es el más bajo del territorio común junto con Madrid.',
    fuente: 'https://www.gobiernodecanarias.org/tributos/',
  },

  {
    id: 'cantabria',
    nombre: 'Cantabria',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 9 }],
      reducciones: [
        red('cnt-5', 5, 'Vivienda habitual de menor de 30, familia numerosa o discapacidad ≥ 65 %', {
          perfil: o(menorDe(30), numerosa, discap(65)),
        }),
        red('cnt-vpo', 5, 'VPO', { perfil: esVpo }),
        red('cnt-3', 3, 'Vivienda habitual en municipio en riesgo de despoblación', {
          perfil: y(habitual, (p) => p.municipioPequeno),
        }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('cnt-ajd', 0.3, 'Vivienda habitual de menor de 30, familia numerosa o discapacidad', {
          perfil: o(menorDe(30), numerosa, discap(65)),
        }),
      ],
    },
    notas: 'El tipo general bajó del 10 % al 9 % en 2023. Los tipos reducidos exigen límites de renta.',
    fuente: 'https://www.cantabria.es/agencia-cantabra-administracion-tributaria',
  },

  {
    id: 'castilla-la-mancha',
    nombre: 'Castilla-La Mancha',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 9 }],
      reducciones: [
        red('clm-6', 6, 'Primera vivienda habitual hasta 180.000 €', {
          perfil: y(habitual, (p) => p.primeraVivienda),
          valorMax: 180000,
        }),
        red('clm-fam', 6, 'Vivienda habitual de familia numerosa o discapacidad ≥ 65 %', {
          perfil: o(numerosa, discap(65)),
        }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('clm-ajd', 0.75, 'Primera vivienda habitual, familia numerosa o discapacidad', {
          perfil: o(y(habitual, (p) => p.primeraVivienda), numerosa, discap(65)),
        }),
      ],
    },
    notas: 'Tipo general del 9 %. Bonificaciones adicionales en municipios de menos de 3.000 habitantes.',
    fuente: 'https://tributos.castillalamancha.es/',
  },

  {
    id: 'castilla-y-leon',
    nombre: 'Castilla y León',
    itp: {
      tramos: [
        { hasta: 250000, tipo: 8 },
        { hasta: Infinity, tipo: 10 },
      ],
      reducciones: [
        red('cyl-001', 0.01, 'Vivienda habitual de menor de 36 años en municipio rural, familia numerosa o discapacidad ≥ 65 % (hasta 150.000 €)', {
          perfil: o(y(menorDe(36), (p) => p.municipioPequeno), numerosa, discap(65)),
          valorMax: 150000,
        }),
        red('cyl-5', 5, 'Vivienda habitual de menor de 36 años, familia numerosa, monoparental o discapacidad', {
          perfil: o(menorDe(36), numerosa, discap(33)),
          valorMax: 150000,
        }),
        red('cyl-vpo', 5, 'VPO destinada a vivienda habitual', { perfil: esVpo }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('cyl-ajd001', 0.01, 'Vivienda habitual de joven en municipio rural o VPO', {
          perfil: o(y(menorDe(36), (p) => p.municipioPequeno), esVpo),
        }),
        red('cyl-ajd', 0.5, 'Vivienda habitual de menor de 36, familia numerosa o discapacidad', {
          perfil: o(menorDe(36), numerosa, discap(65)),
        }),
      ],
    },
    notas: 'Dos tramos: 8 % hasta 250.000 € y 10 % sobre el exceso. El tipo del 0,01 % para jóvenes en el medio rural es de los más ventajosos de España.',
    fuente: 'https://tributos.jcyl.es/',
  },

  {
    id: 'cataluna',
    nombre: 'Catalunya',
    itp: {
      tramos: [
        { hasta: 600000, tipo: 10 },
        { hasta: 900000, tipo: 11 },
        { hasta: 1500000, tipo: 12 },
        { hasta: Infinity, tipo: 13 },
      ],
      reducciones: [
        red('cat-5', 5, 'Primera vivienda habitual de menor de 33 años con base imponible ≤ 36.000 €', {
          perfil: y(primeraHasta(32), rentaHasta(36000)),
        }),
        red('cat-5b', 5, 'Vivienda habitual de familia numerosa, monoparental o discapacidad ≥ 65 %', {
          perfil: o(numerosa, discap(65)),
        }),
        red('cat-vpo', 7, 'VPO', { perfil: esVpo }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('cat-ajd', 0.5, 'VPO o vivienda habitual de joven, familia numerosa o discapacidad', {
          perfil: o(primeraHasta(32), numerosa, discap(65), esVpo),
        }),
      ],
    },
    notas: 'Desde la reforma de junio de 2025 el ITP es progresivo por tramos y llega al 13 %. Los grandes tenedores tributan al 20 % y la compra de edificios enteros de viviendas, también.',
    fuente: 'https://atc.gencat.cat/',
  },

  {
    id: 'extremadura',
    nombre: 'Extremadura',
    itp: {
      tramos: [
        { hasta: 360000, tipo: 8 },
        { hasta: 600000, tipo: 10 },
        { hasta: Infinity, tipo: 11 },
      ],
      reducciones: [
        red('ext-4', 4, 'Vivienda habitual de menor de 35, familia numerosa o discapacidad ≥ 65 % (hasta 122.000 €)', {
          perfil: o(menorDe(35), numerosa, discap(65)),
          valorMax: 122000,
        }),
        red('ext-7', 7, 'Vivienda habitual hasta 122.000 € con límite de renta', {
          perfil: y(habitual, rentaHasta(19000)),
          valorMax: 122000,
        }),
        red('ext-vpo', 4, 'VPO', { perfil: esVpo }),
      ],
      bonif: [
        bon('ext-rural', 20, 'Bonificación del 20 % en municipios de menos de 3.000 habitantes', {
          perfil: y(habitual, (p) => p.municipioPequeno),
        }),
      ],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('ext-ajd', 0.75, 'Vivienda habitual con límite de renta', { perfil: habitual, valorMax: 122000 }),
        red('ext-ajd-vpo', 0.1, 'VPO', { perfil: esVpo }),
      ],
    },
    notas: 'ITP por tramos. Los tipos reducidos tienen un límite de valor muy bajo (122.000 €) y límites de renta estrictos.',
    fuente: 'https://portaltributario.juntaex.es/',
  },

  {
    id: 'galicia',
    nombre: 'Galicia',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 8 }],
      reducciones: [
        red('gal-3', 3, 'Vivienda habitual de menor de 36, familia numerosa o discapacidad ≥ 65 % (hasta 150.000 €)', {
          perfil: o(menorDe(36), numerosa, discap(65)),
          valorMax: 150000,
        }),
        red('gal-6', 6, 'Vivienda habitual (tipo reducido general)', { perfil: habitual }),
        red('gal-vpo', 3, 'VPO', { perfil: esVpo }),
      ],
      bonif: [
        bon('gal-rural', 100, 'Deducción del 100 % para menores de 36 años en municipios de menos de 5.000 habitantes', {
          perfil: y(primeraMenorDe(36), (p) => p.municipioPequeno),
        }),
      ],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('gal-ajd', 0.5, 'Vivienda habitual de menor de 36, familia numerosa o discapacidad', {
          perfil: o(menorDe(36), numerosa, discap(65)),
        }),
        red('gal-ajd-vpo', 0.1, 'VPO', { perfil: esVpo }),
      ],
    },
    notas: 'Desde 2024 la vivienda habitual tributa al 6 % con carácter general y al 3 % para jóvenes, familias numerosas y personas con discapacidad.',
    fuente: 'https://www.atriga.gal/',
  },

  {
    id: 'madrid',
    nombre: 'Comunidad de Madrid',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 6 }],
      reducciones: [],
      bonif: [
        bon('mad-fam', 95, 'Bonificación del 95 % de la cuota para familias numerosas (vivienda habitual, con condiciones)', {
          perfil: numerosa,
        }),
        bon('mad-10', 10, 'Bonificación del 10 % de la cuota en la compra de vivienda habitual', {
          perfil: habitual,
        }),
      ],
    },
    ajd: {
      general: 0.75,
      reducciones: [
        red('mad-ajd', 0.4, 'Vivienda habitual de menor de 35 años hasta 250.000 €', {
          perfil: menorDe(35),
          valorMax: 250000,
        }),
        red('mad-ajd-vpo', 0.2, 'VPO o familia numerosa', { perfil: o(esVpo, numerosa) }),
      ],
    },
    notas: 'Uno de los ITP más bajos de España (6 %), con una bonificación adicional del 10 % de la cuota si es vivienda habitual. Ojo: la bonificación exige mantener la vivienda como habitual.',
    fuente: 'https://www.comunidad.madrid/servicios/impuestos',
  },

  {
    id: 'murcia',
    nombre: 'Región de Murcia',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 8 }],
      reducciones: [
        red('mur-3', 3, 'Primera vivienda habitual de menor de 35 años (hasta 150.000 €, con límite de renta)', {
          perfil: y(primeraMenorDe(35), rentaHasta(26620)),
          valorMax: 150000,
        }),
        red('mur-3b', 3, 'Vivienda habitual de familia numerosa o discapacidad ≥ 65 %', {
          perfil: o(numerosa, discap(65)),
        }),
        red('mur-vpo', 4, 'VPO', { perfil: esVpo }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('mur-ajd', 0.1, 'Vivienda habitual de joven, familia numerosa, discapacidad o VPO', {
          perfil: o(primeraMenorDe(35), numerosa, discap(65), esVpo),
        }),
      ],
    },
    notas: 'Tipo general del 8 %. El tipo del 3 % para jóvenes exige que sea la primera vivienda y respetar el límite de base imponible del IRPF.',
    fuente: 'https://agenciatributaria.carm.es/',
  },

  {
    id: 'navarra',
    nombre: 'Comunidad Foral de Navarra',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 6 }],
      reducciones: [
        red('nav-5', 5, 'Primera vivienda habitual de familia numerosa (hasta 180.304 €)', {
          perfil: numerosa,
          valorMax: 180304,
        }),
      ],
      bonif: [],
    },
    ajd: { general: 0.5, reducciones: [] },
    notas: 'Régimen foral propio. Tipo general del 6 % y AJD del 0,5 %, de los más bajos de España.',
    fuente: 'https://hacienda.navarra.es/',
  },

  {
    id: 'pais-vasco',
    nombre: 'País Vasco',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 7 }],
      reducciones: [
        red('pv-25', 2.5, 'Vivienda habitual ≤ 120 m² de familia numerosa o menor de 36 años (primera vivienda)', {
          perfil: o(numerosa, primeraMenorDe(36)),
        }),
        red('pv-4', 4, 'Vivienda habitual de superficie construida ≤ 120 m²', { perfil: habitual }),
      ],
      bonif: [],
    },
    ajd: { general: 0, reducciones: [] },
    notas: 'Régimen foral (Álava, Bizkaia y Gipuzkoa, con matices entre diputaciones). Las escrituras de vivienda habitual están exentas de AJD. El tipo reducido exige superficie construida ≤ 120 m².',
    fuente: 'https://www.euskadi.eus/hacienda/',
  },

  {
    id: 'la-rioja',
    nombre: 'La Rioja',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 7 }],
      reducciones: [
        red('rio-3', 3, 'Vivienda habitual de menor de 36 años, familia numerosa o discapacidad ≥ 33 %', {
          perfil: o(menorDe(36), numerosa, discap(33)),
        }),
        red('rio-5', 5, 'Vivienda habitual (tipo reducido general)', { perfil: habitual }),
        red('rio-vpo', 5, 'VPO', { perfil: esVpo }),
      ],
      bonif: [
        bon('rio-rural', 100, 'Deducción del 100 % para jóvenes en municipios de menos de 3.000 habitantes', {
          perfil: y(primeraMenorDe(36), (p) => p.municipioPequeno),
        }),
      ],
    },
    ajd: {
      general: 1,
      reducciones: [
        red('rio-ajd', 0.4, 'Vivienda habitual de joven, familia numerosa o discapacidad', {
          perfil: o(menorDe(36), numerosa, discap(33)),
        }),
        red('rio-ajd-hab', 0.5, 'Vivienda habitual', { perfil: habitual }),
      ],
    },
    notas: 'AJD del 1 %, por debajo de la media. Deducciones muy potentes para jóvenes que compran en municipios pequeños.',
    fuente: 'https://www.larioja.org/tributos/',
  },

  {
    id: 'valenciana',
    nombre: 'Comunitat Valenciana',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 10 }],
      reducciones: [
        red('val-6', 6, 'Vivienda habitual de menor de 35, familia numerosa, monoparental, discapacidad ≥ 65 % o víctima de violencia de género', {
          perfil: o(menorDe(35), numerosa, discap(65)),
        }),
        red('val-8', 8, 'Vivienda habitual (tipo reducido general) o VPO de régimen general', {
          perfil: o(habitual, esVpo),
        }),
        red('val-vpo', 4, 'VPO de régimen especial', { perfil: esVpo }),
      ],
      bonif: [],
    },
    ajd: {
      general: 1.5,
      reducciones: [
        red('val-ajd', 0.1, 'VPO o vivienda habitual de joven, familia numerosa o discapacidad', {
          perfil: o(menorDe(35), numerosa, discap(65), esVpo),
        }),
      ],
    },
    notas: 'Tipo general del 10 %, de los más altos. Desde 2024 los colectivos protegidos tributan al 6 %. Los tipos reducidos exigen límites de renta.',
    fuente: 'https://atv.gva.es/',
  },

  {
    id: 'ceuta-melilla',
    nombre: 'Ceuta y Melilla',
    itp: {
      tramos: [{ hasta: Infinity, tipo: 6 }],
      reducciones: [],
      bonif: [bon('cm-50', 50, 'Bonificación del 50 % de la cuota (régimen de Ceuta y Melilla)', { perfil: () => true })],
    },
    ajd: { general: 0.5, reducciones: [] },
    impuestoNueva: { nombre: 'IPSI', tipo: 4, tipoVpo: 0.5 },
    notas: 'Ciudades autónomas con régimen fiscal propio: el IVA se sustituye por el IPSI y existe una bonificación general del 50 % en ITP y AJD. Confirma el tipo de IPSI aplicable con la ciudad autónoma.',
    fuente: 'https://www.ceuta.es/ceuta/servicios-tributarios',
  },
];

/** Impuesto por defecto en obra nueva: IVA del territorio común. */
export const IVA_OBRA_NUEVA = { nombre: 'IVA', tipo: 10, tipoVpo: 4 };

/* ------------------------------------------------------------------ *
 * Costes de cierre (no fiscales)
 * ------------------------------------------------------------------ */

/**
 * Aranceles orientativos. Notaría y Registro se rigen por arancel oficial
 * (RD 1426/1989 y RD 1427/1989) y son regresivos: cuanto mayor el precio,
 * menor el porcentaje. Aproximamos por tramos.
 */
export const ARANCELES = {
  notaria: [
    { hasta: 100000, coste: 650 },
    { hasta: 200000, coste: 800 },
    { hasta: 350000, coste: 950 },
    { hasta: 600000, coste: 1150 },
    { hasta: 1000000, coste: 1500 },
    { hasta: Infinity, coste: 2200 },
  ],
  registro: [
    { hasta: 100000, coste: 420 },
    { hasta: 200000, coste: 520 },
    { hasta: 350000, coste: 620 },
    { hasta: 600000, coste: 750 },
    { hasta: 1000000, coste: 950 },
    { hasta: Infinity, coste: 1400 },
  ],
  gestoria: 400,
  tasacion: 400,
  notaSimple: 15,
};

/** Gastos que, desde la Ley 5/2019, asume obligatoriamente el banco. */
export const GASTOS_BANCO = [
  'AJD del préstamo hipotecario',
  'Notaría de la escritura de préstamo',
  'Registro de la hipoteca',
  'Gestoría del préstamo',
  'Copias de la escritura para el banco',
];

/* ------------------------------------------------------------------ *
 * Parámetros financieros por defecto
 * ------------------------------------------------------------------ */

export const DEFAULTS = {
  precio: 250000,
  entradaPct: 20,
  plazoAnios: 30,
  tinFijo: 2.7,
  diferencial: 0.65,
  euribor: 2.1,
  aniosFijoMixto: 10,
  ratioEsfuerzo: 35, // % máximo de los ingresos netos destinado a deuda
  ltvMax: 80,
  ltvMaxAval: 100, // con aval ICO para jóvenes
  seguroHogarAnual: 250,
  seguroVidaAnual: 300,
  comisionApertura: 0,
};

/** Escenarios de estrés del Euríbor para el tipo variable. */
export const ESCENARIOS_EURIBOR = [
  { id: 'optimista', label: 'Optimista', valor: 1.5 },
  { id: 'actual', label: 'Escenario base', valor: null }, // usa el euríbor introducido
  { id: 'tension', label: 'Tensión', valor: 3.5 },
  { id: 'crisis', label: 'Crisis (máx. 2008)', valor: 5.4 },
];

export const getComunidad = (id) =>
  COMUNIDADES.find((c) => c.id === id) || COMUNIDADES.find((c) => c.id === 'madrid');
