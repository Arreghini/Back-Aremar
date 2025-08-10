const { query } = require('express-validator');

const getAvailableRoomsValidator = [
  query('roomTypeId')
    .exists().withMessage('roomTypeId es requerido')
    .notEmpty().withMessage('roomTypeId no puede estar vacío')
    .isInt({ gt: 0 }).withMessage('roomTypeId debe ser un entero positivo'),

  query('checkIn')
    .exists().withMessage('checkIn es requerido')
    .notEmpty().withMessage('checkIn no puede estar vacío')
    .isISO8601().withMessage('Fecha de check-in inválida'),

  query('checkOut')
    .exists().withMessage('checkOut es requerido')
    .notEmpty().withMessage('checkOut no puede estar vacío')
    .isISO8601().withMessage('Fecha de check-out inválida'),

  query('numberOfGuests')
    .exists().withMessage('numberOfGuests es requerido')
    .notEmpty().withMessage('numberOfGuests no puede estar vacío')
    .isInt({ gt: 0 }).withMessage('Debe ser un número entero positivo'),
];

module.exports = {
  getAvailableRoomsValidator,
};