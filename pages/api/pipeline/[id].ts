import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { findRowById, updateSheetRow, deleteSheetRow } from '@/lib/sheets';
import { APIResponse, Pipeline } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Pipeline>>
) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ exito: false, error: 'ID inválido' });
  }

  try {
    switch (method) {
      case 'PUT':
        return await updateOportunidad(req, res, id);
      case 'DELETE':
        return await deleteOportunidad(req, res, id);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de oportunidad:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function updateOportunidad(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Pipeline>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Pipeline', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Oportunidad no encontrada'
      });
    }

    const { nombre, empresa, contactoId, valor, etapa, probabilidad, fechaCierre, descripcion, asignadoA, origen } = req.body;

    const updatedOportunidad: Pipeline = {
      id,
      nombre,
      empresa,
      contactoId,
      valor: parseFloat(valor),
      etapa,
      probabilidad: parseInt(probabilidad),
      fechaCierre,
      descripcion,
      asignadoA,
      origen,
      fechaCreacion: req.body.fechaCreacion,
    };

    await updateSheetRow('Pipeline', rowNumber, [
      id,
      nombre,
      empresa,
      contactoId,
      parseFloat(valor),
      etapa,
      parseInt(probabilidad),
      fechaCierre,
      descripcion,
      asignadoA,
      origen,
      req.body.fechaCreacion,
    ]);

    return res.status(200).json({
      exito: true,
      data: updatedOportunidad,
      mensaje: 'Oportunidad actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando oportunidad:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al actualizar oportunidad'
    });
  }
}

async function deleteOportunidad(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Pipeline>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Pipeline', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Oportunidad no encontrada'
      });
    }

    await deleteSheetRow('Pipeline', rowNumber);

    return res.status(200).json({
      exito: true,
      mensaje: 'Oportunidad eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando oportunidad:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al eliminar oportunidad'
    });
  }
}

export default requireAuth(handler);
