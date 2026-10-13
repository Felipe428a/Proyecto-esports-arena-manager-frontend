import { createContext, useContext, useState, useEffect } from 'react'
import {
  JUEGOS_INICIALES,
  JUGADORES_INICIALES,
  EQUIPOS_INICIALES,
  TORNEOS_INICIALES,
  INSCRIPCIONES_INICIALES,
  PARTIDAS_INICIALES,
} from '../data/datos'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [juegos] = useState(JUEGOS_INICIALES)
  const [jugadores, setJugadores] = useState(JUGADORES_INICIALES)
  const [equipos, setEquipos] = useState(EQUIPOS_INICIALES)
  const [torneos, setTorneos] = useState(TORNEOS_INICIALES)
  const [inscripciones, setInscripciones] = useState(INSCRIPCIONES_INICIALES)
  const [partidas, setPartidas] = useState(PARTIDAS_INICIALES)

  // Estado de navegación SPA
  const [vistaActual, setVistaActual] = useState('inicio')
  const [parametrosVista, setParametrosVista] = useState({})


  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (!hash) {
        setVistaActual('inicio')
        setParametrosVista({})
        return
      }

      const [ruta, queryString] = hash.split('?')
      const params = new URLSearchParams(queryString || '')
      const paramObj = {}
      for (const [key, value] of params.entries()) {
        paramObj[key] = isNaN(Number(value)) ? value : Number(value)
      }

      if (['inicio', 'torneos', 'detalle-torneo', 'inscripcion', 'equipo', 'perfil'].includes(ruta)) {
        setVistaActual(ruta)
        setParametrosVista(paramObj)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navegar = (vista, parametros = {}) => {
    setVistaActual(vista)
    setParametrosVista(parametros)
    const queryString = new URLSearchParams(parametros).toString()
    const nuevoHash = `#/${vista}${queryString ? `?${queryString}` : ''}`
    window.location.hash = nuevoHash
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const agregarInscripcion = ({ torneoId, participanteTipo, participanteId }) => {
    const torneoNum = Number(torneoId)
    const participanteNum = Number(participanteId)
    const fecha = new Date().toISOString().slice(0, 10)

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
        if (e.id === equipoNum) {
          if (e.integrantes.some((i) => i.jugadorId === jugadorNum)) return e
          return {
            ...e,
            integrantes: [...e.integrantes, { jugadorId: jugadorNum, rol }],
          }
        }
        return e
      })
    )

    setJugadores((prev) =>
      prev.map((j) => {
        if (j.id === jugadorNum && !j.equipos.includes(equipoNum)) {
          return { ...j, equipos: [...j.equipos, equipoNum] }
        }
        return j
      })
    )
  }

  const quitarIntegrante = (equipoId, jugadorId) => {
    const equipoNum = Number(equipoId)
    const jugadorNum = Number(jugadorId)

    setEquipos((prev) =>
      prev.map((e) => {
        if (e.id === equipoNum) {
          return {
            ...e,
            integrantes: e.integrantes.filter((i) => i.jugadorId !== jugadorNum),
          }
        }
        return e
      })
    )

    setJugadores((prev) =>
      prev.map((j) => {
        if (j.id === jugadorNum) {
          return { ...j, equipos: j.equipos.filter((id) => id !== equipoNum) }
        }
        return j
      })
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
    vistaActual,
    parametrosVista,
    navegar,
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
