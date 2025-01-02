# Calculador de Rutas y Precios

Este proyecto es una aplicación web que permite calcular los costos de viajes en base a tarifas configuradas manualmente. Utiliza un mapa interactivo para buscar rutas y admite la entrada manual de kilómetros recorridos. Además, permite registrar y utilizar dominios de vehículos para registrar los viajes.

## Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación.
- **CSS3**: Estilos y diseño responsivo.
- **JavaScript**: Lógica de interacción y cálculo de costos.
- **Leaflet**: Biblioteca para la integración y uso del mapa interactivo.
- **Toastify**: Para mostrar notificaciones.
- **Lottie**: Animaciones para mejorar la experiencia del usuario.

## Estructura de Archivos

### Archivos Principales

- **`index.html`**: Archivo HTML principal que contiene la estructura de la aplicación.
- **`assets/css/styles.css`**: Archivo CSS para los estilos personalizados.
- **`assets/js/index.js`**: Archivo JavaScript con la lógica de la aplicación.
- **`assets/logo/logo.svg`**: Logotipo de la aplicación.

## Características Principales

### Configuración de Tarifas

- Permite ingresar manualmente el precio por kilómetro y el precio fijo de la movida.
- Guarda las tarifas y las muestra al usuario.

### Registro de Vehículo

- El usuario puede registrar el dominio/patente de su vehículo.
- Una vez registrado, el dominio se muestra como "Dominio Actual".

### Mapa Interactivo

- Utiliza la biblioteca Leaflet para ofrecer un mapa interactivo.
- Los usuarios pueden seleccionar puntos de inicio y destino directamente en el mapa.

### Entrada Manual de Kilómetros

- Permite a los usuarios ingresar manualmente los kilómetros recorridos si no desean utilizar el mapa.

### Resultados

- Genera una tabla que muestra:
  - Dominio del vehículo.
  - Precio por kilómetro.
  - Precio fijo de la movida.
  - Kilómetros recorridos.
  - Costo total del viaje.
- Botón para eliminar todos los registros de viajes.

## Cómo Usar

1. **Configuración de Tarifas**:

   - En la sección "Configuración de Tarifas", ingresa los valores para "Precio por Kilómetro" y "Precio de la Movida".
   - Haz clic en "Guardar Tarifas".

2. **Registro de Vehículo**:

   - En el formulario "Dominio/Patente del Vehículo", ingresa el dominio del vehículo.
   - Haz clic en "Registrar Dominio". El dominio aparecerá registrado en la sección correspondiente.

3. **Búsqueda de Ruta**:

   - Selecciona los puntos de inicio y destino en el mapa.
   - Alternativamente, ingresa manualmente los kilómetros en el campo "Kilómetros Manuales".

4. **Resultados**:

   - Consulta los resultados en la tabla de la sección "Resultados".
   - Elimina los registros con el botón "Eliminar Todo" si es necesario.

## Dependencias Externas

Incluye las siguientes bibliotecas y recursos:

- [Leaflet](https://leafletjs.com/): Para la integración del mapa interactivo.
- [Toastify](https://apvarun.github.io/toastify-js/): Para notificaciones.
- [Lottie](https://airbnb.io/lottie/): Para mostrar animaciones.

Los enlaces de CDN utilizados:

```html
<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
/>
<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"
/>
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.10.2/lottie.min.js"></script>
```

## Clonar el repositorio

```bash
git clone https://github.com/LaureanoCorrea/JAVASCRIPT-FLEX---COMISION-75010.git
```

## Contacto

Si tienes alguna pregunta o sugerencia, por favor contáctame a través del repositorio o correo electrónico asociado al proyecto.
