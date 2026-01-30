import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { findRowById, updateSheetRow, deleteSheetRow } from '@/lib/sheets';
import { APIResponse, Reunion } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Reunion>>
) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ exito: false, error: 'ID inválido' });
  }

  try {
    switch (method) {
      case 'PUT':
        return await updateReunion(req, res, id);
      case 'DELETE':
        return await deleteReunion(req, res, id);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de reunión:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function updateReunion(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Reunion>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Reuniones', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Reunión no encontrada'
      });
    }

    const { titulo, descripcion, fechaInicio, fechaFin, ubicacion, asistentes, estado, recordatorio } = req.body;

    const updatedReunion: Reunion = {
      id,
      titulo,
      descripcion,
      fechaInicio,
      fechaFin,
      ubicacion,
      asistentes,
      estado,
      recordatorio,
      creadoPor: req.body.creadoPor,
      fechaCreacion: req.body.fechaCreacion,
      eventCalendarId: req.body.eventCalendarId,
    };

    await updateSheetRow('Reuniones', rowNumber, [
      id,
      titulo,
      descripcion,
      fechaInicio,
      fechaFin,
      ubicacion,
      asistentes,
      estado,
      recordatorio,
      req.body.creadoPor,
      req.body.fechaCreacion,
      req.body.eventCalendarId || '',
    ]);

    return res.status(200).json({
      exito: true,
      data: updatedReunion,
      mensaje: 'Reunión actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando reunión:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al actualizar reunión'
    });
  }
}

async function deleteReunion(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Reunion>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Reuniones', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Reunión no encontrada'
      });
    }

    await deleteSheetRow('Reuniones', rowNumber);

    return res.status(200).json({
      exito: true,
      mensaje: 'Reunión eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando reunión:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al eliminar reunión'
    });
  }
}

export default requireAuth(handler);
