import { useState } from 'react'

const NOMBRE_ROL = { JUGADOR: 'Jugador', ORGANIZADOR: 'Organizador', ADMINISTRADOR: 'Administrador' }

/**
 * Barra de navegación principal (Bootstrap navbar).
 * Es un componente de presentación: no conoce el enrutador ni los contextos.
 *
 * Props:
 *  - enlaces:        [{ id, ruta, texto }] elementos del menú (el padre ya los filtró según el rol)
 *  - rutaActual:     ruta que se está mostrando (para marcar el enlace activo)
 *  - onNavegar:      función que recibe la ruta destino
 *  - usuario:        usuario de la sesión ({ nombre, rol }) o null si no hay sesión
 *  - onCerrarSesion: se llama al presionar "Cerrar sesión"
 *
 * Estado propio: `abierto`, solo para plegar/desplegar el menú en pantallas pequeñas.
 */
export default function Encabezado({
  enlaces = [],
  rutaActual = '',
  onNavegar = () => {},
  usuario = null,
  onCerrarSesion = () => {},
}) {
  const [abierto, setAbierto] = useState(false)

  // Son <a href="/ruta"> reales (clic central o "copiar enlace" funcionan),
  // pero se intercepta el clic para navegar sin recargar y cerrar el menú móvil.
  const ir = (evento, ruta) => {
    evento.preventDefault()
    onNavegar(ruta)
    setAbierto(false)
  }

  return (
    <header className="encabezado">
      <nav className="navbar navbar-expand-lg container" aria-label="Navegación principal">
        <a className="navbar-brand marca" href="/inicio" onClick={(e) => ir(e, '/inicio')}>
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
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {enlaces.map((enlace) => {
              const activo = rutaActual === enlace.ruta || rutaActual.startsWith(`${enlace.ruta}/`)
              return (
                <li key={enlace.id} className="nav-item">
                  <a
                    className={`nav-link ${activo ? 'active nav-activo' : ''}`}
                    href={enlace.ruta}
                    aria-current={activo ? 'page' : undefined}
                    onClick={(e) => ir(e, enlace.ruta)}
                  >
                    {enlace.texto}
                  </a>
                </li>
              )
            })}
          </ul>
          <div className="sesion-encabezado d-flex flex-wrap align-items-center gap-2 ms-lg-3 mt-2 mt-lg-0">
            {usuario ? (
              <>
                <span className="usuario-sesion" id="usuario-sesion">
                  Hola, <strong>{usuario.nombre || usuario.email}</strong>
                  <span className={`chip-rol chip-rol--${String(usuario.rol).toLowerCase()}`}>
                    {NOMBRE_ROL[usuario.rol] || usuario.rol}
                  </span>
                </span>
                <button
                  type="button"
                  id="boton-cerrar-sesion"
                  className="boton boton-pequeno boton-secundario btn btn-sm"
                  onClick={() => {
                    setAbierto(false)
                    onCerrarSesion()
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <a
                  id="enlace-login"
                  className="boton boton-pequeno boton-primario btn btn-sm"
                  href="/login"
                  onClick={(e) => ir(e, '/login')}
                >
                  Iniciar sesión
                </a>
                <a
                  id="enlace-registro"
                  className="boton boton-pequeno boton-secundario btn btn-sm"
                  href="/registro"
                  onClick={(e) => ir(e, '/registro')}
                >
                  Crear cuenta
                </a>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
