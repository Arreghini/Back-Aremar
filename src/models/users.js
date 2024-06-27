const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
      allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },    
    email: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
      },
    emailValidate: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        default: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default: true,
    },
});
}