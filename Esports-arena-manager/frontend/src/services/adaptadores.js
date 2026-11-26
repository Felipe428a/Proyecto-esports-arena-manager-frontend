/**
 * Adaptadores: convierten los JSON de los microservicios al modelo que ya usaban las vistas
 * y la lógica pura del frontend (src/logica). Así la lógica y sus pruebas no cambian:
 * solo cambia de dónde vienen los datos (antes datos.js, ahora la API REST).
 *
 * Son funciones puras (sin fetch): se prueban en adaptadores.spec.js.
 */

/** '2026-09-15T23:59:00' → '2026-09-15' (las vistas muestran fechas sin hora) */
export function soloFecha(valor) {
  if (!valor) return null
  return String(valor).slice(0, 10)
}

/** 'EN_CURSO' → 'en_curso' */
export function estadoMinuscula(estado) {
  return estado ? String(estado).toLowerCase() : ''
}

export function adaptarJuego(j) {
  const individual = String(j.modalidad || '').toUpperCase() === 'INDIVIDUAL'
  return {
    id: j.id,
    nombre: j.nombre,
    modalidad: individual ? 'Individual' : 'Equipos',
    integrantesPorEquipo: j.jugadoresPorEquipo ?? 1,
    categoria: j.genero,
    reglas: j.reglasGenerales || '',
    activo: j.estado === 'ACTIVO',
    estado: j.estado,
  }
}

export function adaptarSancion(s, hoy = new Date()) {
  const fin = soloFecha(s.fechaFin)
  const vigentePorFecha = !fin || new Date(`${fin}T23:59:59`) >= hoy
  return {
    id: s.id,
    usuarioId: s.usuarioId ?? null,
    equipoId: s.equipoId ?? null,
    motivo: s.motivo,
    severidad: s.severidad,
    estado: s.estado,
    fechaInicio: soloFecha(s.fechaInicio),
    fechaFin: fin,
    activa: s.estado === 'ACTIVA' && vigentePorFecha,
  }
}

export function adaptarEquipo(e) {
  return {
    id: e.id,
    nombre: e.nombre,
    juegoId: e.juegoPrincipalId,
    capitanId: e.capitanId,
    activo: e.estado === 'ACTIVO',
    estado: e.estado,
    integrantes: (e.integrantes || []).map((m) => ({
      jugadorId: m.usuarioId,
      rol: m.rolDentroEquipo === 'CAPITAN' ? 'Capitán/a' : m.rolDentroEquipo,
    })),
  }
}

export function adaptarInscripcion(i) {
  const individual = i.tipoParticipante === 'INDIVIDUAL'
  return {
    id: i.id,
    torneoId: i.torneoId,
    participanteTipo: individual ? 'jugador' : 'equipo',
    participanteId: individual ? i.jugadorId : i.equipoId,
    fecha: soloFecha(i.fechaInscripcion),
    estado: estadoMinuscula(i.estado),
  }
}

export function adaptarPremio(p) {
  const valor = Number(p.valor) || 0
  const monto = valor > 0 ? ` + $${valor.toLocaleString('es-CL')}` : ''
  return { id: p.id, posicion: p.posicion, premio: `${p.descripcion}${monto}`, estado: p.estado }
}

export function adaptarTorneo(t, inscripciones = [], premios = []) {
  const cupoOcupado = inscripciones.filter((i) => i.torneoId === t.id && i.estado !== 'cancelada').length
  return {
    id: t.id,
    nombre: t.nombre,
    juegoId: t.juegoId,
    estado: estadoMinuscula(t.estado),
    modalidad: estadoMinuscula(t.modalidad),
    cupoMax: t.cupoMaximo,
    cupoOcupado,
    fechaCierreInscripcion: soloFecha(t.fechaCierreInscripcion),
    fechaInicio: soloFecha(t.fechaInicio),
    fechaFin: soloFecha(t.fechaFin),
    descripcion: t.descripcion || '',
    premios: premios
      .filter((p) => p.torneoId === t.id && p.estado !== 'INACTIVO')
      .map(adaptarPremio)
      .sort((a, b) => a.posicion - b.posicion),
  }
}

const ESTADO_PARTIDA = { FINALIZADA: 'jugada', JUGADA: 'jugada', PROGRAMADA: 'programada', CANCELADA: 'cancelada', EN_CURSO: 'en_curso' }

/**
 * Una partida guarda solo ids (participanteAId/BId). Según la modalidad del torneo,
 * esos ids son de equipos o de jugadores: aquí se resuelven sus nombres.
 */
export function adaptarPartida(p, { torneosCrudos = [], equipos = [], usuarios = [], resultados = [] } = {}) {
  const torneo = torneosCrudos.find((t) => t.id === p.torneoId)
  const tipo = String(torneo?.modalidad || '').toUpperCase() === 'INDIVIDUAL' ? 'jugador' : 'equipo'
  const nombreDe = (id) => {
    if (id == null) return 'Por definir'
    const fuente = tipo === 'equipo' ? equipos : usuarios
    return fuente.find((x) => x.id === id)?.nombre ?? 'Por definir'
  }
  const resultado = resultados
    .filter((r) => r.partidaId === p.id && r.estadoValidacion !== 'ANULADO')
    .sort((a, b) => (a.estadoValidacion === 'VALIDADO' ? -1 : 1) - (b.estadoValidacion === 'VALIDADO' ? -1 : 1))[0]
  return {
    id: p.id,
    torneoId: p.torneoId,
    ronda: p.ronda,
    estado: ESTADO_PARTIDA[p.estado] || estadoMinuscula(p.estado),
    horario: p.fechaHora,
    participanteA: { tipo, id: p.participanteAId, nombre: nombreDe(p.participanteAId) },
    participanteB: { tipo, id: p.participanteBId, nombre: nombreDe(p.participanteBId) },
    resultado: resultado
      ? {
          id: resultado.id,
          puntajeA: resultado.puntajeA,
          puntajeB: resultado.puntajeB,
          ganadorId: resultado.ganadorId,
          ganadorNombre: nombreDe(resultado.ganadorId),
          validado: resultado.estadoValidacion === 'VALIDADO',
        }
      : null,
  }
}

/** Victorias y derrotas de un jugador: sus partidas individuales y las de los equipos que integra. */
export function calcularEstadisticas(jugadorId, partidas = [], equipos = []) {
  const misEquipos = equipos.filter((e) => e.integrantes.some((i) => i.jugadorId === jugadorId)).map((e) => e.id)
  const participa = (lado) =>
    lado && (lado.tipo === 'jugador' ? lado.id === jugadorId : misEquipos.includes(lado.id))
  let victorias = 0
  let derrotas = 0
  partidas.forEach((p) => {
    if (!p.resultado) return
    const lado = participa(p.participanteA) ? p.participanteA : participa(p.participanteB) ? p.participanteB : null
    if (!lado) return
    if (p.resultado.ganadorId === lado.id) victorias += 1
    else derrotas += 1
  })
  return { victorias, derrotas }
}

export function adaptarJugador(u, { equipos = [], partidas = [], sanciones = [] } = {}) {
  return {
    id: u.id,
    nombre: u.nombre,
    apodo: u.nickname,
    email: u.email,
    rol: u.rol,
    estado: u.estado,
    equipos: equipos.filter((e) => e.integrantes.some((i) => i.jugadorId === u.id)).map((e) => e.id),
    estadisticas: calcularEstadisticas(u.id, partidas, equipos),
    sanciones: sanciones.filter((s) => s.usuarioId === u.id),
  }
}

/**
 * Arma el modelo completo de la aplicación a partir de las respuestas crudas de cada microservicio.
 * Las inscripciones canceladas no cuentan para cupos ni para "ya inscrito".
 */
export function construirModelo(crudo = {}, hoy = new Date()) {
  const {
    juegos = [], torneos = [], usuarios = [], equipos = [], inscripciones = [],
    partidas = [], resultados = [], premios = [], sanciones = [],
  } = crudo

  const equiposA = equipos.map(adaptarEquipo)
  const inscripcionesA = inscripciones.map(adaptarInscripcion).filter((i) => i.estado !== 'cancelada')
  const sancionesA = sanciones.map((s) => adaptarSancion(s, hoy))
  const partidasA = partidas.map((p) =>
    adaptarPartida(p, { torneosCrudos: torneos, equipos: equiposA, usuarios, resultados })
  )
  const usuariosA = usuarios.map((u) =>
    adaptarJugador(u, { equipos: equiposA, partidas: partidasA, sanciones: sancionesA })
  )

  return {
    juegos: juegos.map(adaptarJuego),
    torneos: torneos.map((t) => adaptarTorneo(t, inscripcionesA, premios)),
    usuarios: usuariosA,
    jugadores: usuariosA.filter((u) => u.rol === 'JUGADOR'),
    equipos: equiposA,
    inscripciones: inscripcionesA,
    partidas: partidasA,
    sanciones: sancionesA,
  }
}
