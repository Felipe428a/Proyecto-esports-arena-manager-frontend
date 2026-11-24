const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

/** Devuelve el instante exacto en que termina el día indicado (23:59:59.999, hora local). */
export function finDelDia(valor) {
    if (typeof valor === 'string' && SOLO_FECHA.test(valor)) {
        const [anio, mes, dia] = valor.split('-').map(Number)
        return new Date(anio, mes - 1, dia, 23, 59, 59, 999)
    }
    const fecha = new Date(valor)
    fecha.setHours(23, 59, 59, 999)
    return fecha
}

/** true si el texto tiene formato YYYY-MM-DD (sin hora).*/
export function esSoloFecha(valor) {
    return typeof valor === 'string' && SOLO_FECHA.test(valor)
}
