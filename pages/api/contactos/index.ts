import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getSheetData, appendSheetData } from '@/lib/sheets';
import { generateID } from '@/lib/utils';
import { APIResponse, Contacto } from '@/types';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Contacto[]>>
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getContactos(req, res);
      case 'POST':
        return await createContacto(req, res);
      default:
        return res.status(405).json({ exito: false, error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de contactos:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}

async function getContactos(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Contacto[]>>
) {
  try {
    const data = await getSheetData('Contactos');
    const contactos: Contacto[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        contactos.push({
          id: row[0],
          nombre: row[1],
          apellido: row[2],
          email: row[3],
          telefono: row[4],
          empresa: row[5],
          cargo: row[6],
          tipo: row[7] as any,
          etapa: row[8],
          ultimoContacto: row[9],
          notas: row[10],
          creadoPor: row[11],
          fechaCreacion: row[12],
        });
      }
    }

    return res.status(200).json({
      exito: true,
      data: contactos,
      mensaje: `${contactos.length} contactos encontrados`
    });
  } catch (error: any) {
    console.error('Error obteniendo contactos:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener contactos'
    });
  }
}

async function createContacto(
  req: AuthenticatedRequest,
  res: NextApiResponse<APIResponse<Contacto>>
) {
  try {
    const { nombre, apellido, email, telefono, empresa, cargo, tipo, etapa, notas } = req.body;
    const user = req.user!;

    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        exito: false,
        error: 'Nombre, apellido y email son requeridos'
      });
    }

    const id = generateID();
    const ahora = new Date().toISOString();

    const newContacto: Contacto = {
      id,
      nombre,
      apellido,
      email,
      telefono: telefono || '',
      empresa: empresa || '',
      cargo: cargo || '',
      tipo: tipo || 'prospecto',
      etapa: etapa || 'nuevo',
      ultimoContacto: ahora,
      notas: notas || '',
      creadoPor: user.id,
      fechaCreacion: ahora,
    };

    await appendSheetData('Contactos', [
      [
        id,
        nombre,
        apellido,
        email,
        telefono || '',
        empresa || '',
        cargo || '',
        tipo || 'prospecto',
        etapa || 'nuevo',
        ahora,
        notas || '',
        user.id,
        ahora,
      ]
    ]);

    return res.status(201).json({
      exito: true,
      data: newContacto,
      mensaje: 'Contacto creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando contacto:', error);
    return res.status(500).json({
      exito: false,
      error: 'Error al crear contacto'
    });
  }
}

export default requireAuth(handler);
