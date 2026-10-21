import { createContext, useContext, useState } from 'react'
import {
  JUEGOS_INICIALES,
  JUGADORES_INICIALES,
  EQUIPOS_INICIALES,
  TORNEOS_INICIALES,
  INSCRIPCIONES_INICIALES,
  PARTIDAS_INICIALES,
} from '../data/datos'

/**
 * Contexto de datos de la aplicación: entidades (juegos, jugadores, equipos, torneos,
 * inscripciones, partidas) y las acciones que las modifican.
 *
 * La NAVEGACIÓN ya no vive aquí: la maneja react-router (ver App.jsx). Antes este archivo
 * mezclaba datos con un enrutador hecho a mano sobre window.location.hash.
 *
 * Solo las vistas (src/components/vistas) leen este contexto. Los componentes de
 * presentación reciben todo por props, lo que permite probarlos sin un Provider.
 */
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [juegos] = useState(JUEGOS_INICIALES)
  const [jugadores, setJugadores] = useState(JUGADORES_INICIALES)
  const [equipos, setEquipos] = useState(EQUIPOS_INICIALES)
  const [torneos, setTorneos] = useState(TORNEOS_INICIALES)
  const [inscripciones, setInscripciones] = useState(INSCRIPCIONES_INICIALES)
  const [partidas] = useState(PARTIDAS_INICIALES)

  const agregarInscripcion = ({ torneoId, participanteTipo, participanteId }) => {
    const torneoNum = Number(torneoId)
    const participanteNum = Number(participanteId)
    const hoy = new Date()
    const dos = (n) => String(n).padStart(2, '0')
    // Fecha local (toISOString devolvería la fecha UTC y de noche marcaría "mañana")
    const fecha = `${hoy.getFullYear()}-${dos(hoy.getMonth() + 1)}-${dos(hoy.getDate())}`

    const nuevaInscripcion = {
      id: Math.max(...inscripciones.map((i) => i.id), 0) + 1,
      torneoId: torneoNum,
      participanteTipo,
      participanteId: participanteNum,
      fecha,
    }

    setInscripciones((prev) => [...prev, nuevaInscripcion])

    setTorneos((prev) =>
      prev.map((t) => (t.id === torneoNum ? { ...t, cupoOcupado: t.cupoOcupado + 1 } : t))
    )

    return nuevaInscripcion
  }

  const crearEquipo = ({ nombre, juegoId, capitanId }) => {
    const nuevoId = Math.max(...equipos.map((e) => e.id), 0) + 1
    const juegoNum = Number(juegoId)
    const capitanNum = Number(capitanId)

    const nuevoEquipo = {
      id: nuevoId,
      nombre: nombre.trim(),
      juegoId: juegoNum,
      capitanId: capitanNum,
      activo: true,
      integrantes: [{ jugadorId: capitanNum, rol: 'Capitán/a' }],
    }

    setEquipos((prev) => [...prev, nuevoEquipo])

    // Agregar equipo al jugador
    setJugadores((prev) =>
      prev.map((j) =>
        j.id === capitanNum && !j.equipos.includes(nuevoId)
          ? { ...j, equipos: [...j.equipos, nuevoId] }
          : j
      )
    )

    return nuevoEquipo
  }

  const agregarIntegrante = (equipoId, jugadorId, rol = 'Jugador/a') => {
    const equipoNum = Number(equipoId)
    const jugadorNum = Number(jugadorId)

    setEquipos((prev) =>
      prev.map((e) => {
        if (e.id !== equipoNum) return e
        if (e.integrantes.some((i) => i.jugadorId === jugadorNum)) return e
        return { ...e, integrantes: [...e.integrantes, { jugadorId: jugadorNum, rol }] }
      })
    )

    setJugadores((prev) =>
      prev.map((j) =>
        j.id === jugadorNum && !j.equipos.includes(equipoNum)
          ? { ...j, equipos: [...j.equipos, equipoNum] }
          : j
      )
    )
  }

  const quitarIntegrante = (equipoId, jugadorId) => {
    const equipoNum = Number(equipoId)
    const jugadorNum = Number(jugadorId)

    setEquipos((prev) =>
      prev.map((e) =>
        e.id === equipoNum
          ? { ...e, integrantes: e.integrantes.filter((i) => i.jugadorId !== jugadorNum) }
          : e
      )
    )

    setJugadores((prev) =>
      prev.map((j) =>
        j.id === jugadorNum ? { ...j, equipos: j.equipos.filter((id) => id !== equipoNum) } : j
      )
    )
  }

  const actualizarApodo = (jugadorId, nuevoApodo) => {
    const jugadorNum = Number(jugadorId)
    const apodoLimpio = nuevoApodo.trim()

    setJugadores((prev) =>
      prev.map((j) => (j.id === jugadorNum ? { ...j, apodo: apodoLimpio } : j))
    )
  }

  const valor = {
    juegos,
    jugadores,
    equipos,
    torneos,
    inscripciones,
    partidas,
    agregarInscripcion,
    crearEquipo,
    agregarIntegrante,
    quitarIntegrante,
    actualizarApodo,
  }

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>
}

export function useApp() {
  const contexto = useContext(AppContext)
  if (!contexto) {
    throw new Error('useApp debe ser usado dentro de un AppProvider')
  }
  return contexto
}
