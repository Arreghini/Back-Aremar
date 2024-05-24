const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

  sequelize.define('roomsType', {
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
        type: DataTypes.STRING,
        allowNull: false,
        },    
    simpleBeds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        },
    trundleBed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
    kingBed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        },
    windows: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },   
  });
}