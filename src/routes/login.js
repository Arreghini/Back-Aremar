const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const authResponse = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE,
      grant_type: 'password',
      username,
      password,
    });

    const { access_token } = authResponse.data;

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 3600000,
    }).send('Login successful');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(401).send('Unauthorized');
  }
});

module.exports = router;
