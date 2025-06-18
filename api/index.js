import express from 'express';
import cors from 'cors';
import { db } from '../firebaseConfig.js'; // Importamos la conexión a la BD

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde otros orígenes (como la interfaz de ChatGPT)
app.use(express.json()); // Permite al servidor entender JSON

// Ruta de prueba para saber si el servidor funciona
app.get('/api', (req, res) => {
  res.status(200).send('API del Consultor Empresarial funcionando correctamente.');
});


// --- ENDPOINT PARA GUARDAR UN NUEVO EXPERIMENTO ---
app.post('/api/guardarExperimento', async (req, res) => {
  try {
    const {
      id_experimento,
      fecha_inicio,
      responsable,
      nombre_experimento,
      contexto_observaciones,
      hipotesis,
      metrica_principal,
      metricas_secundarias,
      acciones_tareas,
      recursos_necesarios,
      duracion_estimada,
    } = req.body;

    // Validación básica
    if (!nombre_experimento || !hipotesis || !metrica_principal) {
      return res.status(400).json({ error: 'Faltan campos clave del experimento.' });
    }

    const nuevoExperimento = {
      id_experimento,
      fecha_inicio,
      responsable,
      nombre_experimento,
      contexto_observaciones,
      hipotesis,
      metrica_principal,
      metricas_secundarias,
      acciones_tareas,
      recursos_necesarios,
      duracion_estimada,
      fecha_creacion: new Date(), // Añadimos fecha de registro
      estado: 'Definido' // Estado inicial
    };

    const docRef = await db.collection('experimentos').add(nuevoExperimento);

    console.log("Experimento guardado con ID: ", docRef.id);
    res.status(200).json({ status: 'ok', message: 'Experimento guardado exitosamente', id: docRef.id });

  } catch (error) {
    console.error("Error al guardar experimento: ", error);
    res.status(500).json({ error: 'Error interno del servidor al guardar el experimento.' });
  }
});


// --- ENDPOINT PARA GUARDAR LOS RESULTADOS DE UN EXPERIMENTO ---
app.post('/api/guardarResultado', async (req, res) => {
  try {
    const {
      idExperimento, // Este es el ID del DOCUMENTO en Firebase
      resultados_cuantitativos,
      resultados_cualitativos,
      aprendizajes_conclusiones,
      decision_proximos_pasos
    } = req.body;

    if (!idExperimento) {
      return res.status(400).json({ error: 'Falta el ID del experimento a actualizar.' });
    }

    const docRef = db.collection('experimentos').doc(idExperimento);

    await docRef.update({
      resultados_cuantitativos,
      resultados_cualitativos,
      aprendizajes_conclusiones,
      decision_proximos_pasos,
      fecha_actualizacion: new Date(),
      estado: 'Finalizado'
    });
    
    console.log("Resultados actualizados para el experimento: ", idExperimento);
    res.status(200).json({ status: 'ok', message: 'Resultados actualizados correctamente' });

  } catch (error) {
    console.error("Error al actualizar resultados: ", error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar resultados.' });
  }
});

// Exporta la app para que Vercel la pueda usar
export default app;
