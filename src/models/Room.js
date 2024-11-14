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
      type: DataTypes.UUID, // Cambiar de STRING a UUID
      allowNull: true,
      references: {
        model: 'RoomType',
        key: 'id',
      },
    },
    roomDetailId: {
      type: DataTypes.UUID, // Cambiar de STRING a UUID
      allowNull: true,
      references: {
        model: 'RoomDetail',
        key: 'id',
      }
    },    
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    photoRoom: {
      type: DataTypes.JSONB, 
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'unavailable'),
      defaultValue: 'available',
    },
  });
};
