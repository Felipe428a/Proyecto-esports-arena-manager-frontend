import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { partidasService, resultadosService } from '../../services/arena'
import { formatearFecha } from '../../logica/formato'
import { useAccion, Resultado } from './useAccion'

/** Programar partidas entre inscritos y registrar sus resultados (match-service + result-service). */
export default function AdminPartidas() {
  const { torneos, partidas, inscripciones, equipos, usuarios, recargar } = useApp()
  const { ejecutar, ocupado, exito, error } = useAccion(recargar)
  const [torneoId, setTorneoId] = useState('')
  const [form, setForm] = useState({ ronda: 1, a: '', b: '', fecha: '' })
  const [marcadores, setMarcadores] = useState({})

  const activos = torneos.filter((t) => ['abierto', 'cerrado', 'en_curso'].includes(t.estado))
  useEffect(() => {
    if (!torneoId && activos.length > 0) setTorneoId(String(activos[0].id))
  }, [activos, torneoId])

  const torneo = torneos.find((t) => t.id === Number(torneoId))
  const inscritos = useMemo(() => {
    if (!torneo) return []
    return inscripciones
      .filter((i) => i.torneoId === torneo.id)
      .map((i) => {
        const fuente = i.participanteTipo === 'equipo' ? equipos : usuarios
        return { id: i.participanteId, nombre: fuente.find((x) => x.id === i.participanteId)?.nombre ?? `#${i.participanteId}` }
      })
  }, [torneo, inscripciones, equipos, usuarios])
  const partidasTorneo = partidas.filter((p) => p.torneoId === Number(torneoId))

  const programar = async (e) => {
    e.preventDefault()
    if (!form.a || !form.b || form.a === form.b || !form.fecha) return
    const ok = await ejecutar(
      () =>
        partidasService.crear({
          torneoId: Number(torneoId),
          participanteAId: Number(form.a),
          participanteBId: Number(form.b),
          ronda: Number(form.ronda),
          fechaHora: `${form.fecha}:00`,
        }),
      'Partida programada.'
    )
    if (ok) setForm({ ...form, a: '', b: '' })
  }

  const registrar = (p) => {
    const m = marcadores[p.id] || {}
    const a = Number(m.a)
    const b = Number(m.b)
    if (Number.isNaN(a) || Number.isNaN(b) || m.a === undefined || m.b === undefined || a === b) return
    const ganadorId = a > b ? p.participanteA.id : p.participanteB.id
    ejecutar(async () => {
      await resultadosService.crear({ partidaId: p.id, ganadorId, puntajeA: a, puntajeB: b, evidencia: 'Registrado desde el panel' })
      await partidasService.actualizar(p.id, { estado: 'FINALIZADA' })
    }, 'Resultado registrado.')
  }

  const formularioValido = form.a && form.b && form.a !== form.b && form.fecha

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <label htmlFor="partidas-torneo" className="form-label">Torneo</label>
        <select id="partidas-torneo" className="form-select mb-3" value={torneoId} onChange={(e) => setTorneoId(e.target.value)}>
          {activos.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <h3>Programar partida</h3>
        <form id="formulario-partida" className="row g-2" onSubmit={programar} noValidate>
          <div className="col-12">
            <label className="form-label" htmlFor="partida-a">Participante A</label>
            <select id="partida-a" className="form-select" value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })}>
              <option value="">Selecciona…</option>
              {inscritos.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="partida-b">Participante B</label>
            <select id="partida-b" className="form-select" value={form.b} onChange={(e) => setForm({ ...form, b: e.target.value })}>
              <option value="">Selecciona…</option>
              {inscritos.filter((i) => String(i.id) !== form.a).map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
          </div>
          <div className="col-4">
            <label className="form-label" htmlFor="partida-ronda">Ronda</label>
            <input id="partida-ronda" type="number" min="1" className="form-control" value={form.ronda} onChange={(e) => setForm({ ...form, ronda: e.target.value })} />
          </div>
          <div className="col-8">
            <label className="form-label" htmlFor="partida-fecha">Fecha y hora</label>
            <input id="partida-fecha" type="datetime-local" className="form-control" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </div>
          {inscritos.length < 2 && <div className="col-12"><small className="text-secondary">Se necesitan al menos dos inscritos.</small></div>}
          <div className="col-12">
            <button type="submit" className="boton boton-primario btn" disabled={ocupado || !formularioValido}>Programar</button>
          </div>
        </form>
      </div>

      <div className="col-12 col-lg-8">
        <h3>Partidas del torneo</h3>
        <Resultado exito={exito} error={error} />
        {partidasTorneo.length === 0 ? (
          <p className="text-secondary mt-2">Aún no hay partidas.</p>
        ) : (
          <ul className="lista-partidas mt-2" id="lista-admin-partidas">
            {partidasTorneo.map((p) => (
              <li key={p.id} className="tarjeta-partida flex-wrap">
                <span className="enfrentamiento">
                  R{p.ronda} · {p.participanteA.nombre}{' '}
                  {p.resultado ? <span className="marcador">{p.resultado.puntajeA} - {p.resultado.puntajeB}</span> : <span className="marcador">vs</span>}{' '}
                  {p.participanteB.nombre}
                </span>
                <span className="text-secondary">{formatearFecha(p.horario, true)} · {p.estado}</span>
                {!p.resultado && p.estado !== 'cancelada' && (
                  <span className="d-flex gap-1 align-items-center">
                    <input aria-label="Puntaje A" type="number" min="0" className="form-control form-control-sm" style={{ width: '4.5rem' }}
                      value={marcadores[p.id]?.a ?? ''} onChange={(e) => setMarcadores({ ...marcadores, [p.id]: { ...marcadores[p.id], a: e.target.value } })} />
                    <input aria-label="Puntaje B" type="number" min="0" className="form-control form-control-sm" style={{ width: '4.5rem' }}
                      value={marcadores[p.id]?.b ?? ''} onChange={(e) => setMarcadores({ ...marcadores, [p.id]: { ...marcadores[p.id], b: e.target.value } })} />
                    <button type="button" className="btn btn-sm btn-outline-light" disabled={ocupado} onClick={() => registrar(p)}>Resultado</button>
                    <button type="button" className="btn btn-sm btn-outline-danger" disabled={ocupado}
                      onClick={() => ejecutar(() => partidasService.cancelar(p.id), 'Partida cancelada.')}>Cancelar</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
