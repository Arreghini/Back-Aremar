const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('RoomDetail', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
      allowNull: false
    },  
    cableTvService: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    smart_TV: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    wifi: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    microwave: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    pava_electrica: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
    tableName: 'RoomDetail', // Agrega esto para especificar el nombre exacto de la tabla
    timestamps: true 
  });
};
