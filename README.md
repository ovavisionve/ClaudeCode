# 🎯 OVA CRM - Sistema de Gestión de Relaciones con Clientes

**Versión 2.0** - Migrado a Next.js + Vercel + Google Sheets API

---

## 🌟 Características

### 📊 Dashboard Completo
- Métricas en tiempo real
- Resumen de actividades
- Estadísticas de ventas
- Visualización del pipeline

### 📅 Gestión de Reuniones
- Crear, editar y eliminar reuniones
- Estados: Pendiente, Confirmada, Completada, Cancelada
- Recordatorios configurables
- Asistentes y ubicación

### ✅ Tareas Kanban
- Tablero Kanban visual
- Prioridades: Baja, Media, Alta, Urgente
- Estados: Por Hacer, En Progreso, Completada
- Asignación de tareas
- Fechas de vencimiento

### 👥 Gestión de Contactos
- CRUD completo de contactos
- Tipos: Cliente, Prospecto, Proveedor, Socio
- Historial de interacciones
- Notas y seguimiento

### 📈 Pipeline de Ventas
- Gestión de oportunidades
- Etapas configurables
- Valor y probabilidad de cierre
- Seguimiento de conversiones

### 💰 Cotizaciones
- Crear cotizaciones profesionales
- Gestión de items y precios
- Cálculo automático de IVA y totales
- Estados: Borrador, Enviada, Aprobada, Rechazada

### 🤖 Chat IA con Groq
- Asistente virtual inteligente
- Powered by Llama 3.3 70B
- Ayuda con gestión del CRM
- Respuestas en tiempo real

### 🔒 Sistema de Autenticación
- Login seguro con tokens
- 4 niveles de roles: Admin, Manager, Usuario, ReadOnly
- Permisos granulares por módulo
- Sesiones con expiración

---

## 🏗️ Arquitectura

```
Frontend:           Next.js 14 + React + TypeScript
Backend:            Next.js API Routes (Serverless)
Base de Datos:      Google Sheets (via Google Sheets API)
Autenticación:      JWT + Session Tokens
IA:                 Groq API (Llama 3.3 70B)
Deployment:         Vercel
Costo:              $0 (100% GRATIS)
```

### Stack Tecnológico

- **Next.js 14**: Framework de React con SSR y API Routes
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Estilos utility-first
- **Google Sheets API**: Base de datos en Google Sheets
- **Groq API**: IA generativa para el chat
- **Vercel**: Hosting y deployment automático
- **Lucide Icons**: Iconos modernos y ligeros

---

## 📁 Estructura del Proyecto

```
ClaudeCode/
├── pages/
│   ├── api/                    # API Routes (Backend)
│   │   ├── auth/              # Autenticación
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   └── validate.ts
│   │   ├── reuniones/         # CRUD Reuniones
│   │   ├── tareas/            # CRUD Tareas
│   │   ├── contactos/         # CRUD Contactos
│   │   ├── pipeline/          # CRUD Pipeline
│   │   ├── cotizaciones/      # CRUD Cotizaciones
│   │   └── chat/              # Chat IA
│   ├── _app.tsx               # App wrapper
│   ├── _document.tsx          # Document config
│   ├── index.tsx              # Login page
│   └── dashboard.tsx          # Dashboard
├── components/
│   └── Layout.tsx             # Layout principal
├── lib/
│   ├── sheets.ts              # Google Sheets API client
│   ├── auth.ts                # Autenticación
│   └── utils.ts               # Utilidades
├── middleware/
│   └── auth.ts                # Middleware de autenticación
├── types/
│   └── index.ts               # TypeScript types
├── styles/
│   └── globals.css            # Estilos globales
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .env.example               # Template de variables
├── .gitignore
├── SETUP.md                   # Guía de instalación
└── README.md                  # Este archivo
```

---

## 🚀 Instalación y Deployment

### Opción 1: Deploy Directo en Vercel (Recomendado)

Sigue la guía completa en **[SETUP.md](./SETUP.md)** que incluye:

1. ✅ Configuración de Google Cloud
2. ✅ Configuración de Groq API
3. ✅ Deployment en Vercel
4. ✅ Configuración de variables de entorno
5. ✅ Solución de problemas

**Tiempo estimado**: 15-20 minutos

---

### Opción 2: Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/ovavisionve/ClaudeCode.git
cd ClaudeCode

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores (ver SETUP.md)

# 4. Ejecutar en modo desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# Google Sheets Configuration
SPREADSHEET_ID=1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Groq API
GROQ_API_KEY=tu_groq_api_key

# Session Secret
SESSION_SECRET=cadena_aleatoria_de_32_caracteres_minimo
```

Ver **[SETUP.md](./SETUP.md)** para instrucciones detalladas de cómo obtener cada valor.

---

## 👤 Usuarios de Prueba

Por defecto, el sistema incluye estos usuarios:

| Usuario   | Contraseña  | Rol      |
|-----------|-------------|----------|
| admin     | admin123    | Admin    |
| manager   | manager123  | Manager  |
| usuario1  | user123     | Usuario  |

**IMPORTANTE**: Cambia estas contraseñas en producción.

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:3000

# Producción
npm run build        # Construye la aplicación para producción
npm start            # Inicia el servidor de producción

# Linting
npm run lint         # Ejecuta ESLint para verificar el código
```

---

## 📊 Base de Datos (Google Sheets)

El sistema utiliza las siguientes hojas:

1. **Usuarios** - Gestión de usuarios y permisos
2. **Sesiones** - Tokens de sesión activos
3. **Reuniones** - Reuniones y eventos
4. **Tareas** - Tareas del equipo
5. **Contactos** - Base de datos de contactos
6. **Documentos** - Archivos relacionados
7. **Pipeline** - Oportunidades de venta
8. **Cotizaciones** - Cotizaciones generadas
9. **ItemsCotizacion** - Items de cada cotización
10. **Configuracion** - Configuración del sistema
11. **Prompts** - Prompts para el Chat IA
12. **Conversaciones** - Historial del chat
13. **AuditoriaLog** - Log de auditoría
14. **MetricasDashboard** - Métricas del dashboard
15. **ReportesVentas** - Reportes de ventas
16. **Categorias** - Categorías de tareas
17. **Notificaciones** - Notificaciones del sistema
18. **Recordatorios** - Recordatorios programados

---

## 🔒 Seguridad

- ✅ Autenticación con tokens seguros
- ✅ Contraseñas hasheadas con SHA-256
- ✅ Sesiones con expiración (24 horas)
- ✅ Middleware de autenticación en todas las rutas API
- ✅ Validación de permisos por rol
- ✅ Variables de entorno para secretos
- ✅ Service Account para Google Sheets API

---

## 📈 Límites y Cuotas (100% GRATIS)

### Vercel (Plan Hobby - Gratis)
- ✅ Bandwidth: 100 GB/mes
- ✅ Builds: Ilimitados
- ✅ Serverless Functions: 100 GB-hours/mes
- ✅ Deployments: Ilimitados

### Google Sheets API (Gratis)
- ✅ 300 requests/minuto por proyecto
- ✅ 60 requests/minuto por usuario
- ✅ Sin límite diario
- ✅ Gratis para siempre

### Groq API (Plan Gratuito)
- ✅ Requests: Generosos límites gratuitos
- ✅ Modelo: Llama 3.3 70B
- ✅ Sin necesidad de tarjeta de crédito

**Total: $0/mes** 🎉

---

## 🎨 Personalización

### Cambiar Colores

Edita `tailwind.config.js` para cambiar el esquema de colores:

```js
colors: {
  primary: {
    // Cambia estos valores
    500: '#a855f7',  // Color principal
    600: '#9333ea',  // Hover
    // ...
  }
}
```

### Cambiar Logo

Reemplaza el SVG en `pages/index.tsx` (línea ~80) con tu logo.

---

## 🐛 Solución de Problemas

Ver la sección completa de troubleshooting en **[SETUP.md](./SETUP.md#solución-de-problemas)**

### Problemas Comunes

1. **Error de build**: Verifica las variables de entorno
2. **Error de autenticación**: Verifica Google Service Account
3. **Chat IA no funciona**: Verifica Groq API Key
4. **No se cargan datos**: Verifica permisos del Spreadsheet

---

## 📝 Changelog

### v2.0.0 (Actual)
- ✅ Migración completa de Google Apps Script a Next.js
- ✅ Backend con Next.js API Routes
- ✅ Deployment en Vercel
- ✅ Google Sheets API para base de datos
- ✅ TypeScript para todo el proyecto
- ✅ Tailwind CSS para estilos
- ✅ Sistema de autenticación robusto
- ✅ Chat IA con Groq API

### v1.0.0 (Anterior)
- Google Apps Script + HTML
- Base de datos en Google Sheets
- Frontend monolítico

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y pertenece a OVA Vision.

---

## 📞 Soporte

Si tienes problemas:

1. Revisa **[SETUP.md](./SETUP.md)** para la guía completa
2. Verifica la sección de troubleshooting
3. Revisa los logs en Vercel (Deployments → View Function Logs)
4. Abre un issue en GitHub

---

## 🎯 Roadmap

- [ ] Agregar más visualizaciones en el dashboard
- [ ] Integración con Google Calendar para reuniones
- [ ] Exportar reportes a PDF
- [ ] Notificaciones push
- [ ] App móvil (PWA)
- [ ] Integración con WhatsApp Business
- [ ] Dashboard de analíticas avanzadas

---

**Hecho con ❤️ por OVA Vision**

🚀 **¡Listo para transformar tu gestión de clientes!**
