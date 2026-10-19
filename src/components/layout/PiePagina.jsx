import { useApp } from '../../context/AppContext'

export default function PiePagina() {
  const { navegar } = useApp()

  return (
    <footer className="pie-pagina">
      <div className="container"><div className="row g-4">
        <div className="col-12 col-md-6 col-lg-4">
          <h4>eSports Arena Manager</h4>
          <p>
            Plataforma para organizar torneos de videojuegos competitivos:
            inscripciones, partidas, resultados y rankings en un solo lugar.
          </p>
        </div>
        <div className="col-6 col-lg-4">
          <h4>Navegación</h4>
          <ul>
            <li>
              <button type="button" onClick={() => navegar('torneos')}>
                Listado de torneos
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navegar('inscripcion')}>
                Inscribirme a un torneo
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navegar('equipo')}>
                Gestionar mi equipo
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navegar('perfil')}>
                Mi perfil
              </button>
            </li>
          </ul>
        </div>
        <div className="col-6 col-lg-4">
          <h4>Contacto</h4>
          <ul>
            <li>
              <a href="mailto:contacto@arenamanager.cl">contacto@arenamanager.cl</a>
            </li>
            <li>
              <a href="#soporte">Soporte y reglamento</a>
            </li>
            <li>
              <a href="#reportar">Reportar un problema</a>
            </li>
          </ul>
        </div>
        </div>
      </div>
      <p className="pie-legal">
        © 2026 eSports Arena Manager. Proyecto académico — Desarrollo FullStack II.
      </p>
    </footer>
  )
}
