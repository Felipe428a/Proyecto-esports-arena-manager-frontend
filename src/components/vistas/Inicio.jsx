import { useApp } from '../../context/AppContext'
import TarjetaTorneo from '../torneos/TarjetaTorneo'
import MensajeEstado from '../ui/MensajeEstado'
import { formatearFecha } from '../../logica/formato'
import { obtenerTorneosDestacados, obtenerProximosCierres } from '../../logica/torneos'

export default function Inicio() {
  const { torneos, juegos, navegar } = useApp()

  const torneosDestacados = obtenerTorneosDestacados(torneos)
  const proximosCierres = obtenerProximosCierres(torneos, 4)

  const conteoJuegos = juegos.length
  const conteoAbiertos = torneos.filter((t) => t.estado === 'abierto').length
  const conteoEnCurso = torneos.filter((t) => t.estado === 'en_curso').length

  const obtenerNombreJuego = (juegoId) => {
    const j = juegos.find((item) => item.id === juegoId)
    return j ? j.nombre : 'No disponible'
  }

  return (
    <main>
      {/* Sección Héroe */}
      <section className="heroe">
        <div className="contenedor heroe-cuadro">
          <div>
            <p className="heroe-etiqueta">TEMPORADA 2026</p>
            <h1>Organiza y sigue tus torneos de eSports en un solo lugar</h1>
            <p>
              eSports Arena Manager centraliza juegos habilitados, equipos, inscripciones, partidas
              y tablas de posiciones, dejando siempre claro qué acciones están disponibles para cada rol.
            </p>
            <button
              type="button"
              className="boton boton-primario"
              onClick={() => navegar('torneos')}
            >
              Ver todos los torneos
            </button>
          </div>
          <div className="heroe-panel">
            <h2 style={{ border: 'none', padding: 0 }}>Estado de la arena</h2>
            <dl>
              <dt>Juegos habilitados</dt>
              <dd>{conteoJuegos}</dd>
              <dt>Torneos con inscripción abierta</dt>
              <dd>{conteoAbiertos}</dd>
              <dt>Torneos en curso</dt>
              <dd>{conteoEnCurso}</dd>
            </dl>
          </div>
        </div>
      </section>

      {/* Torneos destacados */}
      <section id="destacados">
        <div className="contenedor">
          <h2>Torneos destacados</h2>
          <p>Torneos con inscripción abierta o que ya se están jugando esta temporada.</p>

          {torneosDestacados.length === 0 ? (
            <MensajeEstado tipo="vacio">
              Por ahora no hay torneos abiertos o en curso. Vuelve pronto.
            </MensajeEstado>
          ) : (
            <div className="rejilla-tarjetas" aria-live="polite">
              {torneosDestacados.map((torneo) => (
                <TarjetaTorneo key={torneo.id} torneo={torneo} mostrarModalidad={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Próximos cierres */}
      <section id="cierres">
        <div className="contenedor">
          <h2>Próximos cierres de inscripción</h2>
          <p>No te quedes fuera: estos son los torneos abiertos que cierran inscripciones primero.</p>

          {proximosCierres.length === 0 ? (
            <MensajeEstado tipo="vacio">
              No hay cierres de inscripción próximos en este momento.
            </MensajeEstado>
          ) : (
            <ul className="lista-cierres" aria-live="polite">
              {proximosCierres.map((torneo) => (
                <li key={torneo.id}>
                  <span>
                    <strong>{torneo.nombre}</strong> · {obtenerNombreJuego(torneo.juegoId)}
                  </span>
                  <span>Cierra el {formatearFecha(torneo.fechaCierreInscripcion)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Video resumen */}
      <section id="video">
        <div className="contenedor">
          <h2>Revive la última gran final</h2>
          <p>Un adelanto de lo que se vive en la arena cuando dos equipos llegan a la final.</p>
          <figure className="envoltorio-video">
            <video className="esports-teaser" controls autoPlay loop muted playsInline>
              <source src="/assets/adelanto-esports.mp4" type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
            <figcaption className="oculto-visualmente">Video de referencia de una final de torneo</figcaption>
          </figure>
        </div>
      </section>
    </main>
  )
}
