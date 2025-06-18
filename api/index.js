import express from 'express';
import cors from 'cors';
import { db } from '../firebaseConfig.js'; // Importamos la conexión a la BD

const app = express();

// Middlewares para permitir peticiones externas y entender JSON
app.use(cors());
app.use(express.json());

// --- 1. ENDPOINT PARA BUSCAR EXPERIMENTOS POR NOMBRE DE EMPRESA ---
app.post('/api/buscarExperimentos', async (req, res) => {
  try {
    const { nombreEmpresa } = req.body;

    if (!nombreEmpresa) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido.' });
    }
    
    const experimentosRef = db.collection('experimentos');
    const snapshot = await experimentosRef.where('empresa', '==', nombreEmpresa).get();

    if (snapshot.empty) {
      return res.status(200).json({ experimentos: [] });
    }

    const listaExperimentos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      listaExperimentos.push({
        id: doc.id,
        nombre_experimento: data.nombre_experimento,
        hipotesis: data.hipotesis,
        aprendizajes_conclusiones: data.aprendizajes_conclusiones || 'N/A'
      });
    });

    res.status(200).json({ experimentos: listaExperimentos });

  } catch (error) {
    console.error("Error al buscar experimentos: ", error);
    res.status(500).json({ error: 'Error interno del servidor al buscar.' });
  }
});

app.post('/api/guardarExperimento', async (req, res) => {
  try {
    const data = req.body;

    // Validación de los campos más críticos
    if (!data.empresa || !data.nombre_experimento || !data.hipotesis) {
      return res.status(400).json({ error: 'Faltan campos clave como empresa, nombre o hipótesis.' });
    }

    // LÓGICA DE RESPALDO MEJORADA: Asignamos valores por defecto a CUALQUIER campo que pueda faltar.
    const nuevoExperimento = {
      empresa: data.empresa,
      id_experimento: data.id_experimento || `MEXP-${Date.now()}`,
      fecha_inicio: data.fecha_inicio || new Date().toISOString().split('T')[0], // Fecha de hoy si no se especifica
      responsable: data.responsable || 'Equipo a cargo', // Valor por defecto
      nombre_experimento: data.nombre_experimento,
      contexto_observaciones: data.contexto_observaciones || 'No especificado.', // Valor por defecto
      hipotesis: data.hipotesis,
      metrica_principal: data.metrica_principal,
      metricas_secundarias: data.metricas_secundarias || 'No especificadas.', // Valor por defecto
      acciones_tareas: data.acciones_tareas || 'No especificadas.', // Valor por defecto
      recursos_necesarios: data.recursos_necesarios || 'No especificados.', // Valor por defecto
      duracion_estimada: data.duracion_estimada || 'No especificada.', // Valor por defecto
      fecha_creacion: new Date(),
      estado: 'Definido'
    };

    const docRef = await db.collection('experimentos').add(nuevoExperimento);
    console.log("Experimento guardado con ID: ", docRef.id);
    res.status(200).json({ status: 'ok', message: 'Experimento guardado exitosamente', id: docRef.id });

  } catch (error) {
    console.error("Error al guardar experimento: ", error);
    res.status(500).json({ 
        error: 'Error interno del servidor al guardar el experimento.',
        detalle: error.message 
    });
  }
});

// --- 3. ENDPOINT PARA GUARDAR LOS RESULTADOS DE UN EXPERIMENTO ---
app.post('/api/guardarResultado', async (req, res) => {
  try {
    const { idExperimento, resultado_obtenido, aprendizajes, documentacion } = req.body;

    if (!idExperimento || !resultado_obtenido || !aprendizajes) {
      return res.status(400).json({ error: 'Falta el ID, el resultado o los aprendizajes.' });
    }

    const docRef = db.collection('experimentos').doc(idExperimento);
    await docRef.update({
      resultado_obtenido,
      aprendizajes,
      documentacion: documentacion || 'N/A',
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

// --- 4. ENDPOINT PARA GUARDAR CADA TURNO DE LA CONVERSACIÓN ---
app.post('/api/guardarTurno', async (req, res) => {
  try {
    const { id_experimento_asociado, pregunta_usuario, respuesta_gpt } = req.body;

    if (!pregunta_usuario && !respuesta_gpt) {
      return res.status(400).json({ error: 'La pregunta o la respuesta no pueden estar vacías.' });
    }

    const nuevoTurno = {
      id_experimento_asociado: id_experimento_asociado || 'sin-asignar',
      pregunta_usuario: pregunta_usuario || '',
      respuesta_gpt: respuesta_gpt || '',
      fecha: new Date()
    };
    
    const docRef = await db.collection('conversaciones').add(nuevoTurno);
    console.log("Turno de conversación guardado con ID: ", docRef.id);
    res.status(200).json({ status: 'ok', message: 'Turno guardado.' });

  } catch (error) {
    console.error("Error al guardar turno: ", error);
    res.status(500).json({ error: 'Error interno del servidor al guardar turno.' });
  }
});

// --- 5. ENDPOINT PARA GUARDAR UN HISTORIAL COMPLETO DE CONVERSACIÓN ---
app.post('/api/guardarHistorial', async (req, res) => {
  try {
    const { titulo, historialEstructurado } = req.body;

    if (!titulo || !historialEstructurado) {
      return res.status(400).json({ error: 'Falta el título o el contenido del historial.' });
    }

    const nuevoHistorial = {
      titulo,
      conversacion: historialEstructurado,
      fechaGuardado: new Date()
    };
    
    const docRef = await db.collection('historiales').add(nuevoHistorial);
    console.log("Historial estructurado guardado con ID: ", docRef.id);
    res.status(200).json({ status: 'ok', message: `Historial guardado con el título: "${titulo}"` });

  } catch (error) {
    console.error("Error al guardar el historial estructurado: ", error);
    res.status(500).json({ error: 'Error interno del servidor al guardar el historial.' });
  }
});


// Exporta la app para que Vercel la pueda usar
export default app;
