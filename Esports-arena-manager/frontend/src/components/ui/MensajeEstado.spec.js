import { act } from 'react'
import { createRoot } from 'react-dom/client'
import MensajeEstado from './MensajeEstado.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('MensajeEstado (componente)', () => {
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

  it('renderiza el texto y la clase por defecto (info)', () => {
    act(() => {
      raiz.render(<MensajeEstado>Información importante</MensajeEstado>)
    })

    expect(contenedor.textContent).toContain('Información importante')
    const div = contenedor.querySelector('.mensaje-estado')
    expect(div.classList.contains('mensaje-estado--info')).toBeTrue()
    expect(div.getAttribute('role')).toBe('status')
  })

  it('asigna rol alert y clase error para tipo error', () => {
    act(() => {
      raiz.render(<MensajeEstado tipo="error">Ocurrió un fallo</MensajeEstado>)
    })

    expect(contenedor.textContent).toContain('Ocurrió un fallo')
    const div = contenedor.querySelector('.mensaje-estado')
    expect(div.classList.contains('mensaje-estado--error')).toBeTrue()
    expect(div.getAttribute('role')).toBe('alert')
  })
})
