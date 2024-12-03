let precioPorKm = 0; // Precio por kilómetro (inicializado en 0 hasta que el usuario configure)
let precioMovida = 0; // Precio fijo por la movida (inicializado en 0 hasta que el usuario configure)
let viajes = JSON.parse(localStorage.getItem("viajes")) || [];

function mostrarModal(titulo, mensaje) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");

  modalTitle.textContent = titulo;
  modalMessage.textContent = mensaje;

  modal.style.display = "block";

  document.getElementById("close-btn").onclick = function () {
    modal.style.display = "none";
  };
  document.getElementById("close").onclick = function () {
    modal.style.display = "none";
  };
}

// Elementos del DOM
const formulario = document.getElementById("formulario");
const tablaResultados = document
  .getElementById("tabla-resultados")
  .querySelector("tbody");
const configForm = document.getElementById("config-form");

// Función para guardar tarifas configuradas
function guardarTarifas(precioKm, precioMovidaIngresado) {
  precioPorKm = precioKm;
  precioMovida = precioMovidaIngresado;

  mostrarModal(
    "¡Éxito!",
    "Tarifas configuradas correctamente. ¡Ya puedes registrar viajes!"
  );
}

// Función para agregar un viaje
function agregarViaje(dominio, km) {
  if (precioPorKm <= 0 || precioMovida <= 0) {
    alert("Por favor, configura las tarifas antes de registrar un viaje.");
    return;
  }

  // Calcular costo
  const costo = km > 200 ? precioPorKm * km : precioPorKm * km + precioMovida;

  // Agregar el viaje al array
  viajes.push({
    dominio,
    km,
    costo,
    precioPorKm: parseFloat(precioPorKm),
    precioMovida: parseFloat(precioMovida),
  });

  // Guardar en LocalStorage
  localStorage.setItem("viajes", JSON.stringify(viajes));

  // Actualizar la tabla
  actualizarTabla();
  mostrarModal(
    "¡Viaje registrado!",
    `El viaje para el dominio ${dominio} fue registrado correctamente.`
  );
}

// Función para actualizar la tabla de resultados
function actualizarTabla() {
  // Limpiar tabla
  tablaResultados.innerHTML = "";

  // Generar filas
  viajes.forEach((viaje) => {
    const precioPorKm = Number(viaje.precioPorKm);
    const precioMovida = Number(viaje.precioMovida);
    const costo = Number(viaje.costo);

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${viaje.dominio}</td>
      <td>$${viaje.precioPorKm.toFixed(2)}</td>
      <td>$${viaje.precioMovida.toFixed(2)}</td>
      <td>${viaje.km}</td>
      <td>$${viaje.costo.toFixed(2)}</td>
    `;
    tablaResultados.appendChild(fila);
  });
}

// Manejar el evento del formulario de configuración
configForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Obtener valores del formulario
  const precioKm = parseFloat(document.getElementById("precio-km").value);
  const precioMovidaIngresado = parseFloat(
    document.getElementById("precio-movida").value
  );

  if (
    isNaN(precioKm) ||
    isNaN(precioMovidaIngresado) ||
    precioKm <= 0 ||
    precioMovidaIngresado <= 0
  ) {
    alert("Por favor, ingresa valores válidos para las tarifas.");
    return;
  }

  // Guardar tarifas
  guardarTarifas(precioKm, precioMovidaIngresado);

  // Resetear formulario
  configForm.reset();
});

// Manejar el evento del formulario de viajes
formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  let dominio = document.getElementById("dominio").value.trim();
  const km = parseFloat(document.getElementById("km").value);

  dominio = dominio.toUpperCase();

  if (dominio === "" || isNaN(km) || km <= 0) {
    alert("Por favor, ingresa datos válidos.");
    return;
  }

  // Agregar viaje
  agregarViaje(dominio, km);

  // Resetear formulario
  formulario.reset();
});

actualizarTabla();
