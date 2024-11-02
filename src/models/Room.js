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
    roomType: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'RoomType', 
        key: 'id',
      },
    },
    roomDetail: {
      type: DataTypes.STRING,
      allowNull: false,
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'unavailable'),
      defaultValue: 'available',
    },
  });
};
