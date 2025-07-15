/**
 * Controlador para obtener habitaciones con filtros dinámicos y paginación.
 *
 * Este endpoint permite buscar habitaciones según distintos criterios enviados como query params:
 * 
 * Filtros disponibles:
 * - price: filtra por precio exacto
 * - beds: filtra por cantidad de camas
 * - search: busca texto dentro de la descripción (usa LIKE)
 * - status: estado de la habitación (aunque no se está usando actualmente)
 * - roomTypeId: tipo de habitación (aunque no se está usando actualmente)
 * - startDate / endDate: busca habitaciones disponibles entre ese rango (usa comparación entre fechas)
 * 
 * Paginación:
 * - page: número de página (default: 1)
 * - limit: cantidad de resultados por página (default: 10)
 *
 * Ordenamiento:
 * - sort: campo por el cual ordenar (default: 'id')
 * - order: 'ASC' o 'DESC' (default: 'ASC')
 *
 * Respuesta:
 * - 200 OK: devuelve un array de habitaciones que cumplen con los filtros
 * - 500 Error: error en la base de datos
 */

const { Room } = require('../../models');

const getRoomsController = async (req, res) => {

const {
  price,
  beds,
  search,
  page = 1,
  limit = 10,
  status,
  roomTypeId,
  sort = 'id',
  order = 'ASC',
  startDate,     // ✅ agregar esto
  endDate        // ✅ y esto
} = req.query || {};

  let query = {
    where: {},
    order: [[sort, order]],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
  };

  if (price) query.where.price = price;
  if (beds) query.where.beds = beds;
  if (search) query.where.description = { [Op.like]: `%${search}%` };
  if (startDate && endDate) {
    query.where = {
      ...query.where,
      [Op.and]: [
        { startDate: { [Op.lte]: startDate } },
        { endDate: { [Op.gte]: endDate } },
      ],
    };
  }

  try {
    const rooms = await Room.findAll(query);
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = getRoomsController;
