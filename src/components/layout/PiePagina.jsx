/**
 * Pie de página. Componente de presentación: recibe por props la función de navegación.
 *
 * Props:
 *  - onNavegar: función que recibe la ruta destino
 *
 * Nota: los enlaces de soporte usan mailto: y no "#soporte". Con enrutador por hash,
 * un href="#soporte" cambiaría la ruta a una que no existe y dejaría la pantalla en blanco.
 */
const ENLACES_PIE = [
  { ruta: '/torneos', texto: 'Listado de torneos' },
  { ruta: '/inscripcion', texto: 'Inscribirme a un torneo' },
  { ruta: '/equipo', texto: 'Gestionar mi equipo' },
  { ruta: '/perfil', texto: 'Mi perfil' },
]

export default function PiePagina({ onNavegar = () => {} }) {
  const ir = (evento, ruta) => {
    evento.preventDefault()
    onNavegar(ruta)
  }

  return (
    <footer className="pie-pagina">
      <div className="container">
        <div className="row g-4">
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
              {ENLACES_PIE.map((enlace) => (
                <li key={enlace.ruta}>
                  <a href={`#${enlace.ruta}`} onClick={(e) => ir(e, enlace.ruta)}>
                    {enlace.texto}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-lg-4">
            <h4>Contacto</h4>
            <ul>
              <li>
                <a href="mailto:contacto@arenamanager.cl">contacto@arenamanager.cl</a>
              </li>
              <li>
                <a href="mailto:contacto@arenamanager.cl?subject=Soporte%20y%20reglamento">
                  Soporte y reglamento
                </a>
              </li>
              <li>
                <a href="mailto:contacto@arenamanager.cl?subject=Reportar%20un%20problema">
                  Reportar un problema
                </a>
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
