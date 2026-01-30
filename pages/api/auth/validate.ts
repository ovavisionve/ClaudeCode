import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/lib/auth';
import { APIResponse, User } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<User>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ exito: false, error: 'Método no permitido' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ exito: false, error: 'Token requerido' });
    }

    const usuario = await validateToken(token);

    if (usuario) {
      res.status(200).json({
        exito: true,
        data: usuario,
        mensaje: 'Token válido'
      });
    } else {
      res.status(401).json({ exito: false, error: 'Token inválido o expirado' });
    }
  } catch (error: any) {
    console.error('Error en endpoint de validación:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}
