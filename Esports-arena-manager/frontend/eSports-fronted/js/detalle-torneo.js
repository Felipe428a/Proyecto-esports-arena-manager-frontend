let rondaSeleccionada = 1;

function renderizarDatosGenerales(torneo) {
  const contenedor = document.getElementById("contenido-general");
  const estado = estadoTorneoInfo(torneo.estado);
  const cuposDisponibles = Math.max(0, torneo.cupoMax - torneo.cupoOcupado);

  contenedor.innerHTML = `
    <span class="etiqueta-estado ${estado.clase}">${estado.etiqueta}</span>
    <h1>${torneo.nombre}</h1>
    <p>${torneo.descripcion}</p>
    <div class="heroe-panel" style="max-width:520px;">
      <dl>
        <dt>Juego</dt><dd>${nombreJuego(torneo.juegoId)}</dd>
        <dt>Cupos disponibles</dt><dd>${cuposDisponibles} de ${torneo.cupoMax}</dd>
        <dt>Cierre de inscripción</dt><dd>${formatearFecha(torneo.fechaCierreInscripcion)}</dd>
        <dt>Fecha de inicio</dt><dd>${formatearFecha(torneo.fechaInicio)}</dd>
      </dl>
    </div>
    <p style="margin-top:1rem;">
      <a class="boton boton-primario" href="inscripcion.html?torneo=${torneo.id}">Inscribirme a este torneo</a>
    </p>
  `;
}

function nombreParticipante(inscripcion) {
  if (inscripcion.participanteTipo === "equipo") {
    const equipo = buscarEquipo(inscripcion.participanteId);
    return equipo ? equipo.nombre : "Equipo no disponible";
  }
  const jugador = buscarJugador(inscripcion.participanteId);
  return jugador ? `${jugador.nombre} (${jugador.apodo})` : "Jugador no disponible";
}

function renderizarParticipantes(torneo) {
  const contenedor = document.getElementById("lista-participantes");
  const inscripciones = INSCRIPCIONES.filter((i) => i.torneoId === torneo.id);

  if (inscripciones.length === 0) {
    mostrarMensajeEstado(contenedor, "Todavía no hay participantes inscritos en este torneo.", "vacio");
    return;
  }

  contenedor.innerHTML = "";
  inscripciones.forEach((inscripcion) => {
    const item = document.createElement("li");
    item.className = "tarjeta-torneo";
    item.innerHTML = `
      <span class="etiqueta-estado estado-abierto">${inscripcion.participanteTipo === "equipo" ? "Equipo" : "Individual"}</span>
      <h3>${nombreParticipante(inscripcion)}</h3>
      <p class="fila-dato"><span>Inscrito el</span><span>${formatearFecha(inscripcion.fecha)}</span></p>
    `;
    contenedor.appendChild(item);
  });
}

function nombrePartidasTorneo(torneo) {
  return PARTIDAS.filter((p) => p.torneoId === torneo.id);
}

function renderizarSelectorRondas(partidasTorneo) {
  const contenedor = document.getElementById("selector-rondas");
  const rondas = [...new Set(partidasTorneo.map((p) => p.ronda))].sort((a, b) => a - b);

  if (rondas.length === 0) {
    contenedor.innerHTML = "";
    return [];
  }

  if (!rondas.includes(rondaSeleccionada)) rondaSeleccionada = rondas[0];

  contenedor.innerHTML = "";
  rondas.forEach((ronda) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton boton-pequeno " + (ronda === rondaSeleccionada ? "boton-primario" : "boton-secundario");
    boton.textContent = `Ronda ${ronda}`;
    boton.setAttribute("role", "tab");
    boton.setAttribute("aria-selected", ronda === rondaSeleccionada ? "true" : "false");
    boton.addEventListener("click", () => {
      rondaSeleccionada = ronda;
      renderizarSelectorRondas(partidasTorneo);
      renderizarPartidasRonda(partidasTorneo);
    });
    contenedor.appendChild(boton);
  });

  return rondas;
}

function renderizarPartidasRonda(partidasTorneo) {
  const contenedor = document.getElementById("lista-partidas");
  const partidasRonda = partidasTorneo.filter((p) => p.ronda === rondaSeleccionada);

  if (partidasRonda.length === 0) {
    mostrarMensajeEstado(contenedor, "Aún no hay partidas programadas para este torneo.", "vacio");
    return;
  }

  contenedor.innerHTML = "";
  partidasRonda.forEach((partida) => {
    const item = document.createElement("li");
    item.className = "tarjeta-partida";
    const marcador = partida.resultado
      ? `<span class="marcador">${partida.resultado.puntajeA} - ${partida.resultado.puntajeB}</span>`
      : `<span class="marcador">vs</span>`;
    const nombreB = partida.participanteB.nombre || "Por definir";
    item.innerHTML = `
      <span class="enfrentamiento">${partida.participanteA.nombre} ${marcador} ${nombreB}</span>
      <span>${partida.estado === "jugada" ? "Jugada" : partida.estado === "cancelada" ? "Cancelada" : "Programada"} · ${formatearFecha(partida.horario, true)}</span>
    `;
    contenedor.appendChild(item);
  });
}

function calcularRanking(partidasTorneo) {
  const tabla = {};

  const asegurar = (nombre) => {
    if (!tabla[nombre]) tabla[nombre] = { nombre, victorias: 0, derrotas: 0, diferencia: 0 };
    return tabla[nombre];
  };

  partidasTorneo.forEach((partida) => {
    if (!partida.resultado) return;
    const filaA = asegurar(partida.participanteA.nombre);
    const filaB = asegurar(partida.participanteB.nombre);
    filaA.diferencia += partida.resultado.puntajeA - partida.resultado.puntajeB;
    filaB.diferencia += partida.resultado.puntajeB - partida.resultado.puntajeA;

    if (partida.resultado.puntajeA > partida.resultado.puntajeB) {
      filaA.victorias += 1;
      filaB.derrotas += 1;
    } else if (partida.resultado.puntajeB > partida.resultado.puntajeA) {
      filaB.victorias += 1;
      filaA.derrotas += 1;
    }
  });

  return Object.values(tabla).sort((a, b) => b.victorias - a.victorias || b.diferencia - a.diferencia);
}

function renderizarRanking(partidasTorneo) {
  const cuerpo = document.getElementById("cuerpo-ranking");
  const ranking = calcularRanking(partidasTorneo);

  if (ranking.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="5">Aún no hay resultados validados para calcular la tabla de posiciones.</td></tr>`;
    return;
  }

  cuerpo.innerHTML = "";
  ranking.forEach((fila, indice) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="${indice === 0 ? "posicion-1" : ""}">${indice + 1}</td>
      <td>${fila.nombre}</td>
      <td>${fila.victorias}</td>
      <td>${fila.derrotas}</td>
      <td>${fila.diferencia > 0 ? "+" : ""}${fila.diferencia}</td>
    `;
    cuerpo.appendChild(tr);
  });
}

function renderizarPremios(torneo) {
  const contenedor = document.getElementById("contenido-premios");

  if (torneo.estado !== "finalizado") {
    mostrarMensajeEstado(contenedor, "Los premios se muestran una vez que el torneo finaliza.", "info");
    return;
  }

  if (!torneo.premios || torneo.premios.length === 0) {
    mostrarMensajeEstado(contenedor, "Este torneo finalizó sin premios registrados.", "vacio");
    return;
  }

  const tabla = document.createElement("table");
  tabla.className = "tabla-datos";
  tabla.innerHTML = `
    <thead><tr><th scope="col">Posición</th><th scope="col">Premio</th></tr></thead>
    <tbody>
      ${torneo.premios.map((p) => `<tr><td class="${p.posicion === 1 ? "posicion-1" : ""}">${p.posicion}°</td><td>${p.premio}</td></tr>`).join("")}
    </tbody>
  `;
  contenedor.innerHTML = "";
  contenedor.appendChild(tabla);
}

function iniciar() {
  const idTorneo = obtenerParametroURL("id") || (TORNEOS[0] && TORNEOS[0].id);
  const torneo = buscarTorneo(idTorneo);

  if (!torneo) {
    document.getElementById("contenido-general").innerHTML =
      `<p class="mensaje-estado mensaje-estado--error">No encontramos el torneo solicitado. Vuelve al <a href="torneos.html">listado de torneos</a>.</p>`;
    return;
  }

  renderizarDatosGenerales(torneo);
  renderizarParticipantes(torneo);

  const partidasTorneo = nombrePartidasTorneo(torneo);
  renderizarSelectorRondas(partidasTorneo);
  renderizarPartidasRonda(partidasTorneo);
  renderizarRanking(partidasTorneo);
  renderizarPremios(torneo);
}

document.addEventListener("DOMContentLoaded", iniciar);
