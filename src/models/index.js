const fs = require('fs');
const path = require('path');
const conn = require('../config/db');
const basename = path.basename(__filename);
const modelDefiners = [];

// Leer todos los archivos en el directorio de modelos
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, file)));
  });

// Definir los modelos con la conexión de Sequelize
modelDefiners.forEach((modelDefiner) => modelDefiner(conn));

// Capitalizar nombres de modelos
let entries = Object.entries(conn.models);
let capsEntries = entries.map(([name, model]) => [
  name[0].toUpperCase() + name.slice(1),
  model,
]);
conn.models = Object.fromEntries(capsEntries);

// Relaciones entre modelos
const { User, Room, RoomType, RoomDetail, Reservation, Refund } = conn.models;

// ✅ CORREGIDO - Asociaciones RoomType
RoomType.hasMany(Room, { foreignKey: 'roomTypeId', as: 'rooms' });
Room.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });

// ✅ CORREGIDO - Asociaciones RoomDetail (cambiar roomDetailId por detailRoomId)
RoomDetail.hasMany(Room, { foreignKey: 'detailRoomId', as: 'rooms' });
Room.belongsTo(RoomDetail, { foreignKey: 'detailRoomId', as: 'roomDetail' });

// ✅ Asociaciones Room-Reservation
Room.hasMany(Reservation, {
  foreignKey: 'roomId',
  sourceKey: 'id',
  as: 'reservations',
});
Reservation.belongsTo(Room, {
  foreignKey: 'roomId',
  targetKey: 'id',
  as: 'room',
});

// ✅ Asociaciones User-Reservation
Reservation.belongsTo(User, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'user',
});
User.hasMany(Reservation, {
  foreignKey: 'userId',
  sourceKey: 'id',
  as: 'reservations',
});

// ✅ Asociaciones Reservation-Refund
Reservation.belongsTo(Refund, {
  foreignKey: 'refundId',
  sourceKey: 'id',
  as: 'refund',
});
Refund.hasMany(Reservation, {
  foreignKey: 'refundId',
  sourceKey: 'id',
  as: 'reservations',
});

// Confirmación de modelos cargados
console.log('Modelos cargados:', Object.keys(conn.models));

module.exports = {
  conn,
  ...conn.models,
};
