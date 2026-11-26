import { createContext, useContext } from 'react'

/** Canal del contexto de sesión (sesión 2). null = componente fuera de <AuthProvider>. */
export const AuthContext = createContext(null)

/** Hook personalizado: cualquier componente lee la sesión sin recibirla por props. */
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth necesita <AuthProvider>')
  }
  return contexto
}
