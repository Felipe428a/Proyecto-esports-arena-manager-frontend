import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../auth/useAuth'
import { torneosService } from '../../services/arena'
import { formatearFecha } from '../../logica/formato'
import { obtenerEstadoTorneoInfo } from '../../logica/torneos'
import { useAccion, Resultado } from './useAccion'

const ESTADOS = ['BORRADOR', 'ABIERTO', 'CERRADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO']

/** Valida el formulario de torneo antes de enviarlo (el backend valida de nuevo las fechas). */
export function validarTorneo(f) {
  if (!f.nombre.trim()) return 'El nombre es obligatorio.'
  if (!f.juegoId) return 'Selecciona un juego.'
  if (!f.cierre || !f.inicio || !f.fin) return 'Completa las tres fechas.'
  if (!(f.inicio > f.cierre)) return 'La fecha de inicio debe ser posterior al cierre de inscripción.'
  if (!(f.fin >= f.inicio)) return 'La fecha de término no puede ser anterior al inicio.'
  if (!(Number(f.cupo) >= 2)) return 'El cupo debe ser de al menos 2 participantes.'
  return null
}

/** CRUD de torneos: crear, cambiar estado, editar descripción/cupo y eliminar (solo administrador). */
export default function AdminTorneos() {
  const { torneos, juegos, crudo, recargar } = useApp()
  const { puede } = useAuth()
  const { ejecutar, ocupado, exito, error } = useAccion(recargar)
  const vacio = { nombre: '', juegoId: '', cierre: '', inicio: '', fin: '', cupo: 8, estado: 'ABIERTO', descripcion: '' }
  const [form, setForm] = useState(vacio)
  const [errorForm, setErrorForm] = useState('')
  const [edicion, setEdicion] = useState(null)

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const juegosActivos = juegos.filter((j) => j.activo)

  const crear = async (e) => {
    e.preventDefault()
    const problema = validarTorneo(form)
    setErrorForm(problema || '')
    if (problema) return
    const juego = juegos.find((j) => j.id === Number(form.juegoId))
    const creado = await ejecutar(
      () =>
        torneosService.crear({
          nombre: form.nombre.trim(),
          juegoId: Number(form.juegoId),
          fechaCierreInscripcion: `${form.cierre}T23:59:00`,
          fechaInicio: `${form.inicio}T18:00:00`,
          fechaFin: `${form.fin}T22:00:00`,
          cupoMaximo: Number(form.cupo),
          modalidad: juego?.modalidad === 'Individual' ? 'INDIVIDUAL' : 'EQUIPOS',
          estado: form.estado,
          descripcion: form.descripcion.trim(),
        }),
      'Torneo creado.'
    )
    if (creado) setForm(vacio)
  }

  const guardarEdicion = async (e) => {
    e.preventDefault()
    const ok = await ejecutar(
      () => torneosService.actualizar(edicion.id, { cupoMaximo: Number(edicion.cupo), descripcion: edicion.descripcion, nombre: edicion.nombre }),
      'Torneo actualizado.'
    )
    if (ok) setEdicion(null)
  }

  const eliminar = (t) => {
    if (!window.confirm(`¿Eliminar definitivamente «${t.nombre}»?`)) return
    ejecutar(() => torneosService.eliminar(t.id), 'Torneo eliminado.')
  }

  const estadoCrudo = (id) => crudo.torneos?.find((t) => t.id === id)?.estado

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <h3>Nuevo torneo</h3>
        <form id="formulario-torneo" className="row g-2" onSubmit={crear} noValidate>
          <div className="col-12">
            <label className="form-label" htmlFor="torneo-nombre">Nombre</label>
            <input id="torneo-nombre" name="nombre" className="form-control" value={form.nombre} onChange={cambiar} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="torneo-juego">Juego</label>
            <select id="torneo-juego" name="juegoId" className="form-select" value={form.juegoId} onChange={cambiar}>
              <option value="">Selecciona…</option>
              {juegosActivos.map((j) => (
                <option key={j.id} value={j.id}>{j.nombre} ({j.modalidad})</option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="torneo-cierre">Cierre inscripción</label>
            <input id="torneo-cierre" name="cierre" type="date" className="form-control" value={form.cierre} onChange={cambiar} />
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="torneo-cupo">Cupo</label>
            <input id="torneo-cupo" name="cupo" type="number" min="2" className="form-control" value={form.cupo} onChange={cambiar} />
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="torneo-inicio">Inicio</label>
            <input id="torneo-inicio" name="inicio" type="date" className="form-control" value={form.inicio} onChange={cambiar} />
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="torneo-fin">Término</label>
            <input id="torneo-fin" name="fin" type="date" className="form-control" value={form.fin} onChange={cambiar} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="torneo-estado">Estado inicial</label>
            <select id="torneo-estado" name="estado" className="form-select" value={form.estado} onChange={cambiar}>
              <option value="ABIERTO">Abierto (recibe inscripciones)</option>
              <option value="BORRADOR">Borrador</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="torneo-descripcion">Descripción</label>
            <textarea id="torneo-descripcion" name="descripcion" rows="2" className="form-control" value={form.descripcion} onChange={cambiar} />
          </div>
          {errorForm && <div className="col-12"><div className="alert alert-warning py-2 mb-0" role="alert">{errorForm}</div></div>}
          <div className="col-12">
            <button type="submit" className="boton boton-primario btn" disabled={ocupado}>Crear torneo</button>
          </div>
        </form>
      </div>

      <div className="col-12 col-xl-8">
        <h3>Torneos</h3>
        <Resultado exito={exito} error={error} />
        <div className="table-responsive mt-2">
          <table className="tabla-datos" id="tabla-admin-torneos">
            <thead>
              <tr>
                <th scope="col">Torneo</th>
                <th scope="col">Inscritos</th>
                <th scope="col">Cierre</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {torneos.map((t) => (
                <tr key={t.id}>
                  <td>{t.nombre}<br /><small className="text-secondary">{juegos.find((j) => j.id === t.juegoId)?.nombre}</small></td>
                  <td>{t.cupoOcupado} / {t.cupoMax}</td>
                  <td>{formatearFecha(t.fechaCierreInscripcion)}</td>
                  <td>
                    <select aria-label={`Estado de ${t.nombre}`} className="form-select form-select-sm" value={estadoCrudo(t.id) || ''} disabled={ocupado}
                      onChange={(e) => ejecutar(() => torneosService.cambiarEstado(t.id, e.target.value), `Estado de «${t.nombre}» actualizado.`)}>
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>{obtenerEstadoTorneoInfo(s.toLowerCase()).etiqueta}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-nowrap">
                    <button type="button" className="btn btn-sm btn-outline-light me-1"
                      onClick={() => setEdicion({ id: t.id, nombre: t.nombre, cupo: t.cupoMax, descripcion: t.descripcion })}>
                      Editar
                    </button>
                    {puede('eliminarTorneos') && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => eliminar(t)} disabled={ocupado}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {edicion && (
          <form className="tarjeta-info card card-body mt-3 row g-2" onSubmit={guardarEdicion} id="formulario-editar-torneo">
            <h4 className="h6">Editar torneo</h4>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="editar-nombre">Nombre</label>
              <input id="editar-nombre" className="form-control" value={edicion.nombre} onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="editar-cupo">Cupo máximo</label>
              <input id="editar-cupo" type="number" min="2" className="form-control" value={edicion.cupo} onChange={(e) => setEdicion({ ...edicion, cupo: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="editar-descripcion">Descripción</label>
              <textarea id="editar-descripcion" className="form-control" rows="2" value={edicion.descripcion} onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })} />
            </div>
            <div className="col-12 d-flex gap-2">
              <button type="submit" className="boton boton-primario btn btn-sm" disabled={ocupado}>Guardar</button>
              <button type="button" className="boton boton-secundario btn btn-sm" onClick={() => setEdicion(null)}>Cancelar</button>
            </div>
            <small className="text-secondary">Un torneo en curso no admite cambios de reglas (regla del backend).</small>
          </form>
        )}
      </div>
    </div>
  )
}
