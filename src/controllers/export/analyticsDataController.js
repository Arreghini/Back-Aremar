const { Reservation, Room, RoomType, User } = require('../../models');
const { Op } = require('sequelize');

const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);


// Función para obtener datos analíticos por habitación
const getAnalyticsData = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    const totalDays = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1
    );

    const rooms = await Room.findAll();
    const analyticsData = [];

    for (const room of rooms) {
      const income = await Reservation.sum('totalPrice', {
        where: {
          roomId: room.id,
          checkIn: { [Op.between]: [startDate, endDate] },
        },
      });

      const reservations = await Reservation.findAll({
        where: {
          roomId: room.id,
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

      let occupiedDays = 0;
      for (const reservation of reservations) {
        const checkIn =
          new Date(reservation.checkIn) < new Date(startDate)
            ? new Date(startDate)
            : new Date(reservation.checkIn);
        const checkOut =
          new Date(reservation.checkOut) > new Date(endDate)
            ? new Date(endDate)
            : new Date(reservation.checkOut);
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        occupiedDays += days;
      }

      const freeDays = totalDays - occupiedDays;

      const sumReservations = await Reservation.count({
        where: {
          roomId: room.id,
          checkIn: { [Op.between]: [startDate, endDate] },
        },
      });

      analyticsData.push({
        roomId: room.id,
        income: '$' + ' ' + income || 0,
        freeDays,
        occupiedDays,
        totalDays,
        occupancy: ((occupiedDays / totalDays) * 100).toFixed(1) + '%',
        sumReservations,
      });
    }

    return analyticsData;
  } catch (error) {
    console.error('Error en analyticsDataController:', error);
    throw error;
  }
};

const getDailyRoomOccupancy = async (startDate, endDate) => {
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

  for (const room of rooms) {
    const roomReservations = reservations.filter(
      (r) => r.roomId === room.id
    );

   let currentDate = dayjs(new Date(startDate));
const finalDate = dayjs(new Date(endDate));

while (currentDate.isSameOrBefore(finalDate)) {
  const dateStr = currentDate.format('YYYY-MM-DD');

  const isOccupied = roomReservations.some((res) => {
    const checkIn = dayjs(new Date(res.checkIn));
    const checkOut = dayjs(new Date(res.checkOut));
    return currentDate.isSameOrAfter(checkIn) && currentDate.isBefore(checkOut);
  });

  result.push({
    roomId: room.id,
    date: dateStr,
    status: isOccupied ? 'ocupado' : 'libre',
  });

  currentDate = currentDate.add(1, 'day');
}
  }

  return result;
};

// Función para obtener ocupación mensual
const getMonthlyOccupancy = async (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const totalDays = Math.ceil(
    (endDate - startDate) / (1000 * 60 * 60 * 24) + 1
  );

  const rooms = await Room.findAll();
  const analyticsData = [];

  for (const room of rooms) {
    const income = await Reservation.sum('totalPrice', {
      where: {
        roomId: room.id,
        checkIn: { [Op.between]: [startDate, endDate] },
      },
    });

    const reservations = await Reservation.findAll({
      where: {
        roomId: room.id,
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

    let occupiedDays = 0;
    for (const reservation of reservations) {
      const checkIn =
        new Date(reservation.checkIn) < new Date(startDate)
          ? new Date(startDate)
          : new Date(reservation.checkIn);
      const checkOut =
        new Date(reservation.checkOut) > new Date(endDate)
          ? new Date(endDate)
          : new Date(reservation.checkOut);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      occupiedDays += days;
    }

    const freeDays = totalDays - occupiedDays;

    const sumReservations = await Reservation.count({
      where: {
        roomId: room.id,
        checkIn: { [Op.between]: [startDate, endDate] },
      },
    });

    analyticsData.push({
      roomId: room.id,
      income: income || 0,
      freeDays,
      sumReservations,
    });
  }

  return analyticsData;
};

// Función para obtener ingresos por tipo de habitación
const getRevenueByRoomType = async (startDate, endDate) => {
  const rooms = await Room.findAll({
    include: [
      {
        model: RoomType,
        as: 'roomType',
        attributes: ['name'],
      },
    ],
  });

  const totalDays = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1
  );

  const roomTypes = new Set();
rooms.forEach((room) => {
  if (room.roomType && room.roomType.name) {
    roomTypes.add(room.roomType.name);
  }
});

  const analyticsData = [];

  for (const roomType of roomTypes) {
    const roomIds = rooms
  .filter((room) => room.roomType && room.roomType.name === roomType)
  .map((room) => room.id);

    const income = await Reservation.sum('totalPrice', {
      where: {
        roomId: { [Op.in]: roomIds },
        checkIn: { [Op.between]: [startDate, endDate] },
      },
    });

    const reservations = await Reservation.findAll({
      where: {
        roomId: { [Op.in]: roomIds },
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

    let occupiedDays = 0;
    for (const reservation of reservations) {
      const checkIn =
        new Date(reservation.checkIn) < new Date(startDate)
          ? new Date(startDate)
          : new Date(reservation.checkIn);
      const checkOut =
        new Date(reservation.checkOut) > new Date(endDate)
          ? new Date(endDate)
          : new Date(reservation.checkOut);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      occupiedDays += days;
    }

    const freeDays = totalDays - occupiedDays;

    const sumReservations = await Reservation.count({
      where: {
        roomId: { [Op.in]: roomIds },
        checkIn: { [Op.between]: [startDate, endDate] },
      },
    });

    analyticsData.push({
      roomType,
      income: income || 0,
      freeDays,
      sumReservations,
    });
  }

  return analyticsData;
};

// Análisis de clientes frecuentes
const getFrequentCustomers = async (startDate, endDate, limit = 10) => {
  const reservations = await Reservation.findAll({
    where: {
      checkIn: { [Op.between]: [startDate, endDate] },
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  const customerAnalytics = {};
  reservations.forEach((reservation) => {
    const customerId = reservation.user.id;
    const price = reservation.totalPrice || 0;

    if (!customerAnalytics[customerId]) {
      customerAnalytics[customerId] = {
        name: reservation.user.name,
        email: reservation.user.email,
        reservationCount: 1,
        totalPrice: price,
      };
    } else {
      customerAnalytics[customerId].reservationCount++;
      customerAnalytics[customerId].totalPrice += price;
    }
  });

  const sortedAnalytics = Object.values(customerAnalytics).sort(
    (a, b) => b.reservationCount - a.reservationCount
  );

  return sortedAnalytics.slice(0, limit);
};

module.exports = {
  getAnalyticsData,
  getDailyRoomOccupancy,
  getMonthlyOccupancy,
  getRevenueByRoomType,
  getFrequentCustomers,
};
