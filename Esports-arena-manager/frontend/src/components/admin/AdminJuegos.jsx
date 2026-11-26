import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { juegosService } from '../../services/arena'
import { useAccion, Resultado } from './useAccion'

/** CRUD de juegos habilitados (game-service). Solo ADMINISTRADOR. */
export default function AdminJuegos() {
  const { juegos, recargar } = useApp()
  const { ejecutar, ocupado, exito, error } = useAccion(recargar)
  const vacio = { nombre: '', genero: '', modalidad: 'EQUIPOS', jugadoresPorEquipo: 3, reglasGenerales: '' }
  const [form, setForm] = useState(vacio)
  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const valido = form.nombre.trim() && form.genero.trim() && Number(form.jugadoresPorEquipo) >= 1

  const crear = async (e) => {
    e.preventDefault()
    if (!valido) return
    const ok = await ejecutar(
      () =>
        juegosService.crear({
          ...form,
          nombre: form.nombre.trim(),
          genero: form.genero.trim(),
          jugadoresPorEquipo: form.modalidad === 'INDIVIDUAL' ? 1 : Number(form.jugadoresPorEquipo),
        }),
      'Juego creado.'
    )
    if (ok) setForm(vacio)
  }

  const eliminar = (j) => {
    if (!window.confirm(`¿Eliminar el juego «${j.nombre}»?`)) return
    ejecutar(() => juegosService.eliminar(j.id), 'Juego eliminado.')
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <h3>Nuevo juego</h3>
        <form id="formulario-juego" className="row g-2" onSubmit={crear} noValidate>
          <div className="col-12">
            <label className="form-label" htmlFor="juego-nombre">Nombre</label>
            <input id="juego-nombre" name="nombre" className="form-control" value={form.nombre} onChange={cambiar} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="juego-genero">Género</label>
            <input id="juego-genero" name="genero" className="form-control" placeholder="MOBA, Lucha…" value={form.genero} onChange={cambiar} />
          </div>
          <div className="col-7">
            <label className="form-label" htmlFor="juego-modalidad">Modalidad</label>
            <select id="juego-modalidad" name="modalidad" className="form-select" value={form.modalidad} onChange={cambiar}>
              <option value="EQUIPOS">Equipos</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </div>
          <div className="col-5">
            <label className="form-label" htmlFor="juego-integrantes">Integrantes</label>
            <input id="juego-integrantes" name="jugadoresPorEquipo" type="number" min="1" className="form-control"
              value={form.modalidad === 'INDIVIDUAL' ? 1 : form.jugadoresPorEquipo} disabled={form.modalidad === 'INDIVIDUAL'} onChange={cambiar} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="juego-reglas">Reglas generales</label>
            <textarea id="juego-reglas" name="reglasGenerales" rows="2" className="form-control" value={form.reglasGenerales} onChange={cambiar} />
          </div>
          <div className="col-12">
            <button type="submit" className="boton boton-primario btn" disabled={ocupado || !valido}>Crear juego</button>
          </div>
        </form>
      </div>
      <div className="col-12 col-lg-8">
        <h3>Juegos</h3>
        <Resultado exito={exito} error={error} />
        <div className="table-responsive mt-2">
          <table className="tabla-datos" id="tabla-admin-juegos">
            <thead><tr><th>Juego</th><th>Modalidad</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {juegos.map((j) => (
                <tr key={j.id}>
                  <td>{j.nombre}<br /><small className="text-secondary">{j.categoria}</small></td>
                  <td>{j.modalidad}{j.modalidad === 'Equipos' ? ` · ${j.integrantesPorEquipo}` : ''}</td>
                  <td>{j.activo ? 'Activo' : 'Inactivo'}</td>
                  <td className="text-nowrap">
                    <button type="button" className="btn btn-sm btn-outline-light me-1" disabled={ocupado}
                      onClick={() => ejecutar(() => juegosService.actualizar(j.id, { estado: j.activo ? 'INACTIVO' : 'ACTIVO' }),
                        j.activo ? 'Juego desactivado.' : 'Juego activado.')}>
                      {j.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" disabled={ocupado} onClick={() => eliminar(j)}>
                      Eliminar
                    </button>
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
