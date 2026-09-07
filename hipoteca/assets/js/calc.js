/**
 * Motor de cálculo. Funciones puras, sin DOM: se usan igual desde el
 * navegador y desde los tests de Node (`npm test` en esta carpeta).
 */

import { ARANCELES, DEFAULTS, IVA_OBRA_NUEVA } from './data.js';

/* ------------------------------------------------------------------ *
 * Utilidades
 * ------------------------------------------------------------------ */

/** Formatea un tipo impositivo con la coma decimal española: 1.5 -> "1,5". */
const tipoTxt = (n) => String(redondea(n, 2)).replace('.', ',');

export const redondea = (n, dec = 2) => {
  const f = 10 ** dec;
  return Math.round((n + Number.EPSILON) * f) / f;
};

/** Busca el coste de un tramo escalonado `[{hasta, coste}]`. */
const enTramo = (tabla, valor) => (tabla.find((t) => valor <= t.hasta) || tabla.at(-1)).coste;

/* ------------------------------------------------------------------ *
 * Matemática financiera
 * ------------------------------------------------------------------ */

/**
 * Cuota mensual del sistema francés.
 * @param {number} capital  Capital pendiente
 * @param {number} tinAnual Tipo nominal anual en % (p.ej. 2.7)
 * @param {number} meses    Nº de mensualidades restantes
 */
export function cuotaFrancesa(capital, tinAnual, meses) {
  if (meses <= 0) return 0;
  if (capital <= 0) return 0;
  const i = tinAnual / 100 / 12;
  if (i === 0) return capital / meses;
  return (capital * i) / (1 - (1 + i) ** -meses);
}

/** Nº de mensualidades necesarias para amortizar `capital` con una `cuota` dada. */
export function plazoParaCuota(capital, tinAnual, cuota) {
  const i = tinAnual / 100 / 12;
  if (capital <= 0) return 0;
  if (i === 0) return Math.ceil(capital / cuota);
  if (cuota <= capital * i) return Infinity; // la cuota no cubre ni los intereses
  return Math.ceil(-Math.log(1 - (capital * i) / cuota) / Math.log(1 + i));
}

/** Capital máximo financiable con una cuota, un plazo y un tipo dados. */
export function capitalDesdeCuota(cuota, tinAnual, meses) {
  const i = tinAnual / 100 / 12;
  if (i === 0) return cuota * meses;
  return (cuota * (1 - (1 + i) ** -meses)) / i;
}

/**
 * Construye el cuadro de amortización completo.
 *
 * @param {object} o
 * @param {number}   o.capital      Importe del préstamo
 * @param {number}   o.meses        Plazo en mensualidades
 * @param {function} o.tinPara      (mes) => TIN anual en % vigente ese mes
 * @param {Array}    o.extras       [{ mes, importe, modo: 'plazo'|'cuota' }]
 * @param {number}   o.comisionAmortizacion  % sobre el importe amortizado
 */
export function tablaAmortizacion({
  capital,
  meses,
  tinPara,
  extras = [],
  comisionAmortizacion = 0,
}) {
  const filas = [];
  const extrasPorMes = new Map();
  for (const e of extras) {
    if (!e || e.importe <= 0) continue;
    const prev = extrasPorMes.get(e.mes) || { importe: 0, modo: e.modo || 'plazo' };
    extrasPorMes.set(e.mes, { importe: prev.importe + e.importe, modo: e.modo || prev.modo });
  }

  let saldo = capital;
  let plazoRestante = meses;
  let cuota = 0;
  let tinVigente = NaN;
  let totalIntereses = 0;
  let totalAmortizadoExtra = 0;
  let totalComisiones = 0;

  for (let mes = 1; mes <= meses && saldo > 0.005; mes++) {
    const tin = tinPara(mes);
    if (tin !== tinVigente) {
      cuota = cuotaFrancesa(saldo, tin, plazoRestante);
      tinVigente = tin;
    }

    const i = tin / 100 / 12;
    const interes = saldo * i;
    let amortizado = Math.min(cuota - interes, saldo);
    const cuotaMes = amortizado + interes;
    saldo -= amortizado;
    totalIntereses += interes;
    plazoRestante -= 1;

    // Amortización anticipada al final del mes
    let extra = 0;
    const ex = extrasPorMes.get(mes);
    if (ex && saldo > 0) {
      extra = Math.min(ex.importe, saldo);
      saldo -= extra;
      totalAmortizadoExtra += extra;
      const comision = extra * (comisionAmortizacion / 100);
      totalComisiones += comision;
      if (saldo > 0.005) {
        if (ex.modo === 'cuota') {
          cuota = cuotaFrancesa(saldo, tin, plazoRestante); // mismo plazo, menos cuota
        } else {
          plazoRestante = plazoParaCuota(saldo, tin, cuota); // misma cuota, menos plazo
        }
      }
    }

    filas.push({
      mes,
      anio: Math.ceil(mes / 12),
      cuota: cuotaMes,
      interes,
      amortizado,
      extra,
      saldo: Math.max(saldo, 0),
      tin,
    });
  }

  return {
    filas,
    totalIntereses,
    totalAmortizadoExtra,
    totalComisiones,
    mesesReales: filas.length,
    cuotaInicial: filas[0]?.cuota ?? 0,
    totalPagado: filas.reduce((s, f) => s + f.cuota + f.extra, 0) + totalComisiones,
  };
}

/**
 * Genera la función `tinPara` según el tipo de hipoteca.
 * - fijo:    TIN constante
 * - variable: euríbor + diferencial, revisión anual (primer año suele ser fijo)
 * - mixto:   `aniosFijo` años a `tinFijo`, después variable
 */
export function construirTinPara({
  modalidad,
  tinFijo,
  diferencial,
  euribor,
  aniosFijo = 0,
  euriborPorAnio = null,
}) {
  const variableEn = (anio) => {
    const eur = euriborPorAnio ? euriborPorAnio(anio) : euribor;
    return redondea(eur + diferencial, 4);
  };

  if (modalidad === 'fijo') return () => tinFijo;

  if (modalidad === 'mixto') {
    return (mes) => {
      const anio = Math.ceil(mes / 12);
      return anio <= aniosFijo ? tinFijo : variableEn(anio);
    };
  }

  // variable: el primer año se aplica el tipo de salida (tinFijo), luego revisa
  return (mes) => {
    const anio = Math.ceil(mes / 12);
    return anio <= 1 ? tinFijo : variableEn(anio);
  };
}

/**
 * TAE aproximada: TIR mensual de los flujos reales del préstamo
 * (capital recibido menos gastos iniciales frente a cuotas y seguros vinculados).
 */
export function calcularTae({ capital, filas, gastosIniciales = 0, costeAnualVinculaciones = 0 }) {
  if (!filas.length) return 0;
  const flujos = [capital - gastosIniciales];
  for (const f of filas) {
    flujos.push(-(f.cuota + f.extra + costeAnualVinculaciones / 12));
  }
  const van = (r) => flujos.reduce((acc, c, t) => acc + c / (1 + r) ** t, 0);

  // El VAN es creciente en r (un único flujo positivo en t=0 y el resto
  // negativos), así que basta con una bisección entre 0 y un tipo absurdo.
  let lo = 0;
  let hi = 0.05; // 5 % mensual ≈ 80 % TAE
  if (van(hi) < 0) return 0; // ni al 80 % TAE cuadran los flujos
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (van(mid) < 0) lo = mid;
    else hi = mid;
  }
  const rMensual = (lo + hi) / 2;
  return redondea(((1 + rMensual) ** 12 - 1) * 100, 3);
}

/* ------------------------------------------------------------------ *
 * Fiscalidad de la compra
 * ------------------------------------------------------------------ */

/** Cuota de un impuesto con tramos progresivos. */
export function cuotaPorTramos(base, tramos) {
  let restante = base;
  let anterior = 0;
  let cuota = 0;
  const desglose = [];
  for (const t of tramos) {
    if (restante <= 0) break;
    const anchoTramo = t.hasta - anterior;
    const gravado = Math.min(restante, anchoTramo);
    const importe = gravado * (t.tipo / 100);
    cuota += importe;
    desglose.push({ desde: anterior, hasta: t.hasta, tipo: t.tipo, gravado, importe });
    restante -= gravado;
    anterior = t.hasta;
  }
  return { cuota, desglose, tipoEfectivo: base > 0 ? (cuota / base) * 100 : 0 };
}

/** Devuelve la reducción/bonificación aplicable más favorable, si la hay. */
function mejorOpcion(lista, base, perfil) {
  return lista
    .filter((r) => base <= r.valorMax && r.perfil(perfil))
    .sort((a, b) => (a.tipo ?? -a.pct) - (b.tipo ?? -b.pct))[0];
}

/**
 * ITP (vivienda de segunda mano).
 * @returns {{cuota, tipoEfectivo, desglose, reduccion, bonificacion, cuotaIntegra}}
 */
export function calcularItp(comunidad, base, perfil) {
  const reduccion = mejorOpcion(comunidad.itp.reducciones || [], base, perfil);

  let cuotaIntegra;
  let desglose;
  if (reduccion) {
    cuotaIntegra = base * (reduccion.tipo / 100);
    desglose = [{ desde: 0, hasta: base, tipo: reduccion.tipo, gravado: base, importe: cuotaIntegra }];
  } else {
    const r = cuotaPorTramos(base, comunidad.itp.tramos);
    cuotaIntegra = r.cuota;
    desglose = r.desglose;
  }

  const bonificacion = mejorOpcion(comunidad.itp.bonif || [], base, perfil);
  const cuota = bonificacion ? cuotaIntegra * (1 - bonificacion.pct / 100) : cuotaIntegra;

  return {
    cuota,
    cuotaIntegra,
    desglose,
    reduccion,
    bonificacion,
    tipoEfectivo: base > 0 ? (cuota / base) * 100 : 0,
  };
}

/** AJD (obra nueva). */
export function calcularAjd(comunidad, base, perfil) {
  const reduccion = mejorOpcion(comunidad.ajd.reducciones || [], base, perfil);
  const tipo = reduccion ? reduccion.tipo : comunidad.ajd.general;
  return { cuota: base * (tipo / 100), tipo, reduccion };
}

/**
 * Impuestos totales de la compra.
 * Base imponible del ITP = el mayor entre precio pagado y valor de referencia
 * de Catastro (art. 10 TRLITPAJD desde 2022).
 */
export function calcularImpuestos({ comunidad, precio, valorReferencia = 0, tipoVivienda, perfil }) {
  const base = Math.max(precio, valorReferencia || 0);

  if (tipoVivienda === 'usada') {
    const itp = calcularItp(comunidad, base, perfil);
    return {
      tipo: 'ITP',
      base,
      partidas: [{ id: 'itp', label: `ITP (${tipoTxt(itp.tipoEfectivo)} % efectivo)`, importe: itp.cuota }],
      total: itp.cuota,
      itp,
    };
  }

  // Obra nueva: IVA (o IGIC / IPSI) + AJD
  const cfg = comunidad.impuestoNueva || IVA_OBRA_NUEVA;
  const tipoIndirecto = perfil.vpo ? cfg.tipoVpo : cfg.tipo;
  const indirecto = precio * (tipoIndirecto / 100);
  const ajd = calcularAjd(comunidad, precio, perfil);

  return {
    tipo: cfg.nombre,
    base: precio,
    partidas: [
      { id: 'iva', label: `${cfg.nombre} (${tipoTxt(tipoIndirecto)} %)`, importe: indirecto },
      { id: 'ajd', label: `AJD (${tipoTxt(ajd.tipo)} %)`, importe: ajd.cuota },
    ],
    total: indirecto + ajd.cuota,
    ajd,
  };
}

/** Gastos no fiscales de la compraventa (los que paga el comprador). */
export function calcularGastos({ precio, conHipoteca, gestoria = true }) {
  const partidas = [
    { id: 'notaria', label: 'Notaría (escritura de compraventa)', importe: enTramo(ARANCELES.notaria, precio) },
    { id: 'registro', label: 'Registro de la Propiedad', importe: enTramo(ARANCELES.registro, precio) },
    { id: 'nota', label: 'Nota simple y certificaciones', importe: ARANCELES.notaSimple },
  ];
  if (gestoria) partidas.push({ id: 'gestoria', label: 'Gestoría', importe: ARANCELES.gestoria });
  if (conHipoteca) {
    partidas.push({ id: 'tasacion', label: 'Tasación (la paga el comprador)', importe: ARANCELES.tasacion });
  }
  return { partidas, total: partidas.reduce((s, p) => s + p.importe, 0) };
}

/**
 * Resumen económico completo de la operación.
 */
export function resumenOperacion({
  comunidad,
  precio,
  valorReferencia = 0,
  tipoVivienda,
  perfil,
  entradaPct,
  comisionApertura = 0,
}) {
  const impuestos = calcularImpuestos({ comunidad, precio, valorReferencia, tipoVivienda, perfil });
  const entrada = precio * (entradaPct / 100);
  const capital = precio - entrada;
  const gastos = calcularGastos({ precio, conHipoteca: capital > 0 });
  const apertura = capital * (comisionApertura / 100);

  const ahorroNecesario = entrada + impuestos.total + gastos.total + apertura;

  return {
    precio,
    entrada,
    capital,
    impuestos,
    gastos,
    apertura,
    ahorroNecesario,
    gastosTotales: impuestos.total + gastos.total + apertura,
    pctGastos: precio > 0 ? ((impuestos.total + gastos.total + apertura) / precio) * 100 : 0,
    ltv: precio > 0 ? (capital / precio) * 100 : 0,
  };
}

/* ------------------------------------------------------------------ *
 * Capacidad de compra
 * ------------------------------------------------------------------ */

/**
 * ¿Cuánta casa me puedo permitir?
 * Cruza dos límites: el ahorro disponible (entrada + gastos) y los ingresos
 * (regla del 35 % de esfuerzo que aplican los bancos).
 */
export function capacidadCompra({
  comunidad,
  tipoVivienda,
  perfil,
  ahorro,
  ingresosNetosMensuales,
  deudasMensuales = 0,
  plazoAnios,
  tin,
  ratioEsfuerzo = DEFAULTS.ratioEsfuerzo,
  ltvMax = DEFAULTS.ltvMax,
}) {
  const meses = plazoAnios * 12;
  const cuotaMax = Math.max(ingresosNetosMensuales * (ratioEsfuerzo / 100) - deudasMensuales, 0);
  const capitalMax = capitalDesdeCuota(cuotaMax, tin, meses);
  const precioPorIngresos = ltvMax > 0 ? capitalMax / (ltvMax / 100) : 0;

  // El ahorro debe cubrir entrada + impuestos + gastos. Como el ITP puede ser
  // progresivo, resolvemos por bisección en lugar de con un porcentaje fijo.
  const entradaPct = 100 - ltvMax;
  const necesarioPara = (p) =>
    resumenOperacion({ comunidad, precio: p, tipoVivienda, perfil, entradaPct }).ahorroNecesario;

  let lo = 0;
  let hi = 5_000_000;
  if (necesarioPara(hi) < ahorro) lo = hi;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (necesarioPara(mid) <= ahorro) lo = mid;
    else hi = mid;
  }
  const precioPorAhorro = lo;

  const precioMax = Math.min(precioPorIngresos, precioPorAhorro);
  const limitante = precioPorIngresos < precioPorAhorro ? 'ingresos' : 'ahorro';

  return {
    cuotaMax,
    capitalMax,
    precioPorIngresos,
    precioPorAhorro,
    precioMax,
    limitante,
    resumen: precioMax > 0
      ? resumenOperacion({ comunidad, precio: precioMax, tipoVivienda, perfil, entradaPct })
      : null,
  };
}

/** Ratio de esfuerzo real de una cuota sobre los ingresos netos. */
export function ratioEsfuerzo(cuota, deudas, ingresos) {
  if (!ingresos) return 0;
  return ((cuota + deudas) / ingresos) * 100;
}

/* ------------------------------------------------------------------ *
 * Comparativas
 * ------------------------------------------------------------------ */

/** Compara el mismo préstamo bajo distintos escenarios de euríbor. */
export function compararEscenarios({ capital, meses, base, escenarios }) {
  return escenarios.map((e) => {
    const euribor = e.valor ?? base.euribor;
    const tinPara = construirTinPara({ ...base, euribor });
    const t = tablaAmortizacion({ capital, meses, tinPara });
    const cuotas = t.filas.map((f) => f.cuota);
    return {
      ...e,
      euribor,
      cuotaInicial: t.cuotaInicial,
      cuotaMaxima: Math.max(...cuotas),
      cuotaMedia: cuotas.reduce((s, c) => s + c, 0) / cuotas.length,
      totalIntereses: t.totalIntereses,
    };
  });
}

/** Ahorro obtenido por una amortización anticipada. */
export function simularAmortizacion({ capital, meses, tinPara, extra, comisionAmortizacion = 0 }) {
  const baseline = tablaAmortizacion({ capital, meses, tinPara });
  const modos = ['plazo', 'cuota'].map((modo) => {
    const t = tablaAmortizacion({
      capital,
      meses,
      tinPara,
      extras: [{ mes: extra.mes, importe: extra.importe, modo }],
      comisionAmortizacion,
    });
    return {
      modo,
      ahorroIntereses: baseline.totalIntereses - t.totalIntereses,
      mesesAhorrados: baseline.mesesReales - t.mesesReales,
      cuotaFinal: t.filas.at(-1)?.cuota ?? 0,
      cuotaTrasAmortizar: t.filas.find((f) => f.mes === extra.mes + 1)?.cuota ?? 0,
      totalIntereses: t.totalIntereses,
      mesesReales: t.mesesReales,
    };
  });
  return { baseline, modos };
}
