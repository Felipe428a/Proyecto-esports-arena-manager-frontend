import { useNavigate } from 'react-router'
import MensajeEstado from '../ui/MensajeEstado'

export default function NoEncontrada() {
  const navigate = useNavigate()
  return (
    <main>
      <section>
        <div className="container">
          <h1>Página no encontrada</h1>
          <MensajeEstado tipo="vacio">La dirección que buscas no existe en la arena.</MensajeEstado>
          <button type="button" className="boton boton-primario btn mt-3" onClick={() => navigate('/inicio')}>
            Volver al inicio
          </button>
        </div>
      </section>
    </main>
  )
}
