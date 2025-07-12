const checkAdminHandler = (req, res) => {
  const user = req.user; // Información del usuario decodificado del token JWT

  if (user && user['http://aremar/roles']?.includes('admin')) {
    res.json({ isAdmin: true });
  } else {
    res.json({ isAdmin: false });
  }
};

module.exports = checkAdminHandler;
