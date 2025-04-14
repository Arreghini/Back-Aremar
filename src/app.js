const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const adminReservationRoutes = require('./routes/AdminReservationRoutes');
const adminRoomRoutes = require('./routes/AdminRoomRoutes');
const adminUserRoutes = require('./routes/AdminUserRoutes');
const adminRoomTypeRoutes = require('./routes/AdminRoomTypeRoutes');
const adminRoomDetailsRoutes = require('./routes/AdminRoomDetailsRoutes');
const helmet = require('helmet'); // Para gestionar la CSPs
const userRoutes = require('./routes/UsersRoutes');
const roomRoutes = require('./routes/RoomRoutes');
const reservationRoutes = require('./routes/ReservationRoutes');
const paymentRedirectRoutes = require('./routes/PaymentRedirectRoutes');
const webhookHandler = require('./handlers/reservation/webhookHandler');
const { checkAdmin, jwtCheck } = require('./services/tokenAdministrador');
const createPreferenceHandler = require('./handlers/reservation/createPreferenceHandler');
require('dotenv').config();

const app = express();
app.name = 'API';

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
// Middlewares básicos
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
// Configuración de la Content Security Policy (CSP) con helmet
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://www.gstatic.com",
        "https://www.google.com",
        "https://www.recaptcha.net",
        "https://*.gstatic.com",
        "https://*.google.com",
        "https://*.recaptcha.net",
        "https://*.mercadopago.com",
        "https://*.mercadopago.com.ar",
        "https://*.mercadopago.com.br",
        "https://*.mercadopago.com.co",
        "https://*.mercadopago.com.mx",
        "https://*.mercadopago.com.pe",
        "https://*.mercadopago.com.uy",
        "https://*.mercadopago.com.ve",
        "https://*.hotjar.com",
        "https://*.newrelic.com",
        "https://js-agent.newrelic.com",
        "https://http2.mlstatic.com",
        "https://static.hotjar.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: [
        "'self'",
        "https://www.google.com",
        "https://recaptcha.google.com",
        "https://www.recaptcha.net",
        "https://*.mercadopago.com",
        "https://*.mercadopago.com.ar"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    }
  }
}));

// Rutas públicas
app.get('/public', (req, res) => {
  res.send('Esta es una ruta pública.');
});

// Ruta pública para webhooks
app.post('/api/webhooks/mercadopago', express.json(), webhookHandler());

// Ruta pública para redirección de pagos
app.use('/api/payment', paymentRedirectRoutes);

// Aplicar jwtCheck globalmente para todas las rutas API protegidas
app.use('/api', jwtCheck);

// Mantener las rutas administrativas originales
app.use('/api/reservations/admin', checkAdmin, adminReservationRoutes);
app.use('/api/rooms/admin/roomType', checkAdmin, adminRoomTypeRoutes);
app.use('/api/rooms/admin/roomDetail', checkAdmin, adminRoomDetailsRoutes);
app.use('/api/rooms/admin', checkAdmin, adminRoomRoutes);
app.use('/api/users/admin', checkAdmin, adminUserRoutes);

// Rutas regulares protegidas
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reservations/:reservationId/payment', createPreferenceHandler);
app.use('/api/payment', paymentRedirectRoutes);

// Manejo de errores y rutas no encontradas (mantener igual)
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error en la solicitud:', err);
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Token inválido o no proporcionado' });
  }
  return res.status(err.status || 500).json({ message: err.message || 'Ocurrió un error en el servidor' });
});

module.exports = app;