/**
 * Empaqueta la app en un único archivo HTML autocontenido, apto para
 * publicarse como Artifact (que envuelve el contenido en su propio
 * <!doctype>/<head>/<body>, así que aquí no se emiten esas etiquetas).
 *
 *   node build-artifact.mjs   ->  dist/mi-hipoteca.html
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const leer = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');

/* ---------- CSS: se añade la variante [data-theme='dark'] ---------- */

const css = leer('./assets/css/styles.css');
const bloqueOscuro = css.match(/@media \(prefers-color-scheme: dark\) \{\n([\s\S]*?)\n\}\n\/\* tema-oscuro:fin \*\//);
if (!bloqueOscuro) throw new Error('No se encuentra el bloque de tema oscuro marcado en styles.css');

// El mismo juego de tokens, pero activado por el atributo del visor.
const tokensOscuros = bloqueOscuro[1].replace(":root:not([data-theme='light'])", ":root[data-theme='dark']");
const cssFinal = `${css}\n\n/* Elección explícita de tema oscuro por parte del visor. */\n${tokensOscuros}\n`;

/* ---------- JS: se concatenan los módulos en orden de dependencia ---------- */

const MODULOS = ['data.js', 'calc.js', 'guia.js', 'ui.js', 'app.js'];

/** Quita los `import ... from '...';` (pueden ocupar varias líneas) y los `export`. */
/** Elimina un bloque delimitado por marcadores de comentario. */
const quitarBloque = (src, nombre) => {
  const re = new RegExp(`[ \\t]*/\\* ${nombre}:inicio[\\s\\S]*?${nombre}:fin \\*/\\n`, 'g');
  return src.replace(re, '');
};

function aplanar(fuente) {
  const salida = [];
  const lineas = fuente.split('\n');
  for (let i = 0; i < lineas.length; i++) {
    if (/^import\s/.test(lineas[i])) {
      while (i < lineas.length && !/;\s*$/.test(lineas[i])) i++;
      continue;
    }
    salida.push(lineas[i].replace(/^export\s+(const|let|function|class)\s/, '$1 '));
  }
  return salida.join('\n');
}

const js = MODULOS.map((m) => {
  // El sandbox del visor bloquea las descargas, así que el exportador a CSV
  // no llega a esta versión: se retira el marcado y también su código.
  const codigo = aplanar(quitarBloque(leer(`./assets/js/${m}`), 'csv'));
  if (/^\s*(import|export)\s/m.test(codigo)) throw new Error(`Quedan import/export sin aplanar en ${m}`);
  return `/* ======================= ${m} ======================= */\n${codigo}`;
}).join('\n\n');

/* ---------- HTML ---------- */

let html = leer('./index.html');

// Nos quedamos solo con el contenido de <body>: el Artifact aporta el esqueleto.
const cuerpo = html.match(/<body>([\s\S]*?)<\/body>/)[1];

// El sandbox del visor bloquea las descargas que inicia la propia página,
// así que el botón de CSV no funcionaría: se retira en esta versión.
const cuerpoLimpio = cuerpo
  .replace(/\s*<button class="btn" id="btnCsv"[^>]*>.*?<\/button>/s, '')
  .replace(/\s*<script type="module"[^>]*><\/script>/, '');

const salida = `<title>Mi Hipoteca</title>
<style>
${cssFinal}</style>
${cuerpoLimpio.trim()}
<script type="module">
${js}
</script>
`;

mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/mi-hipoteca.html', import.meta.url), salida);

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`dist/mi-hipoteca.html  ${kb(salida.length)}`);
console.log(`  CSS ${kb(cssFinal.length)} · JS ${kb(js.length)} · HTML ${kb(cuerpoLimpio.length)}`);
// Etiquetas exactas: <header> no debe confundirse con <head>.
const prohibidos = [/<!doctype/i, /<html[\s>]/i, /<\/?head[\s>]/i, /<\/?body[\s>]/i];
for (const re of prohibidos) {
  if (re.test(salida)) throw new Error(`El resultado no debería contener ${re}`);
}
if (/id="btnCsv"/.test(cuerpoLimpio)) throw new Error('El botón de CSV sigue en el marcado');
for (const rastro of ['btnCsv', 'download', 'createObjectURL']) {
  if (salida.includes(rastro)) throw new Error(`Queda código de descarga en el paquete: ${rastro}`);
}
console.log('  sin etiquetas de esqueleto ni botón de descarga ✓');
