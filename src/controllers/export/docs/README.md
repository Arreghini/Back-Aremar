
Del archivo:  analyticsGraphController.js

Función: getSoldVsUnsoldByDay(startDate, endDate)
Propósito:
Devuelve un array con los ingresos diarios por habitaciones vendidas (sold) y no vendidas (unsold) entre dos fechas dadas.

Pasos principales:
Obtención de datos:

Se obtienen todas las habitaciones (Room.findAll()).
Se obtienen todas las reservas que:
Tienen check-in o check-out dentro del rango, o
Abarcan completamente el rango de fechas.
Inicialización:

Se crea un array result para almacenar los datos diarios.
Se inicializa currentDate con el día de inicio y lastDate con el día de fin.
Iteración diaria:

Se recorre cada día del rango usando un bucle while.
Para cada día:
Se inicializa el ingreso vendido (sold) y un conjunto de habitaciones ocupadas (occupiedRooms).
Se recorre cada reserva:
Si la reserva cubre el día actual (currentDate), se suma al ingreso vendido una fracción del precio total proporcional a los días de la reserva.
Se agrega el ID de la habitación ocupada al conjunto.
Se calcula la cantidad de habitaciones no vendidas (unsoldRooms) como la diferencia entre el total de habitaciones y las ocupadas ese día.
El ingreso no vendido (unsold) se calcula como 0, pero aquí podrías estimar un valor si lo deseas.
Se agrega un objeto con la fecha, el ingreso vendido y no vendido al array result.
Se avanza al siguiente día.
Retorno:

Devuelve el array result, donde cada elemento tiene la forma:
{
  date: 'YYYY-MM-DD',
  sold: <ingreso vendido>,
  unsold: <ingreso no vendido>
}
Exportación
Se exporta la función getSoldVsUnsoldByDay para ser utilizada en otros módulos, como controladores de rutas de exportación o generación de gráficos.

Resumen
Este código permite analizar, día por día, cuántos ingresos se generaron por habitaciones ocupadas y cuántos potenciales ingresos se perdieron por habitaciones libres, facilitando la visualización y toma de decisiones en la gestión hotelera.