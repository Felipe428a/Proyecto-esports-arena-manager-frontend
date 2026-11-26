import EtiquetaEstado from './EtiquetaEstado'
import BarraCupos from './BarraCupos'
import { formatearFecha } from '../../logica/formato'

/**
 * Tarjeta con el resumen de un torneo. Componente de presentación: todo llega por props.
 *
 * Props:
 *  - torneo:            objeto del torneo (nombre, estado, cupoOcupado, cupoMax, fechaCierreInscripcion)
 *  - juego:             juego del torneo (nombre, modalidad). Puede venir undefined
 *  - mostrarModalidad:  si es false oculta la fila "Modalidad" (por defecto true)
 *  - onVerDetalle:      se llama con el id del torneo al presionar "Ver detalle"
 */
export default function TarjetaTorneo({
  torneo,
  juego,
  mostrarModalidad = true,
  onVerDetalle = () => {},
}) {
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
        className="btn btn-outline-light btn-sm"
        onClick={() => onVerDetalle(torneo.id)}
      >
        Ver detalle
      </button>
    </article>
  )
}
