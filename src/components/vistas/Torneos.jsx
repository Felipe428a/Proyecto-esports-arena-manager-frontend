import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import TarjetaTorneo from '../torneos/TarjetaTorneo'
import MensajeEstado from '../ui/MensajeEstado'
import { filtrarTorneos, validarRangoFechas } from '../../logica/torneos'

export default function Torneos() {
  const { torneos, juegos } = useApp()

  const [filtros, setFiltros] = useState({
    buscar: '',
    juego: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  const [errorFecha, setErrorFecha] = useState('')

  const handleCambio = (e) => {
    const { name, value } = e.target
    const nuevosFiltros = { ...filtros, [name]: value }
    setFiltros(nuevosFiltros)

    // Validar rango de fechas en vivo
    const validacion = validarRangoFechas(nuevosFiltros.fechaDesde, nuevosFiltros.fechaHasta)
    setErrorFecha(validacion.valido ? '' : validacion.error)
  }

  const handleLimpiar = () => {
    setFiltros({
      buscar: '',
      juego: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
    })
    setErrorFecha('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const resultados = useMemo(() => {
    if (errorFecha) return []
    return filtrarTorneos(torneos, filtros)
  }, [torneos, filtros, errorFecha])

  return (
    <main>
      <section>
        <div className="container">
          <h1>Listado de torneos</h1>
          <p>Explora todos los torneos de la temporada y filtra por juego, estado o fecha.</p>

          <form id="formulario-filtros" className="row g-3 mb-4" onSubmit={handleSubmit} noValidate>
            <div className="col-12 col-md-6 col-lg-4">
              <label htmlFor="filtro-buscar" className="form-label">Buscar por nombre</label>
              <input
                type="text"
                id="filtro-buscar"
                name="buscar"
                className="form-control"
                autoComplete="off"
                placeholder="Ej: Copa Arena"
                value={filtros.buscar}
                onChange={handleCambio}
              />
              <div className="form-text">Escribe parte del nombre del torneo.</div>
            </div>

            <div className="col-6 col-lg-4">
              <label htmlFor="filtro-juego" className="form-label">Juego</label>
              <select id="filtro-juego" name="juego" className="form-select" value={filtros.juego} onChange={handleCambio}>
                <option value="">Todos los juegos</option>
                {juegos.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-lg-4">
              <label htmlFor="filtro-estado" className="form-label">Estado</label>
              <select id="filtro-estado" name="estado" className="form-select" value={filtros.estado} onChange={handleCambio}>
                <option value="">Todos los estados</option>
                <option value="abierto">Inscripciones abiertas</option>
                <option value="en_curso">En curso</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="filtro-fecha-desde" className="form-label">Cierre de inscripción desde</label>
              <input type="date" id="filtro-fecha-desde" name="fechaDesde" className="form-control" value={filtros.fechaDesde} onChange={handleCambio} />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="filtro-fecha-hasta" className="form-label">Cierre de inscripción hasta</label>
              <input
                type="date"
                id="filtro-fecha-hasta"
                name="fechaHasta"
                className={`form-control ${errorFecha ? 'is-invalid' : ''}`}
                value={filtros.fechaHasta}
                onChange={handleCambio}
                aria-invalid={errorFecha ? 'true' : 'false'}
              />
              {errorFecha && (
                <div id="error-filtro-fecha-hasta" className="invalid-feedback" role="alert">
                  {errorFecha}
                </div>
              )}
            </div>

            <div className="col-12 d-flex flex-wrap gap-2">
              <button type="submit" className="boton boton-primario btn">
                Aplicar filtros
              </button>
              <button type="button" id="boton-limpiar" className="boton boton-secundario btn" onClick={handleLimpiar}>
                Limpiar
              </button>
            </div>
          </form>

          {!errorFecha && (
            <p id="contador-resultados" aria-live="polite" className="text-secondary">
              {resultados.length} torneo{resultados.length === 1 ? '' : 's'} encontrado
              {resultados.length === 1 ? '' : 's'}
            </p>
          )}

          <div id="lista-torneos" className="row g-4" aria-live="polite">
            {resultados.length === 0 && !errorFecha ? (
              <div className="col-12">
                <MensajeEstado tipo="vacio">
                  Ningún torneo cumple con los filtros seleccionados. Prueba ajustando el juego, el
                  estado o el rango de fechas.
                </MensajeEstado>
              </div>
            ) : (
              resultados.map((torneo) => (
                <div key={torneo.id} className="col-12 col-md-6 col-lg-4">
                  <TarjetaTorneo torneo={torneo} mostrarModalidad={true} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
