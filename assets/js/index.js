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
	//API KEY mapas
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

	const lottieLoader = lottie.loadAnimation({
		container: document.getElementById('lottie-loader'),
		renderer: 'svg',
		loop: true,
		autoplay: false,
		path: 'assets/logo/lootie.json',
	});

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

			document.getElementById('registered-domain').style.display = 'block';
			document.getElementById('current-domain').textContent = currentDomain;
			domainInput.value = '';
			showToast('Dominio registrado correctamente.');

			// Habilitar el campo de kilómetros y el mapa después de registrar el dominio
			document.getElementById('kmManual').disabled = false;
			toggleMapInteraction(true);
		});

	kmInput.addEventListener('input', function () {
		let kmValue = parseFloat(kmInput.value);
		if (isNaN(kmValue) || kmValue <= 0) {
			// Habilitar clics en el mapa si el valor no es válido
			toggleMapInteraction(true);
			if (calculateButton) calculateButton.style.display = 'none';
		} else {
			// Deshabilitar clics en el mapa si se ingresa un valor válido
			toggleMapInteraction(false);
			showCalculateButton();
		}
	});

	// Habilitar o deshabilitar la interacción con el mapa
	function toggleMapInteraction(enable) {
		const action = enable ? 'enable' : 'disable';
		map.dragging[action]();
		map.scrollWheelZoom[action]();
		map.doubleClickZoom[action]();
		map.touchZoom[action]();
		map.boxZoom[action]();
		map.keyboard[action]();
		map.off('click', mapClickHandler); // Desactivar clics si no está habilitado
		if (enable) map.on('click', mapClickHandler); // Activar clics si está habilitado
	}

	// Manejador de clics en el mapa para agregar puntos
	function mapClickHandler(event) {
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
	}

	function showCalculateButton() {
		// Verificar si el input tiene valor o si se seleccionaron ambos puntos en el mapa
		if ((startPoint && endPoint) || (kmInput.value && !isNaN(kmInput.value))) {
			if (!calculateButton) {
				calculateButton = document.createElement('button');
				calculateButton.textContent = 'Calcular Viaje';
				calculateButton.classList.add(
					'btn',
					'btn-primary',
					'calculate-route-btn'
				);
				document.getElementById('map-inputs').appendChild(calculateButton);

				calculateButton.addEventListener('click', () => {
					calculateRoute();
				});
			}
			calculateButton.style.display = 'block';
		}
	}

	async function calculateRoute() {
		let distanceKm = 0;

		// Mostrar overlay y la animación de Lottie al iniciar el cálculo
		document.getElementById('overlay').style.display = 'block';
		const loaderContainer = document.getElementById('lottie-loader');
		loaderContainer.style.display = 'block';
		lottieLoader.play();

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
				loaderContainer.style.display = 'none';
				lottieLoader.stop();
				return;
			}
		}

		// Realizar el cálculo del costo total
		let totalCost =
			distanceKm > 200
				? distanceKm * pricePerKm
				: distanceKm * pricePerKm + moveCost;
		addRowToTable(currentDomain, pricePerKm, moveCost, distanceKm, totalCost);

		resetSelection();
		setTimeout(() => {
			document.getElementById('overlay').style.display = 'none';
			loaderContainer.style.display = 'none';
			lottieLoader.stop();
		}, 2000);
	}

	// Función para restablecer los valores de puntos seleccionados y otros estados
	function resetSelection() {
		if (startMarker) {
			map.removeLayer(startMarker);
			startMarker = null;
		}
		if (endMarker) {
			map.removeLayer(endMarker);
			endMarker = null;
		}
		kmInput.value = '';
		startPoint = null;
		endPoint = null;

		document.getElementById('tariff-info').style.display = 'none';
		document.getElementById('registered-domain').style.display = 'none';
		currentDomain = '';
		if (calculateButton) {
			calculateButton.style.display = 'none';
		}
		toggleMapInteraction(true);
	}

	// Validación de los kilómetros manuales
	kmInput.addEventListener('input', function () {
		let kmValue = parseFloat(kmInput.value);
		if (isNaN(kmValue) || kmValue <= 0) {
			toggleMapInteraction(true); // Habilitar clics en el mapa si el valor no es válido
			calculateButton.style.display = 'none';
		} else {
			toggleMapInteraction(false); // Deshabilitar clics en el mapa si se ingresa un valor válido
			showCalculateButton();
		}
	});
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
            <td><button class="delete-btn">Eliminar</button></td>`;

		row.querySelector('.delete-btn').addEventListener('click', () => {
			row.remove();
			saveTableData();
			checkTableData();
			showToast('Viaje eliminado.');
		});

		tableBody.appendChild(row);
		saveTableData();
		checkTableData();
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
		checkTableData();
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
		checkTableData();
	}

	// Verificar si hay datos en la tabla
	function checkTableData() {
		const tableBody = document
			.getElementById('tabla-resultados')
			.getElementsByTagName('tbody')[0];
		const deleteButton = document.getElementById('delete-all');

		if (tableBody.rows.length > 0) {
			deleteButton.style.display = 'block';
		} else {
			deleteButton.style.display = 'none';
		}
	}

	// Función para eliminar todas las filas de la tabla
	document.getElementById('delete-all').addEventListener('click', () => {
		const tableBody = document.querySelector('#tabla-resultados tbody');
		tableBody.innerHTML = '';
		saveTableData();
		showToast('Todos los viajes eliminados.');
	});

	loadTableData();
	checkTableData();
});
