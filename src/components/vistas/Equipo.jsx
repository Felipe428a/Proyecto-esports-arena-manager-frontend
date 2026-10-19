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

  const err = (id, texto) =>
    texto && (
      <div id={id} className="invalid-feedback d-block" role="alert">
        {texto}
      </div>
    )

  return (
    <main>
      <section>
        <div className="container">
          <h1>Gestión de equipo</h1>
          <p>Crea un equipo nuevo o administra los integrantes de uno existente.</p>

          <div className="row g-4">
            {/* Columna 1: crear equipo */}
            <div className="col-12 col-lg-5">
              <h2>Crear equipo</h2>
              <form id="formulario-equipo" className="row g-3" onSubmit={handleCrearEquipo} noValidate>
                <div className="col-12">
                  <label htmlFor="campo-nombre-equipo" className="form-label">Nombre del equipo</label>
                  <input
                    type="text"
                    id="campo-nombre-equipo"
                    name="nombreEquipo"
                    className={`form-control ${erroresCreacion['campo-nombre-equipo'] ? 'is-invalid' : ''}`}
                    autoComplete="off"
                    placeholder="Ej: Escuadrón Nocturno"
                    value={nombreEquipo}
                    onChange={(e) => {
                      setNombreEquipo(e.target.value)
                      setErroresCreacion((prev) => ({ ...prev, 'campo-nombre-equipo': '' }))
                    }}
                    aria-invalid={erroresCreacion['campo-nombre-equipo'] ? 'true' : 'false'}
                  />
                  <div className="form-text">Debe ser único entre los equipos existentes.</div>
                  {err('error-campo-nombre-equipo', erroresCreacion['campo-nombre-equipo'])}
                </div>

                <div className="col-12 col-md-6 col-lg-12 col-xl-6">
                  <label htmlFor="campo-juego-equipo" className="form-label">Juego principal</label>
                  <select
                    id="campo-juego-equipo"
                    name="juegoEquipo"
                    className="form-select"
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

                <div className="col-12 col-md-6 col-lg-12 col-xl-6">
                  <label htmlFor="campo-capitan" className="form-label">Capitán</label>
                  <select
                    id="campo-capitan"
                    name="capitan"
                    className={`form-select ${erroresCreacion['campo-capitan'] ? 'is-invalid' : ''}`}
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
                  {err('error-campo-capitan', erroresCreacion['campo-capitan'])}
                </div>

                <div className="col-12">
                  <button type="submit" className="boton boton-primario btn">
                    Crear equipo
                  </button>
                </div>
              </form>
            </div>

            {/* Columna 2: administrar integrantes */}
            <div className="col-12 col-lg-7">
              <h2>Administrar integrantes</h2>
              <div className="mb-3">
                <label htmlFor="selector-equipo-actual" className="form-label">Equipo a administrar</label>
                <select
                  id="selector-equipo-actual"
                  className="form-select"
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

              <div id="panel-equipo">
                {!equipoSeleccionado ? (
                  <MensajeEstado tipo="vacio">
                    Crea tu primer equipo con el formulario de arriba.
                  </MensajeEstado>
                ) : (
                  <div className="tarjeta-info card card-body">
                    <h3>{equipoSeleccionado.nombre}</h3>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary">Juego</span>
                      <span>{juegoEquipo ? juegoEquipo.nombre : '—'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary">Capitán/a</span>
                      <span>{capitanEquipo ? capitanEquipo.nombre : '—'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary">Estado</span>
                      <span>{equipoSeleccionado.activo ? 'Activo' : 'Inactivo (no puede inscribirse)'}</span>
                    </div>

                    <h4 className="mt-3">Integrantes</h4>
                    <ul id="lista-integrantes" className="list-group list-group-flush mb-3">
                      {equipoSeleccionado.integrantes.map((integrante) => {
                        const jug = jugadores.find((j) => j.id === integrante.jugadorId)
                        const esCapitan = integrante.jugadorId === equipoSeleccionado.capitanId
                        return (
                          <li
                            key={integrante.jugadorId}
                            className="list-group-item bg-transparent text-reset d-flex justify-content-between align-items-center flex-wrap gap-2"
                          >
                            <span>
                              {jug ? jug.nombre : 'Jugador no disponible'} — {integrante.rol}
                            </span>
                            {!esCapitan && (
                              <button
                                type="button"
                                className="boton boton-pequeno boton-secundario btn btn-sm"
                                onClick={() => handleQuitarIntegrante(integrante.jugadorId)}
                              >
                                Quitar
                              </button>
                            )}
                          </li>
                        )
                      })}
                    </ul>

                    <form
                      id="formulario-agregar-integrante"
                      className="row g-2 align-items-end"
                      onSubmit={handleAgregarIntegrante}
                      noValidate
                    >
                      <div className="col-12 col-md">
                        <label htmlFor="campo-nuevo-integrante" className="form-label">
                          Agregar jugador al equipo
                        </label>
                        <select
                          id="campo-nuevo-integrante"
                          className="form-select"
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
                        {err('error-campo-nuevo-integrante', errorAgregar)}
                      </div>
                      <div className="col-12 col-md-auto">
                        <button
                          type="submit"
                          className="boton boton-secundario btn"
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
          </div>
        </div>
      </section>
    </main>
  )
}
