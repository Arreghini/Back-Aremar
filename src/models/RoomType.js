const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define(
    'RoomType',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'RoomType',
      timestamps: true,
    }
  );
};
