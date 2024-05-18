const server = require('./src/app.js');
const { conn } = require('./db.js');
const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor y conectar a la base de datos
async function startServer() {
  try {
    await conn.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar los modelos con la base de datos
    await conn.sync();
    console.log('Modelos sincronizados con la base de datos.');
    
    server.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

// Iniciar el servidor
startServer();
