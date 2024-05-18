require('dotenv').config();
const {Sequelize} = require("sequelize")

const fs = require("fs")
const path = require("path")

const {DB_USER, DB_PASSWORD, DB_HOST} = process.env

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/aremar`, {
    logging: false,
    native: false,
    dialect: "postgres",
    });

const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Incluyo la conexión de Sequelize a cada modelo
modelDefiners.forEach(model => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

//Destructuring de los modelos
const {
    guestProfile,
    reservations,
    rooms,
    roomsDetails,
    roomsType,
    users,
} = sequelize.models
    
// Relaciones
users.hasOne(guestProfile,{ foreignKey: "userId"});
guestProfile.belongsTo(users,{foreignKey:"userId"});

module.exports = {
   ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
   conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
 };




// // Relaciones
// users.hasOne(guest_profile, { foreignKey: "user_id", onDelete: "CASCADE" });
// guest_profile.belongsTo(users, { foreignKey: "user_id" });

// reservations.belongsTo(rooms, { foreignKey: "room_id" });
// rooms.hasMany(reservations, { foreignKey: "room_id" });

// users.hasMany(reservations, { foreignKey: "user_id" });
// reservations.belongsTo(users, { foreignKey: "user_id" });

// rooms.hasOne(room_details, { foreignKey: "room_id" });
// room_details.belongsTo(rooms, { foreignKey: "room_id" });

// room_types.hasMany(rooms, { foreignKey: "type_id" });
// rooms.belongsTo(room_types, { foreignKey: "type_id" });

// //RELACIONES RESERVA SPA

// users.hasMany(spa_reservations, { foreignKey: "user_id" });
// spa_reservations.belongsTo(users, { foreignKey: "user_id" });

// spa_reservations.belongsTo(room_spa, { foreignKey: "spa_room_id" });
// room_spa.hasMany(spa_reservations, { foreignKey: "spa_room_id" });

// //RELACION RESERVA CARS

// users.hasMany(car_reservations, { foreignKey: "user_id" });
// car_reservations.belongsTo(users, { foreignKey: "user_id" });

// car_reservations.belongsTo(car_details, { foreignKey: "car_id" });
// car_details.hasMany(car_reservations, { foreignKey: "car_id" });

// // RESERVA RESTAURANT

// users.hasMany(restaurant_reserv, { foreignKey: "user_id" });
// restaurant_reserv.belongsTo(users, { foreignKey: "user_id" });

// //All reservations

// user_reservations.belongsTo(rooms, {
//   foreignKey: "room_id",
// });
// rooms.hasOne(user_reservations, { foreignKey: "room_id" });

// user_reservations.belongsTo(room_spa, {
//   foreignKey: "spa_id",
// });
// room_spa.hasOne(user_reservations, {
//   foreignKey: "spa_id",
// });

// users.hasMany(user_reservations, { foreignKey: "user_id" });
// user_reservations.belongsTo(users, { foreignKey: "user_id" });

// user_reservations.belongsTo(restaurant_reserv, {
//   foreignKey: "restaurant_reservation_id",
// });
// restaurant_reserv.hasMany(user_reservations, {
//   foreignKey: "restaurant_reservation_id",
// });

// user_reservations.belongsTo(car_details, {
//   foreignKey: "car_id",
// });
// car_details.hasMany(user_reservations, {
//   foreignKey: "car_id",
// });

// module.exports = {
//   ...sequelize.models,
//   connect: sequelize,
// };