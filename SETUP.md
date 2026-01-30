# 🚀 Guía Completa de Configuración - OVA CRM en Vercel

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Configuración de Google Cloud](#configuración-de-google-cloud)
3. [Configuración de Groq API](#configuración-de-groq-api)
4. [Deployment en Vercel](#deployment-en-vercel)
5. [Verificación](#verificación)
6. [Solución de Problemas](#solución-de-problemas)

---

## ✅ Prerequisitos

- Cuenta de Google (gratuita)
- Cuenta de GitHub (gratuita)
- Cuenta de Vercel (gratuita - [vercel.com](https://vercel.com))
- Cuenta de Groq (gratuita - [console.groq.com](https://console.groq.com))
- Google Spreadsheet ya creado con ID: `1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o`

---

## 🔧 Configuración de Google Cloud

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Haz clic en **"Nuevo proyecto"**
4. Nombre del proyecto: **`OVA CRM`**
5. Haz clic en **"Crear"**
6. **Espera 30 segundos** a que se cree el proyecto
7. Selecciona el proyecto recién creado

### Paso 2: Activar Google Sheets API

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google Sheets API"**
3. Haz clic en el resultado
4. Haz clic en **"Habilitar"**
5. Espera a que se active (1-2 minutos)

### Paso 3: Crear Service Account

1. En el menú lateral, ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** → **"Cuenta de servicio"**
3. Completa los campos:
   - **Nombre**: `ova-crm-service`
   - **ID de cuenta de servicio**: Se generará automáticamente
   - **Descripción**: `Service account para OVA CRM`
4. Haz clic en **"Crear y continuar"**
5. En **"Otorgar acceso a este servicio"**:
   - Selecciona el rol: **"Editor"** (o puedes dejarlo sin rol)
6. Haz clic en **"Continuar"**
7. Haz clic en **"Listo"**

### Paso 4: Generar Clave JSON

1. En la lista de cuentas de servicio, busca la que acabas de crear
2. Haz clic en el **email de la cuenta de servicio** (termina en `@ova-crm-xxxxx.iam.gserviceaccount.com`)
3. Ve a la pestaña **"Claves"**
4. Haz clic en **"Agregar clave"** → **"Crear clave nueva"**
5. Selecciona **"JSON"**
6. Haz clic en **"Crear"**
7. **Se descargará un archivo JSON** - ¡GUÁRDALO EN UN LUGAR SEGURO!
8. **Copia el email de la cuenta de servicio** (lo necesitarás en el siguiente paso)

### Paso 5: Compartir el Spreadsheet con la Service Account

1. Abre tu Spreadsheet: [https://docs.google.com/spreadsheets/d/1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o/edit](https://docs.google.com/spreadsheets/d/1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o/edit)
2. Haz clic en **"Compartir"** (botón verde arriba a la derecha)
3. Pega el **email de la cuenta de servicio** (del paso anterior)
   - Ejemplo: `ova-crm-service@ova-crm-123456.iam.gserviceaccount.com`
4. Selecciona **"Editor"** como rol
5. **IMPORTANTE**: Desmarca **"Notificar a las personas"**
6. Haz clic en **"Compartir"**

✅ **¡Google Cloud está listo!**

---

## 🤖 Configuración de Groq API

### Paso 1: Crear Cuenta en Groq

1. Ve a [https://console.groq.com](https://console.groq.com)
2. Haz clic en **"Sign Up"** o **"Get Started"**
3. Regístrate con tu email o cuenta de Google
4. Verifica tu email si es necesario

### Paso 2: Obtener API Key

1. Una vez dentro del dashboard, ve a **"API Keys"** en el menú lateral
2. Haz clic en **"Create API Key"**
3. Dale un nombre: **`OVA CRM`**
4. Haz clic en **"Submit"**
5. **COPIA LA API KEY** que aparece - ¡Solo se muestra una vez!
6. Guárdala en un lugar seguro

✅ **¡Groq API está lista!**

---

## 🚀 Deployment en Vercel

### Paso 1: Preparar Variables de Entorno

Antes de deployar, necesitas tener listos estos valores:

1. **SPREADSHEET_ID**: `1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o`

2. **GOOGLE_SERVICE_ACCOUNT_EMAIL**:
   - Del archivo JSON descargado, copia el valor de `"client_email"`
   - Ejemplo: `ova-crm-service@ova-crm-123456.iam.gserviceaccount.com`

3. **GOOGLE_PRIVATE_KEY**:
   - Del archivo JSON descargado, copia el valor COMPLETO de `"private_key"`
   - **IMPORTANTE**: Debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
   - **IMPORTANTE**: Los saltos de línea `\n` DEBEN mantenerse

4. **GROQ_API_KEY**:
   - La API key que copiaste de Groq Console

5. **SESSION_SECRET**:
   - Genera una cadena aleatoria de mínimo 32 caracteres
   - Puedes usar: `openssl rand -base64 32` (en terminal)
   - O cualquier generador de contraseñas seguras

### Paso 2: Conectar GitHub con Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"** o **"Login"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tu cuenta de GitHub

### Paso 3: Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca tu repositorio **`ovavisionve/ClaudeCode`**
3. Haz clic en **"Import"**

### Paso 4: Configurar el Proyecto

1. **Framework Preset**: Vercel detectará automáticamente **Next.js** ✅
2. **Root Directory**: Dejar como está (`.`)
3. **Build Command**: Dejar como está (`next build`)
4. **Output Directory**: Dejar como está (`.next`)

### Paso 5: Agregar Variables de Entorno

1. Expande la sección **"Environment Variables"**
2. Agrega cada variable **UNA POR UNA**:

**Variable 1:**
```
Name: SPREADSHEET_ID
Value: 1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o
```

**Variable 2:**
```
Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: [tu-email-de-service-account]@[tu-proyecto].iam.gserviceaccount.com
```

**Variable 3:** (¡CUIDADO con este!)
```
Name: GOOGLE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nMIIEvQIB...tu-clave-aquí...\n-----END PRIVATE KEY-----\n
```
**IMPORTANTE**: Copia el valor COMPLETO de `"private_key"` del JSON, incluyendo los `\n` tal cual aparecen.

**Variable 4:**
```
Name: GROQ_API_KEY
Value: [tu-api-key-de-groq]
```

**Variable 5:**
```
Name: SESSION_SECRET
Value: [cadena-aleatoria-de-32-caracteres-minimo]
```

### Paso 6: Deploy

1. Haz clic en **"Deploy"**
2. Vercel comenzará a construir tu aplicación
3. **Espera 2-5 minutos** a que termine el build
4. Si todo está correcto, verás **"Congratulations! 🎉"**

### Paso 7: Obtener URL

1. Una vez completado el deploy, verás tu URL de producción
2. Ejemplo: `https://ova-crm.vercel.app`
3. Haz clic en la URL para abrir tu aplicación

✅ **¡Tu CRM está en producción!**

---

## 🎯 Verificación

### Checklist de Verificación

- [ ] ✅ Google Sheets API está habilitada
- [ ] ✅ Service Account creada y clave JSON descargada
- [ ] ✅ Spreadsheet compartido con la Service Account
- [ ] ✅ Groq API Key obtenida
- [ ] ✅ Proyecto desplegado en Vercel
- [ ] ✅ Variables de entorno configuradas correctamente
- [ ] ✅ Build completado sin errores
- [ ] ✅ Aplicación accesible desde la URL de Vercel

### Probar la Aplicación

1. **Abrir la aplicación**:
   - Ve a tu URL de Vercel

2. **Probar login**:
   - Usuario: `admin`
   - Contraseña: `admin123`
   - Deberías ver el Dashboard

3. **Probar funcionalidades**:
   - Dashboard debe mostrar métricas (aunque estén en 0)
   - Menú lateral debe funcionar
   - Todas las secciones deben cargar sin errores

---

## ❌ Solución de Problemas

### Error: "Failed to build"

**Causa**: Error en las variables de entorno o en el código

**Solución**:
1. Ve a Vercel → Tu Proyecto → **"Settings"** → **"Environment Variables"**
2. Verifica que todas las variables estén correctamente configuradas
3. En **"Deployments"**, haz clic en el deployment fallido
4. Revisa los **logs** para ver el error específico
5. Si el error es con `GOOGLE_PRIVATE_KEY`, asegúrate de que:
   - Incluye `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
   - Los `\n` están presentes (no los reemplaces por saltos de línea reales)

### Error: "Token inválido o expirado" al hacer login

**Causa**: Variables de entorno no configuradas correctamente

**Solución**:
1. Verifica que `SESSION_SECRET` esté configurado
2. Verifica que `SPREADSHEET_ID` sea correcto
3. Verifica que `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `GOOGLE_PRIVATE_KEY` sean correctos
4. Ve a Vercel → Settings → Environment Variables
5. Re-deploy después de corregir: Vercel → Deployments → "..." → "Redeploy"

### Error: "Error al obtener reuniones/tareas/contactos"

**Causa**: Google Sheets API no tiene permisos o el Spreadsheet no está compartido

**Solución**:
1. Abre el Spreadsheet
2. Verifica que esté compartido con la Service Account email
3. Verifica que el rol sea **"Editor"**
4. Espera 1-2 minutos a que los permisos se propaguen
5. Intenta de nuevo

### Error: "API Key de Groq no configurada"

**Causa**: Variable de entorno `GROQ_API_KEY` no configurada

**Solución**:
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que `GROQ_API_KEY` esté configurada
3. Si no está, agrégala
4. Haz un redeploy

### Error: "403 Permission Denied" al acceder a Google Sheets

**Causa**: El Spreadsheet no está compartido con la Service Account

**Solución**:
1. Abre el Spreadsheet
2. Haz clic en **"Compartir"**
3. Agrega el email de la Service Account
4. Rol: **"Editor"**
5. **Importante**: Desmarca "Notificar a las personas"
6. Haz clic en **"Compartir"**

### La aplicación carga pero no muestra datos

**Causa**: Las hojas de Google Sheets no tienen las columnas correctas

**Solución**:
1. Verifica que el Spreadsheet tenga todas las hojas necesarias:
   - Usuarios, Reuniones, Tareas, Contactos, Pipeline, Cotizaciones, etc.
2. Verifica que cada hoja tenga los encabezados correctos
3. Si faltan hojas o encabezados, puedes ejecutar el script `configurarSistemaCompleto()` de nuevo en Apps Script (solo para crear las hojas, no para usarlo)

---

## 🎉 ¡Listo!

Tu OVA CRM ahora está funcionando en Vercel con:

✅ **Frontend y Backend**: Next.js en Vercel (100% GRATIS)
✅ **Base de Datos**: Google Sheets API (100% GRATIS)
✅ **Autenticación**: Sistema de sesiones con tokens
✅ **Chat IA**: Groq API con Llama 3.3 70B (100% GRATIS)
✅ **Deployment**: Automático desde GitHub

---

## 📞 Comandos Útiles

### Desarrollo Local (Opcional)

Si quieres probar localmente antes de deployar:

```bash
# Instalar dependencias
npm install

# Crear archivo .env con las variables de entorno
cp .env.example .env
# Edita .env con tus valores

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

### Actualizar en Producción

Simplemente haz push a tu repositorio de GitHub:

```bash
git add .
git commit -m "Actualización del CRM"
git push origin main
```

Vercel detectará el cambio y hará deploy automáticamente.

---

**¿Necesitas ayuda?** Revisa la sección de Solución de Problemas o verifica los logs en Vercel.
