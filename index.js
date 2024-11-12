// Solicita al usuario el precio por km y el precio de la movida (una sola vez)
const precioPorKm = parseFloat(prompt("Ingrese el precio por kilómetro:"));
const precioMovida = parseFloat(prompt("Ingrese el precio de la movida:"));

// Array para almacenar los detalles de cada viaje (dominio y kilómetros)
let viajes = [];

// Ciclo para solicitar las distancias y las patentes hasta que el usuario quiera salir
let continuar = true;
while (continuar) {
  let dominio = prompt(
    "Ingrese la patente o dominio del vehículo (o escriba 'salir' para finalizar):"
  );

  if (dominio.toLowerCase() === "salir") {
    continuar = false; // Finaliza el ciclo si el usuario ingresa 'salir'
  } else {
    let kmRecorridos = parseFloat(
      prompt("Ingrese la cantidad de kilómetros recorridos:")
    );
    viajes.push({ dominio: dominio, km: kmRecorridos }); // Agrega el objeto con dominio y km al array
  }
}

// Función para calcular el costo de un viaje
function calcularCostoViaje(precioKm, km, movida) {
  if (km > 200) {
    return precioKm * km; // Si supera 200 km, solo se cobra el precio por km
  } else {
    return precioKm * km + movida; // Si no supera 200 km, se suma el precio de la movida
  }
}

// Realizar los cálculos y mostrar los resultados
for (let viaje of viajes) {
  const costo = calcularCostoViaje(precioPorKm, viaje.km, precioMovida);
  alert(
    `El costo total para el vehículo con dominio ${
      viaje.dominio
    } es: $${costo.toFixed(2)}`
  );
  console.log(
    `Dominio: ${viaje.dominio}, Kilómetros: ${
      viaje.km
    }, Costo total: $${costo.toFixed(2)}`
  );
}
