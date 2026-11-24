function poblarSelectorJugador() {
  const selector = document.getElementById("selector-jugador");
  JUGADORES.forEach((jugador) => {
    const opcion = document.createElement("option");
    opcion.value = jugador.id;
    opcion.textContent = `${jugador.nombre} (${jugador.apodo})`;
    selector.appendChild(opcion);
  });
}

function historialDeTorneos(jugadorId) {
  const idsEquiposDelJugador = EQUIPOS.filter((e) =>
    e.integrantes.some((i) => i.jugadorId === jugadorId)
  ).map((e) => e.id);

  return INSCRIPCIONES.filter(
    (i) =>
      (i.participanteTipo === "jugador" && i.participanteId === jugadorId) ||
      (i.participanteTipo === "equipo" && idsEquiposDelJugador.includes(i.participanteId))
  );
}

function renderizarPerfil(jugadorId) {
  const contenedor = document.getElementById("contenido-perfil");
  const jugador = buscarJugador(jugadorId);
  if (!jugador) {
    mostrarMensajeEstado(contenedor, "No se encontró información para este jugador.", "vacio");
    return;
  }

  const equipos = jugador.equipos.map((id) => buscarEquipo(id)).filter(Boolean);
  const historial = historialDeTorneos(jugador.id);
  const sancionesActivas = jugador.sanciones.filter((s) => s.activa);
  const sancionesCumplidas = jugador.sanciones.filter((s) => !s.activa);

  contenedor.innerHTML = `
    <div class="rejilla-perfil">
      <div class="tarjeta-info">
        <h3>Datos de contacto</h3>
        <p class="fila-dato"><span>Nombre</span><span>${jugador.nombre}</span></p>
        <p class="fila-dato"><span>Apodo</span><span>${jugador.apodo}</span></p>
        <p class="fila-dato"><span>Correo</span><span>${jugador.email}</span></p>
      </div>

      <div class="tarjeta-info">
        <h3>Estadísticas</h3>
        <p class="fila-dato"><span>Victorias</span><span>${jugador.estadisticas.victorias}</span></p>
        <p class="fila-dato"><span>Derrotas</span><span>${jugador.estadisticas.derrotas}</span></p>
        <p class="fila-dato"><span>Efectividad</span><span>${calcularEfectividad(jugador.estadisticas)}%</span></p>
      </div>

      <div class="tarjeta-info">
        <h3>Equipos</h3>
        ${equipos.length
          ? `<ul style="padding-left:1.1rem;">${equipos.map((e) => `<li>${e.nombre}</li>`).join("")}</ul>`
          : `<p>Este jugador aún no integra ningún equipo.</p>`}
      </div>

      <div class="tarjeta-info">
        <h3>Sanciones</h3>
        ${sancionesActivas.length
          ? sancionesActivas.map((s) => `<span class="chip chip--sancion">${s.motivo} · hasta ${formatearFecha(s.fechaFin)}</span>`).join("")
          : ""}
        ${sancionesCumplidas.length
          ? sancionesCumplidas.map((s) => `<span class="chip chip--cumplida">${s.motivo} (cumplida)</span>`).join("")
          : ""}
        ${jugador.sanciones.length === 0 ? "<p>Sin sanciones registradas.</p>" : ""}
      </div>
    </div>

    <h3 style="margin-top:1.5rem;">Historial de torneos</h3>
    ${historial.length
      ? `<ul style="padding-left:1.1rem;">${historial
          .map((i) => {
            const torneo = buscarTorneo(i.torneoId);
            return `<li>${torneo ? torneo.nombre : "Torneo no disponible"} — inscrito el ${formatearFecha(i.fecha)}</li>`;
          })
          .join("")}</ul>`
      : `<p class="mensaje-estado mensaje-estado--vacio">Este jugador aún no participa en ningún torneo.</p>`}
  `;
}

function calcularEfectividad(estadisticas) {
  const total = estadisticas.victorias + estadisticas.derrotas;
  if (total === 0) return 0;
  return Math.round((estadisticas.victorias / total) * 100);
}

function validarApodo(valor) {
  mostrarErrorCampo("campo-apodo", "");
  if (!valor) {
    mostrarErrorCampo("campo-apodo", "El apodo es obligatorio.");
    return false;
  }
  if (/\s/.test(valor)) {
    mostrarErrorCampo("campo-apodo", "El apodo no puede contener espacios.");
    return false;
  }
  if (valor.length < 3 || valor.length > 16) {
    mostrarErrorCampo("campo-apodo", "El apodo debe tener entre 3 y 16 caracteres.");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  poblarSelectorJugador();
  const selector = document.getElementById("selector-jugador");
  renderizarPerfil(Number(selector.value));

  selector.addEventListener("change", (evento) => renderizarPerfil(Number(evento.target.value)));

  const formularioApodo = document.getElementById("formulario-apodo");
  formularioApodo.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const valor = document.getElementById("campo-apodo").value.trim();
    if (!validarApodo(valor)) return;

    const jugador = buscarJugador(selector.value);
    jugador.apodo = valor;
    renderizarPerfil(jugador.id);
    formularioApodo.reset();
  });
});
