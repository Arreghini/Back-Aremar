// proxy.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/v1/chat/completions', async (req, res) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await groqResponse.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el proxy' });
  }
});

app.listen(3001, () => console.log('Proxy corriendo en puerto 3001'));
