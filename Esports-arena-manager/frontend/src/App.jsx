import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { useAuth } from './auth/useAuth'
import RutaProtegida from './auth/RutaProtegida'
import { ENLACES_MENU, enlacesVisibles } from './rutas'
import Encabezado from './components/layout/Encabezado'
import PiePagina from './components/layout/PiePagina'
import AvisoSesion from './components/layout/AvisoSesion'
import Inicio from './components/vistas/Inicio'
import Torneos from './components/vistas/Torneos'
import DetalleTorneo from './components/vistas/DetalleTorneo'
import Inscripcion from './components/vistas/Inscripcion'
import Equipo from './components/vistas/Equipo'
import Perfil from './components/vistas/Perfil'
import Admin from './components/vistas/Admin'
import NoEncontrada from './components/vistas/NoEncontrada'
import Login from './pages/Login'
import Registro from './pages/Registro'

const STAFF = ['ORGANIZADOR', 'ADMINISTRADOR']

/**
 * Conecta el enrutador (react-router) con los componentes:
 * - Rutas públicas: inicio, torneos, detalle, login y registro.
 * - Rutas con sesión: inscripción, equipo y perfil.
 * - Rutas por rol: panel de gestión (organizador y administrador).
 */
export default function App() {
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const { usuario, logout } = useAuth()

  const cerrarSesion = async () => {
    await logout()
    navigate('/inicio', { replace: true })
  }

  return (
      <>
        <Encabezado
            enlaces={enlacesVisibles(usuario, ENLACES_MENU)}
            rutaActual={ubicacion.pathname}
            onNavegar={(ruta) => navigate(ruta)}
            usuario={usuario}
            onCerrarSesion={cerrarSesion}
        />
        <AvisoSesion />
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/torneos" element={<Torneos />} />
          <Route path="/torneos/:id" element={<DetalleTorneo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/inscripcion" element={<RutaProtegida><Inscripcion /></RutaProtegida>} />
          <Route path="/equipo" element={<RutaProtegida><Equipo /></RutaProtegida>} />
          <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
          <Route path="/admin" element={<RutaProtegida roles={STAFF}><Admin /></RutaProtegida>} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
        <PiePagina onNavegar={(ruta) => navigate(ruta)} />
      </>
  )
}
