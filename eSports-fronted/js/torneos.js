/**
 * torneos.js
 * aplica los filtros elegidos por el usuario sobre el arreglo TORNEOS y renderiza el resultado con manipulación del DOM.
 */

function poblarSelectorJuegos() {
  const selector = document.getElementById("filtro-juego");
  JUEGOS.forEach((juego) => {
    const opcion = document.createElement("option");
    opcion.value = juego.id;
    opcion.textContent = juego.nombre;
    selector.appendChild(opcion);
  });
}

function crearTarjetaTorneo(torneo) {
  const estado = estadoTorneoInfo(torneo.estado);
  const porcentaje = Math.min(100, Math.round((torneo.cupoOcupado / torneo.cupoMax) * 100));
  const juego = JUEGOS.find((j) => j.id === torneo.juegoId);

  const articulo = document.createElement("article");
  articulo.className = "tarjeta-torneo";
  articulo.innerHTML = `
    <span class="etiqueta-estado ${estado.clase}">${estado.etiqueta}</span>
    <h3>${torneo.nombre}</h3>
    <p class="fila-dato"><span>Juego</span><span>${juego ? juego.nombre : "No disponible"}</span></p>
    <p class="fila-dato"><span>Modalidad</span><span>${juego ? juego.modalidad : "—"}</span></p>
    <p class="fila-dato"><span>Cupos</span><span>${torneo.cupoOcupado} / ${torneo.cupoMax}</span></p>
    <div class="barra-cupos" role="img" aria-label="${porcentaje}% de cupos ocupados">
      <span style="width:${porcentaje}%"></span>
    </div>
    <p class="fila-dato"><span>Cierre de inscripción</span><span>${formatearFecha(torneo.fechaCierreInscripcion)}</span></p>
    <a class="boton boton-secundario boton-pequeno" href="detalle-torneo.html?id=${torneo.id}">Ver detalle</a>
  `;
  return articulo;
}

function obtenerFiltrosActuales() {
  return {
    buscar: document.getElementById("filtro-buscar").value.trim().toLowerCase(),
    juego: document.getElementById("filtro-juego").value,
    estado: document.getElementById("filtro-estado").value,
    fechaDesde: document.getElementById("filtro-fecha-desde").value,
    fechaHasta: document.getElementById("filtro-fecha-hasta").value
  };
}

/** Valida que la fecha "desde" no sea posterior a la fecha "hasta", devuelve true si es válido */
function validarRangoFechas(filtros) {
  mostrarErrorCampo("filtro-fecha-hasta", "");
  if (filtros.fechaDesde && filtros.fechaHasta) {
    if (new Date(filtros.fechaDesde) > new Date(filtros.fechaHasta)) {
      mostrarErrorCampo("filtro-fecha-hasta", "La fecha inicial no puede ser posterior a la fecha final.");
      return false;
    }
  }
  return true;
}

function torneoCoincide(torneo, filtros) {
  if (filtros.buscar && !torneo.nombre.toLowerCase().includes(filtros.buscar)) return false;
  if (filtros.juego && torneo.juegoId !== Number(filtros.juego)) return false;
  if (filtros.estado && torneo.estado !== filtros.estado) return false;
  if (filtros.fechaDesde && new Date(torneo.fechaCierreInscripcion) < new Date(filtros.fechaDesde)) return false;
  if (filtros.fechaHasta && new Date(torneo.fechaCierreInscripcion) > new Date(filtros.fechaHasta)) return false;
  return true;
}

function renderizarListado() {
  const contenedor = document.getElementById("lista-torneos");
  const contador = document.getElementById("contador-resultados");
  const filtros = obtenerFiltrosActuales();

  if (!validarRangoFechas(filtros)) {
    contenedor.innerHTML = "";
    contador.textContent = "";
    return;
  }

  const resultados = TORNEOS.filter((torneo) => torneoCoincide(torneo, filtros));

  if (resultados.length === 0) {
    mostrarMensajeEstado(
      contenedor,
      "Ningún torneo cumple con los filtros seleccionados. Prueba ajustando el juego, el estado o el rango de fechas.",
      "vacio"
    );
    contador.textContent = "0 torneos encontrados";
    return;
  }

  contenedor.innerHTML = "";
  resultados.forEach((torneo) => contenedor.appendChild(crearTarjetaTorneo(torneo)));
  contador.textContent = `${resultados.length} torneo${resultados.length === 1 ? "" : "s"} encontrado${resultados.length === 1 ? "" : "s"}`;
}

document.addEventListener("DOMContentLoaded", () => {
  poblarSelectorJuegos();
  renderizarListado();

  const formulario = document.getElementById("formulario-filtros");
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    renderizarListado();
  });

  // Filtra inmediatamente al escribir o cambiar cualquier campo
  formulario.querySelectorAll("input, select").forEach((campo) => {
    campo.addEventListener("input", renderizarListado);
  });


  document.getElementById("boton-limpiar").addEventListener("click", () => {
    setTimeout(renderizarListado, 0);
  });
});
