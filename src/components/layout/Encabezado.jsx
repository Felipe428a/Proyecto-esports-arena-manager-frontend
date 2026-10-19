import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function Encabezado() {
  const { vistaActual, navegar } = useApp()
  const [abierto, setAbierto] = useState(false)

  const links = [
    { id: 'inicio', texto: 'Inicio' },
    { id: 'torneos', texto: 'Torneos' },
    { id: 'inscripcion', texto: 'Inscripción' },
    { id: 'equipo', texto: 'Mi equipo' },
    { id: 'perfil', texto: 'Mi perfil' },
  ]

  const ir = (id) => {
    navegar(id)
    setAbierto(false) // cierra el menú en pantallas pequeñas
  }

  return (
    <header className="encabezado">
      <nav className="navbar navbar-expand-lg container" aria-label="Navegación principal">
        <button type="button" className="navbar-brand marca border-0 bg-transparent" onClick={() => ir('inicio')}>
          Arena<span>Manager</span>
        </button>
        <button
          type="button"
          className="navbar-toggler"
          aria-controls="menu-principal"
          aria-expanded={abierto}
          aria-label="Mostrar u ocultar el menú"
          onClick={() => setAbierto(!abierto)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="menu-principal" className={`collapse navbar-collapse ${abierto ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto">
            {links.map((link) => (
              <li key={link.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${vistaActual === link.id ? 'active nav-activo' : ''}`}
                  aria-current={vistaActual === link.id ? 'page' : undefined}
                  onClick={() => ir(link.id)}
                >
                  {link.texto}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
