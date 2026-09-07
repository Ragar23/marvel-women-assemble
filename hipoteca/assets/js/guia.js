/**
 * Contenido de la guía "Cómo comprar una casa en España".
 * Separado de la lógica para poder editarlo sin tocar el código.
 */

export const PASOS = [
  {
    id: 'presupuesto',
    titulo: 'Calcula tu presupuesto real',
    plazo: 'Antes de mirar ni un solo anuncio',
    texto:
      'El error más caro es enamorarte de una casa que no puedes pagar. Necesitas ahorro para la entrada (normalmente el 20 % del precio) MÁS los impuestos y gastos, que según la comunidad autónoma suman entre el 8 % y el 15 % adicional. Regla rápida: necesitas tener ahorrado alrededor del 30 % del precio de la vivienda.',
    checklist: [
      'Calcula tu ahorro disponible real, dejando intacto un colchón de 6 meses de gastos',
      'Suma todas tus deudas mensuales: préstamos, coche, tarjetas aplazadas',
      'Comprueba que cuota + deudas no superen el 35 % de tus ingresos netos',
      'Usa la pestaña «¿Cuánto puedo pagar?» para fijar tu precio máximo',
      'Presupuesta también mudanza, reforma y muebles (entre 5.000 y 30.000 €)',
    ],
  },
  {
    id: 'perfil',
    titulo: 'Prepara tu perfil y consigue la preaprobación',
    plazo: '1–3 semanas',
    texto:
      'Ir al banco DESPUÉS de firmar las arras es jugar con fuego: si te deniegan la hipoteca puedes perder la señal. Consigue primero una preaprobación por escrito. Pide oferta a tres bancos como mínimo y a un bróker hipotecario: la diferencia entre la mejor y la peor oferta puede superar los 30.000 € a lo largo de la vida del préstamo.',
    checklist: [
      'Reúne: DNI, últimas 3 nóminas, declaración de la renta, vida laboral, extractos bancarios de 6 meses',
      'Consulta si estás en ASNEF/RAI y cancela cualquier incidencia antes de pedir la hipoteca',
      'Evita cambiar de trabajo o pedir otros préstamos en los meses previos',
      'Pide oferta a 3 bancos + 1 bróker y compara siempre la TAE, no el TIN',
      'Calcula el coste real de las vinculaciones (seguros, nómina, tarjetas)',
      'Si tienes menos de 35 años, consulta el aval ICO: cubre hasta el 20 % de entrada',
    ],
  },
  {
    id: 'busqueda',
    titulo: 'Busca y visita con criterio',
    plazo: '1–6 meses',
    texto:
      'Visita al menos 10 viviendas antes de ofertar por ninguna: sin puntos de comparación no sabrás si un precio es bueno. Visita siempre dos veces y a horas distintas (una de día y otra por la tarde) para juzgar luz, ruido y vecindario.',
    checklist: [
      'Define innegociables (nº de habitaciones, ascensor, exterior) frente a deseables',
      'Comprueba el precio por m² de la zona en el portal del Catastro y en los portales inmobiliarios',
      'Revisa orientación, luz natural, ruido, cobertura móvil y plazas de aparcamiento',
      'Pregunta por el gasto real de comunidad, IBI anual y consumo de suministros',
      'Mira el estado de fachada, tejado, bajantes y zonas comunes: derramas futuras',
      'Comprueba la certificación energética (una letra E o F encarece mucho la factura)',
    ],
  },
  {
    id: 'due-diligence',
    titulo: 'Investiga la vivienda antes de ofertar',
    plazo: '3–7 días por vivienda',
    texto:
      'La nota simple del Registro de la Propiedad cuesta unos 10 € y es la mejor inversión de todo el proceso: te dice quién es el dueño real, la superficie registral y si hay cargas (hipotecas, embargos, servidumbres). Si la casa arrastra una hipoteca, debe cancelarse antes o en el momento de la firma.',
    checklist: [
      'Pide la nota simple actualizada en registradores.org (~10 €)',
      'Verifica que el vendedor del anuncio es el titular registral',
      'Comprueba que no hay cargas, embargos ni afecciones fiscales pendientes',
      'Pide el certificado de la comunidad de estar al corriente de pagos y las actas de los últimos 3 años',
      'Comprueba si hay derramas aprobadas o ITE/IEE pendiente (puede costar decenas de miles)',
      'Confirma la cédula de habitabilidad o licencia de primera ocupación',
      'Comprueba que la superficie registral coincide con la catastral y con la real',
      'Si es obra nueva: exige el aval o seguro de las cantidades entregadas a cuenta (Ley 38/1999)',
    ],
  },
  {
    id: 'arras',
    titulo: 'Negocia y firma el contrato de arras',
    plazo: '1–2 semanas',
    texto:
      'Las arras reservan la vivienda: se entrega normalmente entre el 5 % y el 10 % del precio. Tipos: PENITENCIALES (art. 1454 CC) permiten desistir — si te echas atrás pierdes la señal, si se echa atrás el vendedor te devuelve el doble; CONFIRMATORIAS obligan a comprar y la otra parte puede exigir el cumplimiento judicialmente; PENALES fijan una penalización. Salvo que sepas lo que haces, firma penitenciales.',
    checklist: [
      'Negocia el precio: parte del precio por m² de la zona y de los defectos detectados',
      'Especifica en el contrato que son arras PENITENCIALES si quieres poder desistir',
      'Incluye una cláusula de condición suspensiva por no obtención de financiación',
      'Fija un plazo realista para la firma: 60–90 días si necesitas hipoteca',
      'Detalla qué muebles y electrodomésticos se incluyen en el precio',
      'Acuerda por escrito quién paga la plusvalía municipal (por ley, el vendedor)',
      'Paga siempre por transferencia bancaria, nunca en efectivo',
    ],
  },
  {
    id: 'hipoteca',
    titulo: 'Tramita la hipoteca (Ley 5/2019)',
    plazo: '4–8 semanas',
    texto:
      'La Ley 5/2019 de contratos de crédito inmobiliario te protege: el banco debe entregarte la FEIN (Ficha Europea de Información Normalizada, que es una oferta vinculante de 10 días) y la FiAE con las cláusulas sensibles. Después tienes que acudir al notario para el acta de transparencia — gratuita y obligatoria — al menos 1 día antes de la firma.',
    checklist: [
      'Compara ofertas por TAE, incluyendo el coste anual de los seguros vinculados',
      'Recuerda que el banco paga AJD, notaría, registro y gestoría del préstamo; tú solo la tasación',
      'Revisa comisión de apertura, de amortización anticipada y de subrogación',
      'En variable, comprueba el índice (euríbor), el diferencial y la periodicidad de revisión',
      'Verifica que no hay cláusula suelo y que el TIN mínimo puede ser 0 %',
      'Recibe la FEIN y deja pasar los 10 días de reflexión: no se pueden renunciar',
      'Acude al acta notarial previa: es gratuita, obligatoria y sin ella no se puede firmar',
      'Puedes elegir libremente tu propia aseguradora, aunque pierdas la bonificación',
    ],
  },
  {
    id: 'firma',
    titulo: 'Firma en la notaría',
    plazo: 'Un día (1–2 horas)',
    texto:
      'El día de la firma se otorgan dos escrituras: la de compraventa y la de préstamo hipotecario. El notario lee las cláusulas, el banco entrega el cheque bancario al vendedor y tú recibes las llaves. Lleva el DNI y los cheques bancarios de la parte que aportas tú.',
    checklist: [
      'Pide el borrador de la escritura con días de antelación y léelo entero',
      'Haz una visita final a la vivienda el mismo día, antes de firmar',
      'Comprueba que la vivienda se entrega libre de cargas, ocupantes y arrendatarios',
      'Verifica las lecturas de contadores de luz, agua y gas',
      'Confirma que el vendedor está al corriente de IBI y comunidad',
      'Lleva los cheques bancarios por el importe exacto acordado',
      'Recoge todas las llaves, mandos de garaje y el certificado energético',
    ],
  },
  {
    id: 'despues',
    titulo: 'Después de firmar',
    plazo: 'Los 30 días siguientes',
    texto:
      'La compra no acaba en la notaría. Tienes 30 días hábiles para liquidar el ITP o el AJD (modelo 600 o 601 según la comunidad) e inscribir la escritura en el Registro de la Propiedad. La gestoría suele encargarse, pero la responsabilidad última es tuya.',
    checklist: [
      'Liquida el ITP (vivienda usada) o el AJD (obra nueva) en un plazo de 30 días hábiles',
      'Inscribe la escritura en el Registro de la Propiedad',
      'Cambia la titularidad de los suministros (luz, agua, gas) y del IBI',
      'Comunica el cambio de titular a la comunidad de propietarios',
      'Contrata el seguro de hogar (el banco exige al menos el de continente)',
      'Empadrónate en tu nuevo domicilio',
      'Guarda TODAS las facturas de reforma: reducen la ganancia patrimonial si algún día vendes',
      'Comprueba si tu comunidad tiene deducción autonómica por compra de vivienda en el IRPF',
    ],
  },
];

export const QUIEN_PAGA = {
  comprador: [
    'ITP (vivienda usada) o IVA + AJD (obra nueva)',
    'Notaría de la escritura de compraventa',
    'Inscripción de la compraventa en el Registro',
    'Tasación de la vivienda (~300–600 €)',
    'Gestoría de la compraventa (si la contrata)',
    'Nota simple y certificaciones previas',
  ],
  vendedor: [
    'Plusvalía municipal (IIVTNU)',
    'Cancelación registral de su hipoteca previa',
    'Certificado de eficiencia energética',
    'Cuotas de comunidad e IBI hasta la fecha de firma',
    'Comisión de la inmobiliaria (por costumbre)',
  ],
  banco: [
    'AJD del préstamo hipotecario',
    'Notaría de la escritura de préstamo',
    'Registro de la hipoteca',
    'Gestoría del préstamo',
    'Copias de la escritura para el banco',
  ],
};

export const FAQ = [
  {
    q: '¿Cuánto dinero necesito ahorrado de verdad?',
    a: 'En torno al 30 % del precio: un 20 % de entrada (los bancos financian como máximo el 80 % del menor valor entre compra y tasación) más un 8–15 % de impuestos y gastos según la comunidad autónoma. Para una vivienda de 250.000 € eso son unos 75.000 €. Con el aval ICO para menores de 35 años puedes reducir la entrada al 0–5 %, pero seguirás necesitando el dinero de los impuestos.',
  },
  {
    q: '¿Fijo, variable o mixto?',
    a: 'El fijo te da una cuota inmutable durante 30 años: pagas una prima por esa tranquilidad. El variable (euríbor + diferencial) sale más barato si los tipos bajan, pero tu cuota puede subir cientos de euros — el euríbor llegó al 5,4 % en 2008. El mixto combina 5–15 años fijos y el resto variable, y suele ser el más barato de salida. Regla práctica: si una subida del euríbor al 4 % rompería tu economía, ve a fijo.',
  },
  {
    q: '¿Qué es el valor de referencia de Catastro y por qué me importa?',
    a: 'Desde 2022, la base imponible del ITP es el MAYOR entre el precio que pagas y el valor de referencia que el Catastro asigna al inmueble. Si compras por 180.000 € una casa cuyo valor de referencia es 210.000 €, pagas impuestos sobre 210.000 €. Consúltalo gratis en la Sede Electrónica del Catastro antes de ofertar; si es desproporcionado, se puede recurrir.',
  },
  {
    q: '¿Me conviene amortizar anticipadamente?',
    a: 'Depende del tipo de tu hipoteca frente a lo que renta tu dinero. Si tu hipoteca está al 4 % y no tienes inversión segura que supere ese 4 % neto, amortizar es una rentabilidad garantizada. Si está al 1,5 %, el dinero probablemente rinde más en otro sitio. Reducir PLAZO ahorra muchos más intereses que reducir cuota; reducir CUOTA da más aire mensual. Por ley la comisión está limitada (0,15 % o 0,25 % en fijo según el año; 0,10 %/0,05 % en variable, y 0 % pasados los primeros años).',
  },
  {
    q: '¿Qué es el aval ICO para jóvenes?',
    a: 'Es una garantía pública que cubre hasta el 20 % del importe de la vivienda, para que el banco financie hasta el 100 % en lugar del 80 %. Requisitos generales: tener menos de 35 años (o menores a cargo), que sea primera vivienda habitual, ingresos inferiores a 37.800 € anuales (más límite ampliado si hay dos titulares o menores) y precio de vivienda dentro del límite fijado. Ojo: te ahorra la entrada, no los impuestos, y pagarás más intereses porque financias más.',
  },
  {
    q: '¿Puedo negociar el precio de una vivienda?',
    a: 'Casi siempre. El margen medio de negociación en España ronda el 5–10 % sobre el precio de anuncio, y sube si el inmueble lleva más de 6 meses publicado o necesita reforma. Argumenta con datos: precio por m² de operaciones cerradas en la zona, defectos detectados, presupuesto de reforma y derramas pendientes. Tener la preaprobación del banco por escrito es tu mejor palanca.',
  },
  {
    q: '¿Qué pasa si me deniegan la hipoteca después de firmar las arras?',
    a: 'Si el contrato de arras no incluye una cláusula de condición suspensiva por no obtención de financiación, pierdes la señal entregada. Por eso hay que incluirla SIEMPRE y, mejor aún, llevar la preaprobación bancaria antes de firmar arras. Redacta la cláusula pidiendo denegación por escrito de al menos dos entidades en un plazo determinado.',
  },
  {
    q: '¿Merece la pena contratar los seguros del banco?',
    a: 'Calcula. Un banco te baja 0,50 puntos el TIN a cambio de seguros de hogar y vida que pueden costar 700 €/año frente a los 350 € que pagarías fuera. En un préstamo de 150.000 € esa bonificación ahorra menos que el sobrecoste. La ley te permite contratar en cualquier aseguradora con coberturas equivalentes, aunque el banco puede retirar la bonificación. Compara siempre por TAE con vinculaciones incluidas.',
  },
];
