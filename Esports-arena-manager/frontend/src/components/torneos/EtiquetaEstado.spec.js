import { act } from 'react'
import { createRoot } from 'react-dom/client'
import EtiquetaEstado from './EtiquetaEstado'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('EtiquetaEstado (componente)', () => {
  let contenedor
  let raiz

  beforeEach(() => {
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    raiz = createRoot(contenedor)
  })

  afterEach(() => {
    act(() => raiz.unmount())
    contenedor.remove()
  })

  it('muestra la etiqueta y clase para estado abierto', () => {
    act(() => {
      raiz.render(<EtiquetaEstado estado="abierto" />)
    })

    expect(contenedor.textContent).toContain('Inscripciones abiertas')
    const span = contenedor.querySelector('.etiqueta-estado')
    expect(span.classList.contains('estado-abierto')).toBeTrue()
  })

  it('muestra la etiqueta y clase para estado finalizado', () => {
    act(() => {
      raiz.render(<EtiquetaEstado estado="finalizado" />)
    })

    expect(contenedor.textContent).toContain('Finalizado')
    const span = contenedor.querySelector('.etiqueta-estado')
    expect(span.classList.contains('estado-finalizado')).toBeTrue()
  })
})
