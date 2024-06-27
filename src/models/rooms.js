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
    },
    typeRoom: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'RoomType',
        key: 'id',
      },
    },
    detailRoom: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'RoomDetail',
        key: 'id',
      },
    },
  });
};
