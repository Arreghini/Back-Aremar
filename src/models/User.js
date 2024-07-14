// const { DataTypes } = require('sequelize');

// module.exports = (sequelize) => {
//   sequelize.define('User', {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4, 
//       primaryKey: true,
//       allowNull: false,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING, 
//       allowNull: false,
//       unique: true,
//       validate: {
//         isEmail: true
//       }
//     },
//     email_verified: {
//       type: DataTypes.BOOLEAN,
//       allowNull: true,
//       defaultValue: false, 
//     },
//     picture: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     isActive: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: true, 
//     },
//   });
// };

// src/models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return User;
};
