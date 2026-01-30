import type { NextApiRequest, NextApiResponse } from 'next';
import { logout } from '@/lib/auth';
import { APIResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ exito: false, error: 'Método no permitido' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ exito: false, error: 'Token requerido' });
    }

    const result = await logout(token);

    if (result) {
      res.status(200).json({ exito: true, mensaje: 'Sesión cerrada exitosamente' });
    } else {
      res.status(404).json({ exito: false, error: 'Sesión no encontrada' });
    }
  } catch (error: any) {
    console.error('Error en endpoint de logout:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}
