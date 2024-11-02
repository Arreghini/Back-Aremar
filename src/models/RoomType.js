const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('RoomType', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photos: {
      type: DataTypes.JSON, // Almacena un array de URLs de fotos
      allowNull: true,
    },
    simpleBeds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    trundleBeds: { 
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kingBeds: { 
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    windows: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'RoomType', // Agrega esto para especificar el nombre exacto de la tabla
    timestamps: true 
  });
};

