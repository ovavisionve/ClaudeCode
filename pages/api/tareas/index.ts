import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getSheetData, appendSheetData } from '@/lib/sheets';
import { generateID } from '@/lib/utils';
import { APIResponse, Tarea } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Tarea[]>>
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getTareas(req, res);
      case 'POST':
        return await createTarea(req, res);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de tareas:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function getTareas(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Tarea[]>>
) {
  try {
    const data = await getSheetData('Tareas');
    const tareas: Tarea[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        tareas.push({
          id: row[0],
          titulo: row[1],
          descripcion: row[2],
          categoria: row[3],
          estado: row[4] as any,
          prioridad: row[5] as any,
          fechaVencimiento: row[6],
          asignadoA: row[7],
          tags: row[8],
          creadoPor: row[9],
          fechaCreacion: row[10],
        });
      }
    }

    return res.status(200).json({
      exito: true,
      data: tareas,
      mensaje: `${tareas.length} tareas encontradas`
    });
  } catch (error: any) {
    console.error('Error obteniendo tareas:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener tareas'
    });
  }
}

async function createTarea(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Tarea>>
) {
  try {
    const { titulo, descripcion, categoria, prioridad, fechaVencimiento, asignadoA, tags } = req.body;
    const user = req.user!;

    if (!titulo) {
      return res.status(400).json({
        exito: false,
        error: 'El título es requerido'
      });
    }

    const id = generateID();
    const ahora = new Date().toISOString();

    const newTarea: Tarea = {
      id,
      titulo,
      descripcion: descripcion || '',
      categoria: categoria || 'General',
      estado: 'por_hacer',
      prioridad: prioridad || 'media',
      fechaVencimiento: fechaVencimiento || '',
      asignadoA: asignadoA || user.id,
      tags: tags || '',
      creadoPor: user.id,
      fechaCreacion: ahora,
    };

    await appendSheetData('Tareas', [
      [
        id,
        titulo,
        descripcion || '',
        categoria || 'General',
        'por_hacer',
        prioridad || 'media',
        fechaVencimiento || '',
        asignadoA || user.id,
        tags || '',
        user.id,
        ahora,
      ]
    ]);

    return res.status(201).json({
      exito: true,
      data: newTarea,
      mensaje: 'Tarea creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando tarea:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al crear tarea'
    });
  }
}

export default requireAuth(handler);
