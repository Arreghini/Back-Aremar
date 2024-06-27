const crypto = require('crypto');

// Generar una clave secreta de 256 bits (32 bytes) en formato hexadecimal
const secret = crypto.randomBytes(32).toString('hex');

console.log(`Generated JWT Secret: ${secret}`);
