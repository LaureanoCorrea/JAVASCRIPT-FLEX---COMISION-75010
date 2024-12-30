document.addEventListener('DOMContentLoaded', function () {
	let startPoint = null;
	let endPoint = null;
	let currentDomain = null;
	let pricePerKm = 0;
	let moveCost = 0;
	const apiKey = '5b3ce3597851110001cf6248818b07fdf52e4de68ce2f04569d157cc';
	let isTariffLoaded = false;
	let calculateButton = null;
	let loader = null; // Elemento loader

	// Inicialización del mapa
	const map = L.map('map').setView([-34.61315, -58.37723], 13);

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

		pricePerKm = parseFloat(document.getElementById('precio-km').value);
		moveCost = parseFloat(document.getElementById('precio-movida').value);

		if (isNaN(pricePerKm) || isNaN(moveCost)) {
			showToast(
				'Por favor, ingresa valores válidos para las tarifas.',
				'#FF6347'
			);
			return;
		}

		document.getElementById('tariff-price-per-km').textContent =
			pricePerKm.toFixed(2);
		document.getElementById('tariff-move-cost').textContent =
			moveCost.toFixed(2);

		// Mostrar los precios debajo del dominio registrado
		const tariffInfo = document.getElementById('tariff-info');

		isTariffLoaded = true;

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

			const registeredDomainElement =
				document.getElementById('registered-domain');
			registeredDomainElement.style.display = 'block';
			registeredDomainElement.querySelector('span').textContent = currentDomain;

			// Mostrar tarifas debajo del dominio
			document.getElementById('registered-domain').style.display = 'block';

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
			endPoint = event.latlng;
			L.marker(endPoint).addTo(map).bindPopup('Punto de destino').openPopup();
			showToast('Punto de destino seleccionado.');

			// Mostrar botón para calcular viaje
			showCalculateButton();
		}
	});

	// Mostrar botón "Calcular Viaje"
	function showCalculateButton() {
		if (!calculateButton) {
			calculateButton = document.createElement('button');
			calculateButton.id = 'calculate-route-btn';
			calculateButton.textContent = 'Calcular Viaje';
			calculateButton.classList.add('btn', 'btn-primary');
			document.body.appendChild(calculateButton);

			calculateButton.addEventListener('click', () => {
				calculateRoute();
			});
		}

		calculateButton.style.display = 'block';
	}

	// Crear el loader para mostrar mientras se calcula
	function createLoader() {
		if (!loader) {
			loader = document.createElement('div');
			loader.id = 'loader';
			loader.style.position = 'fixed';
			loader.style.top = '0';
			loader.style.left = '0';
			loader.style.width = '100%';
			loader.style.height = '100%';
			loader.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
			loader.style.display = 'flex';
			loader.style.justifyContent = 'center';
			loader.style.alignItems = 'center';
			loader.style.zIndex = '9999';

			const spinner = document.createElement('div');
			spinner.classList.add('spinner');
			loader.appendChild(spinner);

			document.body.appendChild(loader);
		}
	}

	// Ocultar el loader
	function hideLoader() {
		if (loader) {
			loader.style.display = 'none';
		}
	}

	// Calcular la ruta entre los puntos seleccionados
	async function calculateRoute() {
		let distanceKm;

		// Mostrar loader mientras se realiza el cálculo
		createLoader();
		document.getElementById('registered-domain').style.display = 'none'; // Ocultar dominio

		if (startPoint && endPoint) {
			try {
				const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}`;
				const body = {
					coordinates: [
						[startPoint.lng, startPoint.lat],
						[endPoint.lng, endPoint.lat],
					],
				};

				const response = await fetch(routeUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
				});

				const data = await response.json();
				distanceKm = (data.routes[0].summary.distance / 1000).toFixed(2);
			} catch (error) {
				console.error('Error al calcular la ruta:', error);
				showToast('Hubo un error al calcular la ruta.', '#FF6347');
				hideLoader();
				return;
			}
		} else {
			distanceKm = parseFloat(document.getElementById('input-km').value);
			if (isNaN(distanceKm) || distanceKm <= 0) {
				showToast(
					'Por favor, ingresa un número válido de kilómetros.',
					'#FF6347'
				);
				hideLoader();
				return;
			}
		}

		let cost;
		if (distanceKm > 200) {
			cost = distanceKm * pricePerKm;
		} else {
			cost = distanceKm * pricePerKm + moveCost;
		}
		addRowToTable(currentDomain, pricePerKm, moveCost, distanceKm, cost);

		// Ocultar el loader después de realizar el cálculo
		hideLoader();
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

	// Restablecer la selección
	function resetSelection() {
		startPoint = null;
		endPoint = null;
		currentDomain = null;

		document.getElementById('registered-domain').style.display = 'none';
		document.getElementById('registered-domain span').textContent = '';
		document.getElementById('domain-info').style.display = 'none'; // Ocultar tarifas y dominio

		if (calculateButton) {
			calculateButton.remove();
			calculateButton = null;
		}
	}

	document.getElementById('delete-all').addEventListener('click', () => {
		const tableBody = document.querySelector('#tabla-resultados tbody');
		tableBody.innerHTML = '';
		showToast('Todos los viajes eliminados.');
	});
});
