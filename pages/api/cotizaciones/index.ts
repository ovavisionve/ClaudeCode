import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getSheetData, appendSheetData } from '@/lib/sheets';
import { generateID } from '@/lib/utils';
import { APIResponse, Cotizacion } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Cotizacion[]>>
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getCotizaciones(req, res);
      case 'POST':
        return await createCotizacion(req, res);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de cotizaciones:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function getCotizaciones(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Cotizacion[]>>
) {
  try {
    const data = await getSheetData('Cotizaciones');
    const cotizaciones: Cotizacion[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        cotizaciones.push({
          id: row[0],
          numero: row[1],
          clienteId: row[2],
          fecha: row[3],
          validezDias: parseInt(row[4]) || 30,
          estado: row[5] as any,
          subtotal: parseFloat(row[6]) || 0,
          iva: parseFloat(row[7]) || 0,
          total: parseFloat(row[8]) || 0,
          notas: row[9],
          creadoPor: row[10],
          fechaCreacion: row[11],
        });
      }
    }

    return res.status(200).json({
      exito: true,
      data: cotizaciones,
      mensaje: `${cotizaciones.length} cotizaciones encontradas`
    });
  } catch (error: any) {
    console.error('Error obteniendo cotizaciones:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener cotizaciones'
    });
  }
}

async function createCotizacion(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Cotizacion>>
) {
  try {
    const { clienteId, validezDias, notas, items } = req.body;
    const user = req.user!;

    if (!clienteId) {
      return res.status(400).json({
        exito: false,
        error: 'El cliente es requerido'
      });
    }

    const id = generateID();
    const ahora = new Date().toISOString();

    // Generate quote number (COT-YYYYMMDD-XXX)
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const numero = `COT-${dateStr}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Calculate totals
    let subtotal = 0;
    if (items && Array.isArray(items)) {
      subtotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    }
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const newCotizacion: Cotizacion = {
      id,
      numero,
      clienteId,
      fecha: ahora,
      validezDias: validezDias || 30,
      estado: 'borrador',
      subtotal,
      iva,
      total,
      notas: notas || '',
      creadoPor: user.id,
      fechaCreacion: ahora,
    };

    await appendSheetData('Cotizaciones', [
      [
        id,
        numero,
        clienteId,
        ahora,
        validezDias || 30,
        'borrador',
        subtotal,
        iva,
        total,
        notas || '',
        user.id,
        ahora,
      ]
    ]);

    // Add items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await appendSheetData('ItemsCotizacion', [
          [
            generateID(),
            id,
            item.descripcion,
            item.cantidad,
            item.precioUnitario,
            item.total,
          ]
        ]);
      }
    }

    return res.status(201).json({
      exito: true,
      data: newCotizacion,
      mensaje: 'Cotización creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando cotización:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al crear cotización'
    });
  }
}

export default requireAuth(handler);
