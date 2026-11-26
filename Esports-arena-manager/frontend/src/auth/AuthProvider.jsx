import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './useAuth'
import { authService } from '../services/auth'
import { leerSesion, guardarSesion, borrarSesion, CLAVE_SESION } from '../services/sesion'
import { EVENTO_SESION_EXPIRADA, EVENTO_SESION_RENOVADA } from '../services/api'
import { puede, tieneRol } from './permisos'

/**
 * Guarda la sesión y la comparte con toda la aplicación (useContext).
 *
 * - useState(leerSesion): lee localStorage UNA vez, en el primer render → la sesión sobrevive a F5.
 * - Al montar con sesión guardada, la confirma con GET /auth/me (si el backend la rechaza, se cierra).
 * - Escucha 'sesion-expirada' (lo dispara api.js ante un 401 sin renovación posible).
 * - Escucha 'sesion-renovada' (api.js renovó el token con el refresh token).
 * - Escucha 'storage': si se cierra sesión en otra pestaña, se cierra aquí también.
 */
export default function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion)
  const [aviso, setAviso] = useState(null)

  const login = useCallback(async (credenciales) => {
    const datos = await authService.login(credenciales)
    guardarSesion(datos)
    setSesion(datos)
    setAviso(null)
    return datos.usuario
  }, [])

  const registrar = useCallback(async (datosRegistro) => {
    const datos = await authService.registro(datosRegistro)
    guardarSesion(datos)
    setSesion(datos)
    setAviso(null)
    return datos.usuario
  }, [])

  const logout = useCallback(async () => {
    const refresh = leerSesion()?.refreshToken
    borrarSesion()
    setSesion(null)
    if (refresh) {
      // Revoca el refresh token en el backend; si falla, la sesión local ya quedó cerrada
      authService.logout(refresh).catch(() => {})
    }
  }, [])

  // Avisos del navegador: sesión expirada, renovada o cambiada en otra pestaña
  useEffect(() => {
    const alExpirar = () => {
      setSesion(null)
      setAviso('Tu sesión venció. Inicia sesión de nuevo.')
    }
    const alRenovar = (e) => setSesion(e.detail)
    const alCambiarOtraPestana = (e) => {
      if (e.key === CLAVE_SESION) setSesion(leerSesion())
    }
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    window.addEventListener(EVENTO_SESION_RENOVADA, alRenovar)
    window.addEventListener('storage', alCambiarOtraPestana)
    return () => {
      window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
      window.removeEventListener(EVENTO_SESION_RENOVADA, alRenovar)
      window.removeEventListener('storage', alCambiarOtraPestana)
    }
  }, [])

  // Al recargar con una sesión guardada, se confirma con el backend (rol actualizado, cuenta activa)
  useEffect(() => {
    if (!leerSesion()) return
    const control = new AbortController()
    authService
      .yo({ signal: control.signal })
      .then((usuario) => {
        const actual = leerSesion()
        if (!actual) return
        const nueva = { ...actual, usuario: { ...actual.usuario, ...usuario } }
        guardarSesion(nueva)
        setSesion(nueva)
      })
      .catch(() => {
        // 401: api.js ya cerró la sesión. Sin conexión: se mantiene la sesión local.
      })
    return () => control.abort()
  }, [])

  const usuario = sesion?.usuario ?? null
  const valor = useMemo(
    () => ({
      usuario,
      autenticado: sesion !== null,
      aviso,
      limpiarAviso: () => setAviso(null),
      login,
      registrar,
      logout,
      tieneRol: (roles) => tieneRol(usuario, roles),
      puede: (accion) => puede(usuario, accion),
    }),
    [sesion, usuario, aviso, login, registrar, logout]
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}
