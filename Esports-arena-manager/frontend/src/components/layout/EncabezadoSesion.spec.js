import Encabezado from './Encabezado'
import { validarRegistro } from '../../pages/Registro'
import { validarTorneo } from '../admin/AdminTorneos'
import { crearPantalla } from '../../pruebas/montar'

describe('Encabezado con sesión', () => {
  const pantalla = crearPantalla()
  afterEach(pantalla.limpiar)

  it('sin sesión ofrece iniciar sesión y crear cuenta', () => {
    const onNavegar = jasmine.createSpy('onNavegar')
    const cont = pantalla.montar(<Encabezado enlaces={[]} onNavegar={onNavegar} />)
    expect(cont.querySelector('#usuario-sesion')).toBeNull()
    pantalla.clic(cont.querySelector('#enlace-login'))
    expect(onNavegar).toHaveBeenCalledWith('/login')
  })

  it('con sesión muestra el nombre, el rol y el botón para cerrarla', () => {
    const onCerrarSesion = jasmine.createSpy('onCerrarSesion')
    const cont = pantalla.montar(
      <Encabezado enlaces={[]} usuario={{ nombre: 'Olivia', rol: 'ORGANIZADOR' }} onCerrarSesion={onCerrarSesion} />
    )
    expect(cont.querySelector('#usuario-sesion').textContent).toContain('Olivia')
    expect(cont.querySelector('#usuario-sesion').textContent).toContain('Organizador')
    expect(cont.querySelector('#enlace-login')).toBeNull()
    pantalla.clic(cont.querySelector('#boton-cerrar-sesion'))
    expect(onCerrarSesion).toHaveBeenCalledTimes(1)
  })
})

describe('validaciones de formularios', () => {
  it('validarRegistro detecta cada campo inválido', () => {
    const errores = validarRegistro({ nombre: ' ', nickname: 'a b', email: 'malo', password: '123', confirmacion: '1234' })
    expect(Object.keys(errores).sort()).toEqual(['confirmacion', 'email', 'nickname', 'nombre', 'password'])
  })

  it('validarRegistro acepta datos correctos', () => {
    expect(validarRegistro({ nombre: 'Ana', nickname: 'anita', email: 'ana@arena.cl', password: 'secreto1', confirmacion: 'secreto1' })).toEqual({})
  })

  it('validarTorneo exige que el inicio sea posterior al cierre de inscripción', () => {
    const base = { nombre: 'Copa', juegoId: '1', cierre: '2026-10-10', inicio: '2026-10-12', fin: '2026-10-13', cupo: 8 }
    expect(validarTorneo(base)).toBeNull()
    expect(validarTorneo({ ...base, inicio: '2026-10-10' })).toContain('posterior')
    expect(validarTorneo({ ...base, cupo: 1 })).toContain('cupo')
    expect(validarTorneo({ ...base, nombre: '' })).toContain('nombre')
  })
})
