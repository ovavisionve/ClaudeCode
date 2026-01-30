import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/lib/auth';
import { User } from '@/types';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export async function requireAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '') || req.body?.token;

      if (!token) {
        return res.status(401).json({
          exito: false,
          error: 'No se proporcionó token de autenticación'
        });
      }

      const user = await validateToken(token);

      if (!user) {
        return res.status(401).json({
          exito: false,
          error: 'Token inválido o expirado'
        });
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return res.status(500).json({
        exito: false,
        error: 'Error interno del servidor'
      });
    }
  };
}

export async function requirePermission(
  resource: string,
  level: 'lectura' | 'escritura' | 'admin',
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user!;

    if (user.rol === 'admin') {
      return handler(req, res);
    }

    const userPermission = user.permisos[resource as keyof typeof user.permisos];

    let hasAccess = false;

    if (level === 'admin') {
      hasAccess = userPermission === 'admin';
    } else if (level === 'escritura') {
      hasAccess = userPermission === 'escritura' || userPermission === 'admin';
    } else if (level === 'lectura') {
      hasAccess = userPermission !== 'ninguno';
    }

    if (!hasAccess) {
      return res.status(403).json({
        exito: false,
        error: 'No tienes permisos para realizar esta acción'
      });
    }

    return handler(req, res);
  });
}
