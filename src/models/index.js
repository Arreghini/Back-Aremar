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

RoomType.hasMany(Room, { foreignKey: 'roomTypeId' });
Room.belongsTo(RoomType, { foreignKey: 'roomTypeId' });

RoomDetail.hasMany(Room, { foreignKey: 'roomDetailId' });
Room.belongsTo(RoomDetail, { foreignKey: 'roomDetailId' });

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
