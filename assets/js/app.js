let startPoint = null;
let endPoint = null;
let currentDomain = null;
let pricePerKm = 0;
let moveCost = 0;
const apiKey = '5b3ce3597851110001cf6248818b07fdf52e4de68ce2f04569d157cc';
let isTariffLoaded = false;

// Inicialización del mapa
const map = L.map('map').setView([-34.61315, -58.37723], 13); // Centrado por defecto en Buenos Aires

// Agregar el mapa base (utilizando OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Función para mostrar notificaciones con Toastify
function showToast(message, color = '#00A170') {
	Toastify({
		text: message,
		duration: 3000,
		gravity: 'top',
		position: 'right',
		style: {
			background: color,
		},
	}).showToast();
}

// Guardar tarifas
document.getElementById('config-form').addEventListener('submit', (event) => {
	event.preventDefault();

	// Obtener las tarifas
	pricePerKm = parseFloat(document.getElementById('precio-km').value);
	moveCost = parseFloat(document.getElementById('precio-movida').value);

	// Validar que los valores sean números
	if (isNaN(pricePerKm) || isNaN(moveCost)) {
		showToast(
			'Por favor, ingresa valores válidos para las tarifas.',
			'#FF6347'
		);
		return;
	}

	document.getElementById('tariff-price-per-km').textContent =
		pricePerKm.toFixed(2);
	document.getElementById('tariff-move-cost').textContent = moveCost.toFixed(2);

	isTariffLoaded = true;

	// Mostrar mensaje de éxito y limpiar los campos
	showToast('Tarifas guardadas correctamente.');
	document.getElementById('precio-km').value = '';
	document.getElementById('precio-movida').value = '';
});

// Registrar dominio/patente
document
	.getElementById('register-domain-form')
	.addEventListener('submit', (event) => {
		event.preventDefault();

		if (!isTariffLoaded) {
			showToast(
				'Por favor, carga las tarifas antes de registrar el dominio.',
				'#FF6347'
			);
			return;
		}

		const domainInput = document.getElementById('vehicle-domain');
		currentDomain = domainInput.value.trim().toUpperCase();

		if (!currentDomain) {
			showToast('Por favor, ingresa un dominio válido.', '#FF6347');
			return;
		}

		// Mostrar el dominio registrado
		const registeredDomainElement =
			document.getElementById('registered-domain');
		registeredDomainElement.style.display = 'block';
		registeredDomainElement.querySelector('span').textContent = currentDomain;

		domainInput.value = '';

		showToast('Dominio registrado correctamente.');
	});

// Seleccionar puntos en el mapa
map.on('click', (event) => {
	if (!currentDomain) {
		showToast(
			'Registra un dominio antes de seleccionar puntos en el mapa.',
			'#FF6347'
		);
		return;
	}

	if (!startPoint) {
		startPoint = event.latlng;
		L.marker(startPoint).addTo(map).bindPopup('Punto de inicio').openPopup();
		showToast('Punto de inicio seleccionado.');
	} else if (!endPoint) {
		// Si no se ha seleccionado el punto de destino
		endPoint = event.latlng;
		L.marker(endPoint).addTo(map).bindPopup('Punto de destino').openPopup();

		calculateRoute();
		showToast('Punto de destino seleccionado.');
	}
});

// Calcular la ruta entre los puntos seleccionados
async function calculateRoute() {
	let distanceKm;

	if (startPoint && endPoint) {
		// Si los puntos están seleccionados en el mapa, calculamos la ruta
		try {
			// Configuración de la API para obtener la ruta
			const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}`;
			const body = {
				coordinates: [
					[startPoint.lng, startPoint.lat],
					[endPoint.lng, endPoint.lat],
				],
			};

			// Enviar la solicitud a OpenRouteService
			const response = await fetch(routeUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			// Parsear la respuesta JSON
			const data = await response.json();
			distanceKm = (data.routes[0].summary.distance / 1000).toFixed(2); // Convertir a kilómetros
		} catch (error) {
			// Manejo de errores
			console.error('Error al calcular la ruta:', error);
			showToast('Hubo un error al calcular la ruta.', '#FF6347');
			return;
		}
	} else {
		// Si no se seleccionaron puntos en el mapa, usamos el input de kilómetros
		distanceKm = parseFloat(document.getElementById('input-km').value);

		// Validar que los kilómetros ingresados sean válidos
		if (isNaN(distanceKm) || distanceKm <= 0) {
			showToast(
				'Por favor, ingresa un número válido de kilómetros.',
				'#FF6347'
			);
			return;
		}
	}

	let cost;
	if (distanceKm > 200) {
		// Si la distancia es mayor a 200 km, no sumamos el costo de la movida
		cost = distanceKm * pricePerKm;
	} else {
		// Si la distancia es menor o igual a 200 km, se suma el costo de la movida
		cost = distanceKm * pricePerKm + moveCost;
	}
	addRowToTable(currentDomain, pricePerKm, moveCost, distanceKm, cost);

	startPoint = null;
	endPoint = null;
	currentDomain = null;
	document.getElementById('registered-domain').style.display = 'none';
	document.getElementById('registered-domain span').textContent = '';
}

// Agregar fila a la tabla de resultados
function addRowToTable(domain, pricePerKm, moveCost, km, totalCost) {
	const tableBody = document.querySelector('#tabla-resultados tbody');
	const row = document.createElement('tr');

	row.innerHTML = `
    <td>${domain}</td>
    <td>${pricePerKm.toFixed(2)}</td>
    <td>${moveCost.toFixed(2)}</td>
    <td>${km}</td>
    <td>${totalCost.toFixed(2)}</td>
    <td><button class="delete-btn">Eliminar</button></td>
  `;

	row.querySelector('.delete-btn').addEventListener('click', () => {
		row.remove();
		showToast('Viaje eliminado.');
	});

	tableBody.appendChild(row);
}

document.getElementById('delete-all').addEventListener('click', () => {
	const tableBody = document.querySelector('#tabla-resultados tbody');
	tableBody.innerHTML = '';
	showToast('Todos los viajes eliminados.');
});
