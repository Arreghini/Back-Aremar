const { query } = require('express-validator');

const getAvailableRoomsValidator = [
  query('roomTypeId')
    .bail()
    .custom(value => {
      if (value === undefined || value === null || value === '') {
        throw new Error('roomTypeId es requerido y no puede estar vacío');
      }
      if (!/^\d+$/.test(value) || parseInt(value) <= 0) {
        throw new Error('roomTypeId debe ser un entero positivo');
      }
      return true;
    }),

  query('checkIn')
    .exists().withMessage('checkIn es requerido')
    .bail()
    .notEmpty().withMessage('checkIn no puede estar vacío')
    .bail()
    .isISO8601().withMessage('Fecha de check-in inválida'),

  query('checkOut')
    .exists().withMessage('checkOut es requerido')
    .bail()
    .notEmpty().withMessage('checkOut no puede estar vacío')
    .bail()
    .isISO8601().withMessage('Fecha de check-out inválida'),

  query('numberOfGuests')
    .exists().withMessage('numberOfGuests es requerido')
    .bail()
    .notEmpty().withMessage('numberOfGuests no puede estar vacío')
    .bail()
    .isInt({ gt: 0 }).withMessage('Debe ser un número entero positivo'),
];

module.exports = {
  getAvailableRoomsValidator,
};
