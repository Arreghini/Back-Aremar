const { User } = require('../../db')
const bcrypt = require('bcrypt');

const createUserController = async (username, email, password) => {
   try { 
    const user = await User.findOne({ email: email })

    if (user) return { error: 'Email already exists' }

     // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password,10)

    // Crear el nuevo usuario
    const newUser = new User({ username, email, password: hashedPassword })
    await newUser.save()
    return { message: 'User created successfully' }
    }
    catch (error) {
        return { error: error.message }
        }
    };

    module.exports = createUserController;

