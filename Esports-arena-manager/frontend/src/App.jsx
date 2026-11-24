import { AppProvider, useApp } from './context/AppContext.jsx'
import Encabezado from './components/layout/Encabezado.jsx'
import PiePagina from './components/layout/PiePagina.jsx'
import Inicio from './components/vistas/Inicio.jsx'
import Torneos from './components/vistas/Torneos.jsx'
import DetalleTorneo from './components/vistas/DetalleTorneo.jsx'
import Inscripcion from './components/vistas/Inscripcion.jsx'
import Equipo from './components/vistas/Equipo.jsx'
import Perfil from './components/vistas/Perfil.jsx'

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
