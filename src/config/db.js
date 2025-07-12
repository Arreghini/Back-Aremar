require('dotenv').config();
const { Sequelize } = require('sequelize');

const conn = new Sequelize(
  process.env.DB_NAME, // Nombre de la base de datos
  process.env.DB_USER, // Usuario de la base de datos
  process.env.DB_PASSWORD, // Contraseña de la base de datos
  {
    host: process.env.DB_HOST, // Host (generalmente localhost)
    dialect: 'postgres', // Dialecto, en este caso Postgres
    logging: false, // Desactiva el registro de Sequelize para menos ruido en la consola
  }
);

module.exports = conn;
