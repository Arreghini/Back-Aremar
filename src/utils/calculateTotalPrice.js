const Room = require('../models/index');

const calculateTotalPrice = async (roomId, checkIn, checkOut) => {
    const room = await Room.findByPk(roomId);
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return room.price * days;
};
module.exports = calculateTotalPrice;