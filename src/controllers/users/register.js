const { User } = require('../../db');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const registerController = async (username, email, password) => {
  try {
    // Verificar si el usuario ya existe
    const registerExistent = await User.findOne({
      where: { email }
    });

    if (registerExistent) {
      throw new Error('Email already exists');
    }

    // Hashear el password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await User.create({ 
      username, 
      email, 
      password: hashedPassword 
    });

    // Generar token de verificación
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar correo de verificación
    const msg = {
      to: email,
      from: 'your_verified_email@example.com', // Usa un email verificado en SendGrid
      subject: 'Email Verification',
      text: `Hello ${username}, please verify your email by clicking the following link: ${process.env.FRONTEND_URL}/verify-email?token=${token}`,
      html: `<p>Hello ${username},</p><p>Please verify your email by clicking the following link:</p><p><a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify Email</a></p>`
    };

    await sgMail.send(msg);

    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = registerController;
