const { Reservation, Room } = require('../../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs'); 

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
    const unsold = unsoldRooms * 0; // si querés podés estimar un valor por habitación no vendida

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
