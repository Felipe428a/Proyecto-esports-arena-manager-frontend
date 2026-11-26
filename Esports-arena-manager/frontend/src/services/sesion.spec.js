import { leerSesion, guardarSesion, borrarSesion, leerPayload, tokenVencido, sesionVencida, CLAVE_SESION } from './sesion'
import { tokenFalso } from '../pruebas/tokens'

describe('sesion.js (sesión persistente en localStorage)', () => {
  const ahoraSeg = () => Math.floor(Date.now() / 1000)
  const sesionValida = () => ({
    token: tokenFalso({ sub: 'ana@arena.cl', rol: 'ADMINISTRADOR', exp: ahoraSeg() + 900 }),
    refreshToken: 'refresh-123',
    expiraEn: Date.now() + 900_000,
    refreshExpiraEn: Date.now() + 86_400_000,
    usuario: { id: 1, nombre: 'Ana', rol: 'ADMINISTRADOR' },
  })

  beforeEach(() => localStorage.clear())
  afterAll(() => localStorage.clear())

  it('guarda la sesión como texto JSON y la vuelve a leer (sobrevive a una recarga)', () => {
    guardarSesion(sesionValida())
    expect(typeof localStorage.getItem(CLAVE_SESION)).toBe('string')
    expect(leerSesion().usuario.nombre).toBe('Ana')
  })

  it('no guarda campos extra como la contraseña', () => {
    guardarSesion({ ...sesionValida(), password: 'secreta' })
    expect(localStorage.getItem(CLAVE_SESION)).not.toContain('secreta')
  })

  it('borrarSesion deja al usuario sin sesión', () => {
    guardarSesion(sesionValida())
    borrarSesion()
    expect(leerSesion()).toBeNull()
  })

  it('descarta la sesión si el refresh token ya venció', () => {
    guardarSesion({ ...sesionValida(), refreshExpiraEn: Date.now() - 1000 })
    expect(leerSesion()).toBeNull()
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull()
  })

  it('mantiene la sesión si solo venció el access token (se puede renovar)', () => {
    guardarSesion({ ...sesionValida(), token: tokenFalso({ exp: ahoraSeg() - 60 }) })
    expect(leerSesion()).not.toBeNull()
  })

  it('ignora datos corruptos en localStorage', () => {
    localStorage.setItem(CLAVE_SESION, '[object Object]')
    expect(leerSesion()).toBeNull()
  })

  it('leerPayload decodifica Base64URL (incluye tildes)', () => {
    const datos = leerPayload(tokenFalso({ sub: 'x', nombre: 'Tomás' }))
    expect(datos.sub).toBe('x')
    expect(datos.nombre).toBe('Tomás')
  })

  it('tokenVencido compara exp (segundos) con la hora actual (milisegundos)', () => {
    expect(tokenVencido(tokenFalso({ exp: ahoraSeg() + 600 }))).toBeFalse()
    expect(tokenVencido(tokenFalso({ exp: ahoraSeg() - 1 }))).toBeTrue()
    expect(tokenVencido(tokenFalso({ exp: ahoraSeg() + 5 }), 10_000)).toBeTrue()
    expect(tokenVencido('no-es-un-token')).toBeTrue()
  })

  it('sesionVencida sin refresh token depende solo del access token', () => {
    expect(sesionVencida({ token: tokenFalso({ exp: ahoraSeg() + 60 }) })).toBeFalse()
    expect(sesionVencida({ token: tokenFalso({ exp: ahoraSeg() - 60 }) })).toBeTrue()
    expect(sesionVencida(null)).toBeTrue()
  })
})
