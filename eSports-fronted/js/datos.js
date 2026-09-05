const JUEGOS = [
  { id: 1, nombre: "Cripta Cero", modalidad: "Equipos", integrantesPorEquipo: 5, categoria: "Shooter táctico" },
  { id: 2, nombre: "Trono de Runas", modalidad: "Equipos", integrantesPorEquipo: 5, categoria: "MOBA" },
  { id: 3, nombre: "Velocidad Máxima", modalidad: "Individual", integrantesPorEquipo: 1, categoria: "Carreras" },
  { id: 4, nombre: "Puños de Acero", modalidad: "Individual", integrantesPorEquipo: 1, categoria: "Lucha" }
];

const JUGADORES = [
  {
    id: 1, nombre: "Camila Rojas", apodo: "camro", email: "camila.rojas@arena.cl",
    equipos: [1], estadisticas: { victorias: 14, derrotas: 6 },
    sanciones: [{ motivo: "Ausencia sin aviso", activa: false, fechaFin: "2026-05-10" }]
  },
  {
    id: 2, nombre: "Ignacio Pizarro", apodo: "ignapz", email: "ignacio.pizarro@arena.cl",
    equipos: [1], estadisticas: { victorias: 9, derrotas: 11 }, sanciones: []
  },
  {
    id: 3, nombre: "Fernanda Soto", apodo: "fersoto", email: "fernanda.soto@arena.cl",
    equipos: [1], estadisticas: { victorias: 20, derrotas: 4 }, sanciones: []
  },
  {
    id: 4, nombre: "Benjamín Muñoz", apodo: "benmz", email: "benjamin.munoz@arena.cl",
    equipos: [2], estadisticas: { victorias: 3, derrotas: 2 },
    sanciones: [{ motivo: "Lenguaje ofensivo en chat", activa: true, fechaFin: "2026-09-20" }]
  },
  {
    id: 5, nombre: "Valentina Reyes", apodo: "valreyes", email: "valentina.reyes@arena.cl",
    equipos: [2], estadisticas: { victorias: 7, derrotas: 5 }, sanciones: []
  },
  {
    id: 6, nombre: "Tomás Vidal", apodo: "tvidal", email: "tomas.vidal@arena.cl",
    equipos: [], estadisticas: { victorias: 11, derrotas: 8 }, sanciones: []
  },
  {
    id: 7, nombre: "Antonia Fuentes", apodo: "antof", email: "antonia.fuentes@arena.cl",
    equipos: [3], estadisticas: { victorias: 5, derrotas: 1 }, sanciones: []
  },
  {
    id: 8, nombre: "Matías Contreras", apodo: "maticon", email: "matias.contreras@arena.cl",
    equipos: [3], estadisticas: { victorias: 2, derrotas: 6 }, sanciones: []
  }
];

const EQUIPOS = [
  {
    id: 1, nombre: "Escuadrón Nocturno", juegoId: 1, capitanId: 3, activo: true,
    integrantes: [
      { jugadorId: 1, rol: "Asaltante" },
      { jugadorId: 2, rol: "Francotirador" },
      { jugadorId: 3, rol: "Capitana / Estratega" }
    ]
  },
  {
    id: 2, nombre: "Runas del Alba", juegoId: 2, capitanId: 5, activo: true,
    integrantes: [
      { jugadorId: 4, rol: "Línea superior" },
      { jugadorId: 5, rol: "Capitana / Soporte" }
    ]
  },
  {
    id: 3, nombre: "Pista Roja Racing", juegoId: 3, capitanId: 7, activo: false,
    integrantes: [
      { jugadorId: 7, rol: "Capitana / Piloto" },
      { jugadorId: 8, rol: "Piloto suplente" }
    ]
  }
];

const TORNEOS = [
  {
    id: 1, nombre: "Copa Arena Apertura", juegoId: 1, estado: "abierto",
    cupoMax: 8, cupoOcupado: 5,
    fechaCierreInscripcion: "2026-09-15", fechaInicio: "2026-09-22",
    descripcion: "Torneo de apertura de temporada para equipos de Cripta Cero, formato de eliminación directa.",
    premios: []
  },
  {
    id: 2, nombre: "Liga de Runas Otoño", juegoId: 2, estado: "en_curso",
    cupoMax: 6, cupoOcupado: 6,
    fechaCierreInscripcion: "2026-08-20", fechaInicio: "2026-08-28",
    descripcion: "Fase de grupos seguida de semifinales y final para equipos de Trono de Runas.",
    premios: []
  },
  {
    id: 3, nombre: "Gran Premio Velocidad Máxima", juegoId: 3, estado: "abierto",
    cupoMax: 12, cupoOcupado: 9,
    fechaCierreInscripcion: "2026-09-10", fechaInicio: "2026-09-18",
    descripcion: "Clasificatoria individual con parrilla de 12 pilotos rumbo al campeonato regional.",
    premios: []
  },
  {
    id: 4, nombre: "Torneo Puños de Invierno", juegoId: 4, estado: "finalizado",
    cupoMax: 16, cupoOcupado: 16,
    fechaCierreInscripcion: "2026-06-01", fechaInicio: "2026-06-08",
    descripcion: "Bracket individual a doble eliminación para jugadores de Puños de Acero.",
    premios: [
      { posicion: 1, premio: "Trofeo Arena + $300.000" },
      { posicion: 2, premio: "$150.000" },
      { posicion: 3, premio: "$80.000" }
    ]
  },
  {
    id: 5, nombre: "Clásico Nocturno Cripta Cero", juegoId: 1, estado: "finalizado",
    cupoMax: 4, cupoOcupado: 4,
    fechaCierreInscripcion: "2026-05-01", fechaInicio: "2026-05-05",
    descripcion: "Torneo relámpago de fin de semana entre equipos invitados.",
    premios: [
      { posicion: 1, premio: "Trofeo Nocturno + $200.000" },
      { posicion: 2, premio: "$90.000" }
    ]
  },
  {
    id: 6, nombre: "Copa Runas Rápidas", juegoId: 2, estado: "abierto",
    cupoMax: 8, cupoOcupado: 2,
    fechaCierreInscripcion: "2026-09-25", fechaInicio: "2026-10-02",
    descripcion: "Formato exprés a un solo mapa por enfrentamiento, ideal para equipos nuevos.",
    premios: []
  }
];

/** Inscripciones vigentes. */
const INSCRIPCIONES = [
  { id: 1, torneoId: 1, participanteTipo: "equipo", participanteId: 1, fecha: "2026-08-25" },
  { id: 2, torneoId: 2, participanteTipo: "equipo", participanteId: 2, fecha: "2026-08-10" },
  { id: 3, torneoId: 3, participanteTipo: "jugador", participanteId: 7, fecha: "2026-08-29" }
];

/** Partidas por torneo y ronda. */
const PARTIDAS = [
  {
    id: 1, torneoId: 2, ronda: 1, estado: "jugada",
    horario: "2026-08-28T18:00:00",
    participanteA: { tipo: "equipo", id: 2, nombre: "Runas del Alba" },
    participanteB: { tipo: "equipo", id: null, nombre: "Vanguardia Escarlata" },
    resultado: { puntajeA: 2, puntajeB: 1, ganadorNombre: "Runas del Alba" }
  },
  {
    id: 2, torneoId: 2, ronda: 2, estado: "programada",
    horario: "2026-09-05T18:00:00",
    participanteA: { tipo: "equipo", id: 2, nombre: "Runas del Alba" },
    participanteB: { tipo: "equipo", id: null, nombre: "Por definir" },
    resultado: null
  },
  {
    id: 3, torneoId: 4, ronda: 1, estado: "jugada",
    horario: "2026-06-08T15:00:00",
    participanteA: { tipo: "jugador", id: 6, nombre: "Tomás Vidal" },
    participanteB: { tipo: "jugador", id: null, nombre: "Rocío Álvarez" },
    resultado: { puntajeA: 3, puntajeB: 1, ganadorNombre: "Tomás Vidal" }
  },
  {
    id: 4, torneoId: 4, ronda: 2, estado: "jugada",
    horario: "2026-06-08T17:30:00",
    participanteA: { tipo: "jugador", id: 6, nombre: "Tomás Vidal" },
    participanteB: { tipo: "jugador", id: null, nombre: "Elías Bravo" },
    resultado: { puntajeA: 2, puntajeB: 3, ganadorNombre: "Elías Bravo" }
  }
];
