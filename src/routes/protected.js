const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    req.user = decoded;
    next();
  });
}

router.get('/protected', verifyToken, (req, res) => {
  res.send('Protected data');
});

module.exports = router;
