const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes/index");

// Crear servidor
const server = express();
server.name = "API";

// Middlewares
server.use(cookieParser());
server.use(morgan("dev"));
server.use(cors());
server.use(express.urlencoded({ limit: "20mb", extended: true }));
server.use(express.json({ limit: "20mb" }));

// Rutas
server.use("/", routes);

// Middleware para manejo de errores
server.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
