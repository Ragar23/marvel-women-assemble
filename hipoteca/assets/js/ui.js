/**
 * Utilidades de presentación: formateo, ayudas de DOM y gráficos SVG
 * generados a mano (sin librerías, para que la app cargue al instante).
 */

const fmtEur = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const fmtEur2 = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmtNum = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });

export const eur = (n) => fmtEur.format(Math.round(n || 0));
export const eur2 = (n) => fmtEur2.format(n || 0);
export const num = (n) => fmtNum.format(n || 0);
export const pct = (n, d = 2) =>
  `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0)} %`;

/** Formato compacto para ejes: 250.000 → "250 k". */
export const eurCorto = (n) => {
  const v = Math.abs(n);
  if (v >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} M`;
  if (v >= 1000) return `${Math.round(n / 1000)} k`;
  return String(Math.round(n));
};

export const meses = (m) => {
  const a = Math.floor(m / 12);
  const r = m % 12;
  if (a === 0) return `${r} ${r === 1 ? 'mes' : 'meses'}`;
  if (r === 0) return `${a} ${a === 1 ? 'año' : 'años'}`;
  return `${a} a. y ${r} m.`;
};

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Escapa texto que va a inyectarse como HTML. */
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ *
 * Bloques de UI reutilizables
 * ------------------------------------------------------------------ */

export function kpi({ label, value, sub, hero = false, tone = '' }) {
  return `
    <div class="kpi ${hero ? 'kpi--hero' : ''}">
      <div class="kpi__label">${esc(label)}</div>
      <div class="kpi__value" ${tone ? `style="color:var(--${tone})"` : ''}>${value}</div>
      ${sub ? `<div class="kpi__sub">${sub}</div>` : ''}
    </div>`;
}

export function fila({ label, value, sub = false, total = false, badge = '' }) {
  return `
    <div class="row ${sub ? 'row--sub' : ''} ${total ? 'row--total' : ''}">
      <span class="row__label">${esc(label)} ${badge}</span>
      <span class="row__value">${value}</span>
    </div>`;
}

export function nota(texto, tono = '', icono = '💡') {
  return `<div class="note ${tono ? `note--${tono}` : ''}">
    <span class="note__icon">${icono}</span><span>${texto}</span>
  </div>`;
}

/** Barra de ratio de esfuerzo con umbrales 30 / 35 / 40 %. */
export function medidorEsfuerzo(ratio) {
  const capped = Math.min(ratio, 60);
  const color = ratio <= 30 ? 'var(--accent)' : ratio <= 35 ? 'var(--warn)' : 'var(--danger)';
  const veredicto =
    ratio <= 30
      ? ['Cómodo', 'ok', 'Margen de sobra para imprevistos y subidas de tipos.']
      : ratio <= 35
        ? ['En el límite', 'warn', 'Es el techo que aceptan la mayoría de bancos. Vigila los imprevistos.']
        : ['Excesivo', 'danger', 'Por encima del 35 % la mayoría de entidades deniegan la operación.'];

  return `
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
      <span style="font-size:2rem;font-weight:700;letter-spacing:-.03em;color:${color}">${pct(ratio, 1)}</span>
      <span class="badge badge--${veredicto[1]}">${veredicto[0]}</span>
    </div>
    <div class="meter">
      <div class="meter__track">
        <div class="meter__fill" style="width:${(capped / 60) * 100}%;background:${color}"></div>
      </div>
      <div class="meter__scale"><span>0 %</span><span>30 %</span><span>60 %</span></div>
    </div>
    <p class="muted" style="font-size:13.5px;margin-top:10px">${veredicto[2]}</p>`;
}

/* ------------------------------------------------------------------ *
 * Gráficos SVG
 * ------------------------------------------------------------------ */

const W = 640;
const H = 260;
const PAD = { t: 12, r: 10, b: 26, l: 46 };

/**
 * Área apilada: capital amortizado + intereses pagados (acumulados),
 * con la deuda pendiente como línea superpuesta.
 */
export function graficoAmortizacion(filas) {
  if (!filas.length) return '';

  // Resumimos por año para que el SVG sea ligero
  const porAnio = [];
  let capAcc = 0;
  let intAcc = 0;
  let anioActual = 0;
  for (const f of filas) {
    capAcc += f.amortizado + f.extra;
    intAcc += f.interes;
    if (f.anio !== anioActual) {
      anioActual = f.anio;
      porAnio.push({ anio: f.anio, cap: capAcc, int: intAcc, saldo: f.saldo });
    } else {
      const ult = porAnio.at(-1);
      ult.cap = capAcc;
      ult.int = intAcc;
      ult.saldo = f.saldo;
    }
  }

  const nAnios = porAnio.length;
  const maxY = Math.max(...porAnio.map((p) => p.cap + p.int), 1);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (nAnios === 1 ? iw : (i / (nAnios - 1)) * iw);
  const y = (v) => PAD.t + ih - (v / maxY) * ih;

  const areaPath = (valorEn) => {
    const arriba = porAnio.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(valorEn(p)).toFixed(1)}`).join('');
    return `${arriba}L${x(nAnios - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  };
  const linea = (valorEn) =>
    porAnio.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(valorEn(p)).toFixed(1)}`).join('');

  // Rejilla horizontal
  const pasos = 4;
  const grid = Array.from({ length: pasos + 1 }, (_, k) => {
    const v = (maxY / pasos) * k;
    const yy = y(v).toFixed(1);
    return `<line x1="${PAD.l}" y1="${yy}" x2="${W - PAD.r}" y2="${yy}" stroke="var(--line-soft)" stroke-width="1"/>
            <text x="${PAD.l - 8}" y="${yy}" text-anchor="end" dominant-baseline="middle"
                  font-size="11" fill="var(--ink-faint)">${eurCorto(v)}</text>`;
  }).join('');

  // Etiquetas del eje X cada ~5 años
  const paso = nAnios <= 12 ? 2 : nAnios <= 25 ? 5 : 10;
  const ejeX = porAnio
    .map((p, i) =>
      p.anio % paso === 0 || i === nAnios - 1
        ? `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--ink-faint)">${p.anio}</text>`
        : ''
    )
    .join('');

  return `
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img"
         aria-label="Evolución del capital amortizado, los intereses pagados y la deuda pendiente año a año">
      ${grid}
      <path d="${areaPath((p) => p.cap + p.int)}" fill="var(--warn)" opacity="0.28"/>
      <path d="${areaPath((p) => p.cap)}" fill="var(--brand)" opacity="0.5"/>
      <path d="${linea((p) => p.cap + p.int)}" fill="none" stroke="var(--warn)" stroke-width="2"/>
      <path d="${linea((p) => p.cap)}" fill="none" stroke="var(--brand)" stroke-width="2"/>
      <path d="${linea((p) => p.saldo)}" fill="none" stroke="var(--ink-faint)" stroke-width="2" stroke-dasharray="5 4"/>
      ${ejeX}
    </svg>`;
}

/** Donut capital vs intereses. */
export function graficoDonut(capital, intereses) {
  const total = capital + intereses || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  const parteCapital = (capital / total) * c;
  const pctInt = (intereses / total) * 100;

  return `
    <svg class="chart" viewBox="0 0 260 150" role="img"
         aria-label="Reparto entre capital prestado e intereses: ${Math.round(pctInt)} % son intereses"
         style="max-width:280px;margin:14px auto 0">
      <g transform="translate(75,75)">
        <circle r="${r}" fill="none" stroke="var(--warn)" stroke-width="20" opacity="0.85"/>
        <circle r="${r}" fill="none" stroke="var(--brand)" stroke-width="20"
                stroke-dasharray="${parteCapital.toFixed(1)} ${(c - parteCapital).toFixed(1)}"
                transform="rotate(-90)"/>
        <text y="-2" text-anchor="middle" font-size="21" font-weight="700" fill="var(--ink)">${Math.round(pctInt)} %</text>
        <text y="16" text-anchor="middle" font-size="10.5" fill="var(--ink-faint)">en intereses</text>
      </g>
      <g font-size="11.5" fill="var(--ink-soft)">
        <rect x="150" y="52" width="11" height="11" rx="3" fill="var(--brand)"/>
        <text x="167" y="62">Capital</text>
        <rect x="150" y="80" width="11" height="11" rx="3" fill="var(--warn)" opacity="0.85"/>
        <text x="167" y="90">Intereses</text>
      </g>
    </svg>`;
}
