/**
 * Punto de entrada: estado, enlace con el DOM y renderizado.
 */

import { COMUNIDADES, DEFAULTS, ESCENARIOS_EURIBOR, getComunidad } from './data.js';
import {
  calcularTae,
  capacidadCompra,
  compararEscenarios,
  construirTinPara,
  cuotaFrancesa,
  ratioEsfuerzo,
  redondea,
  resumenOperacion,
  simularAmortizacion,
  tablaAmortizacion,
} from './calc.js';
import { FAQ, PASOS, QUIEN_PAGA } from './guia.js';
import {
  $, $$, esc, eur, eur2, fila, graficoAmortizacion, graficoDonut,
  kpi, medidorEsfuerzo, meses, nota, num, pct,
} from './ui.js';

/* ------------------------------------------------------------------ *
 * Estado
 * ------------------------------------------------------------------ */

const CLAVE_ESTADO = 'hipoteca.estado.v1';
const CLAVE_GUIA = 'hipoteca.guia.v1';

const estadoInicial = () => ({
  ca: 'madrid',
  tipoVivienda: 'usada',
  precio: DEFAULTS.precio,
  valorReferencia: 0,
  entradaPct: DEFAULTS.entradaPct,
  plazoAnios: DEFAULTS.plazoAnios,
  modalidad: 'fijo',
  tinFijo: DEFAULTS.tinFijo,
  diferencial: DEFAULTS.diferencial,
  euribor: DEFAULTS.euribor,
  aniosFijo: DEFAULTS.aniosFijoMixto,
  comisionApertura: DEFAULTS.comisionApertura,
  comisionAmort: 0,
  seguros: DEFAULTS.seguroHogarAnual + DEFAULTS.seguroVidaAnual,
  amortImporte: 10000,
  amortAnio: 5,
  vistaCuadro: 'anual',
  perfil: {
    edad: 35,
    baseIrpf: 32000,
    viviendaHabitual: true,
    primeraVivienda: true,
    familiaNumerosa: false,
    monoparental: false,
    discapacidad: 0,
    vpo: false,
    municipioPequeno: false,
  },
  cap: {
    ingresos: 3200,
    deudas: 0,
    ahorro: 80000,
    plazo: 30,
    tin: DEFAULTS.tinFijo,
    ltv: DEFAULTS.ltvMax,
  },
});

const almacen = {
  leer(clave, porDefecto) {
    try {
      const raw = localStorage.getItem(clave);
      return raw ? JSON.parse(raw) : porDefecto;
    } catch {
      return porDefecto;
    }
  },
  escribir(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      /* modo privado o almacenamiento bloqueado: seguimos sin persistir */
    }
  },
};

const base = estadoInicial();
const guardado = almacen.leer(CLAVE_ESTADO, {});
const state = {
  ...base,
  ...guardado,
  perfil: { ...base.perfil, ...(guardado.perfil || {}) },
  cap: { ...base.cap, ...(guardado.cap || {}) },
};

const leerRuta = (obj, ruta) => ruta.split('.').reduce((o, k) => o?.[k], obj);
const escribirRuta = (obj, ruta, valor) => {
  const partes = ruta.split('.');
  const ultima = partes.pop();
  partes.reduce((o, k) => o[k], obj)[ultima] = valor;
};

/* ------------------------------------------------------------------ *
 * Cálculos derivados del estado
 * ------------------------------------------------------------------ */

function calcular() {
  const comunidad = getComunidad(state.ca);
  const resumen = resumenOperacion({
    comunidad,
    precio: state.precio,
    valorReferencia: state.valorReferencia,
    tipoVivienda: state.tipoVivienda,
    perfil: state.perfil,
    entradaPct: state.entradaPct,
    comisionApertura: state.comisionApertura,
  });

  const nMeses = state.plazoAnios * 12;
  const tinPara = construirTinPara({
    modalidad: state.modalidad,
    tinFijo: state.tinFijo,
    diferencial: state.diferencial,
    euribor: state.euribor,
    aniosFijo: state.aniosFijo,
  });

  const tabla = tablaAmortizacion({ capital: resumen.capital, meses: nMeses, tinPara });
  const tae = calcularTae({
    capital: resumen.capital,
    filas: tabla.filas,
    gastosIniciales: resumen.apertura,
    costeAnualVinculaciones: state.seguros,
  });

  return { comunidad, resumen, tabla, tae, tinPara, nMeses };
}

/* ------------------------------------------------------------------ *
 * Panel: Calculadora
 * ------------------------------------------------------------------ */

function renderCalculadora() {
  const { comunidad, resumen, tabla, tae, tinPara, nMeses } = calcular();

  // --- Cabeceras y ayudas contextuales
  $('#caPill').textContent = comunidad.nombre;
  $('#fuenteCa').innerHTML = `Datos fiscales de <b>${esc(comunidad.nombre)}</b>: consulta la fuente oficial en
    <a href="${esc(comunidad.fuente)}" target="_blank" rel="noopener">${esc(comunidad.fuente)}</a>.`;
  $('#notaCa').innerHTML = `<span class="note__icon">📋</span><span><b>${esc(comunidad.nombre)}:</b> ${esc(comunidad.notas)}</span>`;

  // Realimentación inmediata bajo el selector: qué tipo te toca y cuánto es.
  const itpResumen = resumen.impuestos.itp;
  const posicion = COMUNIDADES.map((c) => ({
    id: c.id,
    coste: resumenOperacion({
      comunidad: c, precio: state.precio, valorReferencia: state.valorReferencia,
      tipoVivienda: state.tipoVivienda, perfil: state.perfil, entradaPct: state.entradaPct,
    }).gastosTotales,
  }))
    .sort((a, b) => a.coste - b.coste)
    .findIndex((c) => c.id === comunidad.id) + 1;

  $('#resumenCa').innerHTML = [
    fila({
      label: state.tipoVivienda === 'usada' ? 'Tipo de ITP que se te aplica' : 'Impuestos de obra nueva',
      value: state.tipoVivienda === 'usada'
        ? `<b>${pct(itpResumen.tipoEfectivo, 2)}</b>`
        : `<b>${pct((resumen.impuestos.partidas[0].importe / (state.precio || 1)) * 100, 1)} + ${pct(resumen.impuestos.ajd.tipo, 2)}</b>`,
    }),
    fila({ label: 'Impuestos a pagar', value: `<b>${eur(resumen.impuestos.total)}</b>` }),
    fila({
      label: 'Ranking de coste fiscal (1 = la más barata)',
      value: `<b>${posicion}.º</b> de ${COMUNIDADES.length}`,
    }),
  ].join('');

  const impuestoNueva = comunidad.impuestoNueva || { nombre: 'IVA', tipo: 10 };
  $('#hint-tipo').textContent =
    state.tipoVivienda === 'usada'
      ? 'Pagarás ITP (Impuesto de Transmisiones Patrimoniales).'
      : `Pagarás ${impuestoNueva.nombre} al ${impuestoNueva.tipo} % más AJD.`;

  $('#entradaOut').textContent = `${state.entradaPct} % · ${eur(resumen.entrada)}`;
  $('#plazoOut').textContent = `${state.plazoAnios} años`;
  $('#ltvHint').innerHTML =
    resumen.ltv > 80
      ? `Financiarías el <b>${pct(resumen.ltv, 0)}</b> del precio. Por encima del 80 % necesitarás aval ICO, un avalista o una doble garantía.`
      : `Financiarías el <b>${pct(resumen.ltv, 0)}</b> del precio, dentro de lo que concede un banco sin garantías extra.`;

  $('#lbl-tin').textContent = state.modalidad === 'fijo' ? 'TIN fijo' : 'TIN del primer año (tipo de salida)';
  $$('.js-variable').forEach((n) => n.classList.toggle('hidden', state.modalidad === 'fijo'));
  $$('.js-mixto').forEach((n) => n.classList.toggle('hidden', state.modalidad !== 'mixto'));

  // Insignia del perfil fiscal
  const itp = resumen.impuestos.itp;
  const ventaja = itp?.reduccion || itp?.bonificacion || resumen.impuestos.ajd?.reduccion;
  const badge = $('#perfilBadge');
  badge.textContent = ventaja ? '✓ tipo reducido aplicado' : 'tipo general';
  badge.className = ventaja ? 'badge badge--ok' : 'badge badge--brand';

  // --- KPIs
  const cuota = tabla.cuotaInicial;
  const cuotaMax = Math.max(...tabla.filas.map((f) => f.cuota));
  $('#kpis').innerHTML = [
    kpi({
      label: 'Cuota mensual',
      value: eur2(cuota),
      sub: state.modalidad === 'fijo'
        ? `Fija durante ${state.plazoAnios} años`
        : `Máxima estimada: ${eur(cuotaMax)}/mes`,
      hero: true,
    }),
    kpi({
      label: 'Ahorro necesario al inicio',
      value: eur(resumen.ahorroNecesario),
      sub: `Entrada + impuestos + gastos (${pct(resumen.pctGastos, 1)} en gastos)`,
    }),
    kpi({
      label: 'Intereses totales',
      value: eur(tabla.totalIntereses),
      sub: `${pct((tabla.totalIntereses / (resumen.capital || 1)) * 100, 0)} del capital prestado`,
    }),
    kpi({
      label: 'TAE aproximada',
      value: pct(tae, 2),
      sub: 'Incluye comisiones y seguros vinculados',
    }),
  ].join('');

  $('#stickyValor').textContent = eur2(cuota);
  $('#stickyAhorro').textContent = eur(resumen.ahorroNecesario);

  // --- Desglose del dinero necesario al inicio
  const partesImpuestos = resumen.impuestos.partidas.map((p) => fila({ label: p.label, value: eur(p.importe), sub: true }));
  const partesGastos = resumen.gastos.partidas.map((p) => fila({ label: p.label, value: eur(p.importe), sub: true }));

  $('#desgloseGastos').innerHTML = [
    fila({ label: `Entrada (${state.entradaPct} % del precio)`, value: eur(resumen.entrada) }),
    fila({ label: `Impuestos · ${resumen.impuestos.tipo}`, value: eur(resumen.impuestos.total) }),
    ...partesImpuestos,
    fila({ label: 'Gastos de la compraventa', value: eur(resumen.gastos.total) }),
    ...partesGastos,
    state.comisionApertura > 0 ? fila({ label: 'Comisión de apertura', value: eur(resumen.apertura) }) : '',
    fila({ label: 'Total a tener ahorrado', value: eur(resumen.ahorroNecesario), total: true }),
  ].join('');

  const avisos = [];
  if (itp?.reduccion) {
    avisos.push(nota(`Se te aplica un tipo reducido: <b>${esc(itp.reduccion.label)}</b>.`, 'ok', '✅'));
  }
  if (itp?.bonificacion) {
    avisos.push(nota(`Bonificación aplicada: <b>${esc(itp.bonificacion.label)}</b>.`, 'ok', '✅'));
  }
  if (resumen.impuestos.ajd?.reduccion) {
    avisos.push(nota(`AJD reducido: <b>${esc(resumen.impuestos.ajd.reduccion.label)}</b>.`, 'ok', '✅'));
  }
  if (state.tipoVivienda === 'usada' && state.valorReferencia > state.precio) {
    avisos.push(
      nota(
        `Hacienda liquidará el ITP sobre el valor de referencia (<b>${eur(state.valorReferencia)}</b>), no sobre el precio pagado.`,
        'warn',
        '⚠️'
      )
    );
  }
  if (!state.perfil.viviendaHabitual) {
    avisos.push(
      nota('Al no ser vivienda habitual pierdes casi todos los tipos reducidos y bonificaciones autonómicas.', 'warn', '⚠️')
    );
  }
  $('#avisoGastos').innerHTML = avisos.join('');

  // --- Coste total del préstamo
  const segurosTotal = (state.seguros * tabla.mesesReales) / 12;
  $('#desgloseCoste').innerHTML = [
    fila({ label: 'Capital prestado', value: eur(resumen.capital) }),
    fila({ label: 'Intereses', value: eur(tabla.totalIntereses) }),
    state.comisionApertura > 0 ? fila({ label: 'Comisión de apertura', value: eur(resumen.apertura) }) : '',
    fila({ label: `Seguros vinculados (${meses(tabla.mesesReales)})`, value: eur(segurosTotal) }),
    fila({
      label: 'Devolverás en total',
      value: eur(resumen.capital + tabla.totalIntereses + resumen.apertura + segurosTotal),
      total: true,
    }),
  ].join('');
  $('#chartDonut').innerHTML = graficoDonut(resumen.capital, tabla.totalIntereses);

  // --- Gráfico de evolución
  $('#chartAmort').innerHTML = graficoAmortizacion(tabla.filas);

  // --- Escenarios de euríbor
  const esVariable = state.modalidad !== 'fijo';
  $('#cardEscenarios').classList.toggle('hidden', !esVariable);
  if (esVariable) {
    const escenarios = compararEscenarios({
      capital: resumen.capital,
      meses: nMeses,
      base: {
        modalidad: state.modalidad,
        tinFijo: state.tinFijo,
        diferencial: state.diferencial,
        euribor: state.euribor,
        aniosFijo: state.aniosFijo,
      },
      escenarios: ESCENARIOS_EURIBOR,
    });
    $('#tablaEscenarios tbody').innerHTML = escenarios
      .map(
        (e) => `<tr${e.valor === null ? ' style="font-weight:650"' : ''}>
          <td>${esc(e.label)}</td>
          <td class="num">${pct(e.euribor, 2)}</td>
          <td class="num">${eur(e.cuotaInicial)}</td>
          <td class="num">${eur(e.cuotaMaxima)}</td>
          <td class="num">${eur(e.totalIntereses)}</td>
        </tr>`
      )
      .join('');
  }

  // --- Amortización anticipada
  const mesExtra = Math.min(Math.max(state.amortAnio, 1) * 12, nMeses - 1);
  if (state.amortImporte > 0 && resumen.capital > 0) {
    const sim = simularAmortizacion({
      capital: resumen.capital,
      meses: nMeses,
      tinPara,
      extra: { mes: mesExtra, importe: state.amortImporte },
      comisionAmortizacion: state.comisionAmort,
    });
    const plazo = sim.modos.find((m) => m.modo === 'plazo');
    const cuotaM = sim.modos.find((m) => m.modo === 'cuota');
    $('#amortResultado').innerHTML = `
      <div class="card" style="margin:0;background:var(--bg-sunken)">
        <div class="card__title">Reducir plazo <span class="badge badge--ok">ahorra más</span></div>
        <div class="rows">
          ${fila({ label: 'Ahorro en intereses', value: `<b>${eur(plazo.ahorroIntereses)}</b>` })}
          ${fila({ label: 'Acabas antes', value: meses(plazo.mesesAhorrados) })}
          ${fila({ label: 'Cuota', value: `${eur(cuota)} <span class="muted">(igual)</span>` })}
        </div>
      </div>
      <div class="card" style="margin:0;background:var(--bg-sunken)">
        <div class="card__title">Reducir cuota</div>
        <div class="rows">
          ${fila({ label: 'Ahorro en intereses', value: `<b>${eur(cuotaM.ahorroIntereses)}</b>` })}
          ${fila({ label: 'Nueva cuota', value: eur2(cuotaM.cuotaTrasAmortizar) })}
          ${fila({ label: 'Bajada mensual', value: `−${eur2(cuota - cuotaM.cuotaTrasAmortizar)}` })}
        </div>
      </div>
      ${nota(
        `Aportar <b>${eur(state.amortImporte)}</b> en el año ${state.amortAnio} reduciendo plazo equivale a una
         rentabilidad garantizada equivalente al tipo de tu hipoteca. Compárala con lo que te renta ese dinero invertido.`
      )}`;
  } else {
    $('#amortResultado').innerHTML = `<p class="muted" style="font-size:14px">Introduce un importe para simular.</p>`;
  }

  // --- Cuadro de amortización
  renderCuadro(tabla);
  window.__ultimaTabla = tabla;
}

function renderCuadro(tabla) {
  const anual = state.vistaCuadro === 'anual';
  $('#thPeriodo').textContent = anual ? 'Año' : 'Mes';

  let filas;
  if (anual) {
    const mapa = new Map();
    for (const f of tabla.filas) {
      const a = mapa.get(f.anio) || { periodo: f.anio, cuota: 0, interes: 0, amortizado: 0, saldo: 0 };
      a.cuota += f.cuota + f.extra;
      a.interes += f.interes;
      a.amortizado += f.amortizado + f.extra;
      a.saldo = f.saldo;
      mapa.set(f.anio, a);
    }
    filas = [...mapa.values()];
  } else {
    filas = tabla.filas.map((f) => ({
      periodo: f.mes,
      cuota: f.cuota + f.extra,
      interes: f.interes,
      amortizado: f.amortizado + f.extra,
      saldo: f.saldo,
    }));
  }

  $('#tablaCuadro tbody').innerHTML = filas
    .map(
      (f) => `<tr>
        <td>${f.periodo}</td>
        <td class="num">${eur(f.cuota)}</td>
        <td class="num">${eur(f.interes)}</td>
        <td class="num">${eur(f.amortizado)}</td>
        <td class="num">${eur(f.saldo)}</td>
      </tr>`
    )
    .join('');
}

/* ------------------------------------------------------------------ *
 * Panel: ¿Cuánto puedo pagar?
 * ------------------------------------------------------------------ */

function renderCapacidad() {
  const comunidad = getComunidad(state.ca);
  const c = state.cap;
  $('#capPlazoOut').textContent = `${c.plazo} años`;

  const r = capacidadCompra({
    comunidad,
    tipoVivienda: state.tipoVivienda,
    perfil: state.perfil,
    ahorro: c.ahorro,
    ingresosNetosMensuales: c.ingresos,
    deudasMensuales: c.deudas,
    plazoAnios: c.plazo,
    tin: c.tin,
    ltvMax: c.ltv,
  });

  const cuotaReal = r.resumen ? cuotaFrancesa(r.resumen.capital, c.tin, c.plazo * 12) : 0;

  $('#capKpis').innerHTML = [
    kpi({
      label: 'Precio máximo de vivienda',
      value: eur(r.precioMax),
      sub: `En ${esc(comunidad.nombre)}, ${state.tipoVivienda === 'usada' ? 'segunda mano' : 'obra nueva'}`,
      hero: true,
    }),
    kpi({ label: 'Cuota que podrías pagar', value: eur(r.cuotaMax), sub: `Regla del 35 % de esfuerzo` }),
    kpi({
      label: 'Hipoteca máxima',
      value: eur(r.resumen?.capital || 0),
      sub: `${c.ltv} % del precio a ${c.plazo} años`,
    }),
    kpi({
      label: 'Te lo limita',
      value: r.limitante === 'ahorro' ? 'El ahorro' : 'Los ingresos',
      sub: r.limitante === 'ahorro' ? 'Necesitas más entrada' : 'Necesitas más nómina o más plazo',
      tone: 'warn',
    }),
  ].join('');

  $('#capDetalle').innerHTML = [
    fila({ label: 'Por tus ingresos podrías comprar hasta', value: eur(r.precioPorIngresos) }),
    fila({ label: 'Por tu ahorro podrías comprar hasta', value: eur(r.precioPorAhorro) }),
    fila({ label: 'Precio máximo real (el menor de los dos)', value: eur(r.precioMax), total: true }),
    r.resumen ? fila({ label: 'Entrada necesaria', value: eur(r.resumen.entrada), sub: true }) : '',
    r.resumen
      ? fila({
          label: `Impuestos y gastos (${pct(r.resumen.pctGastos, 1)})`,
          value: eur(r.resumen.gastosTotales),
          sub: true,
        })
      : '',
    r.resumen ? fila({ label: 'Cuota resultante', value: eur2(cuotaReal), sub: true }) : '',
  ].join('');

  const consejos = [];
  if (r.limitante === 'ahorro') {
    const falta = r.precioPorIngresos - r.precioPorAhorro;
    consejos.push(
      nota(
        `Tus ingresos darían para una vivienda <b>${eur(falta)}</b> más cara, pero no tienes ahorro suficiente para
         la entrada y los gastos. Opciones: ahorrar más, buscar aval ICO si tienes menos de 35 años,
         o comprar en una comunidad con menos impuestos.`,
        'warn',
        '💰'
      )
    );
  } else if (r.precioMax > 0) {
    consejos.push(
      nota(
        `Te sobra ahorro: podrías dar más entrada y bajar la cuota, o guardar el excedente como colchón.
         Nunca te quedes sin fondo de emergencia por dar más entrada.`,
        'ok',
        '✅'
      )
    );
  }
  if (c.ltv > 80) {
    consejos.push(
      nota(
        `Financiar el ${c.ltv} % exige aval ICO (menores de 35 años, primera vivienda habitual y límites de renta)
         o una garantía adicional. Ojo: reduce la entrada, no los impuestos, y pagarás más intereses.`,
        'warn',
        '⚠️'
      )
    );
  }
  $('#capAviso').innerHTML = consejos.join('');

  $('#capEsfuerzo').innerHTML = medidorEsfuerzo(ratioEsfuerzo(cuotaReal, c.deudas, c.ingresos));

  // Sensibilidad al plazo
  $('#tablaPlazos tbody').innerHTML = [15, 20, 25, 30, 35, 40]
    .map((anios) => {
      const rr = capacidadCompra({
        comunidad,
        tipoVivienda: state.tipoVivienda,
        perfil: state.perfil,
        ahorro: c.ahorro,
        ingresosNetosMensuales: c.ingresos,
        deudasMensuales: c.deudas,
        plazoAnios: anios,
        tin: c.tin,
        ltvMax: c.ltv,
      });
      const capital = rr.resumen?.capital || 0;
      const t = tablaAmortizacion({ capital, meses: anios * 12, tinPara: () => c.tin });
      return `<tr${anios === c.plazo ? ' style="font-weight:650;background:var(--brand-soft)"' : ''}>
        <td>${anios} años</td>
        <td class="num">${eur(t.cuotaInicial)}</td>
        <td class="num">${eur(rr.precioMax)}</td>
        <td class="num">${eur(t.totalIntereses)}</td>
      </tr>`;
    })
    .join('');
}

/* ------------------------------------------------------------------ *
 * Panel: Comparar comunidades
 * ------------------------------------------------------------------ */

function renderComparar() {
  const filas = COMUNIDADES.map((c) => {
    const r = resumenOperacion({
      comunidad: c,
      precio: state.precio,
      valorReferencia: state.valorReferencia,
      tipoVivienda: state.tipoVivienda,
      perfil: state.perfil,
      entradaPct: state.entradaPct,
      comisionApertura: state.comisionApertura,
    });
    const itp = r.impuestos.itp;
    const tipoTexto =
      state.tipoVivienda === 'usada'
        ? pct(itp.tipoEfectivo, 2)
        : `${pct(state.precio ? (r.impuestos.partidas[0].importe / state.precio) * 100 : 0, 1)} + ${pct(r.impuestos.ajd.tipo, 2)}`;
    return { c, r, tipoTexto };
  }).sort((a, b) => a.r.gastosTotales - b.r.gastosTotales);

  const min = filas[0];
  const max = filas.at(-1);
  const mia = filas.find((f) => f.c.id === state.ca);

  $('#comparaResumen').innerHTML = `Comprando una vivienda de <b>${eur(state.precio)}</b>
    (${state.tipoVivienda === 'usada' ? 'segunda mano' : 'obra nueva'}) con tu perfil actual, esto es lo que pagarías
    de impuestos y gastos en cada comunidad. Ordenado de más barato a más caro.`;

  $('#comparaDiff').innerHTML = `Entre <b>${esc(min.c.nombre)}</b> (${eur(min.r.gastosTotales)}) y
    <b>${esc(max.c.nombre)}</b> (${eur(max.r.gastosTotales)}) hay una diferencia de
    <b>${eur(max.r.gastosTotales - min.r.gastosTotales)}</b> por exactamente la misma vivienda.
    ${mia ? `Tu comunidad, ${esc(mia.c.nombre)}, ocupa el puesto ${filas.indexOf(mia) + 1} de ${filas.length}.` : ''}`;

  const maxVal = max.r.gastosTotales || 1;
  $('#rankCcaa').innerHTML = filas
    .map(
      (f, i) => `
      <div class="rank__item ${f.c.id === state.ca ? 'rank__item--me' : ''}">
        <span class="rank__pos">${i + 1}</span>
        <span class="rank__name">${esc(f.c.nombre)}</span>
        <span class="rank__val">${eur(f.r.gastosTotales)}<small>${pct(f.r.pctGastos, 1)} del precio</small></span>
        <span class="rank__bar"><i style="width:${(f.r.gastosTotales / maxVal) * 100}%"></i></span>
      </div>`
    )
    .join('');

  $('#tablaCcaa tbody').innerHTML = filas
    .map(
      (f) => `<tr${f.c.id === state.ca ? ' style="background:var(--brand-soft);font-weight:650"' : ''}>
        <td>${esc(f.c.nombre)}</td>
        <td class="num">${f.tipoTexto}</td>
        <td class="num">${eur(f.r.impuestos.total)}</td>
        <td class="num">${eur(f.r.gastos.total)}</td>
        <td class="num">${eur(f.r.gastosTotales)}</td>
        <td class="num">${pct(f.r.pctGastos, 1)}</td>
      </tr>`
    )
    .join('');
}

/* ------------------------------------------------------------------ *
 * Panel: Guía
 * ------------------------------------------------------------------ */

let marcados = new Set(almacen.leer(CLAVE_GUIA, []));

function renderGuia() {
  $('#guiaPasos').innerHTML = PASOS.map(
    (p) => `
    <div class="step">
      <h3>${esc(p.titulo)}</h3>
      <div class="step__meta">${esc(p.plazo)}</div>
      <p>${esc(p.texto)}</p>
      <ul class="check">
        ${p.checklist
          .map((item, i) => {
            const id = `${p.id}-${i}`;
            return `<li><label>
              <input type="checkbox" data-check="${id}" ${marcados.has(id) ? 'checked' : ''} />
              <span>${esc(item)}</span>
            </label></li>`;
          })
          .join('')}
      </ul>
    </div>`
  ).join('');

  $('#quienPaga').innerHTML = [
    ['Paga el comprador', QUIEN_PAGA.comprador, 'brand'],
    ['Paga el vendedor', QUIEN_PAGA.vendedor, 'warn'],
    ['Paga el banco', QUIEN_PAGA.banco, 'ok'],
  ]
    .map(
      ([titulo, items, tono]) => `
      <div>
        <div style="margin-bottom:8px"><span class="badge badge--${tono}">${esc(titulo)}</span></div>
        <ul style="margin:0;padding-left:18px;font-size:14px;color:var(--ink-soft);line-height:1.65">
          ${items.map((i) => `<li>${esc(i)}</li>`).join('')}
        </ul>
      </div>`
    )
    .join('');

  $('#faq').innerHTML = FAQ.map(
    (f) => `<details class="faq"><summary>${esc(f.q)}</summary><div>${esc(f.a)}</div></details>`
  ).join('');

  actualizarProgreso();
}

function actualizarProgreso() {
  const total = PASOS.reduce((s, p) => s + p.checklist.length, 0);
  $('#guiaProgreso').textContent = `${marcados.size} / ${total}`;
}

/* ------------------------------------------------------------------ *
 * Enlace con el DOM
 * ------------------------------------------------------------------ */

function pintarSelectorCa() {
  $('#f-ca').innerHTML = COMUNIDADES.map(
    (c) => `<option value="${c.id}">${esc(c.nombre)}</option>`
  ).join('');
}

function sincronizarControles() {
  for (const nodo of $$('[data-bind]')) {
    const ruta = nodo.dataset.bind;
    const valor = leerRuta(state, ruta);
    if (nodo.type === 'checkbox') nodo.checked = Boolean(valor);
    else nodo.value = valor;
  }
  for (const grupo of $$('[data-seg]')) {
    const valor = String(leerRuta(state, grupo.dataset.seg));
    for (const b of $$('button', grupo)) {
      b.setAttribute('aria-pressed', String(b.dataset.value === valor));
    }
  }
}

let pendiente = null;
function programarRender() {
  if (pendiente) return;
  pendiente = requestAnimationFrame(() => {
    pendiente = null;
    render();
    almacen.escribir(CLAVE_ESTADO, state);
  });
}

function render() {
  const activo = $('.panel.is-active')?.id;
  // La calculadora alimenta la barra fija y el selector de comunidad: siempre.
  renderCalculadora();
  if (activo === 'panel-capacidad') renderCapacidad();
  if (activo === 'panel-comparar') renderComparar();
}

function conectarEventos() {
  // Inputs enlazados por ruta
  document.addEventListener('input', (e) => {
    const nodo = e.target.closest('[data-bind]');
    if (!nodo) return;
    const ruta = nodo.dataset.bind;
    let valor;
    if (nodo.type === 'checkbox') valor = nodo.checked;
    else if (nodo.type === 'number' || nodo.type === 'range' || nodo.dataset.type === 'number') {
      valor = nodo.value === '' ? 0 : Number(nodo.value);
      if (Number.isNaN(valor)) return;
    } else valor = nodo.value;
    escribirRuta(state, ruta, valor);
    programarRender();
  });

  document.addEventListener('change', (e) => {
    const nodo = e.target.closest('select[data-bind]');
    if (!nodo) return;
    const valor = nodo.dataset.type === 'number' ? Number(nodo.value) : nodo.value;
    escribirRuta(state, nodo.dataset.bind, valor);
    programarRender();
  });

  // Controles segmentados
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-seg] button');
    if (!btn) return;
    const grupo = btn.closest('[data-seg]');
    const valor = grupo.dataset.type === 'number' ? Number(btn.dataset.value) : btn.dataset.value;
    escribirRuta(state, grupo.dataset.seg, valor);
    for (const b of $$('button', grupo)) b.setAttribute('aria-pressed', String(b === btn));
    programarRender();
  });

  // Pestañas
  for (const tab of $$('.tab')) {
    tab.addEventListener('click', () => {
      for (const t of $$('.tab')) t.setAttribute('aria-selected', String(t === tab));
      for (const p of $$('.panel')) p.classList.toggle('is-active', p.id === tab.getAttribute('aria-controls'));
      $('#stickyCuota').classList.toggle('is-visible', tab.id === 'tab-calc');
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  // Checklist de la guía
  document.addEventListener('change', (e) => {
    const nodo = e.target.closest('[data-check]');
    if (!nodo) return;
    const id = nodo.dataset.check;
    if (nodo.checked) marcados.add(id);
    else marcados.delete(id);
    almacen.escribir(CLAVE_GUIA, [...marcados]);
    actualizarProgreso();
  });

  $('#btnResetGuia')?.addEventListener('click', () => {
    marcados = new Set();
    almacen.escribir(CLAVE_GUIA, []);
    renderGuia();
  });

  // Exportar el cuadro de amortización
  /* csv:inicio — build-artifact.mjs elimina este bloque: el visor de
     Artifacts bloquea las descargas que inicia la propia página. */
  $('#btnCsv')?.addEventListener('click', () => {
    const tabla = window.__ultimaTabla;
    if (!tabla) return;
    const cabecera = 'Mes;Cuota;Intereses;Capital;Amortizacion extra;Pendiente\n';
    const cuerpo = tabla.filas
      .map((f) =>
        [f.mes, f.cuota, f.interes, f.amortizado, f.extra, f.saldo]
          .map((v) => (typeof v === 'number' ? redondea(v, 2).toString().replace('.', ',') : v))
          .join(';')
      )
      .join('\n');
    const blob = new Blob(['﻿' + cabecera + cuerpo], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cuadro-amortizacion-${state.ca}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  /* csv:fin */

  $('#btnPrint')?.addEventListener('click', () => window.print());

  // La píldora de la cabecera lleva al selector de comunidad y lo señala.
  $('#caPill')?.addEventListener('click', () => {
    $('#tab-calc').click();
    const campo = $('#f-ca');
    campo.closest('.control').scrollIntoView({ block: 'center', behavior: 'smooth' });
    campo.closest('.control').classList.remove('destaca');
    void campo.closest('.control').offsetWidth; // reinicia la animación
    campo.closest('.control').classList.add('destaca');
    campo.focus();
  });

  $('#btnVerComparativa')?.addEventListener('click', () => $('#tab-comparar').click());

  // Estado en la URL para poder compartir un escenario
  window.addEventListener('beforeunload', () => almacen.escribir(CLAVE_ESTADO, state));
}

/* ------------------------------------------------------------------ *
 * Arranque
 * ------------------------------------------------------------------ */

function init() {
  pintarSelectorCa();
  sincronizarControles();
  conectarEventos();
  renderGuia();
  render();
  $('#stickyCuota').classList.add('is-visible');
  $('#stickyCuota').setAttribute('aria-hidden', 'false');
}

init();
