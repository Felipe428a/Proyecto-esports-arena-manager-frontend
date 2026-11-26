import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { NOMBRE_ROL } from '../../auth/permisos'
import { useApp } from '../../context/AppContext'
import EstadoCarga from '../ui/EstadoCarga'
import AdminTorneos from '../admin/AdminTorneos'
import AdminPartidas from '../admin/AdminPartidas'
import AdminSanciones from '../admin/AdminSanciones'
import AdminJuegos from '../admin/AdminJuegos'
import AdminUsuarios from '../admin/AdminUsuarios'

/**
 * Panel de gestión (ruta protegida para ORGANIZADOR y ADMINISTRADOR).
 * Dentro del panel, cada pestaña exige además su permiso: Juegos y Usuarios son solo para ADMINISTRADOR.
 */
const PESTANAS = [
  { id: 'torneos', texto: 'Torneos', permiso: 'gestionarTorneos', Componente: AdminTorneos },
  { id: 'partidas', texto: 'Partidas y resultados', permiso: 'gestionarPartidas', Componente: AdminPartidas },
  { id: 'sanciones', texto: 'Sanciones', permiso: 'gestionarSanciones', Componente: AdminSanciones },
  { id: 'juegos', texto: 'Juegos', permiso: 'gestionarJuegos', Componente: AdminJuegos },
  { id: 'usuarios', texto: 'Usuarios y roles', permiso: 'gestionarUsuarios', Componente: AdminUsuarios },
]

export default function Admin() {
  const { usuario, puede } = useAuth()
  const { cargando, errores, recargar } = useApp()
  const visibles = PESTANAS.filter((p) => puede(p.permiso))
  const [activa, setActiva] = useState(visibles[0]?.id)
  const actual = visibles.find((p) => p.id === activa) ?? visibles[0]

  return (
    <main>
      <section>
        <div className="container">
          <h1>Panel de gestión</h1>
          <p>
            Sesión como <strong>{NOMBRE_ROL[usuario.rol]}</strong>.{' '}
            {usuario.rol === 'ORGANIZADOR' && 'Las pestañas de juegos y usuarios son exclusivas del administrador.'}
          </p>
          <EstadoCarga cargando={cargando} errores={errores} onReintentar={recargar} />
          <ul className="nav nav-tabs mb-4" role="tablist" id="pestanas-admin">
            {visibles.map((p) => (
              <li className="nav-item" key={p.id} role="presentation">
                <button type="button" role="tab" aria-selected={p.id === actual?.id}
                  className={`nav-link ${p.id === actual?.id ? 'active' : ''}`} onClick={() => setActiva(p.id)}>
                  {p.texto}
                </button>
              </li>
            ))}
          </ul>
          {actual && <actual.Componente />}
        </div>
      </section>
    </main>
  )
}
