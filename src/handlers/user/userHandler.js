const userController = require('../../controllers/user/userController');

const handleSaveUser = async (req, res) => {
  console.log('handleSaveUser iniciado');
  try {
    console.log('Request Body:', req.body);
    console.log('req.auth:', req.auth);

    if (!req.auth) {
      console.log('Usuario no autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

   // Extraer el ID del usuario desde req.auth
   const user_id = req.auth.payload.sub || req.body.user_id;

   const userData = {
     user_id,
     authorization: req.headers.authorization,
   };

   console.log('Llamando a userController.saveUser con userData:', userData);
   const savedUser = await userController.saveUser(userData);
   console.log('Usuario guardado:', savedUser);
   res.json(savedUser);
 } catch (error) {
   console.error('Error en handleSaveUser:', error);
   res.status(500).send('Error al manejar la solicitud');
 }
};


module.exports =  handleSaveUser ;
