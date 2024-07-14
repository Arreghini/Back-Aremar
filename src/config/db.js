
require('dotenv').config();
const { Sequelize } = require('sequelize');

const conn = new Sequelize(
  process.env.DB_NAME,       
  process.env.DB_USER,       
  process.env.DB_PASSWORD,   
  {
    host: process.env.DB_HOST,    
    dialect: 'postgres',          
    logging: false,               // Puedes habilitarlo para ver las consultas SQL en la consola
  }
);

module.exports = { conn };
