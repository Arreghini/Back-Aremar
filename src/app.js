const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const loginRoutes = require('./routes/login');
const protectedRoutes = require('./routes/protected');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/', loginRoutes);
app.use('/', protectedRoutes);

module.exports = app;
