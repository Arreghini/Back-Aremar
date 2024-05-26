const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('guestProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      allowNull: false, 
      primaryKey: true, 
    },
    userId: { 
      type: DataTypes.UUID,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING, 
      allowNull: true,
    },
    dni: { 
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: { 
      type: DataTypes.STRING,
      allowNull: true,
    },
    photoURL: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'not found', 
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'), 
      allowNull: false,
    },
  });
};
