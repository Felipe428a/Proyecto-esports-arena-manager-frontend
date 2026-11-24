function crearTarjetaTorneo(torneo) {
  const juego = nombreJuego(torneo.juegoId);
  const estado = estadoTorneoInfo(torneo.estado);
  const porcentaje = Math.min(100, Math.round((torneo.cupoOcupado / torneo.cupoMax) * 100));

  const articulo = document.createElement("article");
  articulo.className = "tarjeta-torneo";
  articulo.innerHTML = `
    <span class="etiqueta-estado ${estado.clase}">${estado.etiqueta}</span>
    <h3>${torneo.nombre}</h3>
    <p class="fila-dato"><span>Juego</span><span>${juego}</span></p>
    <p class="fila-dato"><span>Cupos</span><span>${torneo.cupoOcupado} / ${torneo.cupoMax}</span></p>
    <div class="barra-cupos" role="img" aria-label="${porcentaje}% de cupos ocupados">
      <span style="width:${porcentaje}%"></span>
    </div>
    <p class="fila-dato"><span>Cierre de inscripción</span><span>${formatearFecha(torneo.fechaCierreInscripcion)}</span></p>
    <a class="boton boton-secundario boton-pequeno" href="detalle-torneo.html?id=${torneo.id}">Ver detalle</a>
  `;
  return articulo;
}

function renderizarDestacados() {
  const contenedor = document.getElementById("lista-destacados");
  const destacados = TORNEOS.filter((t) => t.estado === "abierto" || t.estado === "en_curso");
  if (destacados.length === 0) {
    mostrarMensajeEstado(contenedor, "Por ahora no hay torneos abiertos o en curso. Vuelve pronto.", "vacio");
    return;
  }

  contenedor.innerHTML = "";
  destacados.forEach((torneo) => contenedor.appendChild(crearTarjetaTorneo(torneo)));
}
function renderizarCierres() {
  const contenedor = document.getElementById("lista-cierres");
  const abiertos = TORNEOS
    .filter((t) => t.estado === "abierto")
    .sort((a, b) => new Date(a.fechaCierreInscripcion) - new Date(b.fechaCierreInscripcion))
    .slice(0, 4);

  if (abiertos.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No hay cierres de inscripción próximos en este momento.";
    contenedor.appendChild(item);
    return;
  }

  contenedor.innerHTML = "";
  abiertos.forEach((torneo) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span><strong>${torneo.nombre}</strong> · ${nombreJuego(torneo.juegoId)}</span>
      <span>Cierra el ${formatearFecha(torneo.fechaCierreInscripcion)}</span>
    `;
    contenedor.appendChild(item);
  });
}

function renderizarResumen() {
  document.getElementById("dato-juegos").textContent = JUEGOS.length;
  document.getElementById("dato-abiertos").textContent =
    TORNEOS.filter((t) => t.estado === "abierto").length;
  document.getElementById("dato-en-curso").textContent =
    TORNEOS.filter((t) => t.estado === "en_curso").length;
}
document.addEventListener("DOMContentLoaded", () => {
  renderizarResumen();
  renderizarDestacados();
  renderizarCierres();
});
