import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getSheetData, appendSheetData } from '@/lib/sheets';
import { generateID } from '@/lib/utils';
import { APIResponse, MensajeChat } from '@/types';
import axios from 'axios';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<{ respuesta: string }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ exito: false, error: 'Método no permitido' });
  }

  try {
    const { mensaje, conversacionId } = req.body;
    const user = req.user!;

    if (!mensaje) {
      return res.status(400).json({
        exito: false,
        error: 'El mensaje es requerido'
      });
    }

    // Get or create conversación
    let convId = conversacionId;
    if (!convId) {
      convId = generateID();
      await appendSheetData('Conversaciones', [
        [convId, user.id, 'Nueva conversación', new Date().toISOString(), new Date().toISOString()]
      ]);
    }

    // Get conversation history
    const promptsData = await getSheetData('Prompts');
    let systemPrompt = 'Eres un asistente virtual de CRM que ayuda a gestionar clientes, reuniones, tareas y ventas.';

    if (promptsData.length > 1) {
      systemPrompt = promptsData[1][1] || systemPrompt;
    }

    // Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(500).json({
        exito: false,
        error: 'API Key de Groq no configurada'
      });
    }

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: mensaje }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const respuesta = groqResponse.data.choices[0]?.message?.content || 'No se pudo generar una respuesta';

    // Save messages to sheet
    const ahora = new Date().toISOString();

    // Save user message
    await appendSheetData('Conversaciones', [
      [convId, user.id, mensaje, 'user', ahora]
    ]);

    // Save assistant response
    await appendSheetData('Conversaciones', [
      [convId, user.id, respuesta, 'assistant', ahora]
    ]);

    return res.status(200).json({
      exito: true,
      data: { respuesta },
      mensaje: 'Respuesta generada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en Chat IA:', error);

    if (error.response) {
      console.error('Groq API Error:', error.response.data);
    }

    return res.status(500).json({
      exito: false,
      error: 'Error al procesar el mensaje: ' + (error.message || 'Error desconocido')
    });
  }
}

export default requireAuth(handler);
