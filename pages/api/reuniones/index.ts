import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getSheetData, appendSheetData } from '@/lib/sheets';
import { generateID } from '@/lib/utils';
import { APIResponse, Reunion } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Reunion[]>>
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getReuniones(req, res);
      case 'POST':
        return await createReunion(req, res);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de reuniones:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function getReuniones(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Reunion[]>>
) {
  try {
    const data = await getSheetData('Reuniones');
    const reuniones: Reunion[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        reuniones.push({
          id: row[0],
          titulo: row[1],
          descripcion: row[2],
          fechaInicio: row[3],
          fechaFin: row[4],
          ubicacion: row[5],
          asistentes: row[6],
          estado: row[7] as any,
          recordatorio: parseInt(row[8]) || 0,
          creadoPor: row[9],
          fechaCreacion: row[10],
          eventCalendarId: row[11],
        });
      }
    }

    return res.status(200).json({
      exito: true,
      data: reuniones,
      mensaje: `${reuniones.length} reuniones encontradas`
    });
  } catch (error: any) {
    console.error('Error obteniendo reuniones:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener reuniones'
    });
  }
}

async function createReunion(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Reunion>>
) {
  try {
    const { titulo, descripcion, fechaInicio, fechaFin, ubicacion, asistentes, recordatorio } = req.body;
    const user = req.user!;

    if (!titulo || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        exito: false,
        error: 'Título, fecha de inicio y fecha de fin son requeridos'
      });
    }

    const id = generateID();
    const ahora = new Date().toISOString();

    const newReunion: Reunion = {
      id,
      titulo,
      descripcion: descripcion || '',
      fechaInicio,
      fechaFin,
      ubicacion: ubicacion || '',
      asistentes: asistentes || '',
      estado: 'pendiente',
      recordatorio: recordatorio || 30,
      creadoPor: user.id,
      fechaCreacion: ahora,
    };

    await appendSheetData('Reuniones', [
      [
        id,
        titulo,
        descripcion || '',
        fechaInicio,
        fechaFin,
        ubicacion || '',
        asistentes || '',
        'pendiente',
        recordatorio || 30,
        user.id,
        ahora,
        '', // eventCalendarId - can be added later with Calendar API integration
      ]
    ]);

    return res.status(201).json({
      exito: true,
      data: newReunion,
      mensaje: 'Reunión creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando reunión:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al crear reunión'
    });
  }
}

export default requireAuth(handler);
