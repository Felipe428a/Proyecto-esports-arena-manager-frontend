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
        <div className="contenedor">
          <h1>Listado de torneos</h1>
          <p>Explora todos los torneos de la temporada y filtra por juego, estado o fecha.</p>

          <form id="formulario-filtros" className="formulario formulario--ancho" onSubmit={handleSubmit} noValidate>
            <div className="fila-campos">
              <div className="campo">
                <label htmlFor="filtro-buscar">Buscar por nombre</label>
                <input
                  type="text"
                  id="filtro-buscar"
                  name="buscar"
                  autoComplete="off"
                  placeholder="Ej: Copa Arena"
                  value={filtros.buscar}
                  onChange={handleCambio}
                />
                <span className="ayuda">Escribe parte del nombre del torneo.</span>
              </div>

              <div className="campo">
                <label htmlFor="filtro-juego">Juego</label>
                <select
                  id="filtro-juego"
                  name="juego"
                  value={filtros.juego}
                  onChange={handleCambio}
                >
                  <option value="">Todos los juegos</option>
                  {juegos.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="filtro-estado">Estado</label>
                <select
                  id="filtro-estado"
                  name="estado"
                  value={filtros.estado}
                  onChange={handleCambio}
                >
                  <option value="">Todos los estados</option>
                  <option value="abierto">Inscripciones abiertas</option>
                  <option value="en_curso">En curso</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>

            <div className="fila-campos">
              <div className="campo">
                <label htmlFor="filtro-fecha-desde">Cierre de inscripción desde</label>
                <input
                  type="date"
                  id="filtro-fecha-desde"
                  name="fechaDesde"
                  value={filtros.fechaDesde}
                  onChange={handleCambio}
                />
              </div>
              <div className="campo">
                <label htmlFor="filtro-fecha-hasta">Cierre de inscripción hasta</label>
                <input
                  type="date"
                  id="filtro-fecha-hasta"
                  name="fechaHasta"
                  value={filtros.fechaHasta}
                  onChange={handleCambio}
                  aria-invalid={errorFecha ? 'true' : 'false'}
                />
                {errorFecha && (
                  <span id="error-filtro-fecha-hasta" className="mensaje-error" role="alert">
                    {errorFecha}
                  </span>
                )}
              </div>
            </div>

            <div className="acciones-formulario">
              <button type="submit" className="boton boton-primario">
                Aplicar filtros
              </button>
              <button
                type="button"
                id="boton-limpiar"
                className="boton boton-secundario"
                onClick={handleLimpiar}
              >
                Limpiar
              </button>
            </div>
          </form>

          {!errorFecha && (
            <p
              id="contador-resultados"
              aria-live="polite"
              style={{ color: 'var(--color-texto-tenue)', marginTop: '1.5rem' }}
            >
              {resultados.length} torneo{resultados.length === 1 ? '' : 's'} encontrado
              {resultados.length === 1 ? '' : 's'}
            </p>
          )}

          <div id="lista-torneos" className="rejilla-tarjetas" aria-live="polite">
            {resultados.length === 0 && !errorFecha ? (
              <MensajeEstado tipo="vacio">
                Ningún torneo cumple con los filtros seleccionados. Prueba ajustando el juego, el
                estado o el rango de fechas.
              </MensajeEstado>
            ) : (
              resultados.map((torneo) => (
                <TarjetaTorneo key={torneo.id} torneo={torneo} mostrarModalidad={true} />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
