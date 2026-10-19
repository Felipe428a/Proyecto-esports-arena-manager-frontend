import { calcularPorcentajeCupos } from '../../logica/formato'

export default function BarraCupos({ cupoOcupado, cupoMax }) {
  const porcentaje = calcularPorcentajeCupos(cupoOcupado, cupoMax)
  return (
    <div
      className="barra-cupos progress"
      role="img"
      aria-label={`${porcentaje}% de cupos ocupados`}
    >
      <div className="progress-bar" style={{ width: `${porcentaje}%` }}></div>
    </div>
  )
}
