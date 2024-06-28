const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('RoomDetail', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CableTvService: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    smart_TV: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    Wifi: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    microwave: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  });
};
