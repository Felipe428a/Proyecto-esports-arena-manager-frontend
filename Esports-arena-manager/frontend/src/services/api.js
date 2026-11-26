/**
 * api.js — función base: TODAS las peticiones de la aplicación pasan por solicitar() (sesiones 1 y 2).
 *
 * - La URL del backend viene de VITE_API_URL (API Gateway). Nunca se escribe en los componentes.
 * - Si hay sesión, agrega Authorization: Bearer <token> (una sola vez, aquí).
 * - Si el access token venció, lo renueva con el refresh token antes de pedir (y una vez más si llega un 401).
 * - Si no se puede renovar: borra la sesión y avisa con el evento 'sesion-expirada'.
 * - Si la respuesta no es 2xx, lanza un Error con el { mensaje } que envía Spring Boot.
 */
import { leerSesion, guardarSesion, borrarSesion, tokenVencido } from './sesion'

export const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8070/api/v1'
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada'
export const EVENTO_SESION_RENOVADA = 'sesion-renovada'

/** Error HTTP con el código de estado, para que la interfaz distinga 401, 403, 404... */
export class ErrorApi extends Error {
  constructor(mensaje, estado, cuerpo) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.cuerpo = cuerpo
  }
}

const MENSAJES = {
  0: 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.',
  401: 'Tu sesión venció. Inicia sesión de nuevo.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  500: 'Ocurrió un error en el servidor. Intenta más tarde.',
}

// Una sola renovación a la vez, aunque fallen varias peticiones en paralelo
let renovacionEnCurso = null

export async function renovarSesion() {
  if (renovacionEnCurso) return renovacionEnCurso
  const actual = leerSesion()
  if (!actual?.refreshToken) return null
  renovacionEnCurso = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: actual.refreshToken }),
      })
      if (!res.ok) return null
      const nueva = await res.json()
      guardarSesion(nueva)
      window.dispatchEvent(new CustomEvent(EVENTO_SESION_RENOVADA, { detail: nueva }))
      return nueva
    } catch {
      return null
    } finally {
      renovacionEnCurso = null
    }
  })()
  return renovacionEnCurso
}

function cerrarPorExpiracion() {
  borrarSesion()
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
}

async function leerCuerpo(res) {
  if (res.status === 204) return null
  const texto = await res.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

/**
 * @param {string} ruta     ruta relativa a la API, por ejemplo '/torneos'
 * @param {object} opciones las de fetch; además `publica: true` evita enviar el token
 */
export async function solicitar(ruta, opciones = {}) {
  const { publica = false, ...opcionesFetch } = opciones
  let sesion = publica ? null : leerSesion()

  // El token vence pronto: se renueva antes de pedir
  if (sesion && tokenVencido(sesion.token, 10_000)) {
    sesion = await renovarSesion()
    if (!sesion) cerrarPorExpiracion()
  }

  const enviar = (token) => {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return fetch(`${API_URL}${ruta}`, {
      ...opcionesFetch,
      headers: { ...headers, ...opcionesFetch.headers },
    })
  }

  let res
  try {
    res = await enviar(sesion?.token)
    // 401 con token: quizás venció justo ahora. Se intenta renovar una vez y repetir.
    if (res.status === 401 && sesion?.token) {
      const nueva = await renovarSesion()
      if (nueva) {
        res = await enviar(nueva.token)
      }
      if (res.status === 401) cerrarPorExpiracion()
    }
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ErrorApi(MENSAJES[0], 0)
  }

  const cuerpo = await leerCuerpo(res)
  if (!res.ok) {
    const mensaje = (cuerpo && (cuerpo.mensaje || cuerpo.error)) || MENSAJES[res.status] || `Error ${res.status}`
    throw new ErrorApi(mensaje, res.status, cuerpo)
  }
  return cuerpo
}

/** Atajos para no repetir method y JSON.stringify. */
export const api = {
  get: (ruta, opciones) => solicitar(ruta, opciones),
  post: (ruta, datos, opciones) => solicitar(ruta, { ...opciones, method: 'POST', body: JSON.stringify(datos ?? {}) }),
  put: (ruta, datos, opciones) => solicitar(ruta, { ...opciones, method: 'PUT', body: JSON.stringify(datos ?? {}) }),
  patch: (ruta, datos, opciones) =>
    solicitar(ruta, { ...opciones, method: 'PATCH', body: datos === undefined ? undefined : JSON.stringify(datos) }),
  delete: (ruta, opciones) => solicitar(ruta, { ...opciones, method: 'DELETE' }),
}
