document.addEventListener('DOMContentLoaded', function () {
	let startPoint = null;
	let endPoint = null;
	let startMarker = null;
	let endMarker = null;
	let currentDomain = null;
	let pricePerKm = 0;
	let moveCost = 0;
	let isTariffLoaded = false;
	let calculateButton = null;
	let kmInput = document.getElementById('kmManual');

	const apiKey = '5b3ce3597851110001cf6248818b07fdf52e4de68ce2f04569d157cc';
	// Inicialización del mapa
	const map = L.map('map').setView([-34.61315, -58.37723], 13);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

	// Función para mostrar notificaciones
	function showToast(message, color = '#00A170') {
		Toastify({
			text: message,
			duration: 3000,
			gravity: 'top',
			position: 'right',
			style: { background: color },
		}).showToast();
	}

	// Guardar tarifas
	document.getElementById('config-form').addEventListener('submit', (event) => {
		event.preventDefault();
		pricePerKm = parseFloat(document.getElementById('km').value);
		moveCost = parseFloat(document.getElementById('movida').value);

		if (isNaN(pricePerKm) || isNaN(moveCost)) {
			showToast(
				'Por favor, ingresa valores válidos para las tarifas.',
				'#FF6347'
			);
			return;
		}

		// Mostrar tarifas debajo del formulario
		document.getElementById('tariff-info').style.display = 'block';
		document.getElementById('precio-km').textContent = pricePerKm.toFixed(2);
		document.getElementById('precio-movida').textContent = moveCost.toFixed(2);

		isTariffLoaded = true;
		showToast('Tarifas guardadas correctamente.');
		document.getElementById('config-form').reset();
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

			// Mostrar dominio debajo del formulario
			document.getElementById('registered-domain').style.display = 'block';
			document.getElementById('current-domain').textContent = currentDomain;
			domainInput.value = '';
			showToast('Dominio registrado correctamente.');

			// Habilitar el campo de kilómetros después de registrar el dominio
			document.getElementById('kmManual').disabled = false;
		});

	// Desactivar la interacción con el mapa cuando el input de kilómetros tenga valor
	// Función para habilitar o deshabilitar la interacción con el mapa
	function toggleMapInteraction(enable) {
		if (enable) {
			console.log('Activando interacciones del mapa'); // Depuración
			map.dragging.enable();
			map.scrollWheelZoom.enable();
			map.doubleClickZoom.enable();
			map.touchZoom.enable();
			map.boxZoom.enable();
			map.keyboard.enable();
			map.on('click', mapClickListener); // Reactivar clics en el mapa
		} else {
			console.log('Desactivando interacciones del mapa'); // Depuración
			map.dragging.disable();
			map.scrollWheelZoom.disable();
			map.doubleClickZoom.disable();
			map.touchZoom.disable();
			map.boxZoom.disable();
			map.keyboard.disable();
			map.off('click', mapClickListener); // Desactivar clics en el mapa
		}
	}

	// Escuchar cambios en el input de kilómetros manuales
	kmInput.addEventListener('input', () => {
		const kmValue = kmInput.value.trim();
		console.log('Valor de kmInput: ', kmValue); // Depuración

		// Si el input tiene un valor válido (es un número y mayor que 0), desactivar el mapa
		if (kmValue && !isNaN(kmValue) && kmValue > 0) {
			toggleMapInteraction(false); // Desactivar interacción con el mapa
		} else {
			toggleMapInteraction(true); // Reactivar interacción con el mapa
		}
	});

	// Comprobar si el campo kmInput está correctamente seleccionado
	if (!kmInput) {
		console.error('No se encontró el campo kmInput');
	}

	// Seleccionar puntos en el mapa
	let mapClickListener = map.on('click', (event) => {
		if (!currentDomain) {
			showToast(
				'Registra un dominio antes de seleccionar puntos en el mapa.',
				'#FF6347'
			);
			return;
		}

		if (!startPoint) {
			startPoint = event.latlng;
			startMarker = L.marker(startPoint)
				.addTo(map)
				.bindPopup('Punto de inicio')
				.openPopup();
			showToast('Punto de inicio seleccionado.');
		} else if (!endPoint) {
			endPoint = event.latlng;
			endMarker = L.marker(endPoint)
				.addTo(map)
				.bindPopup('Punto de destino')
				.openPopup();
			showCalculateButton();
			showToast('Punto de destino seleccionado.');
		}
	});

	// Mostrar botón "Calcular Viaje"
	function showCalculateButton() {
		// Verificar si el input tiene valor o si se seleccionaron ambos puntos en el mapa
		if ((startPoint && endPoint) || (kmInput.value && !isNaN(kmInput.value))) {
			if (!calculateButton) {
				calculateButton = document.createElement('button');
				calculateButton.textContent = 'Calcular Viaje';
				calculateButton.classList.add('btn', 'btn-primary');
				document.getElementById('map-inputs').appendChild(calculateButton);

				calculateButton.addEventListener('click', () => {
					calculateRoute();
				});
			}
			calculateButton.style.display = 'block';
		}
	}

	// Calcular la ruta entre los puntos seleccionados
	async function calculateRoute() {
		let distanceKm = 0;
		// Si se ingresa un valor en el input, usar ese valor
		if (kmInput.value && !isNaN(kmInput.value)) {
			distanceKm = parseFloat(kmInput.value);
		} else if (startPoint && endPoint) {
			// Si no se han ingresado datos en el input, calcular la distancia en el mapa
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
				showToast('Error al calcular la ruta.', '#FF6347');
				return;
			}
		}

		// Mostrar el spinner
		document.getElementById('loader').style.visibility = 'visible'; // Mostrar spinner
		setTimeout(function () {
			document.getElementById('loader').style.visibility = 'hidden';
		}, 3000);

		let totalCost =
			distanceKm > 200
				? distanceKm * pricePerKm
				: distanceKm * pricePerKm + moveCost;
		addRowToTable(currentDomain, pricePerKm, moveCost, distanceKm, totalCost);

		// Ocultar el spinner
		document.getElementById('loader').style.display = 'none'; // Ocultar spinner

		// Restablecer los valores
		resetSelection(); // Llamada para restablecer puntos y otros valores

		// Restablecer el valor del input
	}

	// Función para restablecer los valores de puntos seleccionados y otros estados
	function resetSelection() {
		// Eliminar los marcadores si existen
		if (startMarker) {
			map.removeLayer(startMarker); // Eliminar marcador de inicio
			startMarker = null; // Restablecer la variable
		}
		if (endMarker) {
			map.removeLayer(endMarker); // Eliminar marcador de fin
			endMarker = null; // Restablecer la variable
		}

		// Restablecer las coordenadas a null
		kmInput.value = '';
		startPoint = null;
		endPoint = null;

		// Restablecer las tarifas y dominio
		document.getElementById('tariff-info').style.display = 'none';
		document.getElementById('registered-domain').style.display = 'none';
		currentDomain = '';

		// Restablecer el botón de cálculo
		if (calculateButton) {
			calculateButton.style.display = 'none';
		}
	}
	// Agregar fila a la tabla y guardar en localStorage
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
			saveTableData();
			showToast('Viaje eliminado.');
		});

		tableBody.appendChild(row);
		saveTableData();
		checkTableData(); // Llamar a checkTableData después de agregar la fila
	}

	// Guardar datos de la tabla en localStorage
	function saveTableData() {
		const tableRows = document.querySelectorAll('#tabla-resultados tbody tr');
		const data = Array.from(tableRows).map((row) => ({
			domain: row.cells[0].textContent,
			pricePerKm: parseFloat(row.cells[1].textContent),
			moveCost: parseFloat(row.cells[2].textContent),
			km: parseFloat(row.cells[3].textContent),
			totalCost: parseFloat(row.cells[4].textContent),
		}));
		localStorage.setItem('tableData', JSON.stringify(data));
	}

	// Cargar datos desde localStorage
	function loadTableData() {
		const data = JSON.parse(localStorage.getItem('tableData')) || [];
		data.forEach((item) => {
			addRowToTable(
				item.domain,
				item.pricePerKm,
				item.moveCost,
				item.km,
				item.totalCost
			);
		});
	}

	// Verificar si hay datos en la tabla
	function checkTableData() {
		const tableBody = document
			.getElementById('tabla-resultados')
			.getElementsByTagName('tbody')[0];
		const deleteButton = document.getElementById('delete-all');

		// Verificar si la tabla tiene filas de datos
		if (tableBody.rows.length > 0) {
			// Si hay filas, mostrar el botón
			deleteButton.style.display = 'block';
		} else {
			// Si no hay filas, ocultar el botón
			deleteButton.style.display = 'none';
		}
	}

	// Función para eliminar todas las filas de la tabla
	document.getElementById('delete-all').addEventListener('click', () => {
		const tableBody = document.querySelector('#tabla-resultados tbody');
		tableBody.innerHTML = ''; // Eliminar todas las filas
		saveTableData(); // Guardar los cambios en localStorage
		showToast('Todos los viajes eliminados.');
	});

	loadTableData(); // Cargar los datos al iniciar la página
});
