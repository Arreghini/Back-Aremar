const { Room } = require('../../models');

const getRoomsController = async (req, res) => {
  const {
    price,
    beds,
    search,
    page = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    startDate,
    endDate,
  } = req.query;

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
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

module.exports = getRoomsController;
