const { Reservation, Room } = require('../../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs'); 
/**
 * Obtiene un arreglo con los ingresos diarios por habitaciones vendidas y no vendidas entre dos fechas.
 *
 * La función consulta las habitaciones y las reservas que coinciden o abarcan el rango dado.
 * Luego, día a día, calcula el ingreso vendido prorrateando el totalPrice de cada reserva y
 * estima las habitaciones no vendidas.
 *
 * @param {string} startDate - Fecha de inicio en formato 'YYYY-MM-DD'.
 * @param {string} endDate - Fecha de fin en formato 'YYYY-MM-DD'.
 * @returns {Promise<Array<{ date: string, sold: number, unsold: number }>>}  
 *          Un arreglo con objetos que contienen la fecha y los ingresos vendidos y no vendidos.
 */

// Obtener ingresos vendidos y no vendidos por día
const getSoldVsUnsoldByDay = async (startDate, endDate) => {
  const rooms = await Room.findAll();
  const reservations = await Reservation.findAll({
    where: {
      [Op.or]: [
        { checkIn: { [Op.between]: [startDate, endDate] } },
        { checkOut: { [Op.between]: [startDate, endDate] } },
        {
          checkIn: { [Op.lte]: startDate },
          checkOut: { [Op.gte]: endDate },
        },
      ],
    },
  });

  const result = [];

  let currentDate = dayjs(startDate);
  const lastDate = dayjs(endDate);

  while (currentDate.isSameOrBefore(lastDate)) {
    const dateStr = currentDate.format('YYYY-MM-DD');

    let sold = 0;
    const occupiedRooms = new Set();

    for (const res of reservations) {
      const checkIn = dayjs(res.checkIn);
      const checkOut = dayjs(res.checkOut);
      if (currentDate.isSameOrAfter(checkIn) && currentDate.isBefore(checkOut)) {
        sold += res.totalPrice / (checkOut.diff(checkIn, 'day') || 1); // distribuye el precio por día
        occupiedRooms.add(res.roomId);
      }
    }

    const unsoldRooms = rooms.length - occupiedRooms.size;
    
    // Calcular el precio promedio por habitación para estimar ingresos no aprovechados
    const avgRoomPrice = rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length;
    const unsold = unsoldRooms * avgRoomPrice;

    result.push({
      date: dateStr,
      sold: Math.round(sold),
      unsold: Math.round(unsold),
    });

    currentDate = currentDate.add(1, 'day');
  }

  return result;
};

module.exports = {
  getSoldVsUnsoldByDay,
};
