import TarjetaTorneo from './TarjetaTorneo'
import { crearPantalla } from '../../pruebas/montar'

// Prueba obligatoria #7: TarjetaTorneo renderiza nombre, juego y estado
describe('TarjetaTorneo (componente)', () => {
  const pantalla = crearPantalla()
  afterEach(pantalla.limpiar)

  const torneo = {
    id: 7,
    nombre: 'Copa Arena Apertura',
    juegoId: 1,
    estado: 'abierto',
    cupoMax: 8,
    cupoOcupado: 5,
    fechaCierreInscripcion: '2026-09-15',
  }
  const juego = { id: 1, nombre: 'Cripta Cero', modalidad: 'Equipos' }

  it('muestra el nombre del torneo, el juego y el estado', () => {
    const cont = pantalla.montar(<TarjetaTorneo torneo={torneo} juego={juego} />)

    expect(cont.querySelector('h3').textContent).toBe('Copa Arena Apertura')
    expect(cont.textContent).toContain('Cripta Cero')
    expect(cont.textContent).toContain('Inscripciones abiertas')
  })

  it('muestra los cupos ocupados y la fecha de cierre', () => {
    const cont = pantalla.montar(<TarjetaTorneo torneo={torneo} juego={juego} />)

    expect(cont.textContent).toContain('5 / 8')
    expect(cont.textContent).toContain('septiembre')
  })

  it('muestra la modalidad por defecto', () => {
    const cont = pantalla.montar(<TarjetaTorneo torneo={torneo} juego={juego} />)
    expect(cont.textContent).toContain('Modalidad')
    expect(cont.textContent).toContain('Equipos')
  })

  it('oculta la modalidad cuando mostrarModalidad es false', () => {
    const cont = pantalla.montar(
      <TarjetaTorneo torneo={torneo} juego={juego} mostrarModalidad={false} />
    )
    expect(cont.textContent).not.toContain('Modalidad')
  })

  it('indica "No disponible" si el juego no llega', () => {
    const cont = pantalla.montar(<TarjetaTorneo torneo={torneo} />)
    expect(cont.textContent).toContain('No disponible')
  })

  it('al presionar "Ver detalle" avisa al padre con el id del torneo (espía)', () => {
    // Espía: función falsa que registra cómo la llamaron
    const onVerDetalle = jasmine.createSpy('onVerDetalle')
    const cont = pantalla.montar(
      <TarjetaTorneo torneo={torneo} juego={juego} onVerDetalle={onVerDetalle} />
    )

    pantalla.clic(cont.querySelector('button'))

    expect(onVerDetalle).toHaveBeenCalledTimes(1)
    expect(onVerDetalle).toHaveBeenCalledWith(7)
  })
})
