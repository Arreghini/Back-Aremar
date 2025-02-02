const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userRoutes = require('./routes/UsersRoutes');
const roomRoutes = require('./routes/RoomRoutes');
const reservationRoutes = require('./routes/ReservationRoutes');
const roomTypeRoutes = require('./routes/RoomTypeRoutes');
const roomDetailsRoutes = require('./routes/RoomsDetailsRoutes');
const preferencesRoutes = require('./routes/PaymentRoutes');
const { checkAdmin, jwtCheck } = require('./services/tokenAdministrador');
require('dotenv').config();

const app = express();
app.name = 'API';

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use((req, res, next) => {
  next();
});

// Rutas públicas (no requieren autenticación)
app.get('/public', (req, res) => {
  res.send('Esta es una ruta pública.');
});

// Rutas protegidas por autenticación
app.use('/api/users', jwtCheck, userRoutes); // Protege las rutas de usuarios con autenticación
//app.use('/api/reservations',jwtCheck, reservationRoutes); // Protege las rutas de reservas con autenticación 
app.use('/api/reservations', (req, res, next) => {
  console.log('Nueva solicitud a /api/reservations:', {
    método: req.method,
    ruta: req.path,
    body: req.body
  });
  next();
}, jwtCheck, reservationRoutes);

// Primero las rutas de administración

app.use('/api/rooms/admin/roomType', roomTypeRoutes );
app.use('/api/rooms/admin/roomDetail', roomDetailsRoutes);

// Rutas protegidas para administración (requiere autenticación y rol de admin)
app.use('/api/rooms/admin',jwtCheck, checkAdmin, roomRoutes); // Protege las rutas de administración de habitaciones
app.use('/api/users/admin',jwtCheck,checkAdmin, userRoutes); // Protege las rutas de administración de usuarios
app.use('/api/reservations/admin',jwtCheck, checkAdmin, reservationRoutes); // Protege las rutas de administración de reservas

app.use('/api/rooms', roomRoutes);

// Ruta para crear preferencias de pagos  
app.post('/api', preferencesRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en la solicitud:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Token inválido o no proporcionado' });
  }
  
  return res.status(err.status || 500).json({ message: err.message || 'Ocurrió un error en el servidor' });
});

module.exports = app;
