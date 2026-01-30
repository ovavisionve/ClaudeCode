import type { NextApiRequest, NextApiResponse } from 'next';
import { login } from '@/lib/auth';
import { LoginResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ exito: false, error: 'Método no permitido' });
  }

  try {
    const { username, password } = req.body;

    const result = await login(username, password);

    if (result.exito) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error: any) {
    console.error('Error en endpoint de login:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
}
