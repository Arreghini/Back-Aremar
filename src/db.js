require('dotenv').config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;

// Crear instancia de Sequelize
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/aremar`, {
    logging: false,
    native: false,
    dialect: "postgres",
});

const basename = path.basename(__filename);
const modelDefiners = [];

// Leer todos los archivos en el directorio de modelos y agregarlos a modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Incluir la conexión de Sequelize a cada modelo
modelDefiners.forEach(model => model(sequelize));

// Capitalizar nombres de modelos
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map(entry => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// Destructuración de los modelos
const {
    GuestProfile,
    Reservations,
    Rooms,
    RoomDetails,
    RoomTypes,
    Users,
} = sequelize.models;

// Relaciones
Users.hasOne(GuestProfile, { foreignKey: "userId" });
GuestProfile.belongsTo(Users, { foreignKey: "userId" });

Users.hasMany(Reservations, { foreignKey: "userId" });
Reservations.belongsTo(Users, { foreignKey: "userId" });

Rooms.hasMany(Reservations, { foreignKey: "roomId" });
Reservations.belongsTo(Rooms, { foreignKey: "roomId" });

RoomTypes.hasMany(Rooms, { foreignKey: "roomTypeId" });
Rooms.belongsTo(RoomTypes, { foreignKey: "roomTypeId" });

Rooms.hasOne(RoomDetails, { foreignKey: "roomId" });
RoomDetails.belongsTo(Rooms, { foreignKey: "roomId" });

// Exportar modelos y conexión
module.exports = {
    ...sequelize.models,
    conn: sequelize,
};
