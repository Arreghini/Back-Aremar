const registerController = require('../../controllers/users/register')

const createRegister = async (req,res) => {
    try {
        const {username, email, password} = req.body;

        if (!username || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios: username, email y password." });
        }

    const register = await registerController(username,email,password)
    res.status(201).json(register)
    }catch(error) {
    res.status(400).json({error: error.message})
    }
}
  
   module.exports = createRegister;
