import { solicitar, api, API_URL, EVENTO_SESION_EXPIRADA } from './api'
import { guardarSesion, leerSesion } from './sesion'
import { tokenFalso } from '../pruebas/tokens'

/** Respuesta HTTP simulada para el espía de fetch. */
function respuesta(estado, cuerpo) {
  return Promise.resolve(new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  }))
}

describe('api.js · solicitar() (capa de servicios)', () => {
  const ahoraSeg = () => Math.floor(Date.now() / 1000)
  const sesion = (exp) => ({
    token: tokenFalso({ sub: 'ana@arena.cl', exp }),
    refreshToken: 'refresh-viejo',
    refreshExpiraEn: Date.now() + 86_400_000,
    usuario: { id: 1, nombre: 'Ana', rol: 'JUGADOR' },
  })

  beforeEach(() => localStorage.clear())
  afterAll(() => localStorage.clear())

  it('usa la URL base y no envía Authorization si no hay sesión', async () => {
    const espia = spyOn(window, 'fetch').and.returnValue(respuesta(200, [{ id: 1 }]))
    const datos = await solicitar('/torneos')
    const [url, opciones] = espia.calls.mostRecent().args
    expect(url).toBe(`${API_URL}/torneos`)
    expect(opciones.headers.Authorization).toBeUndefined()
    expect(datos).toEqual([{ id: 1 }])
  })

  it('agrega "Authorization: Bearer <token>" cuando hay sesión', async () => {
    guardarSesion(sesion(ahoraSeg() + 900))
    const espia = spyOn(window, 'fetch').and.returnValue(respuesta(200, {}))
    await solicitar('/equipos')
    const { headers } = espia.calls.mostRecent().args[1]
    expect(headers.Authorization).toBe(`Bearer ${leerSesion().token}`)
  })

  it('las peticiones públicas no envían el token aunque haya sesión', async () => {
    guardarSesion(sesion(ahoraSeg() + 900))
    const espia = spyOn(window, 'fetch').and.returnValue(respuesta(200, []))
    await solicitar('/juegos', { publica: true })
    expect(espia.calls.mostRecent().args[1].headers.Authorization).toBeUndefined()
  })

  it('204 No Content devuelve null', async () => {
    spyOn(window, 'fetch').and.returnValue(respuesta(204))
    expect(await api.delete('/juegos/1')).toBeNull()
  })

  it('convierte un error del backend en Error con el { mensaje } y el estado', async () => {
    spyOn(window, 'fetch').and.returnValue(respuesta(400, { mensaje: 'No superar cupos' }))
    await expectAsync(solicitar('/inscripciones', { method: 'POST' })).toBeRejectedWith(
      jasmine.objectContaining({ message: 'No superar cupos', estado: 400 })
    )
  })

  it('403 mantiene la sesión y muestra el mensaje del backend', async () => {
    guardarSesion(sesion(ahoraSeg() + 900))
    spyOn(window, 'fetch').and.returnValue(respuesta(403, { mensaje: 'Sin permiso para esta acción' }))
    await expectAsync(solicitar('/juegos', { method: 'POST' })).toBeRejectedWith(
      jasmine.objectContaining({ estado: 403 })
    )
    expect(leerSesion()).not.toBeNull()
  })

  it('sin conexión responde un mensaje entendible', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject(new TypeError('Failed to fetch')))
    await expectAsync(solicitar('/torneos')).toBeRejectedWith(jasmine.objectContaining({ estado: 0 }))
  })

  it('si el access token venció, lo renueva con el refresh token antes de pedir', async () => {
    guardarSesion(sesion(ahoraSeg() - 30))
    const nuevo = sesion(ahoraSeg() + 900)
    nuevo.refreshToken = 'refresh-nuevo'
    const espia = spyOn(window, 'fetch').and.callFake((url) =>
      url.endsWith('/auth/refresh') ? respuesta(200, nuevo) : respuesta(200, { ok: true })
    )

    await solicitar('/inscripciones')

    expect(espia.calls.argsFor(0)[0]).toBe(`${API_URL}/auth/refresh`)
    expect(espia.calls.argsFor(1)[1].headers.Authorization).toBe(`Bearer ${nuevo.token}`)
    expect(leerSesion().refreshToken).toBe('refresh-nuevo')
  })

  it('ante un 401 con token renueva una vez y repite la petición', async () => {
    guardarSesion(sesion(ahoraSeg() + 900))
    const nuevo = sesion(ahoraSeg() + 1800)
    let llamadasProtegidas = 0
    spyOn(window, 'fetch').and.callFake((url) => {
      if (url.endsWith('/auth/refresh')) return respuesta(200, nuevo)
      llamadasProtegidas += 1
      return llamadasProtegidas === 1 ? respuesta(401, { mensaje: 'Sesión no válida o vencida' }) : respuesta(200, { id: 9 })
    })

    expect(await solicitar('/equipos')).toEqual({ id: 9 })
    expect(llamadasProtegidas).toBe(2)
  })

  it('si no se puede renovar, borra la sesión y avisa con "sesion-expirada"', async () => {
    guardarSesion(sesion(ahoraSeg() + 900))
    const aviso = jasmine.createSpy('aviso')
    window.addEventListener(EVENTO_SESION_EXPIRADA, aviso)
    spyOn(window, 'fetch').and.callFake((url) =>
      url.endsWith('/auth/refresh') ? respuesta(401, { mensaje: 'Sesión no válida o vencida' }) : respuesta(401, {})
    )

    await expectAsync(solicitar('/equipos')).toBeRejected()

    expect(leerSesion()).toBeNull()
    expect(aviso).toHaveBeenCalled()
    window.removeEventListener(EVENTO_SESION_EXPIRADA, aviso)
  })
})
