import { useApp } from '../../context/AppContext'

export default function Encabezado() {
  const { vistaActual, navegar } = useApp()

  const links = [
    { id: 'inicio', texto: 'Inicio' },
    { id: 'torneos', texto: 'Torneos' },
    { id: 'inscripcion', texto: 'Inscripción' },
    { id: 'equipo', texto: 'Mi equipo' },
    { id: 'perfil', texto: 'Mi perfil' },
  ]

  return (
    <header className="encabezado">
      <div className="barra-encabezado contenedor">
        <button
          type="button"
          className="marca"
          onClick={() => navegar('inicio')}
        >
          Arena<span>Manager</span>
        </button>
        <nav className="nav-principal" aria-label="Navegación principal">
          <ul>
            {links.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={vistaActual === link.id ? 'nav-activo' : ''}
                  aria-current={vistaActual === link.id ? 'page' : undefined}
                  onClick={() => navegar(link.id)}
                >
                  {link.texto}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
