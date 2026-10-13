import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import MensajeEstado from '../ui/MensajeEstado'
import { validarCreacionEquipo, obtenerJugadoresDisponibles } from '../../logica/equipo'

export default function Equipo() {
  const {
    equipos,
    juegos,
    jugadores,
    crearEquipo,
    agregarIntegrante,
    quitarIntegrante,
  } = useApp()

  // Formulario creación
  const [nombreEquipo, setNombreEquipo] = useState('')
  const [juegoEquipoId, setJuegoEquipoId] = useState('')
  const [capitanId, setCapitanId] = useState('')
  const [erroresCreacion, setErroresCreacion] = useState({})

  // Selector equipo a administrar
  const [equipoActualId, setEquipoActualId] = useState('')
  const [nuevoIntegranteId, setNuevoIntegranteId] = useState('')
  const [errorAgregar, setErrorAgregar] = useState('')

  useEffect(() => {
    if (juegos.length > 0 && !juegoEquipoId) {
      setJuegoEquipoId(String(juegos[0].id))
    }
    if (jugadores.length > 0 && !capitanId) {
      setCapitanId(String(jugadores[0].id))
    }
    if (equipos.length > 0 && !equipoActualId) {
      setEquipoActualId(String(equipos[0].id))
    }
  }, [juegos, jugadores, equipos, juegoEquipoId, capitanId, equipoActualId])

  const equipoSeleccionado = equipos.find((e) => e.id === Number(equipoActualId))
  const juegoEquipo = equipoSeleccionado
    ? juegos.find((j) => j.id === equipoSeleccionado.juegoId)
    : null
  const capitanEquipo = equipoSeleccionado
    ? jugadores.find((j) => j.id === equipoSeleccionado.capitanId)
    : null

  const jugadoresDisponibles = equipoSeleccionado
    ? obtenerJugadoresDisponibles(jugadores, equipoSeleccionado.integrantes)
    : []

  // Preseleccionar jugador disponible en el selector de agregar
  useEffect(() => {
    if (jugadoresDisponibles.length > 0) {
      setNuevoIntegranteId(String(jugadoresDisponibles[0].id))
    } else {
      setNuevoIntegranteId('')
    }
  }, [equipoActualId, equipoSeleccionado?.integrantes?.length])

  const handleCrearEquipo = (e) => {
    e.preventDefault()
    setErroresCreacion({})

    const validacion = validarCreacionEquipo(
      nombreEquipo,
      Number(juegoEquipoId),
      Number(capitanId),
      equipos
    )

    if (!validacion.valido) {
      setErroresCreacion({ [validacion.campo]: validacion.mensaje })
      return
    }

    const nuevo = crearEquipo({
      nombre: nombreEquipo,
      juegoId: Number(juegoEquipoId),
      capitanId: Number(capitanId),
    })

    setNombreEquipo('')
    setEquipoActualId(String(nuevo.id))
  }

  const handleAgregarIntegrante = (e) => {
    e.preventDefault()
    setErrorAgregar('')

    if (!nuevoIntegranteId) {
      setErrorAgregar('Selecciona un jugador para agregar.')
      return
    }

    agregarIntegrante(Number(equipoActualId), Number(nuevoIntegranteId), 'Jugador/a')
  }

  const handleQuitarIntegrante = (jugadorId) => {
    quitarIntegrante(Number(equipoActualId), jugadorId)
  }

  return (
    <main>
      <section>
        <div className="contenedor">
          <h1>Gestión de equipo</h1>
          <p>Crea un equipo nuevo o administra los integrantes de uno existente.</p>

          <h2>Crear equipo</h2>
          <form id="formulario-equipo" className="formulario" onSubmit={handleCrearEquipo} noValidate>
            <div className="campo">
              <label htmlFor="campo-nombre-equipo">Nombre del equipo</label>
              <input
                type="text"
                id="campo-nombre-equipo"
                name="nombreEquipo"
                autoComplete="off"
                placeholder="Ej: Escuadrón Nocturno"
                value={nombreEquipo}
                onChange={(e) => {
                  setNombreEquipo(e.target.value)
                  setErroresCreacion((prev) => ({ ...prev, 'campo-nombre-equipo': '' }))
                }}
                aria-invalid={erroresCreacion['campo-nombre-equipo'] ? 'true' : 'false'}
              />
              <span className="ayuda">Debe ser único entre los equipos existentes.</span>
              {erroresCreacion['campo-nombre-equipo'] && (
                <span id="error-campo-nombre-equipo" className="mensaje-error" role="alert">
                  {erroresCreacion['campo-nombre-equipo']}
                </span>
              )}
            </div>

            <div className="fila-campos">
              <div className="campo">
                <label htmlFor="campo-juego-equipo">Juego principal</label>
                <select
                  id="campo-juego-equipo"
                  name="juegoEquipo"
                  value={juegoEquipoId}
                  onChange={(e) => setJuegoEquipoId(e.target.value)}
                >
                  {juegos.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nombre} ({j.integrantesPorEquipo} integrantes)

                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="campo-capitan">Capitán</label>
                <select
                  id="campo-capitan"
                  name="capitan"
                  value={capitanId}
                  onChange={(e) => {
                    setCapitanId(e.target.value)
                    setErroresCreacion((prev) => ({ ...prev, 'campo-capitan': '' }))
                  }}
                  aria-invalid={erroresCreacion['campo-capitan'] ? 'true' : 'false'}
                >
                  {jugadores.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nombre} ({j.apodo})
                    </option>
                  ))}
                </select>
                {erroresCreacion['campo-capitan'] && (
                  <span id="error-campo-capitan" className="mensaje-error" role="alert">
                    {erroresCreacion['campo-capitan']}
                  </span>
                )}
              </div>
            </div>

            <div className="acciones-formulario">
              <button type="submit" className="boton boton-primario">
                Crear equipo
              </button>
            </div>
          </form>

          <h2 style={{ marginTop: '2.5rem' }}>Administrar integrantes</h2>
          <div className="campo" style={{ maxWidth: '420px' }}>
            <label htmlFor="selector-equipo-actual">Equipo a administrar</label>
            <select
              id="selector-equipo-actual"
              value={equipoActualId}
              onChange={(e) => setEquipoActualId(e.target.value)}
            >
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                  {e.activo ? '' : ' (inactivo)'}
                </option>
              ))}
            </select>
          </div>

          <div id="panel-equipo" style={{ marginTop: '1rem' }}>
            {!equipoSeleccionado ? (
              <MensajeEstado tipo="vacio">
                Crea tu primer equipo con el formulario de arriba.
              </MensajeEstado>
            ) : (
              <div className="tarjeta-info">
                <h3>{equipoSeleccionado.nombre}</h3>
                <p className="fila-dato">
                  <span>Juego</span>
                  <span>{juegoEquipo ? juegoEquipo.nombre : '—'}</span>
                </p>
                <p className="fila-dato">
                  <span>Capitán/a</span>
                  <span>{capitanEquipo ? capitanEquipo.nombre : '—'}</span>
                </p>
                <p className="fila-dato">
                  <span>Estado</span>
                  <span>
                    {equipoSeleccionado.activo ? 'Activo' : 'Inactivo (no puede inscribirse)'}
                  </span>
                </p>

                <h4 style={{ marginTop: '1.2rem' }}>Integrantes</h4>
                <ul
                  id="lista-integrantes"
                  style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}
                >
                  {equipoSeleccionado.integrantes.map((integrante) => {
                    const jug = jugadores.find((j) => j.id === integrante.jugadorId)
                    const esCapitan = integrante.jugadorId === equipoSeleccionado.capitanId
                    return (
                      <li
                        key={integrante.jugadorId}
                        className="fila-dato"
                        style={{
                          borderTop: '1px dashed var(--color-superficie-alta)',
                          paddingTop: '0.4rem',
                        }}
                      >
                        <span>
                          {jug ? jug.nombre : 'Jugador no disponible'} — {integrante.rol}
                        </span>
                        <span>
                          {!esCapitan && (
                            <button
                              type="button"
                              className="boton boton-pequeno boton-secundario"
                              onClick={() => handleQuitarIntegrante(integrante.jugadorId)}
                            >
                              Quitar
                            </button>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <form
                  id="formulario-agregar-integrante"
                  className="formulario"
                  style={{ marginTop: '1.2rem' }}
                  onSubmit={handleAgregarIntegrante}
                  noValidate
                >
                  <div className="campo">
                    <label htmlFor="campo-nuevo-integrante">Agregar jugador al equipo</label>
                    <select
                      id="campo-nuevo-integrante"
                      value={nuevoIntegranteId}
                      onChange={(e) => {
                        setNuevoIntegranteId(e.target.value)
                        setErrorAgregar('')
                      }}
                      disabled={jugadoresDisponibles.length === 0}
                    >
                      {jugadoresDisponibles.length === 0 ? (
                        <option value="" disabled>
                          No hay jugadores disponibles para agregar
                        </option>
                      ) : (
                        jugadoresDisponibles.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.nombre} ({j.apodo})
                          </option>
                        ))
                      )}
                    </select>
                    {errorAgregar && (
                      <span id="error-campo-nuevo-integrante" className="mensaje-error" role="alert">
                        {errorAgregar}
                      </span>
                    )}
                  </div>
                  <div className="acciones-formulario">
                    <button
                      type="submit"
                      className="boton boton-secundario"
                      disabled={jugadoresDisponibles.length === 0}
                    >
                      Agregar integrante
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
