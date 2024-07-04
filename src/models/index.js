const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

const basename = path.basename(__filename);
const modelDefiners = [];

// Leer todos los archivos en el directorio de modelos y agregarlos a modelDefiners
fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    modelDefiners.push(require(path.join(__dirname, file)));
  });

// Incluir la conexión de Sequelize a cada modelo
modelDefiners.forEach(model => model(sequelize));

// Capitalizar nombres de modelos
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map(entry => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// Relaciones
const {
  Reservation,
  Room,
  RoomDetail,
  RoomType,
  User,
} = sequelize.models;

User.hasMany(Reservation, { foreignKey: "userId" });
Reservation.belongsTo(User, { foreignKey: "userId" });

Room.hasMany(Reservation, { foreignKey: "roomId" });
Reservation.belongsTo(Room, { foreignKey: "roomId" });

RoomType.hasMany(Room, { foreignKey: "roomTypeId" });
Room.belongsTo(RoomType, { foreignKey: "roomTypeId" });

Room.hasOne(RoomDetail, { foreignKey: "roomId" });
RoomDetail.belongsTo(Room, { foreignKey: "roomId" });

module.exports = sequelize;
