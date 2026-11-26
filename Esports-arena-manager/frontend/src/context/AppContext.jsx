import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  juegosService,
  torneosService,
  usuariosService,
  equiposService,
  inscripcionesService,
  partidasService,
  resultadosService,
  premiosService,
  sancionesService,
} from '../services/arena'
import { construirModelo, adaptarEquipo } from '../services/adaptadores'

/**
 * Contexto de datos: ahora los datos vienen de los microservicios (antes, de datos.js).
 *
 * - Al montar, useEffect pide todo en paralelo a la API (sesión 1: estados de carga, error y datos).
 * - Se usa Promise.allSettled: si un microservicio está caído, el resto de la app sigue funcionando
 *   y se informa qué servicio falló.
 * - Las acciones (inscribir, crear equipo...) llaman al backend y luego recargan los datos.
 *
 * Solo las vistas leen este contexto; los componentes de presentación reciben todo por props.
 */
const AppContext = createContext(null)

const FUENTES = {
  juegos: { servicio: juegosService, nombre: 'juegos (game-service)' },
  torneos: { servicio: torneosService, nombre: 'torneos (tournament-service)' },
  usuarios: { servicio: usuariosService, nombre: 'usuarios (user-service)' },
  equipos: { servicio: equiposService, nombre: 'equipos (team-service)' },
  inscripciones: { servicio: inscripcionesService, nombre: 'inscripciones (registration-service)' },
  partidas: { servicio: partidasService, nombre: 'partidas (match-service)' },
  resultados: { servicio: resultadosService, nombre: 'resultados (result-service)' },
  premios: { servicio: premiosService, nombre: 'premios (prize-service)' },
  sanciones: { servicio: sancionesService, nombre: 'sanciones (sanction-service)' },
}

const MODELO_VACIO = construirModelo({})

export function AppProvider({ children }) {
  const [crudo, setCrudo] = useState({})
  const [cargando, setCargando] = useState(true)
  const [errores, setErrores] = useState([])

  const cargar = useCallback(async (signal) => {
    const claves = Object.keys(FUENTES)
    const respuestas = await Promise.allSettled(
      claves.map((clave) => FUENTES[clave].servicio.listar({ signal, publica: true }))
    )
    if (signal?.aborted) return
    const datos = {}
    const fallas = []
    respuestas.forEach((r, i) => {
      const clave = claves[i]
      if (r.status === 'fulfilled') datos[clave] = Array.isArray(r.value) ? r.value : []
      else if (r.reason?.name !== 'AbortError') fallas.push(`${FUENTES[clave].nombre}: ${r.reason?.message}`)
    })
    setCrudo((anterior) => ({ ...anterior, ...datos }))
    setErrores(fallas)
    setCargando(false)
  }, [])

  // Carga inicial al montar; la limpieza cancela las peticiones (StrictMode monta dos veces)
  useEffect(() => {
    const control = new AbortController()
    cargar(control.signal)
    return () => control.abort()
  }, [cargar])

  const recargar = useCallback(() => cargar(), [cargar])

  const modelo = useMemo(() => (cargando && !crudo.torneos ? MODELO_VACIO : construirModelo(crudo)), [crudo, cargando])

  // ---- Acciones: cada una es un manejador de eventos (no necesita useEffect) ----

  const agregarInscripcion = async ({ torneoId, participanteTipo, participanteId }) => {
    const individual = participanteTipo === 'jugador'
    const creada = await inscripcionesService.crear({
      torneoId: Number(torneoId),
      tipoParticipante: individual ? 'INDIVIDUAL' : 'EQUIPO',
      jugadorId: individual ? Number(participanteId) : null,
      equipoId: individual ? null : Number(participanteId),
    })
    await recargar()
    return creada
  }

  const cancelarInscripcion = async (id) => {
    await inscripcionesService.cancelar(id)
    await recargar()
  }

  const crearEquipo = async ({ nombre, juegoId, capitanId }) => {
    const creado = await equiposService.crear({
      nombre: nombre.trim(),
      juegoPrincipalId: Number(juegoId),
      capitanId: Number(capitanId),
      integrantes: [],
    })
    await recargar()
    return adaptarEquipo(creado)
  }

  const agregarIntegrante = async (equipoId, jugadorId, rol = 'Jugador/a') => {
    await equiposService.agregarMiembro(Number(equipoId), Number(jugadorId), rol)
    await recargar()
  }

  const quitarIntegrante = async (equipoId, jugadorId) => {
    await equiposService.quitarMiembro(Number(equipoId), Number(jugadorId))
    await recargar()
  }

  const actualizarApodo = async (jugadorId, nuevoApodo) => {
    await usuariosService.actualizar(Number(jugadorId), { nickname: nuevoApodo.trim() })
    await recargar()
  }

  const valor = {
    ...modelo,
    crudo,
    cargando,
    errores,
    recargar,
    agregarInscripcion,
    cancelarInscripcion,
    crearEquipo,
    agregarIntegrante,
    quitarIntegrante,
    actualizarApodo,
  }

  return <AppContext value={valor}>{children}</AppContext>
}

export function useApp() {
  const contexto = useContext(AppContext)
  if (!contexto) {
    throw new Error('useApp debe ser usado dentro de un AppProvider')
  }
  return contexto
}
