import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import MensajeEstado from '../ui/MensajeEstado'
import { formatearFecha } from '../../logica/formato'
import { obtenerEstadoTorneoInfo } from '../../logica/torneos'
import { validarInscripcion } from '../../logica/inscripcion'

export default function Inscripcion() {
  const {
    torneos,
    juegos,
    jugadores,
    equipos,
    inscripciones,
    parametrosVista,
    agregarInscripcion,
  } = useApp()

  const [torneoId, setTorneoId] = useState('')
  const [tipoParticipante, setTipoParticipante] = useState('jugador')
  const [jugadorId, setJugadorId] = useState('')
  const [equipoId, setEquipoId] = useState('')

  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [confirmacion, setConfirmacion] = useState(null)

  // Preseleccionar torneo desde parámetros de navegación si existe
  useEffect(() => {
    if (parametrosVista.torneo) {
      setTorneoId(String(parametrosVista.torneo))
    } else if (torneos.length > 0 && !torneoId) {
      setTorneoId(String(torneos[0].id))
    }
  }, [parametrosVista, torneos, torneoId])

  // Preseleccionar primer jugador y primer equipo
  useEffect(() => {
    if (jugadores.length > 0 && !jugadorId) {
      setJugadorId(String(jugadores[0].id))
    }
    if (equipos.length > 0 && !equipoId) {
      setEquipoId(String(equipos[0].id))
    }
  }, [jugadores, equipos, jugadorId, equipoId])

  const torneoSeleccionado = torneos.find((t) => t.id === Number(torneoId))
  const juegoSeleccionado = torneoSeleccionado
    ? juegos.find((j) => j.id === torneoSeleccionado.juegoId)
    : null

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrores({})
    setErrorGeneral('')
    setConfirmacion(null)

    const participanteId = tipoParticipante === 'jugador' ? jugadorId : equipoId

    const resultado = validarInscripcion({
      torneo: torneoSeleccionado,
      tipo: tipoParticipante,
      participanteId,
      inscripciones,
      todosJugadores: jugadores,
      todosEquipos: equipos,
      juegos,
      fechaActual: new Date(),
    })

    if (!resultado.valido) {
      if (resultado.general) {
        setErrorGeneral(resultado.general)
      }
      if (resultado.campo) {
        setErrores({ [resultado.campo]: resultado.mensaje })
      }
      return
    }

    // Registrar inscripción en el estado global
    agregarInscripcion({
      torneoId,
      participanteTipo: tipoParticipante,
      participanteId,
    })

    let nombreParticipante = ''
    if (tipoParticipante === 'jugador') {
      const jug = jugadores.find((j) => j.id === Number(jugadorId))
      nombreParticipante = jug ? `${jug.nombre} (${jug.apodo})` : 'Jugador'
    } else {
      const eq = equipos.find((e) => e.id === Number(equipoId))
      nombreParticipante = eq ? eq.nombre : 'Equipo'
    }

    const cuposRestantes = Math.max(0, torneoSeleccionado.cupoMax - (torneoSeleccionado.cupoOcupado + 1))

    setConfirmacion({
      nombreParticipante,
      nombreTorneo: torneoSeleccionado.nombre,
      cuposRestantes,
      cupoMax: torneoSeleccionado.cupoMax,
    })
  }

  const cuposDisponibles = torneoSeleccionado
    ? Math.max(0, torneoSeleccionado.cupoMax - torneoSeleccionado.cupoOcupado)
    : 0

  return (
    <main>
      <section>
        <div className="contenedor">
          <h1>Inscripción a torneo</h1>
          <p>Registra la participación de un jugador o de un equipo completo en el torneo elegido.</p>

          <form id="formulario-inscripcion" className="formulario" onSubmit={handleSubmit} noValidate>
            <div className="campo">
              <label htmlFor="campo-torneo">Torneo</label>
              <select
                id="campo-torneo"
                name="torneo"
                value={torneoId}
                onChange={(e) => {
                  setTorneoId(e.target.value)
                  setConfirmacion(null)
                  setErrorGeneral('')
                  setErrores({})
                }}
              >
                {torneos.map((t) => {
                  const estado = obtenerEstadoTorneoInfo(t.estado)
                  return (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({estado.etiqueta})
                    </option>
                  )
                })}
              </select>
              {errores['campo-torneo'] && (
                <span id="error-campo-torneo" className="mensaje-error" role="alert">
                  {errores['campo-torneo']}
                </span>
              )}
            </div>

            <fieldset className="campo" style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                Tipo de participante
              </legend>
              <div className="fila-radios">
                <label>
                  <input
                    type="radio"
                    name="tipoParticipante"
                    value="jugador"
                    checked={tipoParticipante === 'jugador'}
                    onChange={() => {
                      setTipoParticipante('jugador')
                      setConfirmacion(null)
                      setErrorGeneral('')
                    }}
                  />
                  Jugador individual
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipoParticipante"
                    value="equipo"
                    checked={tipoParticipante === 'equipo'}
                    onChange={() => {
                      setTipoParticipante('equipo')
                      setConfirmacion(null)
                      setErrorGeneral('')
                    }}
                  />
                  Equipo
                </label>
              </div>
            </fieldset>

            {tipoParticipante === 'jugador' ? (
              <div className="campo">
                <label htmlFor="campo-jugador">Jugador que se inscribe</label>
                <select
                  id="campo-jugador"
                  name="jugador"
                  value={jugadorId}
                  onChange={(e) => {
                    setJugadorId(e.target.value)
                    setConfirmacion(null)
                    setErrorGeneral('')
                  }}
                >
                  {jugadores.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nombre} ({j.apodo})
                    </option>
                  ))}
                </select>
                <span className="ayuda">
                  Simula la sesión activa mientras el sistema opera en modo frontend.
                </span>
                {errores['campo-jugador'] && (
                  <span id="error-campo-jugador" className="mensaje-error" role="alert">
                    {errores['campo-jugador']}
                  </span>
                )}
              </div>
            ) : (
              <div className="campo" id="contenedor-equipo">
                <label htmlFor="campo-equipo">Selecciona tu equipo</label>
                <select
                  id="campo-equipo"
                  name="equipo"
                  value={equipoId}
                  onChange={(e) => {
                    setEquipoId(e.target.value)
                    setConfirmacion(null)
                    setErrorGeneral('')
                  }}
                >
                  {equipos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                      {e.activo ? '' : ' (inactivo)'}
                    </option>
                  ))}
                </select>
                {errores['campo-equipo'] && (
                  <span id="error-campo-equipo" className="mensaje-error" role="alert">
                    {errores['campo-equipo']}
                  </span>
                )}
              </div>
            )}

            {/* Resumen de requisitos */}
            <div id="resumen-requisitos" className="mensaje-estado mensaje-estado--info" aria-live="polite">
              {torneoSeleccionado ? (
                <>
                  <strong>{torneoSeleccionado.nombre}</strong> ·{' '}
                  {juegoSeleccionado ? juegoSeleccionado.nombre : ''}
                  <br />
                  Cupos disponibles: {cuposDisponibles} de {torneoSeleccionado.cupoMax}
                  <br />
                  Cierre de inscripción: {formatearFecha(torneoSeleccionado.fechaCierreInscripcion)}
                  <br />
                  {juegoSeleccionado && juegoSeleccionado.modalidad === 'Equipos'
                    ? `Integrantes exigidos por equipo: ${juegoSeleccionado.integrantesPorEquipo}`
                    : 'Modalidad individual'}
                </>
              ) : (
                'Elige un torneo para ver sus requisitos.'
              )}
            </div>

            {errorGeneral && (
              <span id="error-general" className="mensaje-error" role="alert">
                {errorGeneral}
              </span>
            )}

            <div className="acciones-formulario">
              <button type="submit" id="boton-inscribir" className="boton boton-primario">
                Confirmar inscripción
              </button>
            </div>
          </form>

          {confirmacion && (
            <div
              id="confirmacion"
              className="mensaje-estado mensaje-estado--exito"
              style={{ marginTop: '1.5rem' }}
              aria-live="polite"
            >
              <strong>Inscripción confirmada.</strong>
              <br />
              {confirmacion.nombreParticipante} quedó inscrito/a en{' '}
              <strong>{confirmacion.nombreTorneo}</strong>.
              <br />
              Cupos restantes: {confirmacion.cuposRestantes} de {confirmacion.cupoMax}.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
