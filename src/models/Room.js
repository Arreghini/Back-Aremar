const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Room', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roomTypeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'RoomType',
        key: 'id',
      },
    },
    detailRoomId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'RoomDetail',
        key: 'id',
      },
    },
    photoRoom: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'unavailable'),
      defaultValue: 'available',
    },
  });
};
