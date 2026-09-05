/* Activa el enlace de la página actual. */
function marcarNavActivo() {
  const rutaActual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-principal a").forEach((enlace) => {
    const destino = enlace.getAttribute("href");
    if (destino === rutaActual) {
      enlace.classList.add("nav-activo");
      enlace.setAttribute("aria-current", "page");
    }
  });
}

/* Formatea una fecha ISO para es-CL. */
function formatearFecha(iso, conHora = false) {
  if (!iso) return "Sin definir";
  const fecha = new Date(iso);
  const opciones = { day: "2-digit", month: "long", year: "numeric" };
  if (conHora) {
    opciones.hour = "2-digit";
    opciones.minute = "2-digit";
  }
  return fecha.toLocaleDateString("es-CL", opciones);
}

/* Obtiene un parámetro de la URL. */
function obtenerParametroURL(nombre) {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get(nombre);
}

/* Obtiene el nombre de un juego. */
function nombreJuego(juegoId) {
  const juego = JUEGOS.find((j) => j.id === Number(juegoId));
  return juego ? juego.nombre : "Juego no disponible";
}

/* Busca un torneo. */
function buscarTorneo(torneoId) {
  return TORNEOS.find((t) => t.id === Number(torneoId));
}

/* Busca un equipo. */
function buscarEquipo(equipoId) {
  return EQUIPOS.find((e) => e.id === Number(equipoId));
}

/* Busca un jugador. */
function buscarJugador(jugadorId) {
  return JUGADORES.find((j) => j.id === Number(jugadorId));
}

/* Obtiene etiqueta y clase del estado. */
function estadoTorneoInfo(estado) {
  const mapa = {
    abierto: { etiqueta: "Inscripciones abiertas", clase: "estado-abierto" },
    en_curso: { etiqueta: "En curso", clase: "estado-en-curso" },
    finalizado: { etiqueta: "Finalizado", clase: "estado-finalizado" }
  };
  return mapa[estado] || { etiqueta: estado, clase: "" };
}

/* Muestra un error de campo. */
function mostrarErrorCampo(idCampo, texto) {
  const contenedor = document.getElementById(`error-${idCampo}`);
  if (contenedor) {
    contenedor.textContent = texto;
    contenedor.hidden = !texto;
  }
  const campo = document.getElementById(idCampo);
  if (campo) campo.setAttribute("aria-invalid", texto ? "true" : "false");
}

/* Limpia errores del formulario. */
function limpiarErrores(formulario) {
  formulario.querySelectorAll(".mensaje-error").forEach((el) => {
    el.textContent = "";
    el.hidden = true;
  });
}

/* Muestra un estado general. */
function mostrarMensajeEstado(contenedor, texto, tipo = "info") {
  contenedor.innerHTML = "";
  const parrafo = document.createElement("p");
  parrafo.className = `mensaje-estado mensaje-estado--${tipo}`;
  parrafo.setAttribute("role", tipo === "error" ? "alert" : "status");
  parrafo.textContent = texto;
  contenedor.appendChild(parrafo);
}

/* Comprueba sanciones activas. */
function tieneSancionActiva(jugadorId) {
  const jugador = buscarJugador(jugadorId);
  if (!jugador) return false;
  return jugador.sanciones.some((s) => s.activa);
}

document.addEventListener("DOMContentLoaded", marcarNavActivo);