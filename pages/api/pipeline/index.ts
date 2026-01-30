import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getSheetData, appendSheetData } from '@/lib/sheets';
import { generateID } from '@/lib/utils';
import { APIResponse, Pipeline } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Pipeline[]>>
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getPipeline(req, res);
      case 'POST':
        return await createOportunidad(req, res);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de pipeline:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function getPipeline(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Pipeline[]>>
) {
  try {
    const data = await getSheetData('Pipeline');
    const pipeline: Pipeline[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        pipeline.push({
          id: row[0],
          nombre: row[1],
          empresa: row[2],
          contactoId: row[3],
          valor: parseFloat(row[4]) || 0,
          etapa: row[5] as any,
          probabilidad: parseInt(row[6]) || 0,
          fechaCierre: row[7],
          descripcion: row[8],
          asignadoA: row[9],
          origen: row[10],
          fechaCreacion: row[11],
        });
      }
    }

    return res.status(200).json({
      exito: true,
      data: pipeline,
      mensaje: `${pipeline.length} oportunidades encontradas`
    });
  } catch (error: any) {
    console.error('Error obteniendo pipeline:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener pipeline'
    });
  }
}

async function createOportunidad(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Pipeline>>
) {
  try {
    const { nombre, empresa, contactoId, valor, fechaCierre, descripcion, origen } = req.body;
    const user = req.user!;

    if (!nombre || !empresa || !valor) {
      return res.status(400).json({
        exito: false,
        error: 'Nombre, empresa y valor son requeridos'
      });
    }

    const id = generateID();
    const ahora = new Date().toISOString();

    const newOportunidad: Pipeline = {
      id,
      nombre,
      empresa,
      contactoId: contactoId || '',
      valor: parseFloat(valor),
      etapa: 'prospecto',
      probabilidad: 10,
      fechaCierre: fechaCierre || '',
      descripcion: descripcion || '',
      asignadoA: user.id,
      origen: origen || 'web',
      fechaCreacion: ahora,
    };

    await appendSheetData('Pipeline', [
      [
        id,
        nombre,
        empresa,
        contactoId || '',
        parseFloat(valor),
        'prospecto',
        10,
        fechaCierre || '',
        descripcion || '',
        user.id,
        origen || 'web',
        ahora,
      ]
    ]);

    return res.status(201).json({
      exito: true,
      data: newOportunidad,
      mensaje: 'Oportunidad creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando oportunidad:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al crear oportunidad'
    });
  }
}

export default requireAuth(handler);
