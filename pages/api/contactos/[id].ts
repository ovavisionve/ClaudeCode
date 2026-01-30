import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { findRowById, updateSheetRow, deleteSheetRow } from '@/lib/sheets';
import { APIResponse, Contacto } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Contacto>>
) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ exito: false, error: 'ID inválido' });
  }

  try {
    switch (method) {
      case 'PUT':
        return await updateContacto(req, res, id);
      case 'DELETE':
        return await deleteContacto(req, res, id);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de contacto:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function updateContacto(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Contacto>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Contactos', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Contacto no encontrado'
      });
    }

    const { nombre, apellido, email, telefono, empresa, cargo, tipo, etapa, notas } = req.body;

    const updatedContacto: Contacto = {
      id,
      nombre,
      apellido,
      email,
      telefono,
      empresa,
      cargo,
      tipo,
      etapa,
      ultimoContacto: new Date().toISOString(),
      notas,
      creadoPor: req.body.creadoPor,
      fechaCreacion: req.body.fechaCreacion,
    };

    await updateSheetRow('Contactos', rowNumber, [
      id,
      nombre,
      apellido,
      email,
      telefono,
      empresa,
      cargo,
      tipo,
      etapa,
      new Date().toISOString(),
      notas,
      req.body.creadoPor,
      req.body.fechaCreacion,
    ]);

    return res.status(200).json({
      exito: true,
      data: updatedContacto,
      mensaje: 'Contacto actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando contacto:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al actualizar contacto'
    });
  }
}

async function deleteContacto(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Contacto>>,
  id: string
) {
  try {
    const rowNumber = await findRowById('Contactos', id);

    if (!rowNumber) {
      return res.status(404).json({
        exito: false,
        error: 'Contacto no encontrado'
      });
    }

    await deleteSheetRow('Contactos', rowNumber);

    return res.status(200).json({
      exito: true,
      mensaje: 'Contacto eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando contacto:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al eliminar contacto'
    });
  }
}

export default requireAuth(handler);
