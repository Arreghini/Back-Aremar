const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('rooms', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    description:{
        type: DataTypes.STRING,
    },
    typeRoom: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'roomsTypes', // Nombre del modelo de destino
        key: 'id', // Clave primaria del modelo de destino
      },
    },
    detailRoom: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
        model: 'roomsDetails',
        key: 'id',
      },
    }
  });
};
