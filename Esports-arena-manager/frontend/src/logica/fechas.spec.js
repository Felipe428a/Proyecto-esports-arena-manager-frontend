import { finDelDia, esSoloFecha } from './fechas'

describe('fechas', () => {
    describe('finDelDia', () => {
        it('termina el día a las 23:59:59 en hora local', () => {
            const fin = finDelDia('2026-09-15')
            expect(fin.getFullYear()).toBe(2026)
            expect(fin.getMonth()).toBe(8) // septiembre
            expect(fin.getDate()).toBe(15)
            expect(fin.getHours()).toBe(23)
            expect(fin.getMinutes()).toBe(59)
        })

        it('mantiene el mismo día calendario sin importar la zona horaria', () => {
            // Regresión: con new Date("2026-09-15") + setHours el día retrocedía en Chile
            expect(finDelDia('2026-01-01').getDate()).toBe(1)
            expect(finDelDia('2026-12-31').getDate()).toBe(31)
        })

        it('acepta objetos Date', () => {
            const fin = finDelDia(new Date(2026, 5, 10, 8, 30))
            expect(fin.getDate()).toBe(10)
            expect(fin.getHours()).toBe(23)
        })
    })

    describe('esSoloFecha', () => {
        it('reconoce el formato YYYY-MM-DD', () => {
            expect(esSoloFecha('2026-09-15')).toBeTrue()
        })

        it('rechaza fechas con hora u otros valores', () => {
            expect(esSoloFecha('2026-09-15T18:00:00')).toBeFalse()
            expect(esSoloFecha(null)).toBeFalse()
            expect(esSoloFecha(20260915)).toBeFalse()
        })
    })
})
