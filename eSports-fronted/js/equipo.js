function poblarSelectoresCreacion() {
  const selectorJuego = document.getElementById("campo-juego-equipo");
  JUEGOS.forEach((juego) => {
    const opcion = document.createElement("option");
    opcion.value = juego.id;
    opcion.textContent = `${juego.nombre} (${juego.integrantesPorEquipo} integrantes)`;
    selectorJuego.appendChild(opcion);
  });

  const selectorCapitan = document.getElementById("campo-capitan");
  JUGADORES.forEach((jugador) => {
    const opcion = document.createElement("option");
    opcion.value = jugador.id;
    opcion.textContent = `${jugador.nombre} (${jugador.apodo})`;
    selectorCapitan.appendChild(opcion);
  });
}

function poblarSelectorEquipoActual(idAConservar) {
  const selector = document.getElementById("selector-equipo-actual");
  selector.innerHTML = "";
  EQUIPOS.forEach((equipo) => {
    const opcion = document.createElement("option");
    opcion.value = equipo.id;
    opcion.textContent = `${equipo.nombre}${equipo.activo ? "" : " (inactivo)"}`;
    selector.appendChild(opcion);
  });
  if (idAConservar) selector.value = idAConservar;
}

function validarCreacionEquipo(nombre, juegoId, capitanId) {
  let valido = true;
  mostrarErrorCampo("campo-nombre-equipo", "");
  mostrarErrorCampo("campo-capitan", "");

  if (!nombre) {
    mostrarErrorCampo("campo-nombre-equipo", "El nombre del equipo es obligatorio.");
    valido = false;
  } else if (EQUIPOS.some((e) => e.nombre.trim().toLowerCase() === nombre.toLowerCase())) {
    mostrarErrorCampo("campo-nombre-equipo", "Ya existe un equipo con ese nombre.");
    valido = false;
  }

  if (!capitanId) {
    mostrarErrorCampo("campo-capitan", "Debes seleccionar un capitán.");
    valido = false;
  }

  return valido;
}

function crearEquipo(evento) {
  evento.preventDefault();
  const nombre = document.getElementById("campo-nombre-equipo").value.trim();
  const juegoId = Number(document.getElementById("campo-juego-equipo").value);
  const capitanId = Number(document.getElementById("campo-capitan").value);

  if (!validarCreacionEquipo(nombre, juegoId, capitanId)) return;

  const nuevoId = Math.max(...EQUIPOS.map((e) => e.id), 0) + 1;
  EQUIPOS.push({
    id: nuevoId,
    nombre,
    juegoId,
    capitanId,
    activo: true,
    integrantes: [{ jugadorId: capitanId, rol: "Capitán/a" }]
  });

  document.getElementById("formulario-equipo").reset();
  poblarSelectorEquipoActual(nuevoId);
  renderizarPanelEquipo(nuevoId);
}

function renderizarPanelEquipo(equipoId) {
  const panel = document.getElementById("panel-equipo");
  const equipo = buscarEquipo(equipoId);
  if (!equipo) {
    mostrarMensajeEstado(panel, "Crea tu primer equipo con el formulario de arriba.", "vacio");
    return;
  }
  const juego = JUEGOS.find((j) => j.id === equipo.juegoId);
  const capitan = buscarJugador(equipo.capitanId);

  panel.innerHTML = `
    <div class="tarjeta-info">
      <h3>${equipo.nombre}</h3>
      <p class="fila-dato"><span>Juego</span><span>${juego ? juego.nombre : "—"}</span></p>
      <p class="fila-dato"><span>Capitán/a</span><span>${capitan ? capitan.nombre : "—"}</span></p>
      <p class="fila-dato"><span>Estado</span><span>${equipo.activo ? "Activo" : "Inactivo (no puede inscribirse)"}</span></p>

      <h4 style="margin-top:1.2rem;">Integrantes</h4>
      <ul id="lista-integrantes" style="list-style:none; padding:0; display:grid; gap:0.5rem;"></ul>

      <form id="formulario-agregar-integrante" class="formulario" style="margin-top:1.2rem;" novalidate>
        <div class="campo">
          <label for="campo-nuevo-integrante">Agregar jugador al equipo</label>
          <select id="campo-nuevo-integrante"></select>
          <span id="error-campo-nuevo-integrante" class="mensaje-error" hidden></span>
        </div>
        <div class="acciones-formulario">
          <button type="submit" class="boton boton-secundario">Agregar integrante</button>
        </div>
      </form>
    </div>
  `;

  renderizarListaIntegrantes(equipo);
  poblarSelectorNuevoIntegrante(equipo);

  document.getElementById("formulario-agregar-integrante").addEventListener("submit", (evento) => {
    evento.preventDefault();
    agregarIntegrante(equipo);
  });
}

function renderizarListaIntegrantes(equipo) {
  const lista = document.getElementById("lista-integrantes");
  lista.innerHTML = "";
  equipo.integrantes.forEach((integrante) => {
    const jugador = buscarJugador(integrante.jugadorId);
    const li = document.createElement("li");
    li.className = "fila-dato";
    li.style.borderTop = "1px dashed var(--color-superficie-alta)";
    li.style.paddingTop = "0.4rem";
    const esCapitan = integrante.jugadorId === equipo.capitanId;
    li.innerHTML = `
      <span>${jugador ? jugador.nombre : "Jugador no disponible"} — ${integrante.rol}</span>
      <span>${esCapitan ? "" : `<button type="button" class="boton boton-pequeno boton-secundario" data-quitar="${integrante.jugadorId}">Quitar</button>`}</span>
    `;
    lista.appendChild(li);
  });

  lista.querySelectorAll("[data-quitar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      equipo.integrantes = equipo.integrantes.filter((i) => i.jugadorId !== Number(boton.dataset.quitar));
      renderizarListaIntegrantes(equipo);
      poblarSelectorNuevoIntegrante(equipo);
    });
  });
}

function poblarSelectorNuevoIntegrante(equipo) {
  const selector = document.getElementById("campo-nuevo-integrante");
  const idsEnEquipo = equipo.integrantes.map((i) => i.jugadorId);
  const disponibles = JUGADORES.filter((j) => !idsEnEquipo.includes(j.id));

  selector.innerHTML = "";
  if (disponibles.length === 0) {
    const opcion = document.createElement("option");
    opcion.textContent = "No hay jugadores disponibles para agregar";
    opcion.disabled = true;
    selector.appendChild(opcion);
    return;
  }
  disponibles.forEach((jugador) => {
    const opcion = document.createElement("option");
    opcion.value = jugador.id;
    opcion.textContent = `${jugador.nombre} (${jugador.apodo})`;
    selector.appendChild(opcion);
  });
}

function agregarIntegrante(equipo) {
  mostrarErrorCampo("campo-nuevo-integrante", "");
  const selector = document.getElementById("campo-nuevo-integrante");
  const jugadorId = Number(selector.value);

  if (!jugadorId) {
    mostrarErrorCampo("campo-nuevo-integrante", "Selecciona un jugador para agregar.");
    return;
  }
  if (equipo.integrantes.some((i) => i.jugadorId === jugadorId)) {
    mostrarErrorCampo("campo-nuevo-integrante", "Ese jugador ya forma parte del equipo.");
    return;
  }

  equipo.integrantes.push({ jugadorId, rol: "Jugador/a" });
  renderizarListaIntegrantes(equipo);
  poblarSelectorNuevoIntegrante(equipo);
}

document.addEventListener("DOMContentLoaded", () => {
  poblarSelectoresCreacion();
  poblarSelectorEquipoActual();
  renderizarPanelEquipo(Number(document.getElementById("selector-equipo-actual").value));

  document.getElementById("formulario-equipo").addEventListener("submit", crearEquipo);
  document.getElementById("selector-equipo-actual").addEventListener("change", (evento) => {
    renderizarPanelEquipo(Number(evento.target.value));
  });
});
