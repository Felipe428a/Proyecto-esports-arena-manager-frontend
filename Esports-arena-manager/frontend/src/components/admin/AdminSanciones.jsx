import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { sancionesService } from '../../services/arena'
import { formatearFecha } from '../../logica/formato'
import { useAccion, Resultado } from './useAccion'

/** Sanciones a jugadores (sanction-service). Una sanción BLOQUEANTE vigente impide inscribirse. */
export default function AdminSanciones() {
  const { sanciones, jugadores, recargar } = useApp()
  const { ejecutar, ocupado, exito, error } = useAccion(recargar)
  const hoy = new Date().toISOString().slice(0, 10)
  const vacio = { usuarioId: '', motivo: '', fechaInicio: hoy, fechaFin: '', severidad: 'BLOQUEANTE' }
  const [form, setForm] = useState(vacio)
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const valido = form.usuarioId && form.motivo.trim() && form.fechaFin && form.fechaFin > form.fechaInicio

  const crear = async (e) => {
    e.preventDefault()
    if (!valido) return
    const ok = await ejecutar(
      () => sancionesService.crear({ ...form, usuarioId: Number(form.usuarioId), motivo: form.motivo.trim() }),
      'Sanción registrada.'
    )
    if (ok) setForm(vacio)
  }

  const nombre = (id) => jugadores.find((j) => j.id === id)?.nombre ?? `Usuario #${id}`

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <h3>Nueva sanción</h3>
        <form id="formulario-sancion" className="row g-2" onSubmit={crear} noValidate>
          <div className="col-12">
            <label className="form-label" htmlFor="sancion-usuario">Jugador</label>
            <select id="sancion-usuario" name="usuarioId" className="form-select" value={form.usuarioId} onChange={cambiar}>
              <option value="">Selecciona…</option>
              {jugadores.map((j) => <option key={j.id} value={j.id}>{j.nombre} ({j.apodo})</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="sancion-motivo">Motivo</label>
            <input id="sancion-motivo" name="motivo" className="form-control" value={form.motivo} onChange={cambiar} />
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="sancion-inicio">Desde</label>
            <input id="sancion-inicio" name="fechaInicio" type="date" className="form-control" value={form.fechaInicio} onChange={cambiar} />
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="sancion-fin">Hasta</label>
            <input id="sancion-fin" name="fechaFin" type="date" className="form-control" value={form.fechaFin} onChange={cambiar} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="sancion-severidad">Severidad</label>
            <select id="sancion-severidad" name="severidad" className="form-select" value={form.severidad} onChange={cambiar}>
              <option value="BLOQUEANTE">Bloqueante (no puede inscribirse)</option>
              <option value="LEVE">Leve (solo advertencia)</option>
            </select>
          </div>
          <div className="col-12">
            <button type="submit" className="boton boton-primario btn" disabled={ocupado || !valido}>Registrar sanción</button>
          </div>
        </form>
      </div>
      <div className="col-12 col-lg-8">
        <h3>Sanciones registradas</h3>
        <Resultado exito={exito} error={error} />
        <div className="table-responsive mt-2">
          <table className="tabla-datos" id="tabla-admin-sanciones">
            <thead>
              <tr><th>Jugador</th><th>Motivo</th><th>Vigencia</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {sanciones.map((s) => (
                <tr key={s.id}>
                  <td>{s.usuarioId ? nombre(s.usuarioId) : `Equipo #${s.equipoId}`}</td>
                  <td>{s.motivo}<br /><small className="text-secondary">{s.severidad}</small></td>
                  <td>{formatearFecha(s.fechaInicio)} → {formatearFecha(s.fechaFin)}</td>
                  <td>{s.activa ? 'Vigente' : s.estado === 'ACTIVA' ? 'Vencida' : 'Cerrada'}</td>
                  <td>
                    {s.estado === 'ACTIVA' && (
                      <button type="button" className="btn btn-sm btn-outline-light" disabled={ocupado}
                        onClick={() => ejecutar(() => sancionesService.cerrar(s.id), 'Sanción cerrada.')}>
                        Cerrar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
