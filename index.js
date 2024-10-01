
const server = require('./src/app.js'); 
const { conn } = require('./src/config/db.js');

async function startServer() {
  try {
    await conn.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    await conn.sync({ alter: true }); // Sincroniza modelos con la base de datos
    console.log('Modelos sincronizados con la base de datos.');
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

startServer();

