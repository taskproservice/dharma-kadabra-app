/**
 * Contenido editorial de la página «Lectura de Registros Akáshicos».
 *
 * Los componentes de `components/akashic/` solo presentan estos textos:
 * para ajustar la página se edita este archivo, sin tocar los componentes.
 *
 * NOTA PARA LA AUTORA — secciones 03 (Método) y 07 (FAQ):
 * el documento de especificación técnica no llegó como texto adjunto a esta
 * sesión, así que el método y las 6 preguntas/respuestas de abajo son un
 * borrador editorial fiel al tono de la casa (sereno, humano, sin juicios).
 * Pega aquí el texto exacto del documento (§03 y §07) y la página lo
 * adoptará sin ningún otro cambio.
 */

/** Id del servicio en la agenda: es el `serviceId` que recibe la API. */
export const akashicServiceId = "registros-akashicos" as const;

/** Imágenes de la página. Archivos en `public/images/akashic/`. */
export const akashicImages = {
  hero: "/images/akashic/meditacion-amanecer.jpg",
  introduction: "/images/akashic/manuscritos-palma.jpg",
  method: "/images/akashic/manuscrito-mesa.jpg",
  benefits: "/images/akashic/altar-cuarzo.jpg",
  editorial: "/images/akashic/bosque-luz.jpg",
  process: "/images/akashic/diario-vela.jpg",
  experience: "/images/akashic/espacio-calma.jpg",
  experienceDetail: "/images/akashic/mujer-ventana.jpg",
  faq: "/images/akashic/libro-vela.jpg",
  booking: "/images/akashic/pergamino-escritura.jpg",
} as const;

export const akashicContent = {
  hero: {
    eyebrow: "Dharma Kadabra · La memoria del alma",
    titleTop: "La memoria",
    titleBottom: "del alma",
    subtitle:
      "Todo lo que tu alma ha vivido y aprendido habita en una memoria sutil. Abrimos ese espacio para escuchar sus respuestas, traer luz a tus encrucijadas y reconectar con tu verdad interior.",
    primaryCta: "Reservar mi lectura",
    secondaryCta: "Conocer la tradición",
    secondaryHref: "#introduccion",
    meta: ["60 minutos", "Lectura guiada", "Sesión en línea"],
    glyphs: "✧ ✧ ✧",
  },

  introduction: {
    eyebrow: "02 · Introducción",
    titleLead: "Donde tu alma guarda",
    titleAccent: "su historia.",
    paragraphs: [
      "En la tradición india, «Akasha» nombra el espacio sutil, el éter del que todo emerge. Los Registros Akáshicos son, en esa mirada, la memoria de lo que el alma ha vivido y aprendido a lo largo de su recorrido: experiencias, vínculos, lecciones y dones que permanecen más allá del tiempo.",
      "No se trata de un archivo cerrado ni de un destino escrito. Es una memoria viva a la que se accede en silencio, con una pregunta honesta y la disposición de escuchar. La lectura no impone respuestas: acompaña el momento en que decides mirar tu propia historia con otros ojos.",
    ],
    editorialNote:
      "Conocer el origen de una tradición también es una forma de honrar su profundidad",
    editorialNoteLabel: "Nota editorial",
    imageCaption: "Manuscritos de hoja de palma · La memoria escrita de una tradición",
    stats: [
      { value: "60 min", label: "Duración de la sesión" },
      { value: "1 : 1", label: "Lectura guiada" },
      { value: "20 %", label: "Anticipo para reservar" },
    ],
  },

  method: {
    eyebrow: "03 · Método",
    titleLead: "Un método sereno para",
    titleAccent: "abrir el registro.",
    intro:
      "La sesión sigue un recorrido sencillo y cuidado, pensado para que puedas llegar, respirar y escuchar sin prisa.",
    steps: [
      {
        number: "01",
        title: "Intención",
        text: "Comenzamos nombrando lo que te trae: una pregunta, un momento de encrucijada o simplemente la curiosidad de escuchar tu memoria.",
      },
      {
        number: "02",
        title: "Meditación guiada",
        text: "Con una respiración pausada y un espacio en calma, descendemos al silencio donde la memoria del alma se vuelve audible.",
      },
      {
        number: "03",
        title: "Escucha y lectura",
        text: "Comparto lo que emerge — imágenes, palabras, sensaciones — y lo exploramos juntos, sin juicios y sin imponer significados.",
      },
      {
        number: "04",
        title: "Integración",
        text: "Cerramos traduciendo lo escuchado a tu vida presente: qué mirar, qué soltar y qué paso dar con lo que ahora comprendes.",
      },
    ],
    note: "El método se adapta a tu ritmo: si necesitas detenerte, respirar o reformular tu pregunta, el espacio lo permite.",
    imageCaption: "Manuscrito antiguo a la luz de la vela · El registro que se abre",
  },

  benefits: {
    eyebrow: "04 · Beneficios",
    titleLead: "Lo que una lectura puede",
    titleAccent: "iluminar.",
    intro:
      "Cada lectura es distinta, pero hay frutos que se repiten cuando el alma es escuchada con atención.",
    items: [
      {
        icon: "compass",
        title: "Claridad en encrucijadas",
        text: "Ver con más nitidez las opciones que tienes delante y las que vienes evitando mirar.",
      },
      {
        icon: "heart",
        title: "Comprensión de patrones",
        text: "Reconocer los vínculos y las situaciones que se repiten, y el aprendizaje que guardan.",
      },
      {
        icon: "sparkles",
        title: "Conexión interior",
        text: "Volver a sentir tu verdad más profunda, esa voz serena que el ruido cotidiano tapa.",
      },
      {
        icon: "shield",
        title: "Cierre y alivio",
        text: "Soltar cargas antiguas con compasión y hacer lugar para una etapa más ligera.",
      },
    ],
    disclaimer:
      "La lectura es un espacio de acompañamiento y reflexión. No sustituye el consejo médico, psicológico o legal, ni decide por ti.",
    imageCaption: "Altar sereno con cuarzo y velas · El espacio de la escucha",
  },

  editorial: {
    quote: "La memoria del alma no se borra: se escucha.",
  },

  process: {
    eyebrow: "05 · Proceso",
    titleLead: "Tu sesión,",
    titleAccent: "paso a paso.",
    intro:
      "Reservar y prepararte es parte del ritual. Así transcurre el encuentro, de principio a fin.",
    phases: [
      {
        number: "01",
        title: "Antes",
        text: "Reserva con un anticipo del 20 % y elige fecha y horario. Te confirmaremos por correo y WhatsApp. Busca un lugar sin ruido, con audífonos, agua y algo para escribir.",
      },
      {
        number: "02",
        title: "Durante · 60 minutos",
        text: "Nos encontramos por videollamada. Tras una breve conversación, guiamos la meditación y abrimos el registro con tus preguntas.",
      },
      {
        number: "03",
        title: "Después",
        text: "Te llevas lo escuchado para integrarlo a tu ritmo. Si en los días siguientes surge algo, puedes escribirnos y lo conversamos.",
      },
    ],
    imageCaption: "Diario, vela y mala · Preparar el espacio antes de escuchar",
  },

  experience: {
    eyebrow: "06 · Experiencia",
    titleLead: "Un espacio para escucharte",
    titleAccent: "sin juicios.",
    paragraphs: [
      "No necesitas llegar con las preguntas perfectas ni con una historia ordenada. Puedes llegar tal como estás: con dudas, con cansancio, con una alegría que aún no sabes nombrar.",
      "Durante la sesión no hay respuestas correctas ni caminos obligatorios. Lo que emerge se ofrece como una posibilidad para mirar, no como una sentencia. Tú decides qué tomar, qué dejar y cuándo actuar.",
      "Al salir, la mayoría describe lo mismo: la sensación de haber vuelto a casa dentro de sí.",
    ],
    quote: "La memoria no te juzga: te recuerda quién eres.",
    imageCaption: "Espacio de calma · Donde la escucha se vuelve posible",
    detailCaption: "Mirar la propia historia con otros ojos",
  },

  faq: {
    eyebrow: "07 · Preguntas frecuentes",
    titleLead: "Antes de tu",
    titleAccent: "lectura.",
    intro:
      "Las dudas más comunes, respondidas con calma. Si la tuya no está aquí, escríbenos y la conversamos.",
    items: [
      {
        question: "¿Qué son los Registros Akáshicos?",
        answer:
          "Son, en la tradición india, la memoria sutil de lo que el alma ha vivido y aprendido. En la sesión accedemos a esa memoria en un estado de meditación guiada para escuchar sus respuestas con calma y sin juicios.",
      },
      {
        question: "¿Necesito preparar algo antes de la sesión?",
        answer:
          "Solo un espacio tranquilo, audífonos y algo para escribir. Puedes traer tus preguntas anotadas, aunque no es obligatorio: muchas veces la pregunta más importante aparece durante la sesión.",
      },
      {
        question: "¿La sesión es presencial o en línea?",
        answer:
          "Es en línea, por videollamada. Al reservar recibirás el enlace por correo y WhatsApp. Busca un lugar sin ruido donde puedas estar a solas durante los 60 minutos.",
      },
      {
        question: "¿Puedo preguntar sobre cualquier tema?",
        answer:
          "Sí. Puedes preguntar por vínculos, decisiones, momentos de encrucijada o por patrones que se repiten en tu vida. La lectura ofrece una mirada, no una sentencia: la decisión siempre es tuya.",
      },
      {
        question: "¿Y si no sé qué preguntar?",
        answer:
          "No hay problema. Empezamos conversando sobre lo que te trae y, si lo deseas, formulamos juntos una pregunta. También puedes simplemente abrir el espacio y escuchar lo que la memoria quiera mostrar.",
      },
      {
        question: "¿Cómo reservo y qué pasa con mi anticipo?",
        answer:
          "Eliges fecha y horario y apartas tu lugar con un anticipo del 20 %. Tu cita queda pendiente hasta que el pago se acredite; entonces la confirmamos por correo y WhatsApp. Puedes ver tus reservas en Mi Cuenta.",
      },
    ],
  },

  booking: {
    eyebrow: "08 · Reserva",
    titleLead: "Tu alma ya guarda",
    titleAccent: "las respuestas.",
    text: "Reserva tu lectura de 60 minutos y abre el espacio para escuchar tu memoria con calma.",
    cta: "Reservar mi lectura",
  },
} as const;
