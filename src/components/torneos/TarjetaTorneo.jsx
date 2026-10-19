import EtiquetaEstado from './EtiquetaEstado'
import BarraCupos from './BarraCupos'
import { formatearFecha } from '../../logica/formato'
import { useApp } from '../../context/AppContext'

export default function TarjetaTorneo({ torneo, mostrarModalidad = true }) {
  const { juegos, navegar } = useApp()
  const juego = juegos.find((j) => j.id === torneo.juegoId)

  return (
    <article className="tarjeta-torneo card card-body h-100">
      <EtiquetaEstado estado={torneo.estado} />
      <h3>{torneo.nombre}</h3>
      <p className="fila-dato">
        <span>Juego</span>
        <span>{juego ? juego.nombre : 'No disponible'}</span>
      </p>
      {mostrarModalidad && (
        <p className="fila-dato">
          <span>Modalidad</span>
          <span>{juego ? juego.modalidad : '—'}</span>
        </p>
      )}
      <p className="fila-dato">
        <span>Cupos</span>
        <span>
          {torneo.cupoOcupado} / {torneo.cupoMax}
        </span>
      </p>
      <BarraCupos cupoOcupado={torneo.cupoOcupado} cupoMax={torneo.cupoMax} />
      <p className="fila-dato">
        <span>Cierre de inscripción</span>
        <span>{formatearFecha(torneo.fechaCierreInscripcion)}</span>
      </p>
      <button
        type="button"
        className="boton boton-secundario boton-pequeno"
        onClick={() => navegar('detalle-torneo', { id: torneo.id })}
      >
        Ver detalle
      </button>
    </article>
  )
}
