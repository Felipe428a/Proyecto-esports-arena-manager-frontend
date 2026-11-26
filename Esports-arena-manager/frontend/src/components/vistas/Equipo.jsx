import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../auth/useAuth'
import { puedeAdministrarEquipo } from '../../auth/permisos'
import MensajeEstado from '../ui/MensajeEstado'
import EstadoCarga from '../ui/EstadoCarga'
import { validarCreacionEquipo, obtenerJugadoresDisponibles } from '../../logica/equipo'

/**
 * Gestión de equipos (vista protegida: requiere sesión).
 * - Un JUGADOR crea equipos donde él es el capitán y solo administra los equipos que capitanea.
 * - ORGANIZADOR y ADMINISTRADOR pueden crear equipos con cualquier capitán y administrar todos.
 * team-service aplica la misma regla (403 "Solo el capitán del equipo puede modificarlo").
 */
export default function Equipo() {
  const { equipos, juegos, jugadores, cargando, errores, recargar, crearEquipo, agregarIntegrante, quitarIntegrante } = useApp()
  const { usuario, puede } = useAuth()
  const esStaff = puede('inscribirOtros')

  const juegosActivos = useMemo(() => juegos.filter((j) => j.activo && j.modalidad === 'Equipos'), [juegos])
  const capitanesElegibles = useMemo(
    () => (esStaff ? jugadores : jugadores.filter((j) => j.id === usuario?.id)),
    [esStaff, jugadores, usuario]
  )
  // Un jugador ve los equipos que integra; el staff ve todos
  const equiposVisibles = useMemo(
    () => (esStaff ? equipos : equipos.filter((e) => e.integrantes.some((i) => i.jugadorId === usuario?.id))),
    [esStaff, equipos, usuario]
  )

  const [nombreEquipo, setNombreEquipo] = useState('')
  const [juegoEquipoId, setJuegoEquipoId] = useState('')
  const [capitanId, setCapitanId] = useState('')
  const [erroresCreacion, setErroresCreacion] = useState({})
  const [errorCreacion, setErrorCreacion] = useState('')
  const [exito, setExito] = useState('')
  const [enviando, setEnviando] = useState(false)

  const [equipoActualId, setEquipoActualId] = useState('')
  const [nuevoIntegranteId, setNuevoIntegranteId] = useState('')
  const [errorAgregar, setErrorAgregar] = useState('')

  useEffect(() => {
    if (juegosActivos.length > 0 && !juegoEquipoId) setJuegoEquipoId(String(juegosActivos[0].id))
    if (capitanesElegibles.length > 0 && !capitanId) setCapitanId(String(capitanesElegibles[0].id))
    if (equiposVisibles.length > 0 && !equiposVisibles.some((e) => String(e.id) === equipoActualId)) {
      setEquipoActualId(String(equiposVisibles[0].id))
    }
  }, [juegosActivos, capitanesElegibles, equiposVisibles, juegoEquipoId, capitanId, equipoActualId])

  const equipoSeleccionado = equiposVisibles.find((e) => e.id === Number(equipoActualId))
  const juegoEquipo = equipoSeleccionado ? juegos.find((j) => j.id === equipoSeleccionado.juegoId) : null
  const capitanEquipo = equipoSeleccionado ? jugadores.find((j) => j.id === equipoSeleccionado.capitanId) : null
  const puedeAdministrar = puedeAdministrarEquipo(usuario, equipoSeleccionado)

  const jugadoresDisponibles = equipoSeleccionado
    ? obtenerJugadoresDisponibles(jugadores, equipoSeleccionado.integrantes)
    : []

  useEffect(() => {
    if (jugadoresDisponibles.length > 0) {
      if (!jugadoresDisponibles.some((j) => String(j.id) === nuevoIntegranteId)) {
        setNuevoIntegranteId(String(jugadoresDisponibles[0].id))
      }
    } else {
      setNuevoIntegranteId('')
    }
  }, [equipoActualId, equipoSeleccionado?.integrantes?.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCrearEquipo = async (e) => {
    e.preventDefault()
    setErroresCreacion({})
    setErrorCreacion('')
    setExito('')

    const validacion = validarCreacionEquipo(nombreEquipo, Number(juegoEquipoId), Number(capitanId), equipos)
    if (!validacion.valido) {
      setErroresCreacion({ [validacion.campo]: validacion.mensaje })
      return
    }

    setEnviando(true)
    try {
      const nuevo = await crearEquipo({ nombre: nombreEquipo, juegoId: Number(juegoEquipoId), capitanId: Number(capitanId) })
      setNombreEquipo('')
      setEquipoActualId(String(nuevo.id))
      setExito(`Equipo «${nuevo.nombre}» creado.`)
    } catch (err) {
      setErrorCreacion(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const handleAgregarIntegrante = async (e) => {
    e.preventDefault()
    setErrorAgregar('')
    if (!nuevoIntegranteId) {
      setErrorAgregar('Selecciona un jugador para agregar.')
      return
    }
    try {
      await agregarIntegrante(Number(equipoActualId), Number(nuevoIntegranteId), 'Jugador/a')
    } catch (err) {
      setErrorAgregar(err.message)
    }
  }

  const handleQuitarIntegrante = async (jugadorId) => {
    setErrorAgregar('')
    try {
      await quitarIntegrante(Number(equipoActualId), jugadorId)
    } catch (err) {
      setErrorAgregar(err.message)
    }
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
          <EstadoCarga cargando={cargando} errores={errores} onReintentar={recargar} />

          <div className="row g-4">
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
                  <select id="campo-juego-equipo" name="juegoEquipo" className="form-select" value={juegoEquipoId}
                    onChange={(e) => setJuegoEquipoId(e.target.value)}>
                    {juegosActivos.map((j) => (
                      <option key={j.id} value={j.id}>{j.nombre} ({j.integrantesPorEquipo} integrantes)</option>
                    ))}
                  </select>
                  {err('error-campo-juego-equipo', erroresCreacion['campo-juego-equipo'])}
                </div>

                <div className="col-12 col-md-6 col-lg-12 col-xl-6">
                  <label htmlFor="campo-capitan" className="form-label">Capitán</label>
                  <select
                    id="campo-capitan"
                    name="capitan"
                    className={`form-select ${erroresCreacion['campo-capitan'] ? 'is-invalid' : ''}`}
                    value={capitanId}
                    disabled={!esStaff}
                    onChange={(e) => {
                      setCapitanId(e.target.value)
                      setErroresCreacion((prev) => ({ ...prev, 'campo-capitan': '' }))
                    }}
                    aria-invalid={erroresCreacion['campo-capitan'] ? 'true' : 'false'}
                  >
                    {capitanesElegibles.length === 0 && <option value="">Tu cuenta no tiene perfil de jugador</option>}
                    {capitanesElegibles.map((j) => (
                      <option key={j.id} value={j.id}>{j.nombre} ({j.apodo})</option>
                    ))}
                  </select>
                  {!esStaff && <div className="form-text">Tú serás el capitán del equipo.</div>}
                  {err('error-campo-capitan', erroresCreacion['campo-capitan'])}
                </div>

                {errorCreacion && (
                  <div className="col-12">
                    <div className="alert alert-danger mb-0" role="alert" id="error-crear-equipo">{errorCreacion}</div>
                  </div>
                )}
                {exito && (
                  <div className="col-12">
                    <MensajeEstado tipo="exito">{exito}</MensajeEstado>
                  </div>
                )}

                <div className="col-12">
                  <button type="submit" className="boton boton-primario btn" disabled={enviando}>
                    {enviando ? 'Creando…' : 'Crear equipo'}
                  </button>
                </div>
              </form>
            </div>

            <div className="col-12 col-lg-7">
              <h2>{esStaff ? 'Administrar equipos' : 'Mis equipos'}</h2>
              <div className="mb-3">
                <label htmlFor="selector-equipo-actual" className="form-label">Equipo</label>
                <select id="selector-equipo-actual" className="form-select" value={equipoActualId}
                  onChange={(e) => setEquipoActualId(e.target.value)} disabled={equiposVisibles.length === 0}>
                  {equiposVisibles.length === 0 && <option value="">Aún no integras ningún equipo</option>}
                  {equiposVisibles.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}{e.activo ? '' : ' (inactivo)'}</option>
                  ))}
                </select>
              </div>

              <div id="panel-equipo">
                {!equipoSeleccionado ? (
                  <MensajeEstado tipo="vacio">Crea tu primer equipo con el formulario.</MensajeEstado>
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
                    {juegoEquipo && juegoEquipo.modalidad === 'Equipos' && (
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary">Integrantes</span>
                        <span>
                          {equipoSeleccionado.integrantes.length} de {juegoEquipo.integrantesPorEquipo} requeridos
                        </span>
                      </div>
                    )}

                    <h4 className="mt-3">Integrantes</h4>
                    <ul id="lista-integrantes" className="list-group list-group-flush mb-3">
                      {equipoSeleccionado.integrantes.map((integrante) => {
                        const jug = jugadores.find((j) => j.id === integrante.jugadorId)
                        const esCapitan = integrante.jugadorId === equipoSeleccionado.capitanId
                        return (
                          <li key={integrante.jugadorId}
                            className="list-group-item bg-transparent text-reset d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <span>{jug ? jug.nombre : 'Jugador no disponible'} — {integrante.rol}</span>
                            {!esCapitan && puedeAdministrar && (
                              <button type="button" className="boton boton-pequeno boton-secundario btn btn-sm"
                                onClick={() => handleQuitarIntegrante(integrante.jugadorId)}>
                                Quitar
                              </button>
                            )}
                          </li>
                        )
                      })}
                    </ul>

                    {puedeAdministrar ? (
                      <form id="formulario-agregar-integrante" className="row g-2 align-items-end" onSubmit={handleAgregarIntegrante} noValidate>
                        <div className="col-12 col-md">
                          <label htmlFor="campo-nuevo-integrante" className="form-label">Agregar jugador al equipo</label>
                          <select id="campo-nuevo-integrante" className="form-select" value={nuevoIntegranteId}
                            onChange={(e) => { setNuevoIntegranteId(e.target.value); setErrorAgregar('') }}
                            disabled={jugadoresDisponibles.length === 0}>
                            {jugadoresDisponibles.length === 0 ? (
                              <option value="" disabled>No hay jugadores disponibles para agregar</option>
                            ) : (
                              jugadoresDisponibles.map((j) => (
                                <option key={j.id} value={j.id}>{j.nombre} ({j.apodo})</option>
                              ))
                            )}
                          </select>
                          {err('error-campo-nuevo-integrante', errorAgregar)}
                        </div>
                        <div className="col-12 col-md-auto">
                          <button type="submit" className="boton boton-secundario btn" disabled={jugadoresDisponibles.length === 0}>
                            Agregar integrante
                          </button>
                        </div>
                      </form>
                    ) : (
                      <MensajeEstado tipo="info">Solo el capitán del equipo puede agregar o quitar integrantes.</MensajeEstado>
                    )}
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
