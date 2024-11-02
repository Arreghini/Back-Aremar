const server = require('./src/app.js');
const conn = require('./src/config/db.js'); 
const { User, Room, RoomDetail, RoomType, Reservation } = require('./src/models'); // Ajusta la ruta si es necesario

async function startServer() {
  try {
    await conn.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Sincronizar todos los modelos de una sola vez
    await conn.sync({ alter: true });
    console.log('Todos los modelos sincronizados con la base de datos.');

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

startServer();
