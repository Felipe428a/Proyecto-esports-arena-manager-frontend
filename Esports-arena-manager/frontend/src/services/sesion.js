/**
 * sesion.js — una sola puerta para la sesión (sesión 2, versión 2: localStorage).
 *
 * Se guarda { token, refreshToken, expiraEn, refreshExpiraEn, usuario } en la clave 'sesion'.
 * - Sobrevive a la recarga de la página (localStorage).
 * - Si el refresh token ya venció, la sesión se descarta al leerla.
 * - Nunca se guarda la contraseña; el token no lleva datos sensibles.
 *
 * Nadie más toca localStorage: AuthProvider y api.js usan solo estas funciones.
 */
export const CLAVE_SESION = 'sesion'

/** Lee el payload de un JWT (Base64URL → JSON). Leer no es verificar: eso lo hace el backend. */
export function leerPayload(token) {
  try {
    const parte = token.split('.')[1]
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/')
    const texto = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(texto)
  } catch {
    return null
  }
}

/** true si el access token ya venció (o vence en los próximos `margenMs`). exp viene en segundos. */
export function tokenVencido(token, margenMs = 0, ahora = Date.now()) {
  const payload = token ? leerPayload(token) : null
  if (!payload || !payload.exp) return true
  return payload.exp * 1000 - margenMs <= ahora
}

/** La sesión deja de servir cuando vence el refresh token (ya no se puede renovar). */
export function sesionVencida(sesion, ahora = Date.now()) {
  if (!sesion || !sesion.token) return true
  if (sesion.refreshToken && sesion.refreshExpiraEn) return sesion.refreshExpiraEn <= ahora
  return tokenVencido(sesion.token, 0, ahora)
}

function almacenamiento() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null // modo privado o almacenamiento bloqueado
  }
}

export function leerSesion() {
  const ls = almacenamiento()
  if (!ls) return null
  let sesion = null
  try {
    const texto = ls.getItem(CLAVE_SESION)
    sesion = texto ? JSON.parse(texto) : null
  } catch {
    sesion = null
  }
  if (sesion && sesionVencida(sesion)) {
    borrarSesion()
    return null
  }
  return sesion
}

export function guardarSesion(sesion) {
  const ls = almacenamiento()
  if (!ls) return
  // Se guarda solo lo necesario (nunca la contraseña)
  const { token, refreshToken, expiraEn, refreshExpiraEn, usuario } = sesion
  ls.setItem(CLAVE_SESION, JSON.stringify({ token, refreshToken, expiraEn, refreshExpiraEn, usuario }))
}

export function borrarSesion() {
  almacenamiento()?.removeItem(CLAVE_SESION)
}
