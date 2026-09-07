import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  cuotaFrancesa,
  plazoParaCuota,
  capitalDesdeCuota,
  tablaAmortizacion,
  construirTinPara,
  cuotaPorTramos,
  calcularItp,
  calcularImpuestos,
  resumenOperacion,
  capacidadCompra,
  simularAmortizacion,
  calcularTae,
  redondea,
} from '../assets/js/calc.js';
import { COMUNIDADES, getComunidad } from '../assets/js/data.js';

const perfilBase = {
  edad: 40,
  viviendaHabitual: true,
  primeraVivienda: true,
  familiaNumerosa: false,
  monoparental: false,
  discapacidad: 0,
  vpo: false,
  baseIrpf: 40000,
  municipioPequeno: false,
};

/* ------------------------- Financiera ------------------------- */

test('cuota francesa coincide con el valor conocido', () => {
  assert.equal(redondea(cuotaFrancesa(200000, 3, 360)), 843.21);
  assert.equal(redondea(cuotaFrancesa(150000, 2.5, 300)), 672.93);
});

test('cuota con interés cero reparte el capital linealmente', () => {
  assert.equal(cuotaFrancesa(120000, 0, 240), 500);
});

test('plazoParaCuota es la inversa de cuotaFrancesa', () => {
  const cuota = cuotaFrancesa(180000, 3.2, 300);
  assert.equal(plazoParaCuota(180000, 3.2, cuota), 300);
});

test('capitalDesdeCuota es la inversa de cuotaFrancesa', () => {
  const cuota = cuotaFrancesa(220000, 2.8, 360);
  assert.equal(redondea(capitalDesdeCuota(cuota, 2.8, 360), 0), 220000);
});

test('una cuota que no cubre los intereses nunca amortiza', () => {
  assert.equal(plazoParaCuota(200000, 3, 400), Infinity);
});

/* ---------------------- Cuadro de amortización ---------------------- */

test('el cuadro amortiza exactamente el capital y cierra a saldo cero', () => {
  const t = tablaAmortizacion({ capital: 200000, meses: 360, tinPara: () => 3 });
  assert.equal(t.mesesReales, 360);
  assert.ok(t.filas.at(-1).saldo < 0.01, 'el saldo final debe ser cero');
  const amortizado = t.filas.reduce((s, f) => s + f.amortizado + f.extra, 0);
  assert.equal(redondea(amortizado, 0), 200000);
  // Intereses totales conocidos para 200k / 3 % / 30 años
  assert.equal(redondea(t.totalIntereses, 0), 103555);
});

test('el tipo mixto cambia de TIN en el año esperado', () => {
  const tinPara = construirTinPara({
    modalidad: 'mixto',
    tinFijo: 2.5,
    diferencial: 0.6,
    euribor: 2.2,
    aniosFijo: 10,
  });
  assert.equal(tinPara(1), 2.5);
  assert.equal(tinPara(120), 2.5); // último mes del año 10
  assert.equal(tinPara(121), 2.8); // euríbor + diferencial
});

test('el variable mantiene el tipo de salida el primer año', () => {
  const tinPara = construirTinPara({
    modalidad: 'variable',
    tinFijo: 1.9,
    diferencial: 0.65,
    euribor: 2.1,
  });
  assert.equal(tinPara(12), 1.9);
  assert.equal(redondea(tinPara(13), 2), 2.75);
});

test('amortizar reduciendo plazo ahorra más intereses que reduciendo cuota', () => {
  const { modos } = simularAmortizacion({
    capital: 200000,
    meses: 360,
    tinPara: () => 3,
    extra: { mes: 12, importe: 20000 },
  });
  const plazo = modos.find((m) => m.modo === 'plazo');
  const cuota = modos.find((m) => m.modo === 'cuota');
  assert.ok(plazo.ahorroIntereses > cuota.ahorroIntereses);
  assert.ok(plazo.mesesAhorrados > 0);
  assert.equal(cuota.mesesAhorrados, 0, 'reducir cuota no acorta el plazo');
  assert.ok(cuota.cuotaTrasAmortizar < 843.21, 'reducir cuota baja la mensualidad');
});

test('la TAE supera al TIN cuando hay gastos y vinculaciones', () => {
  const t = tablaAmortizacion({ capital: 200000, meses: 360, tinPara: () => 3 });
  const taeLimpia = calcularTae({ capital: 200000, filas: t.filas });
  assert.ok(Math.abs(taeLimpia - 3.04) < 0.05, `TAE sin gastos ≈ TIN capitalizado, fue ${taeLimpia}`);
  const taeConGastos = calcularTae({
    capital: 200000,
    filas: t.filas,
    gastosIniciales: 2000,
    costeAnualVinculaciones: 550,
  });
  assert.ok(taeConGastos > taeLimpia + 0.2, 'los gastos deben encarecer la TAE');
});

/* --------------------------- Fiscalidad --------------------------- */

test('tramos progresivos: Catalunya 700.000 €', () => {
  const cat = getComunidad('cataluna');
  const { cuota } = cuotaPorTramos(700000, cat.itp.tramos);
  // 600.000 al 10 % + 100.000 al 11 %
  assert.equal(redondea(cuota, 0), 71000);
});

test('tramos progresivos: Castilla y León 300.000 €', () => {
  const cyl = getComunidad('castilla-y-leon');
  const { cuota } = cuotaPorTramos(300000, cyl.itp.tramos);
  // 250.000 al 8 % + 50.000 al 10 %
  assert.equal(redondea(cuota, 0), 25000);
});

test('Madrid aplica el 6 % con bonificación del 10 % en vivienda habitual', () => {
  const madrid = getComunidad('madrid');
  const itp = calcularItp(madrid, 300000, perfilBase);
  assert.equal(redondea(itp.cuotaIntegra, 0), 18000);
  assert.equal(redondea(itp.cuota, 0), 16200);
  assert.equal(itp.bonificacion.id, 'mad-10');
});

test('Madrid sin vivienda habitual no bonifica', () => {
  const madrid = getComunidad('madrid');
  const itp = calcularItp(madrid, 300000, { ...perfilBase, viviendaHabitual: false });
  assert.equal(redondea(itp.cuota, 0), 18000);
  assert.equal(itp.bonificacion, undefined);
});

test('Andalucía: el tipo reducido del 6 % solo se aplica hasta 150.000 €', () => {
  const and = getComunidad('andalucia');
  const joven = { ...perfilBase, edad: 30 };
  assert.equal(calcularItp(and, 150000, joven).tipoEfectivo, 6);
  assert.equal(redondea(calcularItp(and, 160000, joven).tipoEfectivo, 2), 7);
});

test('Baleares: menor de 30 con primera vivienda paga 0 € de ITP', () => {
  const bal = getComunidad('baleares');
  const perfil = { ...perfilBase, edad: 28, baseIrpf: 30000 };
  assert.equal(calcularItp(bal, 250000, perfil).cuota, 0);
});

test('«menor de 35 años» excluye a quien ya tiene 35', () => {
  const and = getComunidad('andalucia');
  const con34 = calcularItp(and, 140000, { ...perfilBase, edad: 34 });
  const con35 = calcularItp(and, 140000, { ...perfilBase, edad: 35 });
  assert.equal(con34.tipoEfectivo, 6, 'con 34 años sí hay tipo reducido');
  assert.equal(redondea(con35.tipoEfectivo, 2), 7, 'con 35 cumplidos ya no');
});

test('Catalunya usa «32 años o menos», así que los 32 sí entran', () => {
  const cat = getComunidad('cataluna');
  const perfil = { ...perfilBase, baseIrpf: 30000 };
  assert.equal(calcularItp(cat, 250000, { ...perfil, edad: 32 }).reduccion?.tipo, 5);
  assert.equal(calcularItp(cat, 250000, { ...perfil, edad: 33 }).reduccion, undefined);
});

test('Baleares: el 0 % es para menores de 30 y la bonificación del 50 % para 30-35', () => {
  const bal = getComunidad('baleares');
  const p = (edad) => ({ ...perfilBase, edad, baseIrpf: 30000 });
  assert.equal(calcularItp(bal, 250000, p(29)).cuota, 0);
  const treintaYdos = calcularItp(bal, 250000, p(32));
  assert.equal(treintaYdos.bonificacion?.id, 'bal-50');
  assert.equal(redondea(treintaYdos.cuota, 0), redondea(treintaYdos.cuotaIntegra / 2, 0));
  assert.equal(calcularItp(bal, 250000, p(36)).bonificacion, undefined);
});

test('las etiquetas de impuestos usan la coma decimal española', () => {
  const r = calcularImpuestos({
    comunidad: getComunidad('cataluna'),
    precio: 300000,
    tipoVivienda: 'nueva',
    perfil: { ...perfilBase, viviendaHabitual: false },
  });
  assert.equal(r.partidas[1].label, 'AJD (1,5 %)');
  assert.ok(!r.partidas.some((p) => /\d\.\d/.test(p.label)), 'ninguna etiqueta con punto decimal');
});

test('elige siempre la reducción más favorable disponible', () => {
  const cyl = getComunidad('castilla-y-leon');
  const perfil = { ...perfilBase, edad: 30, municipioPequeno: true };
  const itp = calcularItp(cyl, 140000, perfil);
  assert.equal(itp.reduccion.tipo, 0.01, 'debe ganar el 0,01 % frente al 5 %');
});

test('obra nueva: IVA 10 % + AJD, y Canarias usa IGIC 7 %', () => {
  const madrid = getComunidad('madrid');
  const nueva = calcularImpuestos({
    comunidad: madrid,
    precio: 300000,
    tipoVivienda: 'nueva',
    perfil: perfilBase,
  });
  assert.equal(nueva.tipo, 'IVA');
  assert.equal(redondea(nueva.total, 0), 30000 + 2250); // 10 % + 0,75 %

  const canarias = calcularImpuestos({
    comunidad: getComunidad('canarias'),
    precio: 300000,
    tipoVivienda: 'nueva',
    perfil: perfilBase,
  });
  assert.equal(canarias.tipo, 'IGIC');
  assert.equal(redondea(canarias.partidas[0].importe, 0), 21000); // 7 %
});

test('la base del ITP es el mayor entre precio y valor de referencia', () => {
  const madrid = getComunidad('madrid');
  const r = calcularImpuestos({
    comunidad: madrid,
    precio: 200000,
    valorReferencia: 240000,
    tipoVivienda: 'usada',
    perfil: perfilBase,
  });
  assert.equal(r.base, 240000);
});

test('el valor de referencia no afecta a la obra nueva', () => {
  const r = calcularImpuestos({
    comunidad: getComunidad('madrid'),
    precio: 200000,
    valorReferencia: 240000,
    tipoVivienda: 'nueva',
    perfil: perfilBase,
  });
  assert.equal(r.base, 200000);
});

test('todas las comunidades producen un resumen coherente', () => {
  for (const c of COMUNIDADES) {
    for (const tipoVivienda of ['usada', 'nueva']) {
      const r = resumenOperacion({
        comunidad: c,
        precio: 250000,
        tipoVivienda,
        perfil: perfilBase,
        entradaPct: 20,
      });
      assert.ok(r.ahorroNecesario > r.entrada, `${c.nombre}/${tipoVivienda}: faltan gastos`);
      assert.ok(r.pctGastos >= 0 && r.pctGastos < 30, `${c.nombre}/${tipoVivienda}: gastos fuera de rango (${r.pctGastos})`);
      assert.equal(redondea(r.capital, 2), 200000);
    }
  }
});

test('cada comunidad declara fuente oficial y notas', () => {
  for (const c of COMUNIDADES) {
    assert.ok(c.fuente?.startsWith('https://'), `${c.nombre} sin fuente`);
    assert.ok(c.notas?.length > 20, `${c.nombre} sin notas`);
    assert.ok(c.itp.tramos.at(-1).hasta === Infinity, `${c.nombre}: el último tramo debe ser abierto`);
  }
});

/* ------------------------ Capacidad de compra ------------------------ */

test('capacidad de compra: el ahorro limita cuando es escaso', () => {
  const r = capacidadCompra({
    comunidad: getComunidad('madrid'),
    tipoVivienda: 'usada',
    perfil: perfilBase,
    ahorro: 40000,
    ingresosNetosMensuales: 4000,
    deudasMensuales: 0,
    plazoAnios: 30,
    tin: 3,
  });
  assert.equal(r.limitante, 'ahorro');
  // Con ~27 % de coste total sobre precio, 40.000 € dan para ~145.000 €
  assert.ok(r.precioMax > 120000 && r.precioMax < 175000, `precioMax fue ${r.precioMax}`);
});

test('capacidad de compra: los ingresos limitan cuando el ahorro sobra', () => {
  const r = capacidadCompra({
    comunidad: getComunidad('madrid'),
    tipoVivienda: 'usada',
    perfil: perfilBase,
    ahorro: 400000,
    ingresosNetosMensuales: 2500,
    deudasMensuales: 200,
    plazoAnios: 30,
    tin: 3,
  });
  assert.equal(r.limitante, 'ingresos');
  assert.equal(redondea(r.cuotaMax, 2), 675); // 35 % de 2500 - 200
});

test('el resultado de la capacidad de compra es autoconsistente', () => {
  const r = capacidadCompra({
    comunidad: getComunidad('valenciana'),
    tipoVivienda: 'usada',
    perfil: perfilBase,
    ahorro: 90000,
    ingresosNetosMensuales: 3200,
    plazoAnios: 30,
    tin: 3,
  });
  // El ahorro necesario para el precio máximo no puede superar el ahorro real
  assert.ok(r.resumen.ahorroNecesario <= 90000 + 1);
  const cuota = cuotaFrancesa(r.resumen.capital, 3, 360);
  assert.ok(cuota <= r.cuotaMax + 1, 'la cuota resultante debe caber en el ratio de esfuerzo');
});

test('sin ingresos ni ahorro no hay capacidad de compra', () => {
  const r = capacidadCompra({
    comunidad: getComunidad('madrid'),
    tipoVivienda: 'usada',
    perfil: perfilBase,
    ahorro: 0,
    ingresosNetosMensuales: 0,
    plazoAnios: 30,
    tin: 3,
  });
  assert.equal(r.precioMax, 0);
});
