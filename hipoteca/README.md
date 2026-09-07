# Calculadora de Hipoteca + Guía de Compra 🏠

Aplicación web para calcular una hipoteca en España **teniendo en cuenta los
impuestos reales de cada comunidad autónoma**, y guía paso a paso del proceso
de compra de una vivienda.

## Arrancar en local

No hay build ni dependencias. Basta con servir la carpeta por HTTP (los
módulos ES no funcionan abriendo el archivo con `file://`):

```bash
cd hipoteca
npm start                 # o: python3 -m http.server 8080
```

Y abrir <http://127.0.0.1:8080>.

## Tests

```bash
npm test                  # node --test tests/
```

30 tests sobre el motor de cálculo: matemática financiera, cuadro de
amortización, tramos progresivos de ITP, umbrales de edad, capacidad de compra
y coherencia de las 18 jurisdicciones fiscales.

## Qué hace

**Calculadora**
- Cuota, TAE, intereses totales y cuadro de amortización (sistema francés).
- Tipo **fijo, variable y mixto**, con revisión anual del euríbor.
- Desglose completo del dinero necesario al inicio: entrada + impuestos +
  notaría + registro + gestoría + tasación.
- Simulador de **amortización anticipada**, comparando reducir plazo frente a
  reducir cuota.
- Escenarios de estrés del euríbor (hasta el 5,4 % de 2008).
- Exportación del cuadro a CSV e impresión a PDF.

**¿Cuánto puedo pagar?**
- Precio máximo de vivienda cruzando dos límites: el ahorro disponible
  (entrada + gastos) y los ingresos (regla del 35 % de esfuerzo).
- Te dice cuál de los dos te está limitando y qué hacer.
- Sensibilidad al plazo: cuánto baja la cuota y cuánto suben los intereses.

**Comparar comunidades**
- La misma compra, con tu perfil, en las 18 jurisdicciones. Para una vivienda
  de 250.000 € la diferencia entre la más barata y la más cara supera los
  20.000 €.

**Cómo comprar una casa**
- 8 pasos con 55 puntos de checklist que se guardan en el navegador.
- Quién paga qué (comprador / vendedor / banco, según la Ley 5/2019).
- Preguntas frecuentes: arras, aval ICO, valor de referencia, fijo vs variable.

## Fiscalidad cubierta

Las 17 comunidades autónomas más Ceuta y Melilla, con:

- **ITP** de vivienda usada, incluidos los **tramos progresivos** de Catalunya,
  Illes Balears, Aragón, Asturias, Extremadura y Castilla y León.
- **Tipos reducidos y bonificaciones** por edad, primera vivienda, vivienda
  habitual, familia numerosa o monoparental, discapacidad, VPO, límites de
  renta y municipios en riesgo de despoblación. Se aplica automáticamente el
  más favorable.
- **Obra nueva**: IVA + AJD, con los regímenes especiales de Canarias (IGIC
  7 %) y Ceuta y Melilla (IPSI).
- **Valor de referencia de Catastro**: desde 2022 la base del ITP es el mayor
  entre el precio pagado y ese valor.
- Los gastos que, desde la **Ley 5/2019**, paga obligatoriamente el banco.

## Estructura

```
hipoteca/
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── data.js     Datos fiscales de las 18 jurisdicciones
│       ├── calc.js     Motor de cálculo (funciones puras, sin DOM)
│       ├── ui.js       Formateo y gráficos SVG hechos a mano
│       ├── guia.js     Contenido de la guía de compra
│       └── app.js      Estado y renderizado
└── tests/calc.test.mjs
```

`calc.js` no toca el DOM, así que los mismos cálculos que corren en el
navegador son los que verifican los tests en Node.

## Rendimiento

Cero dependencias, cero peticiones de red externas, cero build. Cinco módulos
ES, una hoja de estilos y un HTML: **126 KB sin comprimir, 33 KB con gzip**, en
7 peticiones. Los gráficos son SVG generados a mano; los iconos, emoji. El
estado y el checklist se guardan en `localStorage`.

## ⚠️ Aviso

Los tipos impositivos están consolidados a **2025** y cambian con cada ley
autonómica de presupuestos. Los aranceles de notaría y registro son
estimaciones por tramos. Cada comunidad enlaza a su fuente oficial en el pie de
página. **Confirma siempre los importes con la Agencia Tributaria de tu
comunidad antes de firmar.** No es asesoramiento fiscal, legal ni financiero.

## Versión de un solo archivo

```bash
node build-artifact.mjs        # -> dist/mi-hipoteca.html
```

Empaqueta el CSS y los cinco módulos ES en un único HTML autocontenido (125 KB)
para publicarlo como Artifact o subirlo a cualquier hosting estático. Añade la
variante de tema `[data-theme]` y retira el exportador a CSV, porque el visor
de Artifacts bloquea las descargas que inicia la propia página.
