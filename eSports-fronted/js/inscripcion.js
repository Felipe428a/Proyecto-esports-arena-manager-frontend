function poblarSelectorTorneos() {
  const selector = document.getElementById("campo-torneo");
  TORNEOS.forEach((torneo) => {
    const opcion = document.createElement("option");
    opcion.value = torneo.id;
    opcion.textContent = `${torneo.nombre} (${estadoTorneoInfo(torneo.estado).etiqueta})`;
    selector.appendChild(opcion);
  });

  const idPreseleccionado = obtenerParametroURL("torneo");
  if (idPreseleccionado) selector.value = idPreseleccionado;
}

function poblarSelectorJugadores() {
  const selector = document.getElementById("campo-jugador");
  JUGADORES.forEach((jugador) => {
    const opcion = document.createElement("option");
    opcion.value = jugador.id;
    opcion.textContent = `${jugador.nombre} (${jugador.apodo})`;
    selector.appendChild(opcion);
  });
}

function poblarSelectorEquipos() {
  const selector = document.getElementById("campo-equipo");
  selector.innerHTML = "";
  EQUIPOS.forEach((equipo) => {
    const opcion = document.createElement("option");
    opcion.value = equipo.id;
    opcion.textContent = `${equipo.nombre}${equipo.activo ? "" : " (inactivo)"}`;
    selector.appendChild(opcion);
  });
}

function tipoParticipanteSeleccionado() {
  return document.querySelector('input[name="tipoParticipante"]:checked').value;
}

function actualizarVisibilidadEquipo() {
  const esEquipo = tipoParticipanteSeleccionado() === "equipo";
  document.getElementById("contenedor-equipo").hidden = !esEquipo;
  document.getElementById("campo-jugador").closest(".campo").hidden = esEquipo;
}

function renderizarResumenRequisitos() {
  const contenedor = document.getElementById("resumen-requisitos");
  const torneo = buscarTorneo(document.getElementById("campo-torneo").value);
  if (!torneo) {
    contenedor.className = "mensaje-estado mensaje-estado--info";
    contenedor.textContent = "Elige un torneo para ver sus requisitos.";
    return;
  }
  const juego = JUEGOS.find((j) => j.id === torneo.juegoId);
  const cuposDisponibles = Math.max(0, torneo.cupoMax - torneo.cupoOcupado);
  contenedor.className = "mensaje-estado mensaje-estado--info";
  contenedor.innerHTML = `
    <strong>${torneo.nombre}</strong> · ${juego ? juego.nombre : ""}<br />
    Cupos disponibles: ${cuposDisponibles} de ${torneo.cupoMax}<br />
    Cierre de inscripción: ${formatearFecha(torneo.fechaCierreInscripcion)}<br />
    ${juego && juego.modalidad === "Equipos" ? `Integrantes exigidos por equipo: ${juego.integrantesPorEquipo}` : "Modalidad individual"}
  `;
}

function yaEstaInscrito(torneoId, tipo, participanteId) {
  return INSCRIPCIONES.some(
    (i) => i.torneoId === torneoId && i.participanteTipo === tipo && i.participanteId === participanteId
  );
}

function equipoTieneSancionActiva(equipo) {
  return equipo.integrantes.some((integrante) => tieneSancionActiva(integrante.jugadorId));
}

/** Valida la inscripción. */
function validarInscripcion() {
  document.getElementById("error-general").hidden = true;
  mostrarErrorCampo("campo-torneo", "");
  mostrarErrorCampo("campo-equipo", "");

  const torneoId = Number(document.getElementById("campo-torneo").value);
  const torneo = buscarTorneo(torneoId);
  const tipo = tipoParticipanteSeleccionado();

  if (!torneo) {
    mostrarErrorCampo("campo-torneo", "Selecciona un torneo válido.");
    return false;
  }

  const hoy = new Date();
  if (hoy > new Date(torneo.fechaCierreInscripcion)) {
    mostrarErrorGeneral("El plazo de inscripción para este torneo ya cerró.");
    return false;
  }

  if (torneo.cupoOcupado >= torneo.cupoMax) {
    mostrarErrorGeneral("Este torneo alcanzó su cupo máximo de inscripciones.");
    return false;
  }

  if (tipo === "jugador") {
    const jugadorId = Number(document.getElementById("campo-jugador").value);

    if (yaEstaInscrito(torneo.id, "jugador", jugadorId)) {
      mostrarErrorGeneral("Este jugador ya está inscrito en este torneo.");
      return false;
    }

    if (tieneSancionActiva(jugadorId)) {
      mostrarErrorGeneral("Este jugador tiene una sanción vigente y no puede inscribirse hasta que se cumpla.");
      return false;
    }
    return true;
  }

  // Inscripción de equipo.
  const equipoId = Number(document.getElementById("campo-equipo").value);
  const equipo = buscarEquipo(equipoId);
  const juego = JUEGOS.find((j) => j.id === torneo.juegoId);

  if (!equipo) {
    mostrarErrorCampo("campo-equipo", "Selecciona un equipo válido.");
    return false;
  }

  if (!equipo.activo) {
    mostrarErrorCampo("campo-equipo", "Este equipo está inactivo y no puede inscribirse.");
    return false;
  }

  if (juego && equipo.integrantes.length < juego.integrantesPorEquipo) {
    mostrarErrorCampo(
      "campo-equipo",
      `El equipo necesita al menos ${juego.integrantesPorEquipo} integrantes para este juego (tiene ${equipo.integrantes.length}).`
    );
    return false;
  }

  if (yaEstaInscrito(torneo.id, "equipo", equipo.id)) {
    mostrarErrorGeneral("Este equipo ya está inscrito en este torneo.");
    return false;
  }

  if (equipoTieneSancionActiva(equipo)) {
    mostrarErrorGeneral("Un integrante del equipo tiene una sanción vigente y bloquea la inscripción del equipo.");
    return false;
  }

  return true;
}

function mostrarErrorGeneral(texto) {
  const el = document.getElementById("error-general");
  el.textContent = texto;
  el.hidden = false;
}

function mostrarConfirmacion(torneo, tipo) {
  const contenedor = document.getElementById("confirmacion");
  let nombreParticipante;
  if (tipo === "jugador") {
    const jugador = buscarJugador(document.getElementById("campo-jugador").value);
    nombreParticipante = `${jugador.nombre} (${jugador.apodo})`;
  } else {
    const equipo = buscarEquipo(document.getElementById("campo-equipo").value);
    nombreParticipante = equipo.nombre;
  }

  contenedor.hidden = false;
  contenedor.innerHTML = `
    <strong>Inscripción confirmada.</strong><br />
    ${nombreParticipante} quedó inscrito/a en <strong>${torneo.nombre}</strong>.
    Cupos restantes: ${Math.max(0, torneo.cupoMax - torneo.cupoOcupado)} de ${torneo.cupoMax}.
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  poblarSelectorTorneos();
  poblarSelectorJugadores();
  poblarSelectorEquipos();
  actualizarVisibilidadEquipo();
  renderizarResumenRequisitos();

  const formulario = document.getElementById("formulario-inscripcion");

  document.querySelectorAll('input[name="tipoParticipante"]').forEach((radio) => {
    radio.addEventListener("change", actualizarVisibilidadEquipo);
  });

  document.getElementById("campo-torneo").addEventListener("change", renderizarResumenRequisitos);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    document.getElementById("confirmacion").hidden = true;

    if (!validarInscripcion()) return;

    const torneo = buscarTorneo(document.getElementById("campo-torneo").value);
    const tipo = tipoParticipanteSeleccionado();
    const participanteId =
      tipo === "jugador"
        ? Number(document.getElementById("campo-jugador").value)
        : Number(document.getElementById("campo-equipo").value);

    // Guarda en memoria y actualiza el cupo.
    INSCRIPCIONES.push({
      id: INSCRIPCIONES.length + 1,
      torneoId: torneo.id,
      participanteTipo: tipo,
      participanteId,
      fecha: new Date().toISOString().slice(0, 10)
    });
    torneo.cupoOcupado += 1;

    mostrarConfirmacion(torneo, tipo);
    renderizarResumenRequisitos();
  });
});
