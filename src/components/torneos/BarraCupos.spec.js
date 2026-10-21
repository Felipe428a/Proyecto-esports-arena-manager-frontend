import BarraCupos from './BarraCupos'
import { crearPantalla } from '../../pruebas/montar'

describe('BarraCupos (componente)', () => {
  const pantalla = crearPantalla()
  afterEach(pantalla.limpiar)

  it('expone el porcentaje de ocupación para lectores de pantalla', () => {
    const cont = pantalla.montar(<BarraCupos cupoOcupado={5} cupoMax={10} />)
    const barra = cont.querySelector('[role="progressbar"]')
    expect(barra.getAttribute('aria-valuenow')).toBe('50')
  })

  it('ajusta el ancho visual al porcentaje', () => {
    const cont = pantalla.montar(<BarraCupos cupoOcupado={3} cupoMax={12} />)
    expect(cont.querySelector('.progress-bar').style.width).toBe('25%')
  })

  it('nunca pasa de 100% aunque haya más inscritos que cupos', () => {
    const cont = pantalla.montar(<BarraCupos cupoOcupado={20} cupoMax={10} />)
    expect(cont.querySelector('.progress-bar').style.width).toBe('100%')
  })
})
