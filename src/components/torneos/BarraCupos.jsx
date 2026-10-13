import { calcularPorcentajeCupos } from '../../logica/formato'

export default function BarraCupos({ cupoOcupado, cupoMax }) {
  const porcentaje = calcularPorcentajeCupos(cupoOcupado, cupoMax)
  return (
    <div
      className="barra-cupos"
      role="img"
      aria-label={`${porcentaje}% de cupos ocupados`}
    >
      <span style={{ width: `${porcentaje}%` }}></span>
    </div>
  )
}
