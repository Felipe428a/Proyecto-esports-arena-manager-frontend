import { AppProvider, useApp } from './context/AppContext'
import Encabezado from './components/layout/Encabezado'
import PiePagina from './components/layout/PiePagina'
import Inicio from './components/vistas/Inicio'
import Torneos from './components/vistas/Torneos'
import DetalleTorneo from './components/vistas/DetalleTorneo'
import Inscripcion from './components/vistas/Inscripcion'
import Equipo from './components/vistas/Equipo'
import Perfil from './components/vistas/Perfil'

function ContenidoPrincipal() {
  const { vistaActual } = useApp()

  const renderizarVista = () => {
    switch (vistaActual) {
      case 'inicio':
        return <Inicio />
      case 'torneos':
        return <Torneos />
      case 'detalle-torneo':
        return <DetalleTorneo />
      case 'inscripcion':
        return <Inscripcion />
      case 'equipo':
        return <Equipo />
      case 'perfil':
        return <Perfil />
      default:
        return <Inicio />
    }
  }

  return (
    <>
      <Encabezado />
      {renderizarVista()}
      <PiePagina />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ContenidoPrincipal />
    </AppProvider>
  )
}
