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
    trundleBeds: { // Cambiado a plural para mayor claridad
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kingBeds: { // Cambiado a plural para mayor claridad
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    windows: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};

