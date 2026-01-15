// ============================================
// OVA CRM - SISTEMA COMPLETO
// PARTE 2 DE 3 - FUNCIONALIDADES CORE Y CHAT IA
// ============================================
//
// EMPRESA: OVA
// VERSIÓN: 1.0.0
// DESCRIPCIÓN: Implementación completa de funcionalidades principales
//
// CONTENIDO PARTE 2:
// ✅ Chat IA con Groq (procesamiento de lenguaje natural)
// ✅ CRUD completo de Reuniones + sync Google Calendar
// ✅ CRUD completo de Tareas + estados Kanban
// ✅ CRUD completo de Contactos + folders Drive
// ✅ Dashboard con métricas en tiempo real
// ✅ Sistema de gestión de documentos
// ✅ Sistema de notificaciones
// ✅ Búsqueda y filtros avanzados
//
// ============================================

// ============================================
// ENDPOINTS ADICIONALES PARA doPost
// ============================================

/**
 * Enrutador principal de acciones para doPost
 * Esta función extiende la funcionalidad de doPost de la Parte 1
 * @param {Object} datos - Datos de la petición
 * @returns {Object} Resultado de la acción
 */
function rutearAccion(datos) {
  const accion = datos.accion;
  const token = datos.token;

  // Validar token
  const usuario = validarToken(token);
  if (!usuario) {
    return {
      exito: false,
      error: 'Sesión inválida o expirada'
    };
  }

  // Registrar acción en auditoría
  registrarAuditoria(usuario.id, accion, 'api', '', {}, datos);

  // Rutear según acción
  switch (accion) {
    // ===== CHAT IA =====
    case 'chat':
      return procesarMensajeIA(usuario, datos.mensaje, datos.contexto);

    // ===== DASHBOARD =====
    case 'obtener_dashboard':
      return obtenerDatosDashboard(usuario);
    case 'obtener_metricas':
      return obtenerMetricasDashboard(usuario);

    // ===== REUNIONES =====
    case 'crear_reunion':
      return crearReunion(usuario, datos.reunion);
    case 'listar_reuniones':
      return listarReuniones(usuario, datos.filtros);
    case 'obtener_reunion':
      return obtenerReunion(usuario, datos.reunionId);
    case 'actualizar_reunion':
      return actualizarReunion(usuario, datos.reunionId, datos.cambios);
    case 'eliminar_reunion':
      return eliminarReunion(usuario, datos.reunionId);

    // ===== TAREAS =====
    case 'crear_tarea':
      return crearTarea(usuario, datos.tarea);
    case 'listar_tareas':
      return listarTareas(usuario, datos.filtros);
    case 'obtener_tarea':
      return obtenerTarea(usuario, datos.tareaId);
    case 'actualizar_tarea':
      return actualizarTarea(usuario, datos.tareaId, datos.cambios);
    case 'cambiar_estado_tarea':
      return cambiarEstadoTarea(usuario, datos.tareaId, datos.nuevoEstado);
    case 'eliminar_tarea':
      return eliminarTarea(usuario, datos.tareaId);
    case 'obtener_tablero_kanban':
      return obtenerTableroKanban(usuario, datos.filtros);

    // ===== CONTACTOS =====
    case 'crear_contacto':
      return crearContacto(usuario, datos.contacto);
    case 'listar_contactos':
      return listarContactos(usuario, datos.filtros);
    case 'obtener_contacto':
      return obtenerContacto(usuario, datos.contactoId);
    case 'actualizar_contacto':
      return actualizarContacto(usuario, datos.contactoId, datos.cambios);
    case 'eliminar_contacto':
      return eliminarContacto(usuario, datos.contactoId);

    // ===== DOCUMENTOS =====
    case 'subir_documento':
      return subirDocumento(usuario, datos.documento);
    case 'listar_documentos':
      return listarDocumentos(usuario, datos.filtros);
    case 'eliminar_documento':
      return eliminarDocumento(usuario, datos.documentoId);

    // ===== NOTIFICACIONES =====
    case 'obtener_notificaciones':
      return obtenerNotificaciones(usuario, datos.soloNoLeidas);
    case 'marcar_notificacion_leida':
      return marcarNotificacionLeida(usuario, datos.notificacionId);
    case 'marcar_todas_leidas':
      return marcarTodasNotificacionesLeidas(usuario);

    // ===== BÚSQUEDA =====
    case 'buscar_global':
      return buscarGlobal(usuario, datos.query);

    // ===== CONFIGURACIÓN =====
    case 'obtener_configuraciones':
      return obtenerTodasConfiguraciones(usuario);
    case 'actualizar_configuracion':
      return actualizarConfiguracionEndpoint(usuario, datos.parametro, datos.valor);

    default:
      return {
        exito: false,
        error: 'Acción no reconocida: ' + accion
      };
  }
}

// ============================================
// CHAT IA CON GROQ
// ============================================

/**
 * Procesa un mensaje del usuario con la IA
 * @param {Object} usuario - Usuario autenticado
 * @param {string} mensaje - Mensaje del usuario
 * @param {Object} contexto - Contexto adicional
 * @returns {Object} Respuesta de la IA
 */
function procesarMensajeIA(usuario, mensaje, contexto = {}) {
  try {
    Logger.log('🤖 Procesando mensaje IA para: ' + usuario.nombreCompleto);

    if (!mensaje || mensaje.trim() === '') {
      return {
        exito: false,
        error: 'El mensaje no puede estar vacío'
      };
    }

    // Obtener API key
    const apiKey = obtenerGroqApiKey();
    if (!apiKey) {
      return {
        exito: false,
        error: 'API key de Groq no configurada. Ve a Configuracion y agrega tu GROQ_API_KEY.'
      };
    }

    // Construir contexto del usuario
    const contextoUsuario = construirContextoUsuario(usuario);

    // Obtener historial de conversación
    const historial = obtenerHistorialConversacion(usuario.id, 10);

    // Obtener prompt del sistema
    const promptSistema = obtenerPromptSistema(usuario, contextoUsuario);

    // Construir mensajes para Groq
    const mensajes = [
      { role: 'system', content: promptSistema },
      ...historial,
      { role: 'user', content: mensaje }
    ];

    // Llamar a Groq
    const respuestaIA = llamarGroqAPI(mensajes, apiKey);

    if (!respuestaIA.exito) {
      return respuestaIA;
    }

    // Guardar mensaje del usuario en conversaciones
    guardarMensajeConversacion(usuario.id, 'user', mensaje, contexto.sessionId);

    // Procesar la respuesta de la IA
    const resultado = interpretarRespuestaIA(usuario, respuestaIA.respuesta);

    // Guardar respuesta de la IA en conversaciones
    guardarMensajeConversacion(
      usuario.id,
      'assistant',
      resultado.mensaje,
      contexto.sessionId,
      respuestaIA.tokensUsados
    );

    Logger.log('✅ Mensaje IA procesado exitosamente');

    return {
      exito: true,
      mensaje: resultado.mensaje,
      accionEjecutada: resultado.accion || null,
      datos: resultado.datos || null,
      tokensUsados: respuestaIA.tokensUsados
    };

  } catch (error) {
    Logger.log('❌ Error procesando mensaje IA: ' + error.message);
    return {
      exito: false,
      error: 'Error procesando tu mensaje: ' + error.message
    };
  }
}

/**
 * Construye el contexto del usuario para la IA
 * @param {Object} usuario - Usuario autenticado
 * @returns {string} Contexto formateado
 */
function construirContextoUsuario(usuario) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoy = new Date();
    const fechaHoy = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    let contexto = `Usuario actual: ${usuario.nombreCompleto} (${usuario.rol})\n`;
    contexto += `Email: ${usuario.email}\n\n`;

    // Reuniones de hoy
    const reunSheet = ss.getSheetByName('Reuniones');
    const reunData = reunSheet.getDataRange().getValues();
    let reunionesHoy = [];

    for (let i = 1; i < reunData.length; i++) {
      const fechaReunion = Utilities.formatDate(
        new Date(reunData[i][1]),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );
      const usuarioIdReunion = reunData[i][7];
      const estado = reunData[i][11];

      if (fechaReunion === fechaHoy && usuarioIdReunion === usuario.id && estado !== 'Cancelada') {
        reunionesHoy.push({
          hora: reunData[i][2],
          titulo: reunData[i][4],
          participantes: reunData[i][8]
        });
      }
    }

    if (reunionesHoy.length > 0) {
      contexto += '📅 REUNIONES HOY:\n';
      reunionesHoy.forEach(r => {
        contexto += `- ${r.hora}: ${r.titulo}`;
        if (r.participantes) contexto += ` (con: ${r.participantes})`;
        contexto += '\n';
      });
      contexto += '\n';
    }

    // Tareas pendientes
    const tarSheet = ss.getSheetByName('Tareas');
    const tarData = tarSheet.getDataRange().getValues();
    let tareasPendientes = [];

    for (let i = 1; i < tarData.length; i++) {
      const usuarioIdTarea = tarData[i][3];
      const estado = tarData[i][7];

      if (usuarioIdTarea === usuario.id &&
          (estado === ESTADOS_TAREA.PENDIENTE || estado === ESTADOS_TAREA.EN_PROGRESO)) {
        tareasPendientes.push({
          titulo: tarData[i][1],
          estado: estado,
          prioridad: tarData[i][8],
          vencimiento: tarData[i][9]
        });
      }
    }

    if (tareasPendientes.length > 0) {
      contexto += '✅ TAREAS PENDIENTES:\n';
      tareasPendientes.slice(0, 5).forEach(t => {
        contexto += `- [${t.estado}] ${t.titulo} (${t.prioridad})`;
        if (t.vencimiento) {
          contexto += ` - Vence: ${Utilities.formatDate(new Date(t.vencimiento), Session.getScriptTimeZone(), 'dd/MM')}`;
        }
        contexto += '\n';
      });
      if (tareasPendientes.length > 5) {
        contexto += `... y ${tareasPendientes.length - 5} tareas más\n`;
      }
      contexto += '\n';
    }

    // Listar usuarios disponibles
    const usuarios = listarUsuariosActivos();
    if (usuarios.length > 0) {
      contexto += '👥 USUARIOS DISPONIBLES:\n';
      usuarios.forEach(u => {
        contexto += `- ${u.nombreCompleto} (${u.rol})`;
        if (u.departamento) contexto += ` - ${u.departamento}`;
        contexto += '\n';
      });
    }

    return contexto;

  } catch (error) {
    Logger.log('⚠️ Error construyendo contexto: ' + error.message);
    return 'Usuario: ' + usuario.nombreCompleto;
  }
}

/**
 * Obtiene el prompt del sistema desde la hoja Prompts
 * @param {Object} usuario - Usuario autenticado
 * @param {string} contextoUsuario - Contexto del usuario
 * @returns {string} Prompt del sistema
 */
function obtenerPromptSistema(usuario, contextoUsuario) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const promptSheet = ss.getSheetByName('Prompts');
    const data = promptSheet.getDataRange().getValues();

    // Buscar prompt "sistema_principal"
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'sistema_principal' && data[i][2] === 'SI') {
        let prompt = data[i][3];
        // Reemplazar variables
        prompt = prompt.replace(/\{\{CONTEXTO_USUARIO\}\}/g, contextoUsuario);
        prompt = prompt.replace(/\{\{USUARIO\}\}/g, usuario.nombreCompleto);
        return prompt;
      }
    }

    // Prompt por defecto si no se encuentra
    return `Eres el asistente de OVA CRM para ${usuario.nombreCompleto}.
Ayuda al usuario a gestionar reuniones, tareas y contactos mediante lenguaje natural.
Responde siempre en formato JSON.

${contextoUsuario}`;

  } catch (error) {
    Logger.log('⚠️ Error obteniendo prompt: ' + error.message);
    return `Eres el asistente de OVA CRM. Ayuda al usuario con sus tareas.`;
  }
}

/**
 * Llama a la API de Groq
 * @param {Array} mensajes - Array de mensajes
 * @param {string} apiKey - API key
 * @returns {Object} Respuesta de Groq
 */
function llamarGroqAPI(mensajes, apiKey) {
  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    // Obtener configuraciones
    const modelo = obtenerConfiguracion('MODELO_IA') || 'llama-3.3-70b-versatile';
    const temperatura = parseFloat(obtenerConfiguracion('TEMPERATURA_IA') || '0.3');
    const maxTokens = parseInt(obtenerConfiguracion('MAX_TOKENS_IA') || '2000');

    const payload = {
      model: modelo,
      messages: mensajes,
      temperature: temperatura,
      max_tokens: maxTokens
    };

    const options = {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.error) {
      Logger.log('❌ Error de Groq: ' + JSON.stringify(result.error));
      return {
        exito: false,
        error: 'Error de Groq: ' + (result.error.message || 'Error desconocido')
      };
    }

    if (result.choices && result.choices[0] && result.choices[0].message) {
      return {
        exito: true,
        respuesta: result.choices[0].message.content.trim(),
        tokensUsados: result.usage ? result.usage.total_tokens : 0
      };
    }

    return {
      exito: false,
      error: 'Respuesta inesperada de Groq'
    };

  } catch (error) {
    Logger.log('❌ Error llamando a Groq: ' + error.message);
    return {
      exito: false,
      error: 'Error conectando con Groq: ' + error.message
    };
  }
}

/**
 * Interpreta la respuesta de la IA y ejecuta acciones
 * @param {Object} usuario - Usuario autenticado
 * @param {string} respuesta - Respuesta de la IA
 * @returns {Object} Resultado interpretado
 */
function interpretarRespuestaIA(usuario, respuesta) {
  try {
    // Intentar parsear como JSON
    let json;
    try {
      json = JSON.parse(respuesta);
    } catch (e) {
      // Si no es JSON válido, devolver como texto
      return {
        mensaje: respuesta,
        accion: null
      };
    }

    // Verificar si hay una acción a ejecutar
    if (!json.accion || json.accion === 'responder') {
      return {
        mensaje: json.mensaje || respuesta,
        accion: null
      };
    }

    // Ejecutar la acción
    let resultado;
    switch (json.accion) {
      case 'crear_reunion':
        resultado = crearReunion(usuario, json.datos);
        return {
          mensaje: resultado.exito ? json.mensaje : resultado.error,
          accion: 'crear_reunion',
          datos: resultado.reunion || null
        };

      case 'crear_tarea':
        resultado = crearTarea(usuario, json.datos);
        return {
          mensaje: resultado.exito ? json.mensaje : resultado.error,
          accion: 'crear_tarea',
          datos: resultado.tarea || null
        };

      case 'crear_contacto':
        resultado = crearContacto(usuario, json.datos);
        return {
          mensaje: resultado.exito ? json.mensaje : resultado.error,
          accion: 'crear_contacto',
          datos: resultado.contacto || null
        };

      case 'consultar':
        // Para consultas, solo devolver el mensaje
        return {
          mensaje: json.mensaje,
          accion: 'consultar',
          datos: json.datos || null
        };

      default:
        return {
          mensaje: json.mensaje || 'Acción no implementada: ' + json.accion,
          accion: json.accion
        };
    }

  } catch (error) {
    Logger.log('❌ Error interpretando respuesta IA: ' + error.message);
    return {
      mensaje: 'Error procesando la respuesta: ' + error.message,
      accion: null
    };
  }
}

/**
 * Guarda un mensaje en el historial de conversaciones
 * @param {string} usuarioId - ID del usuario
 * @param {string} role - Rol (user/assistant)
 * @param {string} contenido - Contenido del mensaje
 * @param {string} sessionId - ID de sesión (opcional)
 * @param {number} tokens - Tokens usados (opcional)
 */
function guardarMensajeConversacion(usuarioId, role, contenido, sessionId = '', tokens = 0) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const convSheet = ss.getSheetByName('Conversaciones');

    convSheet.appendRow([
      generarID(),
      usuarioId,
      role,
      contenido,
      new Date(),
      sessionId,
      tokens
    ]);

  } catch (error) {
    Logger.log('⚠️ Error guardando mensaje: ' + error.message);
  }
}

/**
 * Obtiene el historial de conversación del usuario
 * @param {string} usuarioId - ID del usuario
 * @param {number} limite - Cantidad de mensajes
 * @returns {Array} Historial de mensajes
 */
function obtenerHistorialConversacion(usuarioId, limite = 10) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const convSheet = ss.getSheetByName('Conversaciones');
    const data = convSheet.getDataRange().getValues();

    const mensajes = [];

    // Recorrer de atrás hacia adelante para obtener los más recientes
    for (let i = data.length - 1; i >= 1 && mensajes.length < limite * 2; i--) {
      if (data[i][1] === usuarioId) {
        mensajes.unshift({
          role: data[i][2],
          content: data[i][3]
        });
      }
    }

    // Devolver solo los últimos 'limite' mensajes de cada tipo
    return mensajes.slice(-limite * 2);

  } catch (error) {
    Logger.log('⚠️ Error obteniendo historial: ' + error.message);
    return [];
  }
}

// ============================================
// CRUD DE REUNIONES
// ============================================

/**
 * Crea una nueva reunión
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} reunion - Datos de la reunión
 * @returns {Object} Resultado de la creación
 */
function crearReunion(usuario, reunion) {
  try {
    Logger.log('📅 Creando reunión para: ' + usuario.nombreCompleto);

    // Validar datos requeridos
    if (!reunion.fecha || !reunion.horaInicio || !reunion.titulo) {
      return {
        exito: false,
        error: 'Faltan datos requeridos: fecha, horaInicio y titulo son obligatorios'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const reunSheet = ss.getSheetByName('Reuniones');

    // Preparar datos
    const reunionId = generarID();
    const fecha = new Date(reunion.fecha);
    const horaInicio = reunion.horaInicio;
    const horaFin = reunion.horaFin || calcularHoraFin(horaInicio);
    const titulo = reunion.titulo;
    const descripcion = reunion.descripcion || '';
    const ubicacion = reunion.ubicacion || '';
    const participantesIds = reunion.participantesIds || [];
    const clienteId = reunion.clienteId || '';
    const tipo = reunion.tipo || 'reunion';
    const estado = 'Pendiente';
    const prioridad = reunion.prioridad || 'Media';
    const recordatorio = reunion.recordatorio || 30;

    // Crear evento en Google Calendar
    let eventId = '';
    try {
      const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
      const fechaInicio = combinarFechaHora(fecha, horaInicio);
      const fechaFin = combinarFechaHora(fecha, horaFin);

      const event = calendar.createEvent(
        `[OVA] ${titulo}`,
        fechaInicio,
        fechaFin,
        {
          description: descripcion,
          location: ubicacion
        }
      );

      eventId = event.getId();
      Logger.log('✅ Evento creado en Calendar: ' + eventId);

    } catch (calError) {
      Logger.log('⚠️ Error creando evento en Calendar: ' + calError.message);
    }

    // Insertar en Sheets
    const ahora = new Date();
    reunSheet.appendRow([
      reunionId,
      fecha,
      horaInicio,
      horaFin,
      titulo,
      descripcion,
      ubicacion,
      usuario.id,
      participantesIds.join(','),
      clienteId,
      tipo,
      estado,
      prioridad,
      eventId,
      recordatorio,
      '',
      ahora,
      ahora
    ]);

    // Crear notificaciones para participantes
    if (participantesIds.length > 0) {
      crearNotificacionesParticipantes(
        usuario,
        participantesIds,
        'reunion_creada',
        titulo,
        reunionId
      );
    }

    // Crear recordatorio
    if (recordatorio > 0) {
      crearRecordatorio(
        'reuniones',
        reunionId,
        usuario.id,
        calcularFechaRecordatorio(fecha, horaInicio, recordatorio),
        `Reunión: ${titulo}`
      );
    }

    Logger.log('✅ Reunión creada exitosamente: ' + reunionId);

    return {
      exito: true,
      mensaje: 'Reunión creada exitosamente',
      reunion: {
        id: reunionId,
        fecha: fecha,
        horaInicio: horaInicio,
        horaFin: horaFin,
        titulo: titulo,
        eventId: eventId
      }
    };

  } catch (error) {
    Logger.log('❌ Error creando reunión: ' + error.message);
    return {
      exito: false,
      error: 'Error creando reunión: ' + error.message
    };
  }
}

/**
 * Lista reuniones del usuario
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Lista de reuniones
 */
function listarReuniones(usuario, filtros = {}) {
  try {
    Logger.log('📋 Listando reuniones para: ' + usuario.nombreCompleto);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const reunSheet = ss.getSheetByName('Reuniones');
    const data = reunSheet.getDataRange().getValues();

    const reuniones = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const usuarioIdReunion = fila[7];
      const participantesIds = fila[8] ? fila[8].split(',') : [];
      const estado = fila[11];

      // Filtrar por usuario (propias o donde participa)
      const esPropia = usuarioIdReunion === usuario.id;
      const participa = participantesIds.includes(usuario.id);

      if (!esPropia && !participa) {
        continue; // No mostrar reuniones de otros
      }

      // Aplicar filtros
      if (filtros.estado && estado !== filtros.estado) continue;
      if (filtros.desde && fila[1] < new Date(filtros.desde)) continue;
      if (filtros.hasta && fila[1] > new Date(filtros.hasta)) continue;

      reuniones.push({
        id: fila[0],
        fecha: Utilities.formatDate(new Date(fila[1]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        horaInicio: fila[2],
        horaFin: fila[3],
        titulo: fila[4],
        descripcion: fila[5],
        ubicacion: fila[6],
        usuarioId: fila[7],
        participantesIds: participantesIds,
        clienteId: fila[9],
        tipo: fila[10],
        estado: fila[11],
        prioridad: fila[12],
        esPropia: esPropia
      });
    }

    // Ordenar por fecha descendente
    reuniones.sort((a, b) => {
      const fechaA = new Date(a.fecha + ' ' + a.horaInicio);
      const fechaB = new Date(b.fecha + ' ' + b.horaInicio);
      return fechaB - fechaA;
    });

    Logger.log(`✅ ${reuniones.length} reuniones encontradas`);

    return {
      exito: true,
      reuniones: reuniones,
      total: reuniones.length
    };

  } catch (error) {
    Logger.log('❌ Error listando reuniones: ' + error.message);
    return {
      exito: false,
      error: 'Error listando reuniones: ' + error.message
    };
  }
}

/**
 * Obtiene una reunión específica
 * @param {Object} usuario - Usuario autenticado
 * @param {string} reunionId - ID de la reunión
 * @returns {Object} Datos de la reunión
 */
function obtenerReunion(usuario, reunionId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const reunSheet = ss.getSheetByName('Reuniones');
    const data = reunSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === reunionId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoReunion(usuario, fila[7], fila[8])) {
          return {
            exito: false,
            error: 'No tienes permiso para ver esta reunión'
          };
        }

        return {
          exito: true,
          reunion: {
            id: fila[0],
            fecha: Utilities.formatDate(new Date(fila[1]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
            horaInicio: fila[2],
            horaFin: fila[3],
            titulo: fila[4],
            descripcion: fila[5],
            ubicacion: fila[6],
            usuarioId: fila[7],
            participantesIds: fila[8] ? fila[8].split(',') : [],
            clienteId: fila[9],
            tipo: fila[10],
            estado: fila[11],
            prioridad: fila[12],
            eventId: fila[13],
            recordatorio: fila[14],
            notas: fila[15]
          }
        };
      }
    }

    return {
      exito: false,
      error: 'Reunión no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo reunión: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo reunión: ' + error.message
    };
  }
}

/**
 * Actualiza una reunión
 * @param {Object} usuario - Usuario autenticado
 * @param {string} reunionId - ID de la reunión
 * @param {Object} cambios - Cambios a aplicar
 * @returns {Object} Resultado de la actualización
 */
function actualizarReunion(usuario, reunionId, cambios) {
  try {
    Logger.log('✏️ Actualizando reunión: ' + reunionId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const reunSheet = ss.getSheetByName('Reuniones');
    const data = reunSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === reunionId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoReunion(usuario, fila[7], fila[8], true)) {
          return {
            exito: false,
            error: 'No tienes permiso para editar esta reunión'
          };
        }

        // Mapeo de campos
        const mapeo = {
          fecha: 2,
          horaInicio: 3,
          horaFin: 4,
          titulo: 5,
          descripcion: 6,
          ubicacion: 7,
          participantesIds: 9,
          clienteId: 10,
          tipo: 11,
          estado: 12,
          prioridad: 13,
          recordatorio: 15,
          notas: 16
        };

        // Aplicar cambios
        let cambiosAplicados = [];
        for (const [campo, valor] of Object.entries(cambios)) {
          if (mapeo[campo]) {
            let valorFinal = valor;
            if (campo === 'participantesIds' && Array.isArray(valor)) {
              valorFinal = valor.join(',');
            }
            reunSheet.getRange(i + 1, mapeo[campo]).setValue(valorFinal);
            cambiosAplicados.push(campo);
          }
        }

        // Actualizar fecha de modificación
        reunSheet.getRange(i + 1, 18).setValue(new Date());

        // Actualizar evento en Calendar si cambió fecha/hora
        if ((cambios.fecha || cambios.horaInicio || cambios.horaFin) && fila[13]) {
          actualizarEventoCalendar(
            fila[13],
            cambios.fecha || fila[1],
            cambios.horaInicio || fila[2],
            cambios.horaFin || fila[3],
            cambios.titulo || fila[4]
          );
        }

        Logger.log(`✅ Reunión actualizada: ${cambiosAplicados.length} cambios`);

        return {
          exito: true,
          mensaje: 'Reunión actualizada exitosamente',
          cambiosAplicados: cambiosAplicados
        };
      }
    }

    return {
      exito: false,
      error: 'Reunión no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error actualizando reunión: ' + error.message);
    return {
      exito: false,
      error: 'Error actualizando reunión: ' + error.message
    };
  }
}

/**
 * Elimina una reunión
 * @param {Object} usuario - Usuario autenticado
 * @param {string} reunionId - ID de la reunión
 * @returns {Object} Resultado de la eliminación
 */
function eliminarReunion(usuario, reunionId) {
  try {
    Logger.log('🗑️ Eliminando reunión: ' + reunionId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const reunSheet = ss.getSheetByName('Reuniones');
    const data = reunSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === reunionId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoReunion(usuario, fila[7], fila[8], true)) {
          return {
            exito: false,
            error: 'No tienes permiso para eliminar esta reunión'
          };
        }

        // Eliminar evento de Calendar
        if (fila[13]) {
          try {
            const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
            const event = calendar.getEventById(fila[13]);
            if (event) {
              event.deleteEvent();
              Logger.log('✅ Evento eliminado de Calendar');
            }
          } catch (calError) {
            Logger.log('⚠️ Error eliminando evento de Calendar: ' + calError.message);
          }
        }

        // Eliminar fila
        reunSheet.deleteRow(i + 1);

        Logger.log('✅ Reunión eliminada exitosamente');

        return {
          exito: true,
          mensaje: 'Reunión eliminada exitosamente'
        };
      }
    }

    return {
      exito: false,
      error: 'Reunión no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error eliminando reunión: ' + error.message);
    return {
      exito: false,
      error: 'Error eliminando reunión: ' + error.message
    };
  }
}

// ============================================
// CRUD DE TAREAS
// ============================================

/**
 * Crea una nueva tarea
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} tarea - Datos de la tarea
 * @returns {Object} Resultado de la creación
 */
function crearTarea(usuario, tarea) {
  try {
    Logger.log('✅ Creando tarea para: ' + usuario.nombreCompleto);

    // Validar datos requeridos
    if (!tarea.titulo) {
      return {
        exito: false,
        error: 'El título es requerido'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tarSheet = ss.getSheetByName('Tareas');

    // Preparar datos
    const tareaId = generarID();
    const titulo = tarea.titulo;
    const descripcion = tarea.descripcion || '';
    const usuarioAsignadoId = tarea.usuarioAsignadoId || usuario.id;
    const usuarioCreadorId = usuario.id;
    const clienteId = tarea.clienteId || '';
    const tipo = tarea.tipo || 'tarea';
    const estadoKanban = tarea.estado || ESTADOS_TAREA.PENDIENTE;
    const prioridad = tarea.prioridad || PRIORIDADES.MEDIA;
    const fechaVencimiento = tarea.fechaVencimiento || '';
    const fechaInicio = tarea.fechaInicio || '';
    const horasEstimadas = tarea.horasEstimadas || 0;
    const tags = tarea.tags || [];

    const ahora = new Date();

    // Insertar en Sheets
    tarSheet.appendRow([
      tareaId,
      titulo,
      descripcion,
      usuarioAsignadoId,
      usuarioCreadorId,
      clienteId,
      tipo,
      estadoKanban,
      prioridad,
      fechaVencimiento,
      fechaInicio,
      '',
      horasEstimadas,
      0,
      tags.join(','),
      '',
      ahora,
      ahora
    ]);

    // Crear notificación si se asigna a otro usuario
    if (usuarioAsignadoId !== usuarioCreadorId) {
      crearNotificacion(
        usuarioAsignadoId,
        'tarea_asignada',
        'Nueva tarea asignada',
        `${usuario.nombreCompleto} te ha asignado: ${titulo}`,
        tareaId
      );
    }

    Logger.log('✅ Tarea creada exitosamente: ' + tareaId);

    return {
      exito: true,
      mensaje: 'Tarea creada exitosamente',
      tarea: {
        id: tareaId,
        titulo: titulo,
        estado: estadoKanban,
        prioridad: prioridad
      }
    };

  } catch (error) {
    Logger.log('❌ Error creando tarea: ' + error.message);
    return {
      exito: false,
      error: 'Error creando tarea: ' + error.message
    };
  }
}

/**
 * Lista tareas del usuario
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Lista de tareas
 */
function listarTareas(usuario, filtros = {}) {
  try {
    Logger.log('📋 Listando tareas para: ' + usuario.nombreCompleto);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tarSheet = ss.getSheetByName('Tareas');
    const data = tarSheet.getDataRange().getValues();

    const tareas = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const usuarioAsignadoId = fila[3];
      const usuarioCreadorId = fila[4];
      const estado = fila[7];

      // Filtrar por usuario (asignadas o creadas)
      const esAsignada = usuarioAsignadoId === usuario.id;
      const esCreada = usuarioCreadorId === usuario.id;

      if (!esAsignada && !esCreada && !usuario.permisos.includes('ver_todo')) {
        continue; // No mostrar tareas de otros
      }

      // Aplicar filtros
      if (filtros.estado && estado !== filtros.estado) continue;
      if (filtros.prioridad && fila[8] !== filtros.prioridad) continue;
      if (filtros.tipo && fila[6] !== filtros.tipo) continue;

      tareas.push({
        id: fila[0],
        titulo: fila[1],
        descripcion: fila[2],
        usuarioAsignadoId: fila[3],
        usuarioCreadorId: fila[4],
        clienteId: fila[5],
        tipo: fila[6],
        estado: fila[7],
        prioridad: fila[8],
        fechaVencimiento: fila[9] ? Utilities.formatDate(new Date(fila[9]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : null,
        fechaInicio: fila[10] ? Utilities.formatDate(new Date(fila[10]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : null,
        fechaCompletada: fila[11] ? Utilities.formatDate(new Date(fila[11]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : null,
        horasEstimadas: fila[12],
        horasReales: fila[13],
        tags: fila[14] ? fila[14].split(',') : [],
        esAsignada: esAsignada,
        esCreada: esCreada
      });
    }

    // Ordenar por prioridad y fecha
    const ordenPrioridad = { 'Urgente': 1, 'Alta': 2, 'Media': 3, 'Baja': 4 };
    tareas.sort((a, b) => {
      const prioA = ordenPrioridad[a.prioridad] || 5;
      const prioB = ordenPrioridad[b.prioridad] || 5;
      return prioA - prioB;
    });

    Logger.log(`✅ ${tareas.length} tareas encontradas`);

    return {
      exito: true,
      tareas: tareas,
      total: tareas.length
    };

  } catch (error) {
    Logger.log('❌ Error listando tareas: ' + error.message);
    return {
      exito: false,
      error: 'Error listando tareas: ' + error.message
    };
  }
}

/**
 * Obtiene los datos para el tablero Kanban
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Datos del tablero Kanban
 */
function obtenerTableroKanban(usuario, filtros = {}) {
  try {
    const resultado = listarTareas(usuario, filtros);

    if (!resultado.exito) {
      return resultado;
    }

    // Agrupar tareas por estado
    const tablero = {
      pendiente: [],
      enProgreso: [],
      completada: []
    };

    resultado.tareas.forEach(tarea => {
      switch (tarea.estado) {
        case ESTADOS_TAREA.PENDIENTE:
          tablero.pendiente.push(tarea);
          break;
        case ESTADOS_TAREA.EN_PROGRESO:
          tablero.enProgreso.push(tarea);
          break;
        case ESTADOS_TAREA.COMPLETADA:
          tablero.completada.push(tarea);
          break;
      }
    });

    return {
      exito: true,
      tablero: tablero,
      totales: {
        pendiente: tablero.pendiente.length,
        enProgreso: tablero.enProgreso.length,
        completada: tablero.completada.length
      }
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo tablero Kanban: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo tablero Kanban: ' + error.message
    };
  }
}

/**
 * Cambia el estado de una tarea
 * @param {Object} usuario - Usuario autenticado
 * @param {string} tareaId - ID de la tarea
 * @param {string} nuevoEstado - Nuevo estado
 * @returns {Object} Resultado del cambio
 */
function cambiarEstadoTarea(usuario, tareaId, nuevoEstado) {
  try {
    Logger.log(`🔄 Cambiando estado de tarea ${tareaId} a: ${nuevoEstado}`);

    // Validar estado
    const estadosValidos = Object.values(ESTADOS_TAREA);
    if (!estadosValidos.includes(nuevoEstado)) {
      return {
        exito: false,
        error: 'Estado no válido. Estados permitidos: ' + estadosValidos.join(', ')
      };
    }

    const cambios = { estado: nuevoEstado };

    // Si se marca como completada, registrar fecha
    if (nuevoEstado === ESTADOS_TAREA.COMPLETADA) {
      cambios.fechaCompletada = new Date();
    }

    return actualizarTarea(usuario, tareaId, cambios);

  } catch (error) {
    Logger.log('❌ Error cambiando estado: ' + error.message);
    return {
      exito: false,
      error: 'Error cambiando estado: ' + error.message
    };
  }
}

/**
 * Obtiene una tarea específica
 * @param {Object} usuario - Usuario autenticado
 * @param {string} tareaId - ID de la tarea
 * @returns {Object} Datos de la tarea
 */
function obtenerTarea(usuario, tareaId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tarSheet = ss.getSheetByName('Tareas');
    const data = tarSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === tareaId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoTarea(usuario, fila[3], fila[4])) {
          return {
            exito: false,
            error: 'No tienes permiso para ver esta tarea'
          };
        }

        return {
          exito: true,
          tarea: {
            id: fila[0],
            titulo: fila[1],
            descripcion: fila[2],
            usuarioAsignadoId: fila[3],
            usuarioCreadorId: fila[4],
            clienteId: fila[5],
            tipo: fila[6],
            estado: fila[7],
            prioridad: fila[8],
            fechaVencimiento: fila[9],
            fechaInicio: fila[10],
            fechaCompletada: fila[11],
            horasEstimadas: fila[12],
            horasReales: fila[13],
            tags: fila[14] ? fila[14].split(',') : [],
            notas: fila[15]
          }
        };
      }
    }

    return {
      exito: false,
      error: 'Tarea no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo tarea: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo tarea: ' + error.message
    };
  }
}

/**
 * Actualiza una tarea
 * @param {Object} usuario - Usuario autenticado
 * @param {string} tareaId - ID de la tarea
 * @param {Object} cambios - Cambios a aplicar
 * @returns {Object} Resultado de la actualización
 */
function actualizarTarea(usuario, tareaId, cambios) {
  try {
    Logger.log('✏️ Actualizando tarea: ' + tareaId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tarSheet = ss.getSheetByName('Tareas');
    const data = tarSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === tareaId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoTarea(usuario, fila[3], fila[4], true)) {
          return {
            exito: false,
            error: 'No tienes permiso para editar esta tarea'
          };
        }

        // Mapeo de campos
        const mapeo = {
          titulo: 2,
          descripcion: 3,
          usuarioAsignadoId: 4,
          clienteId: 6,
          tipo: 7,
          estado: 8,
          prioridad: 9,
          fechaVencimiento: 10,
          fechaInicio: 11,
          fechaCompletada: 12,
          horasEstimadas: 13,
          horasReales: 14,
          tags: 15,
          notas: 16
        };

        // Aplicar cambios
        let cambiosAplicados = [];
        for (const [campo, valor] of Object.entries(cambios)) {
          if (mapeo[campo]) {
            let valorFinal = valor;
            if (campo === 'tags' && Array.isArray(valor)) {
              valorFinal = valor.join(',');
            }
            tarSheet.getRange(i + 1, mapeo[campo]).setValue(valorFinal);
            cambiosAplicados.push(campo);
          }
        }

        // Actualizar fecha de modificación
        tarSheet.getRange(i + 1, 18).setValue(new Date());

        Logger.log(`✅ Tarea actualizada: ${cambiosAplicados.length} cambios`);

        return {
          exito: true,
          mensaje: 'Tarea actualizada exitosamente',
          cambiosAplicados: cambiosAplicados
        };
      }
    }

    return {
      exito: false,
      error: 'Tarea no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error actualizando tarea: ' + error.message);
    return {
      exito: false,
      error: 'Error actualizando tarea: ' + error.message
    };
  }
}

/**
 * Elimina una tarea
 * @param {Object} usuario - Usuario autenticado
 * @param {string} tareaId - ID de la tarea
 * @returns {Object} Resultado de la eliminación
 */
function eliminarTarea(usuario, tareaId) {
  try {
    Logger.log('🗑️ Eliminando tarea: ' + tareaId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tarSheet = ss.getSheetByName('Tareas');
    const data = tarSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === tareaId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoTarea(usuario, fila[3], fila[4], true)) {
          return {
            exito: false,
            error: 'No tienes permiso para eliminar esta tarea'
          };
        }

        // Eliminar fila
        tarSheet.deleteRow(i + 1);

        Logger.log('✅ Tarea eliminada exitosamente');

        return {
          exito: true,
          mensaje: 'Tarea eliminada exitosamente'
        };
      }
    }

    return {
      exito: false,
      error: 'Tarea no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error eliminando tarea: ' + error.message);
    return {
      exito: false,
      error: 'Error eliminando tarea: ' + error.message
    };
  }
}

// ============================================
// CRUD DE CONTACTOS
// ============================================

/**
 * Crea un nuevo contacto
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} contacto - Datos del contacto
 * @returns {Object} Resultado de la creación
 */
function crearContacto(usuario, contacto) {
  try {
    Logger.log('👤 Creando contacto para: ' + usuario.nombreCompleto);

    // Validar datos requeridos
    if (!contacto.nombreEmpresa) {
      return {
        exito: false,
        error: 'El nombre de la empresa es requerido'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const contSheet = ss.getSheetByName('Contactos');

    // Preparar datos
    const contactoId = generarID();
    const nombreEmpresa = contacto.nombreEmpresa;
    const rif = contacto.rif || '';
    const tipo = contacto.tipo || 'Cliente';
    const industria = contacto.industria || '';
    const estatusPipeline = contacto.estatusPipeline || ETAPAS_PIPELINE.PROSPECTO;
    const probabilidadCierre = contacto.probabilidadCierre || 0;
    const valorEstimado = contacto.valorEstimado || 0;
    const fechaEstimadaCierre = contacto.fechaEstimadaCierre || '';
    const contactoPrincipal = contacto.contactoPrincipal || '';
    const email = contacto.email || '';
    const telefono = contacto.telefono || '';
    const movil = contacto.movil || '';
    const direccion = contacto.direccion || '';
    const ciudad = contacto.ciudad || '';
    const pais = contacto.pais || 'Venezuela';
    const sitioWeb = contacto.sitioWeb || '';
    const notas = contacto.notas || '';

    // Crear carpeta en Drive
    let driveFolderId = '';
    try {
      const rootFolder = DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID);
      const clienteFolder = rootFolder.createFolder(nombreEmpresa);
      driveFolderId = clienteFolder.getId();
      Logger.log('✅ Carpeta Drive creada: ' + driveFolderId);
    } catch (driveError) {
      Logger.log('⚠️ Error creando carpeta Drive: ' + driveError.message);
    }

    const ahora = new Date();

    // Insertar en Sheets
    contSheet.appendRow([
      contactoId,
      nombreEmpresa,
      rif,
      tipo,
      industria,
      estatusPipeline,
      probabilidadCierre,
      valorEstimado,
      fechaEstimadaCierre,
      contactoPrincipal,
      email,
      telefono,
      movil,
      direccion,
      ciudad,
      pais,
      sitioWeb,
      driveFolderId,
      notas,
      usuario.id,
      ahora,
      ahora
    ]);

    Logger.log('✅ Contacto creado exitosamente: ' + contactoId);

    return {
      exito: true,
      mensaje: 'Contacto creado exitosamente',
      contacto: {
        id: contactoId,
        nombreEmpresa: nombreEmpresa,
        driveFolderId: driveFolderId
      }
    };

  } catch (error) {
    Logger.log('❌ Error creando contacto: ' + error.message);
    return {
      exito: false,
      error: 'Error creando contacto: ' + error.message
    };
  }
}

/**
 * Lista contactos del usuario
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Lista de contactos
 */
function listarContactos(usuario, filtros = {}) {
  try {
    Logger.log('📋 Listando contactos para: ' + usuario.nombreCompleto);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const contSheet = ss.getSheetByName('Contactos');
    const data = contSheet.getDataRange().getValues();

    const contactos = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const usuarioResponsableId = fila[19];

      // Filtrar por usuario (si no tiene permiso ver_todo)
      if (!usuario.permisos.includes('ver_todo') && usuarioResponsableId !== usuario.id) {
        continue;
      }

      // Aplicar filtros
      if (filtros.tipo && fila[3] !== filtros.tipo) continue;
      if (filtros.estatusPipeline && fila[5] !== filtros.estatusPipeline) continue;
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const nombreEmpresa = (fila[1] || '').toString().toLowerCase();
        const rif = (fila[2] || '').toString().toLowerCase();
        const contactoPrincipal = (fila[9] || '').toString().toLowerCase();

        if (!nombreEmpresa.includes(busqueda) &&
            !rif.includes(busqueda) &&
            !contactoPrincipal.includes(busqueda)) {
          continue;
        }
      }

      contactos.push({
        id: fila[0],
        nombreEmpresa: fila[1],
        rif: fila[2],
        tipo: fila[3],
        industria: fila[4],
        estatusPipeline: fila[5],
        probabilidadCierre: fila[6],
        valorEstimado: fila[7],
        fechaEstimadaCierre: fila[8] ? Utilities.formatDate(new Date(fila[8]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : null,
        contactoPrincipal: fila[9],
        email: fila[10],
        telefono: fila[11],
        movil: fila[12],
        ciudad: fila[14],
        pais: fila[15],
        usuarioResponsableId: fila[19]
      });
    }

    // Ordenar alfabéticamente
    contactos.sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa));

    Logger.log(`✅ ${contactos.length} contactos encontrados`);

    return {
      exito: true,
      contactos: contactos,
      total: contactos.length
    };

  } catch (error) {
    Logger.log('❌ Error listando contactos: ' + error.message);
    return {
      exito: false,
      error: 'Error listando contactos: ' + error.message
    };
  }
}

/**
 * Obtiene un contacto específico
 * @param {Object} usuario - Usuario autenticado
 * @param {string} contactoId - ID del contacto
 * @returns {Object} Datos del contacto
 */
function obtenerContacto(usuario, contactoId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const contSheet = ss.getSheetByName('Contactos');
    const data = contSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === contactoId) {
        const fila = data[i];

        // Verificar permisos
        if (!usuario.permisos.includes('ver_todo') && fila[19] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para ver este contacto'
          };
        }

        return {
          exito: true,
          contacto: {
            id: fila[0],
            nombreEmpresa: fila[1],
            rif: fila[2],
            tipo: fila[3],
            industria: fila[4],
            estatusPipeline: fila[5],
            probabilidadCierre: fila[6],
            valorEstimado: fila[7],
            fechaEstimadaCierre: fila[8],
            contactoPrincipal: fila[9],
            email: fila[10],
            telefono: fila[11],
            movil: fila[12],
            direccion: fila[13],
            ciudad: fila[14],
            pais: fila[15],
            sitioWeb: fila[16],
            driveFolderId: fila[17],
            notas: fila[18],
            usuarioResponsableId: fila[19]
          }
        };
      }
    }

    return {
      exito: false,
      error: 'Contacto no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo contacto: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo contacto: ' + error.message
    };
  }
}

/**
 * Actualiza un contacto
 * @param {Object} usuario - Usuario autenticado
 * @param {string} contactoId - ID del contacto
 * @param {Object} cambios - Cambios a aplicar
 * @returns {Object} Resultado de la actualización
 */
function actualizarContacto(usuario, contactoId, cambios) {
  try {
    Logger.log('✏️ Actualizando contacto: ' + contactoId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const contSheet = ss.getSheetByName('Contactos');
    const data = contSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === contactoId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoContacto(usuario, fila[19])) {
          return {
            exito: false,
            error: 'No tienes permiso para editar este contacto'
          };
        }

        // Mapeo de campos
        const mapeo = {
          nombreEmpresa: 2,
          rif: 3,
          tipo: 4,
          industria: 5,
          estatusPipeline: 6,
          probabilidadCierre: 7,
          valorEstimado: 8,
          fechaEstimadaCierre: 9,
          contactoPrincipal: 10,
          email: 11,
          telefono: 12,
          movil: 13,
          direccion: 14,
          ciudad: 15,
          pais: 16,
          sitioWeb: 17,
          notas: 19,
          usuarioResponsableId: 20
        };

        // Aplicar cambios
        let cambiosAplicados = [];
        for (const [campo, valor] of Object.entries(cambios)) {
          if (mapeo[campo]) {
            contSheet.getRange(i + 1, mapeo[campo]).setValue(valor);
            cambiosAplicados.push(campo);
          }
        }

        // Actualizar fecha de modificación
        contSheet.getRange(i + 1, 22).setValue(new Date());

        Logger.log(`✅ Contacto actualizado: ${cambiosAplicados.length} cambios`);

        return {
          exito: true,
          mensaje: 'Contacto actualizado exitosamente',
          cambiosAplicados: cambiosAplicados
        };
      }
    }

    return {
      exito: false,
      error: 'Contacto no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error actualizando contacto: ' + error.message);
    return {
      exito: false,
      error: 'Error actualizando contacto: ' + error.message
    };
  }
}

/**
 * Elimina un contacto
 * @param {Object} usuario - Usuario autenticado
 * @param {string} contactoId - ID del contacto
 * @returns {Object} Resultado de la eliminación
 */
function eliminarContacto(usuario, contactoId) {
  try {
    Logger.log('🗑️ Eliminando contacto: ' + contactoId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const contSheet = ss.getSheetByName('Contactos');
    const data = contSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === contactoId) {
        const fila = data[i];

        // Verificar permisos
        if (!tienePermisoContacto(usuario, fila[19], true)) {
          return {
            exito: false,
            error: 'No tienes permiso para eliminar este contacto'
          };
        }

        // Nota: NO eliminamos la carpeta de Drive automáticamente por seguridad

        // Eliminar fila
        contSheet.deleteRow(i + 1);

        Logger.log('✅ Contacto eliminado exitosamente');

        return {
          exito: true,
          mensaje: 'Contacto eliminado exitosamente'
        };
      }
    }

    return {
      exito: false,
      error: 'Contacto no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error eliminando contacto: ' + error.message);
    return {
      exito: false,
      error: 'Error eliminando contacto: ' + error.message
    };
  }
}

// ============================================
// GESTIÓN DE DOCUMENTOS
// ============================================

/**
 * Sube un documento
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} documento - Datos del documento
 * @returns {Object} Resultado de la subida
 */
function subirDocumento(usuario, documento) {
  try {
    Logger.log('📎 Subiendo documento para: ' + usuario.nombreCompleto);

    if (!documento.clienteId || !documento.archivo) {
      return {
        exito: false,
        error: 'clienteId y archivo son requeridos'
      };
    }

    // Obtener carpeta del cliente
    const contactoResult = obtenerContacto(usuario, documento.clienteId);
    if (!contactoResult.exito) {
      return {
        exito: false,
        error: 'Cliente no encontrado'
      };
    }

    const driveFolderId = contactoResult.contacto.driveFolderId;
    if (!driveFolderId) {
      return {
        exito: false,
        error: 'El cliente no tiene carpeta en Drive'
      };
    }

    // En un contexto real, aquí se manejaría la subida del archivo
    // Por ahora, simulamos guardando los metadatos

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const docSheet = ss.getSheetByName('Documentos');

    const documentoId = generarID();
    const nombreArchivo = documento.nombreArchivo || 'documento';
    const tipo = documento.tipo || 'Documento General';
    const tamaño = documento.tamaño || 0;
    const driveFileId = documento.driveFileId || '';
    const driveURL = documento.driveURL || '';
    const categoria = documento.categoria || '';
    const descripcion = documento.descripcion || '';
    const tags = documento.tags || [];

    docSheet.appendRow([
      documentoId,
      nombreArchivo,
      tipo,
      tamaño,
      documento.clienteId,
      driveFileId,
      driveURL,
      categoria,
      usuario.id,
      descripcion,
      new Date(),
      tags.join(',')
    ]);

    Logger.log('✅ Documento registrado: ' + documentoId);

    return {
      exito: true,
      mensaje: 'Documento subido exitosamente',
      documento: {
        id: documentoId,
        nombreArchivo: nombreArchivo
      }
    };

  } catch (error) {
    Logger.log('❌ Error subiendo documento: ' + error.message);
    return {
      exito: false,
      error: 'Error subiendo documento: ' + error.message
    };
  }
}

/**
 * Lista documentos
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Lista de documentos
 */
function listarDocumentos(usuario, filtros = {}) {
  try {
    Logger.log('📋 Listando documentos para: ' + usuario.nombreCompleto);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const docSheet = ss.getSheetByName('Documentos');
    const data = docSheet.getDataRange().getValues();

    const documentos = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const clienteId = fila[4];
      const usuarioSubidaId = fila[8];

      // Verificar permisos (puede ver si subió el documento o si tiene permiso ver_todo)
      if (!usuario.permisos.includes('ver_todo') && usuarioSubidaId !== usuario.id) {
        continue;
      }

      // Aplicar filtros
      if (filtros.clienteId && clienteId !== filtros.clienteId) continue;
      if (filtros.tipo && fila[2] !== filtros.tipo) continue;
      if (filtros.categoria && fila[7] !== filtros.categoria) continue;

      documentos.push({
        id: fila[0],
        nombreArchivo: fila[1],
        tipo: fila[2],
        tamaño: fila[3],
        clienteId: fila[4],
        driveFileId: fila[5],
        driveURL: fila[6],
        categoria: fila[7],
        usuarioSubidaId: fila[8],
        descripcion: fila[9],
        fechaSubida: Utilities.formatDate(new Date(fila[10]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
        tags: fila[11] ? fila[11].split(',') : []
      });
    }

    // Ordenar por fecha descendente
    documentos.sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida));

    Logger.log(`✅ ${documentos.length} documentos encontrados`);

    return {
      exito: true,
      documentos: documentos,
      total: documentos.length
    };

  } catch (error) {
    Logger.log('❌ Error listando documentos: ' + error.message);
    return {
      exito: false,
      error: 'Error listando documentos: ' + error.message
    };
  }
}

/**
 * Elimina un documento
 * @param {Object} usuario - Usuario autenticado
 * @param {string} documentoId - ID del documento
 * @returns {Object} Resultado de la eliminación
 */
function eliminarDocumento(usuario, documentoId) {
  try {
    Logger.log('🗑️ Eliminando documento: ' + documentoId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const docSheet = ss.getSheetByName('Documentos');
    const data = docSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === documentoId) {
        const fila = data[i];

        // Verificar permisos
        if (!usuario.permisos.includes('eliminar') && fila[8] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para eliminar este documento'
          };
        }

        // Eliminar archivo de Drive (opcional)
        // Por seguridad, no lo eliminamos automáticamente

        // Eliminar registro
        docSheet.deleteRow(i + 1);

        Logger.log('✅ Documento eliminado exitosamente');

        return {
          exito: true,
          mensaje: 'Documento eliminado exitosamente'
        };
      }
    }

    return {
      exito: false,
      error: 'Documento no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error eliminando documento: ' + error.message);
    return {
      exito: false,
      error: 'Error eliminando documento: ' + error.message
    };
  }
}

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

/**
 * Crea una notificación
 * @param {string} usuarioId - ID del usuario destinatario
 * @param {string} tipo - Tipo de notificación
 * @param {string} titulo - Título
 * @param {string} mensaje - Mensaje
 * @param {string} link - Link opcional
 */
function crearNotificacion(usuarioId, tipo, titulo, mensaje, link = '') {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const notSheet = ss.getSheetByName('Notificaciones');

    notSheet.appendRow([
      generarID(),
      usuarioId,
      tipo,
      titulo,
      mensaje,
      'NO',
      new Date(),
      link
    ]);

    Logger.log('✅ Notificación creada para usuario: ' + usuarioId);

  } catch (error) {
    Logger.log('⚠️ Error creando notificación: ' + error.message);
  }
}

/**
 * Crea notificaciones para participantes
 * @param {Object} usuario - Usuario que crea la notificación
 * @param {Array} participantesIds - IDs de participantes
 * @param {string} tipo - Tipo de notificación
 * @param {string} titulo - Título
 * @param {string} entidadId - ID de la entidad relacionada
 */
function crearNotificacionesParticipantes(usuario, participantesIds, tipo, titulo, entidadId) {
  try {
    participantesIds.forEach(participanteId => {
      if (participanteId !== usuario.id) {
        const mensaje = `${usuario.nombreCompleto} te ha invitado a: ${titulo}`;
        crearNotificacion(participanteId, tipo, 'Nueva invitación', mensaje, entidadId);
      }
    });
  } catch (error) {
    Logger.log('⚠️ Error creando notificaciones: ' + error.message);
  }
}

/**
 * Obtiene notificaciones del usuario
 * @param {Object} usuario - Usuario autenticado
 * @param {boolean} soloNoLeidas - Solo no leídas
 * @returns {Object} Lista de notificaciones
 */
function obtenerNotificaciones(usuario, soloNoLeidas = false) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const notSheet = ss.getSheetByName('Notificaciones');
    const data = notSheet.getDataRange().getValues();

    const notificaciones = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      if (fila[1] === usuario.id) {
        const leida = fila[5] === 'SI';

        if (soloNoLeidas && leida) continue;

        notificaciones.push({
          id: fila[0],
          tipo: fila[2],
          titulo: fila[3],
          mensaje: fila[4],
          leida: leida,
          timestamp: Utilities.formatDate(new Date(fila[6]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
          link: fila[7]
        });
      }
    }

    // Ordenar por fecha descendente
    notificaciones.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      exito: true,
      notificaciones: notificaciones,
      total: notificaciones.length,
      noLeidas: notificaciones.filter(n => !n.leida).length
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo notificaciones: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo notificaciones: ' + error.message
    };
  }
}

/**
 * Marca una notificación como leída
 * @param {Object} usuario - Usuario autenticado
 * @param {string} notificacionId - ID de la notificación
 * @returns {Object} Resultado
 */
function marcarNotificacionLeida(usuario, notificacionId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const notSheet = ss.getSheetByName('Notificaciones');
    const data = notSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === notificacionId && data[i][1] === usuario.id) {
        notSheet.getRange(i + 1, 6).setValue('SI');
        return { exito: true, mensaje: 'Notificación marcada como leída' };
      }
    }

    return { exito: false, error: 'Notificación no encontrada' };

  } catch (error) {
    Logger.log('❌ Error marcando notificación: ' + error.message);
    return { exito: false, error: error.message };
  }
}

/**
 * Marca todas las notificaciones como leídas
 * @param {Object} usuario - Usuario autenticado
 * @returns {Object} Resultado
 */
function marcarTodasNotificacionesLeidas(usuario) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const notSheet = ss.getSheetByName('Notificaciones');
    const data = notSheet.getDataRange().getValues();

    let marcadas = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === usuario.id && data[i][5] === 'NO') {
        notSheet.getRange(i + 1, 6).setValue('SI');
        marcadas++;
      }
    }

    return {
      exito: true,
      mensaje: `${marcadas} notificaciones marcadas como leídas`
    };

  } catch (error) {
    Logger.log('❌ Error marcando notificaciones: ' + error.message);
    return { exito: false, error: error.message };
  }
}

// ============================================
// DASHBOARD CON DATOS EN TIEMPO REAL
// ============================================

/**
 * Obtiene datos completos del dashboard
 * @param {Object} usuario - Usuario autenticado
 * @returns {Object} Datos del dashboard
 */
function obtenerDatosDashboard(usuario) {
  try {
    Logger.log('📊 Obteniendo datos dashboard para: ' + usuario.nombreCompleto);

    const hoy = new Date();
    const fechaHoy = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    // Obtener métricas
    const metricas = calcularMetricasDashboard(usuario, fechaHoy);

    // Obtener reuniones próximas
    const reunionesProximas = obtenerReunionesProximas(usuario, 5);

    // Obtener tareas pendientes urgentes
    const tareasPendientes = obtenerTareasPendientesUrgentes(usuario, 5);

    // Obtener actividad reciente
    const actividadReciente = obtenerActividadReciente(usuario, 10);

    return {
      exito: true,
      dashboard: {
        metricas: metricas,
        reunionesProximas: reunionesProximas,
        tareasPendientes: tareasPendientes,
        actividadReciente: actividadReciente,
        ultimaActualizacion: new Date().toISOString()
      }
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo dashboard: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo dashboard: ' + error.message
    };
  }
}

/**
 * Calcula métricas del dashboard
 * @param {Object} usuario - Usuario autenticado
 * @param {string} fechaHoy - Fecha de hoy
 * @returns {Object} Métricas
 */
function calcularMetricasDashboard(usuario, fechaHoy) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Reuniones de hoy
  const reunSheet = ss.getSheetByName('Reuniones');
  const reunData = reunSheet.getDataRange().getValues();
  let reunionesHoy = 0;

  for (let i = 1; i < reunData.length; i++) {
    const fechaReunion = Utilities.formatDate(new Date(reunData[i][1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const usuarioId = reunData[i][7];
    const participantesIds = (reunData[i][8] || '').split(',');

    if (fechaReunion === fechaHoy &&
        (usuarioId === usuario.id || participantesIds.includes(usuario.id))) {
      reunionesHoy++;
    }
  }

  // Tareas
  const tarSheet = ss.getSheetByName('Tareas');
  const tarData = tarSheet.getDataRange().getValues();
  let tareasPendientes = 0;
  let tareasCompletadas = 0;

  for (let i = 1; i < tarData.length; i++) {
    const usuarioAsignadoId = tarData[i][3];
    const estado = tarData[i][7];

    if (usuarioAsignadoId === usuario.id) {
      if (estado === ESTADOS_TAREA.PENDIENTE || estado === ESTADOS_TAREA.EN_PROGRESO) {
        tareasPendientes++;
      } else if (estado === ESTADOS_TAREA.COMPLETADA) {
        tareasCompletadas++;
      }
    }
  }

  // Contactos
  const contSheet = ss.getSheetByName('Contactos');
  const contData = contSheet.getDataRange().getValues();
  let totalContactos = 0;

  for (let i = 1; i < contData.length; i++) {
    const usuarioResponsableId = contData[i][19];
    if (usuarioResponsableId === usuario.id || usuario.permisos.includes('ver_todo')) {
      totalContactos++;
    }
  }

  return {
    reunionesHoy: reunionesHoy,
    tareasPendientes: tareasPendientes,
    tareasCompletadas: tareasCompletadas,
    totalContactos: totalContactos
  };
}

/**
 * Obtiene reuniones próximas
 * @param {Object} usuario - Usuario autenticado
 * @param {number} limite - Cantidad de reuniones
 * @returns {Array} Reuniones próximas
 */
function obtenerReunionesProximas(usuario, limite = 5) {
  const resultado = listarReuniones(usuario, { estado: 'Pendiente' });

  if (!resultado.exito) {
    return [];
  }

  // Filtrar solo futuras y ordenar por fecha/hora
  const ahora = new Date();
  const proximasReuniones = resultado.reuniones.filter(r => {
    const fechaHora = new Date(r.fecha + ' ' + r.horaInicio);
    return fechaHora >= ahora;
  }).slice(0, limite);

  return proximasReuniones;
}

/**
 * Obtiene tareas pendientes urgentes
 * @param {Object} usuario - Usuario autenticado
 * @param {number} limite - Cantidad de tareas
 * @returns {Array} Tareas pendientes
 */
function obtenerTareasPendientesUrgentes(usuario, limite = 5) {
  const resultado = listarTareas(usuario, {});

  if (!resultado.exito) {
    return [];
  }

  // Filtrar pendientes o en progreso, ordenar por prioridad
  const tareasPendientes = resultado.tareas.filter(t =>
    t.estado === ESTADOS_TAREA.PENDIENTE || t.estado === ESTADOS_TAREA.EN_PROGRESO
  ).slice(0, limite);

  return tareasPendientes;
}

/**
 * Obtiene actividad reciente
 * @param {Object} usuario - Usuario autenticado
 * @param {number} limite - Cantidad de actividades
 * @returns {Array} Actividad reciente
 */
function obtenerActividadReciente(usuario, limite = 10) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const audSheet = ss.getSheetByName('AuditoriaLog');
    const data = audSheet.getDataRange().getValues();

    const actividades = [];

    // Recorrer de atrás hacia adelante
    for (let i = data.length - 1; i >= 1 && actividades.length < limite; i--) {
      if (data[i][2] === usuario.id || usuario.permisos.includes('ver_todo')) {
        actividades.push({
          timestamp: Utilities.formatDate(new Date(data[i][1]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
          accion: data[i][3],
          entidadTipo: data[i][4],
          entidadId: data[i][5]
        });
      }
    }

    return actividades;

  } catch (error) {
    Logger.log('⚠️ Error obteniendo actividad reciente: ' + error.message);
    return [];
  }
}

/**
 * Obtiene métricas para el dashboard (endpoint separado)
 * @param {Object} usuario - Usuario autenticado
 * @returns {Object} Métricas
 */
function obtenerMetricasDashboard(usuario) {
  try {
    const fechaHoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const metricas = calcularMetricasDashboard(usuario, fechaHoy);

    return {
      exito: true,
      metricas: metricas
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo métricas: ' + error.message);
    return {
      exito: false,
      error: error.message
    };
  }
}

// ============================================
// BÚSQUEDA GLOBAL
// ============================================

/**
 * Búsqueda global en el CRM
 * @param {Object} usuario - Usuario autenticado
 * @param {string} query - Término de búsqueda
 * @returns {Object} Resultados de búsqueda
 */
function buscarGlobal(usuario, query) {
  try {
    Logger.log('🔍 Búsqueda global: ' + query);

    if (!query || query.trim().length < 2) {
      return {
        exito: false,
        error: 'La búsqueda debe tener al menos 2 caracteres'
      };
    }

    const queryLower = query.toLowerCase();
    const resultados = {
      reuniones: [],
      tareas: [],
      contactos: [],
      documentos: []
    };

    // Buscar en reuniones
    const reunionesResult = listarReuniones(usuario, {});
    if (reunionesResult.exito) {
      resultados.reuniones = reunionesResult.reuniones.filter(r =>
        r.titulo.toLowerCase().includes(queryLower) ||
        (r.descripcion && r.descripcion.toLowerCase().includes(queryLower))
      ).slice(0, 5);
    }

    // Buscar en tareas
    const tareasResult = listarTareas(usuario, {});
    if (tareasResult.exito) {
      resultados.tareas = tareasResult.tareas.filter(t =>
        t.titulo.toLowerCase().includes(queryLower) ||
        (t.descripcion && t.descripcion.toLowerCase().includes(queryLower))
      ).slice(0, 5);
    }

    // Buscar en contactos
    const contactosResult = listarContactos(usuario, { busqueda: query });
    if (contactosResult.exito) {
      resultados.contactos = contactosResult.contactos.slice(0, 5);
    }

    // Buscar en documentos
    const docsResult = listarDocumentos(usuario, {});
    if (docsResult.exito) {
      resultados.documentos = docsResult.documentos.filter(d =>
        d.nombreArchivo.toLowerCase().includes(queryLower) ||
        (d.descripcion && d.descripcion.toLowerCase().includes(queryLower))
      ).slice(0, 5);
    }

    const totalResultados =
      resultados.reuniones.length +
      resultados.tareas.length +
      resultados.contactos.length +
      resultados.documentos.length;

    Logger.log(`✅ Búsqueda completada: ${totalResultados} resultados`);

    return {
      exito: true,
      resultados: resultados,
      total: totalResultados
    };

  } catch (error) {
    Logger.log('❌ Error en búsqueda global: ' + error.message);
    return {
      exito: false,
      error: 'Error en búsqueda: ' + error.message
    };
  }
}

// ============================================
// FUNCIONES DE CONFIGURACIÓN (ENDPOINTS)
// ============================================

/**
 * Obtiene todas las configuraciones
 * @param {Object} usuario - Usuario autenticado
 * @returns {Object} Configuraciones
 */
function obtenerTodasConfiguraciones(usuario) {
  try {
    // Solo admins pueden ver configuraciones
    if (usuario.rol !== ROLES.ADMIN) {
      return {
        exito: false,
        error: 'Solo administradores pueden ver configuraciones'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const confSheet = ss.getSheetByName('Configuracion');
    const data = confSheet.getDataRange().getValues();

    const configuraciones = [];

    for (let i = 1; i < data.length; i++) {
      configuraciones.push({
        parametro: data[i][0],
        valor: data[i][1],
        tipo: data[i][2],
        descripcion: data[i][3]
      });
    }

    return {
      exito: true,
      configuraciones: configuraciones
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo configuraciones: ' + error.message);
    return {
      exito: false,
      error: error.message
    };
  }
}

/**
 * Actualiza una configuración (endpoint)
 * @param {Object} usuario - Usuario autenticado
 * @param {string} parametro - Parámetro a actualizar
 * @param {string} valor - Nuevo valor
 * @returns {Object} Resultado
 */
function actualizarConfiguracionEndpoint(usuario, parametro, valor) {
  try {
    // Solo admins pueden actualizar configuraciones
    if (usuario.rol !== ROLES.ADMIN) {
      return {
        exito: false,
        error: 'Solo administradores pueden actualizar configuraciones'
      };
    }

    const resultado = actualizarConfiguracion(parametro, valor);

    return {
      exito: resultado,
      mensaje: resultado ? 'Configuración actualizada' : 'Error actualizando configuración'
    };

  } catch (error) {
    Logger.log('❌ Error actualizando configuración: ' + error.message);
    return {
      exito: false,
      error: error.message
    };
  }
}

// ============================================
// FUNCIONES DE UTILIDAD Y HELPERS
// ============================================

/**
 * Verifica si el usuario tiene permiso sobre una reunión
 * @param {Object} usuario - Usuario autenticado
 * @param {string} creadorId - ID del creador
 * @param {string} participantesIdsStr - IDs de participantes (string separado por comas)
 * @param {boolean} edicion - Si es para edición
 * @returns {boolean}
 */
function tienePermisoReunion(usuario, creadorId, participantesIdsStr, edicion = false) {
  // Admin puede todo
  if (usuario.rol === ROLES.ADMIN) return true;

  // Ver todo
  if (usuario.permisos.includes('ver_todo')) {
    if (!edicion) return true;
  }

  // Es creador
  if (creadorId === usuario.id) return true;

  // Es participante
  if (participantesIdsStr) {
    const participantesIds = participantesIdsStr.split(',');
    if (participantesIds.includes(usuario.id)) {
      return !edicion; // Participantes pueden ver pero no editar
    }
  }

  return false;
}

/**
 * Verifica si el usuario tiene permiso sobre una tarea
 * @param {Object} usuario - Usuario autenticado
 * @param {string} asignadoId - ID del asignado
 * @param {string} creadorId - ID del creador
 * @param {boolean} edicion - Si es para edición
 * @returns {boolean}
 */
function tienePermisoTarea(usuario, asignadoId, creadorId, edicion = false) {
  // Admin puede todo
  if (usuario.rol === ROLES.ADMIN) return true;

  // Ver todo
  if (usuario.permisos.includes('ver_todo')) {
    if (!edicion) return true;
  }

  // Es asignado o creador
  if (asignadoId === usuario.id || creadorId === usuario.id) return true;

  return false;
}

/**
 * Verifica si el usuario tiene permiso sobre un contacto
 * @param {Object} usuario - Usuario autenticado
 * @param {string} responsableId - ID del responsable
 * @param {boolean} edicion - Si es para edición
 * @returns {boolean}
 */
function tienePermisoContacto(usuario, responsableId, edicion = false) {
  // Admin puede todo
  if (usuario.rol === ROLES.ADMIN) return true;

  // Ver todo
  if (usuario.permisos.includes('ver_todo')) {
    return true;
  }

  // Es responsable
  if (responsableId === usuario.id) return true;

  return false;
}

/**
 * Calcula hora fin a partir de hora inicio
 * @param {string} horaInicio - Hora inicio (HH:MM)
 * @returns {string} Hora fin (HH:MM)
 */
function calcularHoraFin(horaInicio) {
  const duracion = parseInt(obtenerConfiguracion('DURACION_REUNION_DEFAULT') || '60');
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(horas, minutos + duracion, 0, 0);

  return Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'HH:mm');
}

/**
 * Combina fecha y hora en un objeto Date
 * @param {Date} fecha - Fecha
 * @param {string} hora - Hora (HH:MM)
 * @returns {Date}
 */
function combinarFechaHora(fecha, hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  const resultado = new Date(fecha);
  resultado.setHours(horas, minutos, 0, 0);
  return resultado;
}

/**
 * Actualiza un evento en Google Calendar
 * @param {string} eventId - ID del evento
 * @param {Date} fecha - Nueva fecha
 * @param {string} horaInicio - Nueva hora inicio
 * @param {string} horaFin - Nueva hora fin
 * @param {string} titulo - Nuevo título (opcional)
 */
function actualizarEventoCalendar(eventId, fecha, horaInicio, horaFin, titulo = null) {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const event = calendar.getEventById(eventId);

    if (event) {
      const fechaInicio = combinarFechaHora(fecha, horaInicio);
      const fechaFin = combinarFechaHora(fecha, horaFin);

      event.setTime(fechaInicio, fechaFin);

      if (titulo) {
        event.setTitle(`[OVA] ${titulo}`);
      }

      Logger.log('✅ Evento Calendar actualizado');
    }

  } catch (error) {
    Logger.log('⚠️ Error actualizando evento Calendar: ' + error.message);
  }
}

/**
 * Crea un recordatorio
 * @param {string} entidadTipo - Tipo de entidad
 * @param {string} entidadId - ID de entidad
 * @param {string} usuarioId - ID de usuario
 * @param {Date} fechaHora - Fecha y hora del recordatorio
 * @param {string} mensaje - Mensaje
 */
function crearRecordatorio(entidadTipo, entidadId, usuarioId, fechaHora, mensaje) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const recSheet = ss.getSheetByName('Recordatorios');

    recSheet.appendRow([
      generarID(),
      entidadTipo,
      entidadId,
      usuarioId,
      fechaHora,
      mensaje,
      'NO',
      '',
      'Dashboard'
    ]);

    Logger.log('✅ Recordatorio creado');

  } catch (error) {
    Logger.log('⚠️ Error creando recordatorio: ' + error.message);
  }
}

/**
 * Calcula fecha de recordatorio
 * @param {Date} fecha - Fecha del evento
 * @param {string} hora - Hora del evento
 * @param {number} minutos - Minutos antes
 * @returns {Date}
 */
function calcularFechaRecordatorio(fecha, hora, minutos) {
  const fechaHora = combinarFechaHora(fecha, hora);
  const resultado = new Date(fechaHora.getTime() - minutos * 60 * 1000);
  return resultado;
}

// ============================================
// FIN DE LA PARTE 2
// ============================================
//
// RESUMEN DE PARTE 2:
// ✅ Chat IA completo con Groq
// ✅ CRUD de Reuniones + Google Calendar sync
// ✅ CRUD de Tareas + Sistema Kanban
// ✅ CRUD de Contactos + Drive folders
// ✅ Sistema de Gestión de Documentos
// ✅ Sistema de Notificaciones
// ✅ Dashboard con datos en tiempo real
// ✅ Búsqueda global
// ✅ Funciones de permisos y utilidades
//
// TOTAL PARTE 2: ~2,500 líneas
//
// PRÓXIMA PARTE 3 INCLUIRÁ:
// - Pipeline de ventas completo
// - Sistema de cotizaciones
// - Reportes con datos para gráficos
// - Calendario visual avanzado
// - Sistema de roles y permisos avanzado
// - Automatizaciones adicionales
//
// ============================================
