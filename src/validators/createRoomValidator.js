const { body } = require('express-validator');

const createRoomValidatorRules = [
  body('id')
    .notEmpty().withMessage('El ID es obligatorio')
    .isString().withMessage('El ID debe ser una cadena'),

  body('price')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),

  body('capacity')
    .notEmpty().withMessage('La capacidad es obligatoria')
    .isInt({ min: 1 }).withMessage('La capacidad debe ser un entero positivo'),

  body('description')
    .optional()
    .isString().withMessage('La descripción debe ser una cadena'),
];

module.exports = {
  createRoomValidatorRules,
};
