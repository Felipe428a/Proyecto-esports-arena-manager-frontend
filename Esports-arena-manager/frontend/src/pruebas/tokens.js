/**
 * Crea un JWT de mentira (sin firma real): el frontend solo LEE el payload, no lo verifica.
 * Igual que un JWT real, el JSON se codifica en UTF-8 y luego en Base64URL.
 */
export function tokenFalso(payload) {
  const b64 = (obj) => {
    let binario = ''
    new TextEncoder().encode(JSON.stringify(obj)).forEach((byte) => { binario += String.fromCharCode(byte) })
    return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.firma`
}
