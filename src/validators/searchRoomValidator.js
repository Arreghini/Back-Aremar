const { query } = require('express-validator');

const searchRoomsValidator = [
  query('capacity')
    .optional()
    .isInt({ gt: 0 }).withMessage('La capacidad debe ser un número entero positivo'),

  query('priceMin')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El precio mínimo debe ser mayor que 0'),

  query('priceMax')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El precio máximo debe ser mayor que 0'),

  // Validación cruzada: priceMin <= priceMax
  query('priceMax').custom((value, { req }) => {
    if (req.query.priceMin && value && parseFloat(value) < parseFloat(req.query.priceMin)) {
      throw new Error('El precio máximo no puede ser menor que el precio mínimo');
    }
    return true;
  }),
];

module.exports = {
  searchRoomsValidator,
};
