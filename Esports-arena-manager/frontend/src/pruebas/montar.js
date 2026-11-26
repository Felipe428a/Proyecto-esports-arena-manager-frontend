/**
 * Ayudas compartidas por las pruebas de componentes (no es una prueba en sí).
 *
 * Un componente de React necesita un contenedor real en el DOM para dibujarse.
 * Esta ayuda lo crea, lo monta dentro de act() (que espera a que React termine de
 * renderizar) y lo limpia al terminar cada prueba, para que no se acumulen en la página.
 *
 * Uso típico:
 *   const pantalla = crearPantalla()
 *   afterEach(pantalla.limpiar)
 *   it('...', () => {
 *     const cont = pantalla.montar(<MiComponente />)
 *     pantalla.clic(cont.querySelector('button'))
 *     expect(cont.textContent).toContain('...')
 *   })
 */
import { act } from 'react'
import { createRoot } from 'react-dom/client'

// Le indica a React que está corriendo en un entorno de pruebas (evita advertencias)
globalThis.IS_REACT_ACT_ENVIRONMENT = true

export function crearPantalla() {
  let contenedor = null
  let raiz = null

  const limpiar = () => {
    if (raiz) act(() => raiz.unmount())
    if (contenedor) contenedor.remove()
    raiz = null
    contenedor = null
  }

  const montar = (elemento) => {
    limpiar()
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    raiz = createRoot(contenedor)
    act(() => raiz.render(elemento))
    return contenedor
  }

  // bubbles: true es necesario porque React escucha los eventos en la raíz
  const clic = (elemento) =>
    act(() => {
      elemento.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    })

  // Escribir en un <input>/<textarea> controlado: hay que usar el setter nativo
  // para que React detecte el cambio, y luego disparar el evento "input".
  const escribir = (campo, valor) =>
    act(() => {
      const prototipo = Object.getPrototypeOf(campo)
      Object.getOwnPropertyDescriptor(prototipo, 'value').set.call(campo, valor)
      campo.dispatchEvent(new Event('input', { bubbles: true }))
    })

  const elegir = (select, valor) =>
    act(() => {
      const prototipo = Object.getPrototypeOf(select)
      Object.getOwnPropertyDescriptor(prototipo, 'value').set.call(select, valor)
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

  const enviarFormulario = (formulario) =>
    act(() => {
      formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

  return { montar, limpiar, clic, escribir, elegir, enviarFormulario }
}
