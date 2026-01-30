import { getSheetData, appendSheetData, findRowById, updateSheetRow } from './sheets';
import { generateID, hashPassword, generateToken } from './utils';
import { User, Session, LoginResponse } from '@/types';

// Login function
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    console.log('🔐 Intento de login:', username);

    if (!username || !password) {
      return { exito: false, error: 'Usuario y contraseña son requeridos' };
    }

    const userSheet = await getSheetData('Usuarios');

    for (let i = 1; i < userSheet.length; i++) {
      const fila = userSheet[i];
      const usuarioUsername = fila[1];
      const usuarioPassword = fila[2];
      const usuarioActivo = fila[7];

      if (usuarioUsername === username) {
        if (usuarioActivo !== 'SI') {
          return { exito: false, error: 'Usuario inactivo' };
        }

        const passwordHash = hashPassword(password);
        if (usuarioPassword === passwordHash) {
          const token = generateToken();
          const ahora = new Date();
          const expiracion = new Date(ahora.getTime() + 24 * 60 * 60 * 1000); // 24 hours

          const usuario: User = {
            id: fila[0],
            username: fila[1],
            nombreCompleto: fila[3],
            email: fila[4],
            rol: fila[5] as 'admin' | 'manager' | 'usuario' | 'readonly',
            permisos: JSON.parse(fila[6] || '{}'),
            activo: usuarioActivo === 'SI',
          };

          // Save session
          await appendSheetData('Sesiones', [
            [generateID(), usuario.id, token, expiracion.toISOString(), ahora.toISOString()]
          ]);

          // Update last access
          await updateSheetRow('Usuarios', i + 1, [
            fila[0], fila[1], fila[2], fila[3], fila[4], fila[5], fila[6], fila[7], ahora.toISOString()
          ]);

          console.log('✅ Login exitoso para:', username);
          return {
            exito: true,
            mensaje: 'Login exitoso',
            token: token,
            usuario: usuario
          };
        } else {
          console.log('❌ Contraseña incorrecta para:', username);
        }
      }
    }

    return { exito: false, error: 'Usuario o contraseña incorrectos' };
  } catch (error: any) {
    console.error('Error en login:', error);
    return { exito: false, error: 'Error en el servidor: ' + error.message };
  }
}

// Validate token
export async function validateToken(token: string): Promise<User | null> {
  try {
    if (!token) return null;

    const sessionSheet = await getSheetData('Sesiones');
    const ahora = new Date();

    for (let i = 1; i < sessionSheet.length; i++) {
      const fila = sessionSheet[i];
      const sessionToken = fila[2];
      const expiracion = new Date(fila[3]);
      const usuarioId = fila[1];

      if (sessionToken === token) {
        if (expiracion < ahora) {
          console.log('⏰ Token expirado');
          return null;
        }

        // Get user data
        const usuario = await getUserById(usuarioId);
        return usuario;
      }
    }

    console.log('🔍 Token no encontrado');
    return null;
  } catch (error) {
    console.error('Error validando token:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(usuarioId: string): Promise<User | null> {
  try {
    const userSheet = await getSheetData('Usuarios');

    for (let i = 1; i < userSheet.length; i++) {
      const fila = userSheet[i];
      if (fila[0] === usuarioId) {
        return {
          id: fila[0],
          username: fila[1],
          nombreCompleto: fila[3],
          email: fila[4],
          rol: fila[5] as 'admin' | 'manager' | 'usuario' | 'readonly',
          permisos: JSON.parse(fila[6] || '{}'),
          activo: fila[7] === 'SI',
          ultimoAcceso: fila[8] || undefined,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error obteniendo usuario por ID:', error);
    return null;
  }
}

// Logout function
export async function logout(token: string): Promise<boolean> {
  try {
    const sessionSheet = await getSheetData('Sesiones');

    for (let i = 1; i < sessionSheet.length; i++) {
      const fila = sessionSheet[i];
      if (fila[2] === token) {
        // Delete session by clearing the row
        await updateSheetRow('Sesiones', i + 1, ['', '', '', '', '']);
        console.log('✅ Sesión cerrada');
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error en logout:', error);
    return false;
  }
}

// Check permission
export function hasPermission(user: User, resource: string, level: 'lectura' | 'escritura' | 'admin'): boolean {
  if (user.rol === 'admin') return true;

  const userPermission = user.permisos[resource as keyof typeof user.permisos];

  if (level === 'admin') return userPermission === 'admin';
  if (level === 'escritura') return userPermission === 'escritura' || userPermission === 'admin';
  if (level === 'lectura') return userPermission !== 'ninguno';

  return false;
}
