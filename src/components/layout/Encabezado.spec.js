import Encabezado from './Encabezado'
import { crearPantalla } from '../../pruebas/montar'

describe('Encabezado (componente)', () => {
  const pantalla = crearPantalla()
  afterEach(pantalla.limpiar)

  const enlaces = [
    { id: 'inicio', ruta: '/inicio', texto: 'Inicio' },
    { id: 'torneos', ruta: '/torneos', texto: 'Torneos' },
    { id: 'perfil', ruta: '/perfil', texto: 'Mi perfil' },
  ]

  it('muestra un enlace por cada elemento del menú', () => {
    const cont = pantalla.montar(<Encabezado enlaces={enlaces} rutaActual="/inicio" />)
    expect(cont.querySelectorAll('.nav-link').length).toBe(3)
    expect(cont.textContent).toContain('Mi perfil')
  })

  it('marca como activo solo el enlace de la ruta actual', () => {
    const cont = pantalla.montar(<Encabezado enlaces={enlaces} rutaActual="/torneos" />)
    const activos = cont.querySelectorAll('.nav-link.active')
    expect(activos.length).toBe(1)
    expect(activos[0].textContent).toBe('Torneos')
    expect(activos[0].getAttribute('aria-current')).toBe('page')
  })

  it('al hacer clic en un enlace entrega la ruta al padre (espía)', () => {
    const onNavegar = jasmine.createSpy('onNavegar')
    const cont = pantalla.montar(
      <Encabezado enlaces={enlaces} rutaActual="/inicio" onNavegar={onNavegar} />
    )

    pantalla.clic(cont.querySelectorAll('.nav-link')[2])

    expect(onNavegar).toHaveBeenCalledOnceWith('/perfil')
  })

  it('el logo lleva al inicio', () => {
    const onNavegar = jasmine.createSpy('onNavegar')
    const cont = pantalla.montar(
      <Encabezado enlaces={enlaces} rutaActual="/torneos" onNavegar={onNavegar} />
    )
    pantalla.clic(cont.querySelector('.navbar-brand'))
    expect(onNavegar).toHaveBeenCalledWith('/inicio')
  })

  describe('menú en pantallas pequeñas (estado interno)', () => {
    it('parte cerrado y el botón hamburguesa lo abre y lo cierra', () => {
      const cont = pantalla.montar(<Encabezado enlaces={enlaces} rutaActual="/inicio" />)
      const menu = cont.querySelector('#menu-principal')
      const boton = cont.querySelector('.navbar-toggler')

      expect(menu.classList.contains('show')).toBeFalse()
      pantalla.clic(boton)
      expect(menu.classList.contains('show')).toBeTrue()
      expect(boton.getAttribute('aria-expanded')).toBe('true')
      pantalla.clic(boton)
      expect(menu.classList.contains('show')).toBeFalse()
    })

    it('se cierra solo al elegir un enlace', () => {
      const cont = pantalla.montar(<Encabezado enlaces={enlaces} rutaActual="/inicio" />)
      pantalla.clic(cont.querySelector('.navbar-toggler'))
      pantalla.clic(cont.querySelectorAll('.nav-link')[1])
      expect(cont.querySelector('#menu-principal').classList.contains('show')).toBeFalse()
    })
  })
})
