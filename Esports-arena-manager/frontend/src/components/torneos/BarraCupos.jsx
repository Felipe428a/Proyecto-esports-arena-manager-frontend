import { calcularPorcentajeCupos } from '../../logica/formato'

/**
 * Barra de progreso de cupos (Bootstrap .progress).
 * El único estilo en línea es el ancho: es un valor calculado en tiempo de ejecución
 * (0–100 %) que no se puede expresar con una clase CSS fija.
 */
export default function BarraCupos({ cupoOcupado, cupoMax }) {
  const porcentaje = calcularPorcentajeCupos(cupoOcupado, cupoMax)
  return (
    <div
      className="barra-cupos progress"
      role="progressbar"
      aria-label="Cupos ocupados"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-bar" style={{ width: `${porcentaje}%` }}></div>
    </div>
  )
}
