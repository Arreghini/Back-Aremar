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
    Reservation,
    Room,
    RoomDetail,
    RoomType,
    User,
} = sequelize.models;

// Relaciones

User.hasMany(Reservation, { foreignKey: "userId" });
Reservation.belongsTo(User, { foreignKey: "userId" });

Room.hasMany(Reservation, { foreignKey: "roomId" });
Reservation.belongsTo(Room, { foreignKey: "roomId" });

RoomType.hasMany(Room, { foreignKey: "roomTypeId" });
Room.belongsTo(RoomType, { foreignKey: "roomTypeId" });

Room.hasOne(RoomDetail, { foreignKey: "roomId" });
RoomDetail.belongsTo(Room, { foreignKey: "roomId" });


// Exportar modelos y conexión
module.exports = {
    ...sequelize.models,
    conn: sequelize,
};
