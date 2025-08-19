const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Demasiadas solicitudes, intenta más tarde",
});

// Configuración DB
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "aremar",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Endpoint streaming con contexto DB
app.post("/v1/chat/completions", limiter, async (req, res) => {
  try {
    const { messages } = req.body;

    // 1️⃣ Traer info de Rooms desde la DB (tabla "Room")
   const result = await pool.query(`
  SELECT id, description, "roomTypeId", "detailRoomId", "photoRoom", price, status
  FROM "Rooms"
`);
    const rooms = result.rows;

    // 2️⃣ Convertirlo en texto para el contexto
    const roomsContext = rooms
      .map(r =>
        `ID: ${r.id}, Nombre: ${r.name}, Tipo: ${r.type}, Camas: ${r.beds}, ` +
        `Capacidad: ${r.capacity}, Precio: $${r.price}/noche, ` +
        `Estado: ${r.available ? "Disponible" : "No disponible"}, ` +
        `Descripción: ${r.description}`
      )
      .join("\n");

    // 3️⃣ Armar el prompt con contexto + mensajes del usuario
    const systemPrompt = `
Eres un asistente que SOLO puede responder sobre las habitaciones del complejo Aremar.
Estas son las habitaciones disponibles en la base de datos:

${roomsContext}

Si la pregunta no tiene relación con estas habitaciones, responde: 
"Solo puedo responder sobre las habitaciones del complejo Aremar."
    `;

    const body = {
      model: "llama-3.1-8b-instant",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
    };

    // 4️⃣ Llamar a la API de Groq
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!groqResponse.ok) {
      const text = await groqResponse.text();
      console.error("❌ Error Groq:", text);
      return res.status(500).json({ error: "Error al conectar con Groq", detail: text });
    }

    // 5️⃣ Enviar streaming SSE al frontend
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    groqResponse.body.on("data", chunk => res.write(chunk));
    groqResponse.body.on("end", () => res.end());
    groqResponse.body.on("error", err => {
      console.error("❌ Error en streaming:", err);
      res.end();
    });

  } catch (error) {
    console.error("❌ Error proxy:", error);
    res.status(500).json({ error: "Error en el proxy", detail: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Proxy Groq con DB corriendo en puerto ${PORT} (streaming)`);
});
