const { Room } = require('../models');

const calculateTotalPrice = async (roomId, checkIn, checkOut) => {
  try {
    // Validar parámetros de entrada
    if (!roomId || !checkIn || !checkOut) {
      throw new Error('Faltan parámetros requeridos: roomId, checkIn, checkOut');
    }

    // Buscar la habitación
    const room = await Room.findByPk(roomId);
    
    if (!room) {
      throw new Error(`Habitación con ID ${roomId} no encontrada`);
    }

    // Validar que checkOut sea posterior a checkIn
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
    }

    // Calcular días (redondeado hacia arriba)
    const days = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    // Validar que el precio de la habitación sea válido
    if (!room.price || room.price <= 0) {
      throw new Error('Precio de habitación inválido');
    }

    return room.price * days;
  } catch (error) {
    console.error('Error calculando precio total:', error.message);
    throw error;
  }
};

module.exports = calculateTotalPrice;
