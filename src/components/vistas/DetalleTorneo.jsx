import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import EtiquetaEstado from '../torneos/EtiquetaEstado'
import MensajeEstado from '../ui/MensajeEstado'
import { formatearFecha } from '../../logica/formato'
import { calcularRanking } from '../../logica/ranking'

export default function DetalleTorneo() {
  const { torneos, juegos, equipos, jugadores, inscripciones, partidas, parametrosVista, navegar } =
    useApp()

  const torneoId = parametrosVista.id ? Number(parametrosVista.id) : torneos[0]?.id
  const torneo = torneos.find((t) => t.id === torneoId)
  const juego = torneo ? juegos.find((j) => j.id === torneo.juegoId) : null

  // Partidas de este torneo
  const partidasTorneo = useMemo(() => {
    if (!torneo) return []
    return partidas.filter((p) => p.torneoId === torneo.id)
  }, [partidas, torneo])

  // Rondas disponibles
  const rondas = useMemo(() => {
    return [...new Set(partidasTorneo.map((p) => p.ronda))].sort((a, b) => a - b)
  }, [partidasTorneo])

  const [rondaSeleccionada, setRondaSeleccionada] = useState(1)

  // Participantes inscritos
  const participantesInscritos = useMemo(() => {
    if (!torneo) return []
    return inscripciones.filter((i) => i.torneoId === torneo.id)
  }, [inscripciones, torneo])

  // Ranking calculado
  const ranking = useMemo(() => {
    return calcularRanking(partidasTorneo)
  }, [partidasTorneo])

  if (!torneo) {
    return (
      <main>
        <section>
          <div className="contenedor">
            <MensajeEstado tipo="error">
              No encontramos el torneo solicitado. Vuelve al{' '}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => navegar('torneos')}
              >
                listado de torneos
              </button>
              .
            </MensajeEstado>
          </div>
        </section>
      </main>
    )
  }

  const cuposDisponibles = Math.max(0, torneo.cupoMax - torneo.cupoOcupado)
  const rondaActual = rondas.includes(rondaSeleccionada) ? rondaSeleccionada : rondas[0] || 1
  const partidasRonda = partidasTorneo.filter((p) => p.ronda === rondaActual)

  const obtenerNombreParticipante = (inscripcion) => {
    if (inscripcion.participanteTipo === 'equipo') {
      const eq = equipos.find((e) => e.id === inscripcion.participanteId)
      return eq ? eq.nombre : 'Equipo no disponible'
    }
    const jug = jugadores.find((j) => j.id === inscripcion.participanteId)
    return jug ? `${jug.nombre} (${jug.apodo})` : 'Jugador no disponible'
  }

  return (
    <main>
      {/* Sección General */}
      <section id="seccion-general">
        <div className="contenedor">
          <p>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--color-acento)',
                cursor: 'pointer',
                fontFamily: 'var(--fuente-texto)',
                fontSize: '1rem',
              }}
              onClick={() => navegar('torneos')}
            >
              ← Volver al listado de torneos
            </button>
          </p>

          <div id="contenido-general">
            <EtiquetaEstado estado={torneo.estado} />
            <h1 style={{ marginTop: '0.8rem' }}>{torneo.nombre}</h1>
            <p>{torneo.descripcion}</p>

            <div className="heroe-panel" style={{ maxWidth: '520px' }}>
              <dl>
                <dt>Juego</dt>
                <dd>{juego ? juego.nombre : 'No disponible'}</dd>
                <dt>Cupos disponibles</dt>
                <dd>
                  {cuposDisponibles} de {torneo.cupoMax}
                </dd>
                <dt>Cierre de inscripción</dt>
                <dd>{formatearFecha(torneo.fechaCierreInscripcion)}</dd>
                <dt>Fecha de inicio</dt>
                <dd>{formatearFecha(torneo.fechaInicio)}</dd>
              </dl>
            </div>

            {torneo.estado === 'abierto' && (
              <p style={{ marginTop: '1.2rem' }}>
                <button
                  type="button"
                  className="boton boton-primario"
                  onClick={() => navegar('inscripcion', { torneo: torneo.id })}
                >
                  Inscribirme a este torneo
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Participantes */}
      <section id="seccion-participantes">
        <div className="contenedor">
          <h2>Participantes inscritos</h2>
          {participantesInscritos.length === 0 ? (
            <MensajeEstado tipo="vacio">
              Todavía no hay participantes inscritos en este torneo.
            </MensajeEstado>
          ) : (
            <ul
              id="lista-participantes"
              className="rejilla-tarjetas"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
                listStyle: 'none',
                padding: 0,
              }}
            >
              {participantesInscritos.map((inscripcion) => (
                <li key={inscripcion.id} className="tarjeta-torneo">
                  <span className="etiqueta-estado estado-abierto">
                    {inscripcion.participanteTipo === 'equipo' ? 'Equipo' : 'Individual'}
                  </span>
                  <h3>{obtenerNombreParticipante(inscripcion)}</h3>
                  <p className="fila-dato">
                    <span>Inscrito el</span>
                    <span>{formatearFecha(inscripcion.fecha)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Llaves y partidas */}
      <section id="seccion-llaves">
        <div className="contenedor">
          <h2>Llaves y calendario de partidas</h2>

          {rondas.length > 0 && (
            <div
              id="selector-rondas"
              className="selector-rondas"
              role="tablist"
              aria-label="Rondas del torneo"
            >
              {rondas.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={r === rondaActual}
                  className={`boton boton-pequeno ${
                    r === rondaActual ? 'boton-primario' : 'boton-secundario'
                  }`}
                  onClick={() => setRondaSeleccionada(r)}
                >
                  Ronda {r}
                </button>
              ))}
            </div>
          )}

          {partidasRonda.length === 0 ? (
            <MensajeEstado tipo="vacio">
              Aún no hay partidas programadas para este torneo.
            </MensajeEstado>
          ) : (
            <ul id="lista-partidas" className="lista-partidas">
              {partidasRonda.map((partida) => {
                const marcador = partida.resultado ? (
                  <span className="marcador">
                    {partida.resultado.puntajeA} - {partida.resultado.puntajeB}
                  </span>
                ) : (
                  <span className="marcador">vs</span>
                )
                const nombreB = partida.participanteB?.nombre || 'Por definir'
                const estadoTexto =
                  partida.estado === 'jugada'
                    ? 'Jugada'
                    : partida.estado === 'cancelada'
                    ? 'Cancelada'
                    : 'Programada'

                return (
                  <li key={partida.id} className="tarjeta-partida">
                    <span className="enfrentamiento">
                      {partida.participanteA?.nombre} {marcador} {nombreB}
                    </span>
                    <span>
                      {estadoTexto} · {formatearFecha(partida.horario, true)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Ranking */}
      <section id="seccion-ranking">
        <div className="contenedor">
          <h2>Tabla de posiciones</h2>
          <table className="tabla-datos">
            <caption>Se recalcula automáticamente con cada resultado validado.</caption>
            <thead>
              <tr>
                <th scope="col">Posición</th>
                <th scope="col">Participante</th>
                <th scope="col">Victorias</th>
                <th scope="col">Derrotas</th>
                <th scope="col">Diferencia de puntaje</th>
              </tr>
            </thead>
            <tbody id="cuerpo-ranking">
              {ranking.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    Aún no hay resultados validados para calcular la tabla de posiciones.
                  </td>
                </tr>
              ) : (
                ranking.map((fila, indice) => (
                  <tr key={fila.nombre}>
                    <td className={indice === 0 ? 'posicion-1' : ''}>{indice + 1}</td>
                    <td>{fila.nombre}</td>
                    <td>{fila.victorias}</td>
                    <td>{fila.derrotas}</td>
                    <td>{fila.diferencia > 0 ? `+${fila.diferencia}` : fila.diferencia}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Premios */}
      <section id="seccion-premios">
        <div className="contenedor">
          <h2>Premios</h2>
          <div id="contenido-premios">
            {torneo.estado !== 'finalizado' ? (
              <MensajeEstado tipo="info">
                Los premios se muestran una vez que el torneo finaliza.
              </MensajeEstado>
            ) : !torneo.premios || torneo.premios.length === 0 ? (
              <MensajeEstado tipo="vacio">
                Este torneo finalizó sin premios registrados.
              </MensajeEstado>
            ) : (
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th scope="col">Posición</th>
                    <th scope="col">Premio</th>
                  </tr>
                </thead>
                <tbody>
                  {torneo.premios.map((p) => (
                    <tr key={p.posicion}>
                      <td className={p.posicion === 1 ? 'posicion-1' : ''}>{p.posicion}°</td>
                      <td>{p.premio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
