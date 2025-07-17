const dotenv = require('dotenv');

// Función para cargar variables de entorno desde .env
function loadEnv() {
  const result = dotenv.config();

  if (result && result.parsed) {
    for (const key in result.parsed) {
      if (!process.env[key] && result.parsed[key] !== '') {
        process.env[key] = result.parsed[key];
      }
    }
  }
}

// Ejecutar antes de usar variables de entorno
loadEnv();

const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Ahora las variables ya están disponibles
const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE } = process.env;

// Configurar cliente JWKS
const client = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
});

// Obtener la clave pública del token
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verificar el token y extraer el payload
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: AUTH0_AUDIENCE,
        issuer: `https://${AUTH0_DOMAIN}/`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
};

// Obtener token del Management API
const getManagementApiToken = async () => {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error al obtener token del Management API:', error);
    throw new Error('Error al obtener token del Management API');
  }
};

// Verificar si un usuario tiene rol de admin
const checkUserRole = async (user_id, token) => {
  try {
    const rolesResponse = await axios.get(
      `https://${AUTH0_DOMAIN}/api/v2/users/${user_id}/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const roles = rolesResponse.data.map((role) => role.name);
    return roles.includes('admin');
  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    throw new Error('Error al obtener roles del usuario');
  }
};

// Middleware para verificar JWT
const jwtCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const token = authHeader.slice(7); // Remover "Bearer "
    const decoded = await verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar si el usuario es admin
const checkAdmin = async (req, res, next) => {
  try {
    const managementToken = await getManagementApiToken();
    const isAdmin = await checkUserRole(req.user.sub, managementToken);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar rol de admin:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  loadEnv,
  getManagementApiToken,
  checkUserRole,
  verifyToken,
  jwtCheck,
  checkAdmin,
};
