import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../auth/useAuth'
import { cuentasService } from '../../services/arena'
import { NOMBRE_ROL, ROLES } from '../../auth/permisos'
import { useAccion, Resultado } from './useAccion'

/**
 * Cuentas de acceso y roles (auth-service, solo ADMINISTRADOR).
 * Cambiar el rol de una cuenta lo sincroniza con su perfil en user-service y aplica en el próximo token.
 */
export default function AdminUsuarios() {
  const { recargar: recargarArena } = useApp()
  const { usuario } = useAuth()
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarCuentas = useCallback(async (signal) => {
    try {
      const lista = await cuentasService.listar({ signal })
      setCuentas(Array.isArray(lista) ? lista : [])
    } finally {
      setCargando(false)
    }
  }, [])

  const recargar = useCallback(async () => {
    await Promise.all([cargarCuentas(), recargarArena()])
  }, [cargarCuentas, recargarArena])

  const { ejecutar, ocupado, exito, error } = useAccion(recargar)

  useEffect(() => {
    const control = new AbortController()
    cargarCuentas(control.signal).catch(() => {})
    return () => control.abort()
  }, [cargarCuentas])

  return (
    <div>
      <h3>Cuentas y roles</h3>
      <p className="text-secondary">El cambio de rol se aplica cuando la persona renueva su sesión (máximo 15 minutos) o vuelve a iniciar sesión.</p>
      <Resultado exito={exito} error={error} />
      {cargando ? (
        <p>Cargando cuentas…</p>
      ) : (
        <div className="table-responsive mt-2">
          <table className="tabla-datos" id="tabla-admin-cuentas">
            <thead><tr><th>Cuenta</th><th>Rol</th><th>Estado</th></tr></thead>
            <tbody>
              {cuentas.map((c) => {
                const soyYo = c.id === usuario?.cuentaId
                return (
                  <tr key={c.id}>
                    <td>{c.nombre || '—'}<br /><small className="text-secondary">{c.email}</small></td>
                    <td>
                      <select aria-label={`Rol de ${c.email}`} className="form-select form-select-sm" value={c.rol} disabled={ocupado || soyYo}
                        onChange={(e) => ejecutar(() => cuentasService.actualizar(c.id, { rol: e.target.value }), `Rol de ${c.email} actualizado.`)}>
                        {Object.values(ROLES).map((r) => <option key={r} value={r}>{NOMBRE_ROL[r]}</option>)}
                      </select>
                    </td>
                    <td>
                      <button type="button" className={`btn btn-sm ${c.estado === 'ACTIVO' ? 'btn-outline-danger' : 'btn-outline-light'}`}
                        disabled={ocupado || soyYo}
                        onClick={() => ejecutar(() => cuentasService.actualizar(c.id, { estado: c.estado === 'ACTIVO' ? 'DESACTIVADO' : 'ACTIVO' }),
                          c.estado === 'ACTIVO' ? 'Cuenta desactivada (sus sesiones se revocaron).' : 'Cuenta activada.')}>
                        {c.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      </button>
                      {soyYo && <small className="ms-2 text-secondary">(tu cuenta)</small>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
