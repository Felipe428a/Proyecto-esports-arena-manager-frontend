import { useState } from 'react'

/**
 * Barra de navegación principal (Bootstrap navbar).
 * Es un componente de presentación: no conoce el enrutador ni el contexto.
 *
 * Props:
 *  - enlaces:    [{ id, ruta, texto }] elementos del menú
 *  - rutaActual: ruta que se está mostrando (para marcar el enlace activo)
 *  - onNavegar:  función que recibe la ruta destino (la entrega el padre)
 *
 * Estado propio: `abierto`, solo para plegar/desplegar el menú en pantallas pequeñas.
 */
export default function Encabezado({ enlaces = [], rutaActual = '', onNavegar = () => {} }) {
  const [abierto, setAbierto] = useState(false)

  // Los enlaces son <a href="#/ruta"> reales (funcionan con clic central o "copiar enlace"),
  // pero se intercepta el clic para navegar sin recargar y cerrar el menú móvil.
  const ir = (evento, ruta) => {
    evento.preventDefault()
    onNavegar(ruta)
    setAbierto(false)
  }

  return (
    <header className="encabezado">
      <nav className="navbar navbar-expand-lg container" aria-label="Navegación principal">
        <a
          className="navbar-brand marca"
          href="#/inicio"
          onClick={(e) => ir(e, '/inicio')}
        >
          Arena<span>Manager</span>
        </a>
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
            {enlaces.map((enlace) => {
              const activo = rutaActual === enlace.ruta
              return (
                <li key={enlace.id} className="nav-item">
                  <a
                    className={`nav-link ${activo ? 'active nav-activo' : ''}`}
                    href={`#${enlace.ruta}`}
                    aria-current={activo ? 'page' : undefined}
                    onClick={(e) => ir(e, enlace.ruta)}
                  >
                    {enlace.texto}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </header>
  )
}
