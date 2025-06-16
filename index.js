import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVRp05Jn4GDTuUk8nVM5-PkL4lX1IdCteDSwNlW3hK2EAmc01His2Gb9dwJwE5C7Yd/exec';

app.post('/guardarConversacion', async (req, res) => {
  const { pregunta, respuesta } = req.body;

  try {
    const gResponse = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta, respuesta }),
    });

    const data = await gResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy listening on port ${PORT}`);
});
