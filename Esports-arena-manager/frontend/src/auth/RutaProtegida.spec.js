import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import RutaProtegida from './RutaProtegida'
import { AuthContext } from './useAuth'
import { crearPantalla } from '../pruebas/montar'

/** Muestra a dónde redirigió RutaProtegida y qué página recordó (state.desde). */
function PaginaLogin() {
  const ubicacion = useLocation()
  return <p id="login">Login · desde={ubicacion.state?.desde}</p>
}

describe('RutaProtegida (vistas protegidas por sesión y rol)', () => {
  const pantalla = crearPantalla()
  afterEach(pantalla.limpiar)

  const montar = (usuario, roles, ruta = '/admin') =>
    pantalla.montar(
      <AuthContext value={{ autenticado: Boolean(usuario), usuario }}>
        <MemoryRouter initialEntries={[ruta]}>
          <Routes>
            <Route path="/login" element={<PaginaLogin />} />
            <Route path="/admin" element={<RutaProtegida roles={roles}><p id="secreto">Panel</p></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><p id="perfil">Perfil</p></RutaProtegida>} />
          </Routes>
        </MemoryRouter>
      </AuthContext>
    )

  it('sin sesión redirige a /login y recuerda la página pedida', () => {
    const cont = montar(null, ['ADMINISTRADOR'])
    expect(cont.querySelector('#secreto')).toBeNull()
    expect(cont.querySelector('#login').textContent).toContain('desde=/admin')
  })

  it('con sesión pero sin el rol muestra "No tienes permiso" sin redirigir', () => {
    const cont = montar({ id: 5, rol: 'JUGADOR' }, ['ORGANIZADOR', 'ADMINISTRADOR'])
    expect(cont.querySelector('#secreto')).toBeNull()
    expect(cont.querySelector('#sin-permiso').textContent).toContain('No tienes permiso')
    expect(cont.querySelector('#login')).toBeNull()
  })

  it('con el rol correcto muestra la vista', () => {
    const cont = montar({ id: 1, rol: 'ORGANIZADOR' }, ['ORGANIZADOR', 'ADMINISTRADOR'])
    expect(cont.querySelector('#secreto').textContent).toBe('Panel')
  })

  it('sin roles exigidos basta con tener sesión', () => {
    const cont = montar({ id: 5, rol: 'JUGADOR' }, undefined, '/perfil')
    expect(cont.querySelector('#perfil')).not.toBeNull()
  })
})
