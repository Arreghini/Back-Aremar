const fs = require('fs');
const path = require('path');
const conn = require('../config/db'); // Importa correctamente la conexión a la base de datos

const basename = path.basename(__filename);
const modelDefiners = [];

// Leer todos los archivos en el directorio de modelos y agregarlos a modelDefiners
fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    modelDefiners.push(require(path.join(__dirname, file))); // Agrega el modelo al arreglo
  });

// Definir los modelos con la conexión de Sequelize
modelDefiners.forEach(modelDefiner => modelDefiner(conn));

// Capitalizar nombres de modelos
let entries = Object.entries(conn.models);
let capsEntries = entries.map(([name, model]) => [name[0].toUpperCase() + name.slice(1), model]);
conn.models = Object.fromEntries(capsEntries);

// Relaciones entre modelos
const { User, Room, RoomType, RoomDetail, Reservation } = conn.models;

RoomType.hasMany(Room, { foreignKey: 'roomType' });
Room.belongsTo(RoomType, { foreignKey: 'roomType' });

RoomDetail.hasMany(Room, { foreignKey: 'id' });
Room.belongsTo(RoomDetail, { foreignKey: 'id' });

Reservation.belongsTo(Room, { foreignKey: 'roomId' });
Room.hasMany(Reservation, { foreignKey: 'roomId' });

Reservation.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Reservation, { foreignKey: 'userId' });

// Confirmación de modelos cargados
console.log('Modelos cargados:', Object.keys(conn.models));

module.exports = {
  conn,
  ...conn.models,
};


// const fs = require('fs');
// const path = require('path');
// const { conn } = require('../config/db');

// const basename = path.basename(__filename);
// const modelDefiners = [];

// // Leer todos los archivos en el directorio de modelos y agregarlos a modelDefiners
// fs.readdirSync(__dirname)
//   .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
//   .forEach(file => {
//     modelDefiners.push(require(path.join(__dirname, file)));
//   });

// // Incluir la conexión de Sequelize a cada modelo
// modelDefiners.forEach(model => model(conn));

// // Capitalizar nombres de modelos
// let entries = Object.entries(conn.models);
// let capsEntries = entries.map(entry => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
// conn.models = Object.fromEntries(capsEntries);

// // Relaciones
// const {
//   User,
//   RoomType,
//   RoomDetail,
//   Room,
//   Reservation,
// } = conn.models;
// // Después de cargar los modelos
// console.log('Modelos cargados:', conn.models);

// User.hasMany(Reservation, { foreignKey: "userId" });
// Reservation.belongsTo(User, { foreignKey: "userId" });

// Room.hasMany(Reservation, { foreignKey: "roomId" });
// Reservation.belongsTo(Room, { foreignKey: "roomId" });

// RoomType.hasMany(Room, { foreignKey: 'roomType' });
// Room.belongsTo(RoomType, { foreignKey: 'roomType' });

// Room.hasOne(RoomDetail, { foreignKey: "roomId", as: "details" });
// RoomDetail.belongsTo(Room, { foreignKey: "roomId", as: "room" });

// module.exports = conn.models;



