import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { findRowById, updateSheetRow, deleteSheetRow } from '@/lib/sheets';
import { APIResponse, Tarea } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Tarea>>
) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ exito: false, error: 'ID inválido' });
  }

  try {
    switch (method) {
      case 'PUT':
        return await updateTarea(req, res, id);
      case 'DELETE':
        return await deleteTarea(req, res, id);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de tarea:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function updateTarea(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Tarea>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Tareas', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Tarea no encontrada'
      });
    }

    const { titulo, descripcion, categoria, estado, prioridad, fechaVencimiento, asignadoA, tags } = req.body;

    const updatedTarea: Tarea = {
      id,
      titulo,
      descripcion,
      categoria,
      estado,
      prioridad,
      fechaVencimiento,
      asignadoA,
      tags,
      creadoPor: req.body.creadoPor,
      fechaCreacion: req.body.fechaCreacion,
    };

    await updateSheetRow('Tareas', rowNumber, [
      id,
      titulo,
      descripcion,
      categoria,
      estado,
      prioridad,
      fechaVencimiento,
      asignadoA,
      tags,
      req.body.creadoPor,
      req.body.fechaCreacion,
    ]);

    return res.status(200).json({
      exito: true,
      data: updatedTarea,
      mensaje: 'Tarea actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando tarea:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al actualizar tarea'
    });
  }
}

async function deleteTarea(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Tarea>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Tareas', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Tarea no encontrada'
      });
    }

    await deleteSheetRow('Tareas', rowNumber);

    return res.status(200).json({
      exito: true,
      mensaje: 'Tarea eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando tarea:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al eliminar tarea'
    });
  }
}

export default requireAuth(handler);
