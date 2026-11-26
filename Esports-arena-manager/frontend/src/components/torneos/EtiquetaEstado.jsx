import { obtenerEstadoTorneoInfo } from '../../logica/torneos'

export default function EtiquetaEstado({ estado }) {
  const info = obtenerEstadoTorneoInfo(estado)
  return (
    <span className={`etiqueta-estado ${info.clase}`}>
      {info.etiqueta}
    </span>
  )
}
