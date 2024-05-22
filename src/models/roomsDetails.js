const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('roomsDetails', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    roomId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id',
        },
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
