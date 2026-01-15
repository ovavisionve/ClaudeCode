// ============================================
// OVA CRM - SISTEMA COMPLETO
// PARTE 3 DE 3 - FUNCIONALIDADES AVANZADAS
// ============================================
//
// EMPRESA: OVA
// VERSIÓN: 1.0.0
// DESCRIPCIÓN: Funcionalidades avanzadas del CRM
//
// CONTENIDO PARTE 3:
// ✅ Pipeline de ventas completo
// ✅ Sistema de cotizaciones (crear, aprobar, convertir)
// ✅ Reportes y analíticas avanzadas
// ✅ Calendario visual con múltiples vistas
// ✅ Gestión avanzada de usuarios y roles
// ✅ Automatizaciones y procesos automáticos
// ✅ Exportación de datos
// ✅ Funciones de mantenimiento
//
// ============================================

// ============================================
// ENRUTADOR ADICIONAL PARA PARTE 3
// ============================================

/**
 * Extensión del enrutador para acciones de Parte 3
 * Esta función debe agregarse al switch de rutearAccion() en Parte 2
 */
function rutearAccionesParte3(datos, usuario) {
  const accion = datos.accion;

  switch (accion) {
    // ===== PIPELINE =====
    case 'crear_oportunidad':
      return crearOportunidad(usuario, datos.oportunidad);
    case 'listar_oportunidades':
      return listarOportunidades(usuario, datos.filtros);
    case 'obtener_oportunidad':
      return obtenerOportunidad(usuario, datos.oportunidadId);
    case 'actualizar_oportunidad':
      return actualizarOportunidad(usuario, datos.oportunidadId, datos.cambios);
    case 'cambiar_etapa_oportunidad':
      return cambiarEtapaOportunidad(usuario, datos.oportunidadId, datos.nuevaEtapa);
    case 'eliminar_oportunidad':
      return eliminarOportunidad(usuario, datos.oportunidadId);
    case 'obtener_pipeline_visual':
      return obtenerPipelineVisual(usuario, datos.filtros);

    // ===== COTIZACIONES =====
    case 'crear_cotizacion':
      return crearCotizacion(usuario, datos.cotizacion);
    case 'listar_cotizaciones':
      return listarCotizaciones(usuario, datos.filtros);
    case 'obtener_cotizacion':
      return obtenerCotizacion(usuario, datos.cotizacionId);
    case 'actualizar_cotizacion':
      return actualizarCotizacion(usuario, datos.cotizacionId, datos.cambios);
    case 'cambiar_estado_cotizacion':
      return cambiarEstadoCotizacion(usuario, datos.cotizacionId, datos.nuevoEstado);
    case 'agregar_item_cotizacion':
      return agregarItemCotizacion(usuario, datos.cotizacionId, datos.item);
    case 'eliminar_item_cotizacion':
      return eliminarItemCotizacion(usuario, datos.itemId);
    case 'duplicar_cotizacion':
      return duplicarCotizacion(usuario, datos.cotizacionId);

    // ===== REPORTES =====
    case 'generar_reporte_ventas':
      return generarReporteVentas(usuario, datos.periodo);
    case 'obtener_datos_graficos':
      return obtenerDatosGraficos(usuario, datos.tipo);
    case 'exportar_datos':
      return exportarDatos(usuario, datos.entidad, datos.filtros);

    // ===== CALENDARIO =====
    case 'obtener_eventos_calendario':
      return obtenerEventosCalendario(usuario, datos.inicio, datos.fin);
    case 'obtener_disponibilidad':
      return obtenerDisponibilidad(usuario, datos.fecha, datos.usuarioIds);

    // ===== USUARIOS =====
    case 'listar_todos_usuarios':
      return listarTodosUsuarios(usuario);
    case 'crear_usuario':
      return crearUsuarioEndpoint(usuario, datos.nuevoUsuario);
    case 'actualizar_usuario':
      return actualizarUsuarioEndpoint(usuario, datos.usuarioId, datos.cambios);
    case 'cambiar_rol_usuario':
      return cambiarRolUsuario(usuario, datos.usuarioId, datos.nuevoRol);
    case 'activar_desactivar_usuario':
      return activarDesactivarUsuario(usuario, datos.usuarioId, datos.activo);

    default:
      return {
        exito: false,
        error: 'Acción no reconocida en Parte 3: ' + accion
      };
  }
}

// ============================================
// PIPELINE DE VENTAS - CRUD COMPLETO
// ============================================

/**
 * Crea una nueva oportunidad en el pipeline
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} oportunidad - Datos de la oportunidad
 * @returns {Object} Resultado de la creación
 */
function crearOportunidad(usuario, oportunidad) {
  try {
    Logger.log('💼 Creando oportunidad para: ' + usuario.nombreCompleto);

    // Validar datos requeridos
    if (!oportunidad.clienteId || !oportunidad.nombreOportunidad) {
      return {
        exito: false,
        error: 'clienteId y nombreOportunidad son requeridos'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pipSheet = ss.getSheetByName('Pipeline');

    // Preparar datos
    const oportunidadId = generarID();
    const nombreOportunidad = oportunidad.nombreOportunidad;
    const etapa = oportunidad.etapa || ETAPAS_PIPELINE.PROSPECTO;
    const valor = parseFloat(oportunidad.valor) || 0;
    const probabilidad = parseFloat(oportunidad.probabilidad) || obtenerProbabilidadPorEtapa(etapa);
    const valorPonderado = valor * (probabilidad / 100);
    const fechaEstimadaCierre = oportunidad.fechaEstimadaCierre || '';
    const proximoPaso = oportunidad.proximoPaso || '';
    const notas = oportunidad.notas || '';

    const ahora = new Date();

    // Insertar en Sheets
    pipSheet.appendRow([
      oportunidadId,
      oportunidad.clienteId,
      nombreOportunidad,
      etapa,
      valor,
      probabilidad,
      valorPonderado,
      ahora,
      fechaEstimadaCierre,
      usuario.id,
      proximoPaso,
      notas,
      ahora,
      ahora
    ]);

    // Actualizar contacto con la etapa del pipeline
    actualizarContacto(usuario, oportunidad.clienteId, {
      estatusPipeline: etapa,
      probabilidadCierre: probabilidad,
      valorEstimado: valor,
      fechaEstimadaCierre: fechaEstimadaCierre
    });

    Logger.log('✅ Oportunidad creada: ' + oportunidadId);

    return {
      exito: true,
      mensaje: 'Oportunidad creada exitosamente',
      oportunidad: {
        id: oportunidadId,
        nombreOportunidad: nombreOportunidad,
        etapa: etapa,
        valor: valor,
        valorPonderado: valorPonderado
      }
    };

  } catch (error) {
    Logger.log('❌ Error creando oportunidad: ' + error.message);
    return {
      exito: false,
      error: 'Error creando oportunidad: ' + error.message
    };
  }
}

/**
 * Lista oportunidades del pipeline
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Lista de oportunidades
 */
function listarOportunidades(usuario, filtros = {}) {
  try {
    Logger.log('📋 Listando oportunidades para: ' + usuario.nombreCompleto);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pipSheet = ss.getSheetByName('Pipeline');
    const data = pipSheet.getDataRange().getValues();

    const oportunidades = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const usuarioResponsableId = fila[9];

      // Filtrar por usuario
      if (!usuario.permisos.includes('ver_todo') && usuarioResponsableId !== usuario.id) {
        continue;
      }

      // Aplicar filtros
      if (filtros.etapa && fila[3] !== filtros.etapa) continue;
      if (filtros.clienteId && fila[1] !== filtros.clienteId) continue;

      oportunidades.push({
        id: fila[0],
        clienteId: fila[1],
        nombreOportunidad: fila[2],
        etapa: fila[3],
        valor: fila[4],
        probabilidad: fila[5],
        valorPonderado: fila[6],
        fechaInicio: Utilities.formatDate(new Date(fila[7]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        fechaEstimadaCierre: fila[8] ? Utilities.formatDate(new Date(fila[8]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : null,
        usuarioResponsableId: fila[9],
        proximoPaso: fila[10],
        notas: fila[11]
      });
    }

    // Ordenar por valor descendente
    oportunidades.sort((a, b) => b.valor - a.valor);

    Logger.log(`✅ ${oportunidades.length} oportunidades encontradas`);

    return {
      exito: true,
      oportunidades: oportunidades,
      total: oportunidades.length
    };

  } catch (error) {
    Logger.log('❌ Error listando oportunidades: ' + error.message);
    return {
      exito: false,
      error: 'Error listando oportunidades: ' + error.message
    };
  }
}

/**
 * Obtiene el pipeline visual organizado por etapas
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Pipeline organizado
 */
function obtenerPipelineVisual(usuario, filtros = {}) {
  try {
    const resultado = listarOportunidades(usuario, filtros);

    if (!resultado.exito) {
      return resultado;
    }

    // Organizar por etapas
    const pipeline = {};
    const etapas = Object.values(ETAPAS_PIPELINE);

    etapas.forEach(etapa => {
      pipeline[etapa] = {
        oportunidades: [],
        valorTotal: 0,
        valorPonderadoTotal: 0,
        cantidad: 0
      };
    });

    resultado.oportunidades.forEach(op => {
      if (pipeline[op.etapa]) {
        pipeline[op.etapa].oportunidades.push(op);
        pipeline[op.etapa].valorTotal += op.valor;
        pipeline[op.etapa].valorPonderadoTotal += op.valorPonderado;
        pipeline[op.etapa].cantidad++;
      }
    });

    // Calcular totales generales
    let valorTotalPipeline = 0;
    let valorPonderadoTotalPipeline = 0;

    etapas.forEach(etapa => {
      if (etapa !== ETAPAS_PIPELINE.CERRADO_PERDIDO) {
        valorTotalPipeline += pipeline[etapa].valorTotal;
        valorPonderadoTotalPipeline += pipeline[etapa].valorPonderadoTotal;
      }
    });

    return {
      exito: true,
      pipeline: pipeline,
      totales: {
        valorTotal: valorTotalPipeline,
        valorPonderado: valorPonderadoTotalPipeline,
        cantidadTotal: resultado.total
      }
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo pipeline visual: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo pipeline visual: ' + error.message
    };
  }
}

/**
 * Obtiene una oportunidad específica
 * @param {Object} usuario - Usuario autenticado
 * @param {string} oportunidadId - ID de la oportunidad
 * @returns {Object} Datos de la oportunidad
 */
function obtenerOportunidad(usuario, oportunidadId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pipSheet = ss.getSheetByName('Pipeline');
    const data = pipSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === oportunidadId) {
        const fila = data[i];

        // Verificar permisos
        if (!usuario.permisos.includes('ver_todo') && fila[9] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para ver esta oportunidad'
          };
        }

        return {
          exito: true,
          oportunidad: {
            id: fila[0],
            clienteId: fila[1],
            nombreOportunidad: fila[2],
            etapa: fila[3],
            valor: fila[4],
            probabilidad: fila[5],
            valorPonderado: fila[6],
            fechaInicio: fila[7],
            fechaEstimadaCierre: fila[8],
            usuarioResponsableId: fila[9],
            proximoPaso: fila[10],
            notas: fila[11]
          }
        };
      }
    }

    return {
      exito: false,
      error: 'Oportunidad no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo oportunidad: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo oportunidad: ' + error.message
    };
  }
}

/**
 * Actualiza una oportunidad
 * @param {Object} usuario - Usuario autenticado
 * @param {string} oportunidadId - ID de la oportunidad
 * @param {Object} cambios - Cambios a aplicar
 * @returns {Object} Resultado
 */
function actualizarOportunidad(usuario, oportunidadId, cambios) {
  try {
    Logger.log('✏️ Actualizando oportunidad: ' + oportunidadId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pipSheet = ss.getSheetByName('Pipeline');
    const data = pipSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === oportunidadId) {
        const fila = data[i];

        // Verificar permisos
        if (!usuario.permisos.includes('editar') && fila[9] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para editar esta oportunidad'
          };
        }

        // Mapeo de campos
        const mapeo = {
          nombreOportunidad: 3,
          etapa: 4,
          valor: 5,
          probabilidad: 6,
          fechaEstimadaCierre: 9,
          proximoPaso: 11,
          notas: 12
        };

        let nuevoValor = fila[4];
        let nuevaProbabilidad = fila[5];

        // Aplicar cambios
        let cambiosAplicados = [];
        for (const [campo, valor] of Object.entries(cambios)) {
          if (mapeo[campo]) {
            pipSheet.getRange(i + 1, mapeo[campo]).setValue(valor);
            cambiosAplicados.push(campo);

            if (campo === 'valor') nuevoValor = valor;
            if (campo === 'probabilidad') nuevaProbabilidad = valor;
            if (campo === 'etapa') {
              nuevaProbabilidad = obtenerProbabilidadPorEtapa(valor);
              pipSheet.getRange(i + 1, 6).setValue(nuevaProbabilidad);
            }
          }
        }

        // Recalcular valor ponderado
        const valorPonderado = nuevoValor * (nuevaProbabilidad / 100);
        pipSheet.getRange(i + 1, 7).setValue(valorPonderado);

        // Actualizar fecha de modificación
        pipSheet.getRange(i + 1, 14).setValue(new Date());

        Logger.log(`✅ Oportunidad actualizada: ${cambiosAplicados.length} cambios`);

        return {
          exito: true,
          mensaje: 'Oportunidad actualizada exitosamente',
          cambiosAplicados: cambiosAplicados
        };
      }
    }

    return {
      exito: false,
      error: 'Oportunidad no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error actualizando oportunidad: ' + error.message);
    return {
      exito: false,
      error: 'Error actualizando oportunidad: ' + error.message
    };
  }
}

/**
 * Cambia la etapa de una oportunidad en el pipeline
 * @param {Object} usuario - Usuario autenticado
 * @param {string} oportunidadId - ID de la oportunidad
 * @param {string} nuevaEtapa - Nueva etapa
 * @returns {Object} Resultado
 */
function cambiarEtapaOportunidad(usuario, oportunidadId, nuevaEtapa) {
  try {
    Logger.log(`🔄 Cambiando etapa de oportunidad ${oportunidadId} a: ${nuevaEtapa}`);

    // Validar etapa
    const etapasValidas = Object.values(ETAPAS_PIPELINE);
    if (!etapasValidas.includes(nuevaEtapa)) {
      return {
        exito: false,
        error: 'Etapa no válida. Etapas permitidas: ' + etapasValidas.join(', ')
      };
    }

    const nuevaProbabilidad = obtenerProbabilidadPorEtapa(nuevaEtapa);

    return actualizarOportunidad(usuario, oportunidadId, {
      etapa: nuevaEtapa,
      probabilidad: nuevaProbabilidad
    });

  } catch (error) {
    Logger.log('❌ Error cambiando etapa: ' + error.message);
    return {
      exito: false,
      error: 'Error cambiando etapa: ' + error.message
    };
  }
}

/**
 * Elimina una oportunidad
 * @param {Object} usuario - Usuario autenticado
 * @param {string} oportunidadId - ID de la oportunidad
 * @returns {Object} Resultado
 */
function eliminarOportunidad(usuario, oportunidadId) {
  try {
    Logger.log('🗑️ Eliminando oportunidad: ' + oportunidadId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pipSheet = ss.getSheetByName('Pipeline');
    const data = pipSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === oportunidadId) {
        const fila = data[i];

        // Verificar permisos
        if (!usuario.permisos.includes('eliminar') && fila[9] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para eliminar esta oportunidad'
          };
        }

        pipSheet.deleteRow(i + 1);
        Logger.log('✅ Oportunidad eliminada exitosamente');

        return {
          exito: true,
          mensaje: 'Oportunidad eliminada exitosamente'
        };
      }
    }

    return {
      exito: false,
      error: 'Oportunidad no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error eliminando oportunidad: ' + error.message);
    return {
      exito: false,
      error: 'Error eliminando oportunidad: ' + error.message
    };
  }
}

/**
 * Obtiene la probabilidad de cierre según la etapa
 * @param {string} etapa - Etapa del pipeline
 * @returns {number} Probabilidad (0-100)
 */
function obtenerProbabilidadPorEtapa(etapa) {
  const probabilidades = {
    [ETAPAS_PIPELINE.PROSPECTO]: 10,
    [ETAPAS_PIPELINE.CONTACTADO]: 20,
    [ETAPAS_PIPELINE.CALIFICADO]: 40,
    [ETAPAS_PIPELINE.PROPUESTA]: 60,
    [ETAPAS_PIPELINE.NEGOCIACION]: 80,
    [ETAPAS_PIPELINE.CERRADO_GANADO]: 100,
    [ETAPAS_PIPELINE.CERRADO_PERDIDO]: 0
  };

  return probabilidades[etapa] || 50;
}

// ============================================
// SISTEMA DE COTIZACIONES - COMPLETO
// ============================================

/**
 * Crea una nueva cotización
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} cotizacion - Datos de la cotización
 * @returns {Object} Resultado
 */
function crearCotizacion(usuario, cotizacion) {
  try {
    Logger.log('📄 Creando cotización para: ' + usuario.nombreCompleto);

    // Validar datos requeridos
    if (!cotizacion.clienteId) {
      return {
        exito: false,
        error: 'clienteId es requerido'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotSheet = ss.getSheetByName('Cotizaciones');

    // Generar número de cotización
    const numero = generarNumeroCotizacion();

    // Preparar datos
    const cotizacionId = generarID();
    const fechaEmision = new Date();
    const diasValidez = parseInt(obtenerConfiguracion('VALIDEZ_COTIZACION_DIAS') || '30');
    const fechaVencimiento = new Date(fechaEmision.getTime() + diasValidez * 24 * 60 * 60 * 1000);
    const estado = cotizacion.estado || ESTADOS_COTIZACION.BORRADOR;
    const subtotal = cotizacion.subtotal || 0;
    const descuentoPorcentaje = cotizacion.descuentoPorcentaje || 0;
    const impuestoPorcentaje = cotizacion.impuestoPorcentaje || parseFloat(obtenerConfiguracion('IMPUESTO_DEFAULT') || '16');
    const moneda = cotizacion.moneda || obtenerConfiguracion('MONEDA_DEFAULT') || 'USD';
    const terminosPago = cotizacion.terminosPago || '';
    const notas = cotizacion.notas || '';
    const oportunidadId = cotizacion.oportunidadId || '';

    // Calcular total
    const descuento = subtotal * (descuentoPorcentaje / 100);
    const baseImponible = subtotal - descuento;
    const impuesto = baseImponible * (impuestoPorcentaje / 100);
    const total = baseImponible + impuesto;

    const ahora = new Date();

    // Insertar en Sheets
    cotSheet.appendRow([
      cotizacionId,
      numero,
      cotizacion.clienteId,
      oportunidadId,
      fechaEmision,
      fechaVencimiento,
      estado,
      subtotal,
      descuentoPorcentaje,
      impuestoPorcentaje,
      total,
      moneda,
      terminosPago,
      notas,
      usuario.id,
      '',
      ahora,
      ahora
    ]);

    Logger.log('✅ Cotización creada: ' + cotizacionId);

    return {
      exito: true,
      mensaje: 'Cotización creada exitosamente',
      cotizacion: {
        id: cotizacionId,
        numero: numero,
        subtotal: subtotal,
        total: total,
        estado: estado
      }
    };

  } catch (error) {
    Logger.log('❌ Error creando cotización: ' + error.message);
    return {
      exito: false,
      error: 'Error creando cotización: ' + error.message
    };
  }
}

/**
 * Lista cotizaciones
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Lista de cotizaciones
 */
function listarCotizaciones(usuario, filtros = {}) {
  try {
    Logger.log('📋 Listando cotizaciones para: ' + usuario.nombreCompleto);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotSheet = ss.getSheetByName('Cotizaciones');
    const data = cotSheet.getDataRange().getValues();

    const cotizaciones = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const usuarioCreadorId = fila[14];

      // Filtrar por usuario
      if (!usuario.permisos.includes('ver_todo') && usuarioCreadorId !== usuario.id) {
        continue;
      }

      // Aplicar filtros
      if (filtros.estado && fila[6] !== filtros.estado) continue;
      if (filtros.clienteId && fila[2] !== filtros.clienteId) continue;

      cotizaciones.push({
        id: fila[0],
        numero: fila[1],
        clienteId: fila[2],
        oportunidadId: fila[3],
        fechaEmision: Utilities.formatDate(new Date(fila[4]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        fechaVencimiento: Utilities.formatDate(new Date(fila[5]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        estado: fila[6],
        subtotal: fila[7],
        descuentoPorcentaje: fila[8],
        impuestoPorcentaje: fila[9],
        total: fila[10],
        moneda: fila[11],
        usuarioCreadorId: fila[14]
      });
    }

    // Ordenar por fecha descendente
    cotizaciones.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));

    Logger.log(`✅ ${cotizaciones.length} cotizaciones encontradas`);

    return {
      exito: true,
      cotizaciones: cotizaciones,
      total: cotizaciones.length
    };

  } catch (error) {
    Logger.log('❌ Error listando cotizaciones: ' + error.message);
    return {
      exito: false,
      error: 'Error listando cotizaciones: ' + error.message
    };
  }
}

/**
 * Obtiene una cotización completa con sus items
 * @param {Object} usuario - Usuario autenticado
 * @param {string} cotizacionId - ID de la cotización
 * @returns {Object} Cotización completa
 */
function obtenerCotizacion(usuario, cotizacionId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotSheet = ss.getSheetByName('Cotizaciones');
    const itemSheet = ss.getSheetByName('ItemsCotizacion');

    const cotData = cotSheet.getDataRange().getValues();
    const itemData = itemSheet.getDataRange().getValues();

    // Buscar cotización
    for (let i = 1; i < cotData.length; i++) {
      if (cotData[i][0] === cotizacionId) {
        const fila = cotData[i];

        // Verificar permisos
        if (!usuario.permisos.includes('ver_todo') && fila[14] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para ver esta cotización'
          };
        }

        // Buscar items de la cotización
        const items = [];
        for (let j = 1; j < itemData.length; j++) {
          if (itemData[j][1] === cotizacionId) {
            items.push({
              id: itemData[j][0],
              orden: itemData[j][2],
              descripcion: itemData[j][3],
              cantidad: itemData[j][4],
              precioUnitario: itemData[j][5],
              descuentoPorcentaje: itemData[j][6],
              subtotal: itemData[j][7],
              tipoItem: itemData[j][8],
              sku: itemData[j][9]
            });
          }
        }

        // Ordenar items por orden
        items.sort((a, b) => a.orden - b.orden);

        return {
          exito: true,
          cotizacion: {
            id: fila[0],
            numero: fila[1],
            clienteId: fila[2],
            oportunidadId: fila[3],
            fechaEmision: fila[4],
            fechaVencimiento: fila[5],
            estado: fila[6],
            subtotal: fila[7],
            descuentoPorcentaje: fila[8],
            impuestoPorcentaje: fila[9],
            total: fila[10],
            moneda: fila[11],
            terminosPago: fila[12],
            notas: fila[13],
            usuarioCreadorId: fila[14],
            aprobadaPorId: fila[15],
            items: items
          }
        };
      }
    }

    return {
      exito: false,
      error: 'Cotización no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo cotización: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo cotización: ' + error.message
    };
  }
}

/**
 * Actualiza una cotización
 * @param {Object} usuario - Usuario autenticado
 * @param {string} cotizacionId - ID de la cotización
 * @param {Object} cambios - Cambios a aplicar
 * @returns {Object} Resultado
 */
function actualizarCotizacion(usuario, cotizacionId, cambios) {
  try {
    Logger.log('✏️ Actualizando cotización: ' + cotizacionId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotSheet = ss.getSheetByName('Cotizaciones');
    const data = cotSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === cotizacionId) {
        const fila = data[i];

        // Verificar permisos
        if (!usuario.permisos.includes('editar') && fila[14] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para editar esta cotización'
          };
        }

        // No permitir editar si ya está aprobada
        if (fila[6] === ESTADOS_COTIZACION.APROBADA) {
          return {
            exito: false,
            error: 'No se puede editar una cotización aprobada'
          };
        }

        // Mapeo de campos
        const mapeo = {
          fechaVencimiento: 6,
          subtotal: 8,
          descuentoPorcentaje: 9,
          impuestoPorcentaje: 10,
          moneda: 12,
          terminosPago: 13,
          notas: 14
        };

        let nuevoSubtotal = fila[7];
        let nuevoDescuento = fila[8];
        let nuevoImpuesto = fila[9];

        // Aplicar cambios
        let cambiosAplicados = [];
        for (const [campo, valor] of Object.entries(cambios)) {
          if (mapeo[campo]) {
            cotSheet.getRange(i + 1, mapeo[campo]).setValue(valor);
            cambiosAplicados.push(campo);

            if (campo === 'subtotal') nuevoSubtotal = valor;
            if (campo === 'descuentoPorcentaje') nuevoDescuento = valor;
            if (campo === 'impuestoPorcentaje') nuevoImpuesto = valor;
          }
        }

        // Recalcular total
        const descuento = nuevoSubtotal * (nuevoDescuento / 100);
        const baseImponible = nuevoSubtotal - descuento;
        const impuesto = baseImponible * (nuevoImpuesto / 100);
        const total = baseImponible + impuesto;

        cotSheet.getRange(i + 1, 11).setValue(total);

        // Actualizar fecha de modificación
        cotSheet.getRange(i + 1, 18).setValue(new Date());

        Logger.log(`✅ Cotización actualizada: ${cambiosAplicados.length} cambios`);

        return {
          exito: true,
          mensaje: 'Cotización actualizada exitosamente',
          cambiosAplicados: cambiosAplicados,
          nuevoTotal: total
        };
      }
    }

    return {
      exito: false,
      error: 'Cotización no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error actualizando cotización: ' + error.message);
    return {
      exito: false,
      error: 'Error actualizando cotización: ' + error.message
    };
  }
}

/**
 * Cambia el estado de una cotización
 * @param {Object} usuario - Usuario autenticado
 * @param {string} cotizacionId - ID de la cotización
 * @param {string} nuevoEstado - Nuevo estado
 * @returns {Object} Resultado
 */
function cambiarEstadoCotizacion(usuario, cotizacionId, nuevoEstado) {
  try {
    Logger.log(`🔄 Cambiando estado de cotización ${cotizacionId} a: ${nuevoEstado}`);

    // Validar estado
    const estadosValidos = Object.values(ESTADOS_COTIZACION);
    if (!estadosValidos.includes(nuevoEstado)) {
      return {
        exito: false,
        error: 'Estado no válido. Estados permitidos: ' + estadosValidos.join(', ')
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotSheet = ss.getSheetByName('Cotizaciones');
    const data = cotSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === cotizacionId) {
        const fila = data[i];

        // Verificar permisos
        if (!usuario.permisos.includes('editar') && fila[14] !== usuario.id) {
          return {
            exito: false,
            error: 'No tienes permiso para cambiar el estado'
          };
        }

        // Actualizar estado
        cotSheet.getRange(i + 1, 7).setValue(nuevoEstado);

        // Si se aprueba, registrar quién aprobó
        if (nuevoEstado === ESTADOS_COTIZACION.APROBADA) {
          cotSheet.getRange(i + 1, 16).setValue(usuario.id);
        }

        cotSheet.getRange(i + 1, 18).setValue(new Date());

        Logger.log('✅ Estado actualizado exitosamente');

        return {
          exito: true,
          mensaje: `Cotización marcada como: ${nuevoEstado}`
        };
      }
    }

    return {
      exito: false,
      error: 'Cotización no encontrada'
    };

  } catch (error) {
    Logger.log('❌ Error cambiando estado: ' + error.message);
    return {
      exito: false,
      error: 'Error cambiando estado: ' + error.message
    };
  }
}

/**
 * Agrega un item a una cotización
 * @param {Object} usuario - Usuario autenticado
 * @param {string} cotizacionId - ID de la cotización
 * @param {Object} item - Datos del item
 * @returns {Object} Resultado
 */
function agregarItemCotizacion(usuario, cotizacionId, item) {
  try {
    Logger.log('➕ Agregando item a cotización: ' + cotizacionId);

    // Validar que la cotización existe y el usuario tiene permisos
    const cotResult = obtenerCotizacion(usuario, cotizacionId);
    if (!cotResult.exito) {
      return cotResult;
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const itemSheet = ss.getSheetByName('ItemsCotizacion');
    const cotSheet = ss.getSheetByName('Cotizaciones');

    // Calcular orden (último + 1)
    const itemData = itemSheet.getDataRange().getValues();
    let maxOrden = 0;
    for (let i = 1; i < itemData.length; i++) {
      if (itemData[i][1] === cotizacionId && itemData[i][2] > maxOrden) {
        maxOrden = itemData[i][2];
      }
    }

    const itemId = generarID();
    const orden = maxOrden + 1;
    const descripcion = item.descripcion || '';
    const cantidad = parseFloat(item.cantidad) || 1;
    const precioUnitario = parseFloat(item.precioUnitario) || 0;
    const descuentoPorcentaje = parseFloat(item.descuentoPorcentaje) || 0;
    const tipoItem = item.tipoItem || 'producto';
    const sku = item.sku || '';

    // Calcular subtotal del item
    const subtotalBruto = cantidad * precioUnitario;
    const descuentoItem = subtotalBruto * (descuentoPorcentaje / 100);
    const subtotal = subtotalBruto - descuentoItem;

    // Agregar item
    itemSheet.appendRow([
      itemId,
      cotizacionId,
      orden,
      descripcion,
      cantidad,
      precioUnitario,
      descuentoPorcentaje,
      subtotal,
      tipoItem,
      sku
    ]);

    // Recalcular total de la cotización
    recalcularTotalCotizacion(cotizacionId);

    Logger.log('✅ Item agregado exitosamente');

    return {
      exito: true,
      mensaje: 'Item agregado exitosamente',
      item: {
        id: itemId,
        descripcion: descripcion,
        subtotal: subtotal
      }
    };

  } catch (error) {
    Logger.log('❌ Error agregando item: ' + error.message);
    return {
      exito: false,
      error: 'Error agregando item: ' + error.message
    };
  }
}

/**
 * Elimina un item de una cotización
 * @param {Object} usuario - Usuario autenticado
 * @param {string} itemId - ID del item
 * @returns {Object} Resultado
 */
function eliminarItemCotizacion(usuario, itemId) {
  try {
    Logger.log('🗑️ Eliminando item: ' + itemId);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const itemSheet = ss.getSheetByName('ItemsCotizacion');
    const data = itemSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === itemId) {
        const cotizacionId = data[i][1];

        // Verificar permisos sobre la cotización
        const cotResult = obtenerCotizacion(usuario, cotizacionId);
        if (!cotResult.exito) {
          return {
            exito: false,
            error: 'No tienes permiso para modificar esta cotización'
          };
        }

        itemSheet.deleteRow(i + 1);

        // Recalcular total de la cotización
        recalcularTotalCotizacion(cotizacionId);

        Logger.log('✅ Item eliminado exitosamente');

        return {
          exito: true,
          mensaje: 'Item eliminado exitosamente'
        };
      }
    }

    return {
      exito: false,
      error: 'Item no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error eliminando item: ' + error.message);
    return {
      exito: false,
      error: 'Error eliminando item: ' + error.message
    };
  }
}

/**
 * Duplica una cotización existente
 * @param {Object} usuario - Usuario autenticado
 * @param {string} cotizacionId - ID de la cotización a duplicar
 * @returns {Object} Resultado
 */
function duplicarCotizacion(usuario, cotizacionId) {
  try {
    Logger.log('📋 Duplicando cotización: ' + cotizacionId);

    // Obtener cotización original
    const cotResult = obtenerCotizacion(usuario, cotizacionId);
    if (!cotResult.exito) {
      return cotResult;
    }

    const cotOriginal = cotResult.cotizacion;

    // Crear nueva cotización
    const nuevaCotizacion = {
      clienteId: cotOriginal.clienteId,
      oportunidadId: cotOriginal.oportunidadId,
      estado: ESTADOS_COTIZACION.BORRADOR,
      subtotal: cotOriginal.subtotal,
      descuentoPorcentaje: cotOriginal.descuentoPorcentaje,
      impuestoPorcentaje: cotOriginal.impuestoPorcentaje,
      moneda: cotOriginal.moneda,
      terminosPago: cotOriginal.terminosPago,
      notas: 'Duplicado de ' + cotOriginal.numero + '\n\n' + cotOriginal.notas
    };

    const resultado = crearCotizacion(usuario, nuevaCotizacion);

    if (!resultado.exito) {
      return resultado;
    }

    const nuevaCotizacionId = resultado.cotizacion.id;

    // Duplicar items
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const itemSheet = ss.getSheetByName('ItemsCotizacion');

    cotOriginal.items.forEach(item => {
      itemSheet.appendRow([
        generarID(),
        nuevaCotizacionId,
        item.orden,
        item.descripcion,
        item.cantidad,
        item.precioUnitario,
        item.descuentoPorcentaje,
        item.subtotal,
        item.tipoItem,
        item.sku
      ]);
    });

    Logger.log('✅ Cotización duplicada exitosamente');

    return {
      exito: true,
      mensaje: 'Cotización duplicada exitosamente',
      cotizacionId: nuevaCotizacionId,
      numero: resultado.cotizacion.numero
    };

  } catch (error) {
    Logger.log('❌ Error duplicando cotización: ' + error.message);
    return {
      exito: false,
      error: 'Error duplicando cotización: ' + error.message
    };
  }
}

/**
 * Recalcula el total de una cotización sumando sus items
 * @param {string} cotizacionId - ID de la cotización
 */
function recalcularTotalCotizacion(cotizacionId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const itemSheet = ss.getSheetByName('ItemsCotizacion');
    const cotSheet = ss.getSheetByName('Cotizaciones');

    // Sumar subtotales de items
    const itemData = itemSheet.getDataRange().getValues();
    let subtotalTotal = 0;

    for (let i = 1; i < itemData.length; i++) {
      if (itemData[i][1] === cotizacionId) {
        subtotalTotal += parseFloat(itemData[i][7]) || 0;
      }
    }

    // Obtener cotización
    const cotData = cotSheet.getDataRange().getValues();
    for (let i = 1; i < cotData.length; i++) {
      if (cotData[i][0] === cotizacionId) {
        const descuentoPorcentaje = cotData[i][8];
        const impuestoPorcentaje = cotData[i][9];

        // Calcular total
        const descuento = subtotalTotal * (descuentoPorcentaje / 100);
        const baseImponible = subtotalTotal - descuento;
        const impuesto = baseImponible * (impuestoPorcentaje / 100);
        const total = baseImponible + impuesto;

        // Actualizar en Sheet
        cotSheet.getRange(i + 1, 8).setValue(subtotalTotal);
        cotSheet.getRange(i + 1, 11).setValue(total);
        cotSheet.getRange(i + 1, 18).setValue(new Date());

        Logger.log(`✅ Total recalculado para cotización: ${total}`);
        break;
      }
    }

  } catch (error) {
    Logger.log('⚠️ Error recalculando total: ' + error.message);
  }
}

/**
 * Genera un número único de cotización
 * @returns {string} Número de cotización
 */
function generarNumeroCotizacion() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotSheet = ss.getSheetByName('Cotizaciones');
    const data = cotSheet.getDataRange().getValues();

    // Contar cotizaciones del mes actual
    let contador = 0;
    for (let i = 1; i < data.length; i++) {
      const numeroCot = data[i][1];
      if (numeroCot && numeroCot.startsWith(`COT-${año}${mes}`)) {
        contador++;
      }
    }

    contador++;
    return `COT-${año}${mes}-${String(contador).padStart(4, '0')}`;

  } catch (error) {
    Logger.log('⚠️ Error generando número: ' + error.message);
    return `COT-${año}${mes}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  }
}

// ============================================
// REPORTES Y ANALÍTICAS AVANZADAS
// ============================================

/**
 * Genera un reporte de ventas para un periodo específico
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} periodo - Periodo del reporte {inicio, fin}
 * @returns {Object} Reporte generado
 */
function generarReporteVentas(usuario, periodo) {
  try {
    Logger.log('📊 Generando reporte de ventas para: ' + usuario.nombreCompleto);

    if (!usuario.permisos.includes('ver_reportes')) {
      return {
        exito: false,
        error: 'No tienes permiso para ver reportes'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const pipSheet = ss.getSheetByName('Pipeline');
    const cotSheet = ss.getSheetByName('Cotizaciones');

    const fechaInicio = periodo.inicio ? new Date(periodo.inicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fechaFin = periodo.fin ? new Date(periodo.fin) : new Date();

    // Analizar oportunidades
    const pipData = pipSheet.getDataRange().getValues();
    let oportunidadesCreadas = 0;
    let oportunidadesGanadas = 0;
    let oportunidadesPerdidas = 0;
    let valorTotalPipeline = 0;
    let valorGanado = 0;
    let valorPerdido = 0;

    for (let i = 1; i < pipData.length; i++) {
      const fechaInicioPip = new Date(pipData[i][7]);

      if (fechaInicioPip >= fechaInicio && fechaInicioPip <= fechaFin) {
        oportunidadesCreadas++;
        valorTotalPipeline += pipData[i][4];
      }

      if (pipData[i][3] === ETAPAS_PIPELINE.CERRADO_GANADO) {
        oportunidadesGanadas++;
        valorGanado += pipData[i][4];
      } else if (pipData[i][3] === ETAPAS_PIPELINE.CERRADO_PERDIDO) {
        oportunidadesPerdidas++;
        valorPerdido += pipData[i][4];
      }
    }

    // Analizar cotizaciones
    const cotData = cotSheet.getDataRange().getValues();
    let cotizacionesCreadas = 0;
    let cotizacionesAprobadas = 0;
    let cotizacionesRechazadas = 0;
    let valorCotizaciones = 0;
    let valorAprobado = 0;

    for (let i = 1; i < cotData.length; i++) {
      const fechaEmision = new Date(cotData[i][4]);

      if (fechaEmision >= fechaInicio && fechaEmision <= fechaFin) {
        cotizacionesCreadas++;
        valorCotizaciones += cotData[i][10];

        if (cotData[i][6] === ESTADOS_COTIZACION.APROBADA) {
          cotizacionesAprobadas++;
          valorAprobado += cotData[i][10];
        } else if (cotData[i][6] === ESTADOS_COTIZACION.RECHAZADA) {
          cotizacionesRechazadas++;
        }
      }
    }

    // Calcular tasas de conversión
    const tasaConversionOportunidades = oportunidadesCreadas > 0
      ? ((oportunidadesGanadas / oportunidadesCreadas) * 100).toFixed(2)
      : 0;

    const tasaConversionCotizaciones = cotizacionesCreadas > 0
      ? ((cotizacionesAprobadas / cotizacionesCreadas) * 100).toFixed(2)
      : 0;

    const reporte = {
      periodo: {
        inicio: Utilities.formatDate(fechaInicio, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        fin: Utilities.formatDate(fechaFin, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      },
      oportunidades: {
        creadas: oportunidadesCreadas,
        ganadas: oportunidadesGanadas,
        perdidas: oportunidadesPerdidas,
        valorTotal: valorTotalPipeline,
        valorGanado: valorGanado,
        valorPerdido: valorPerdido,
        tasaConversion: parseFloat(tasaConversionOportunidades)
      },
      cotizaciones: {
        creadas: cotizacionesCreadas,
        aprobadas: cotizacionesAprobadas,
        rechazadas: cotizacionesRechazadas,
        valorTotal: valorCotizaciones,
        valorAprobado: valorAprobado,
        tasaConversion: parseFloat(tasaConversionCotizaciones)
      },
      promedios: {
        valorPromedioOportunidad: oportunidadesCreadas > 0 ? (valorTotalPipeline / oportunidadesCreadas).toFixed(2) : 0,
        valorPromedioCotizacion: cotizacionesCreadas > 0 ? (valorCotizaciones / cotizacionesCreadas).toFixed(2) : 0,
        ticketPromedioGanado: oportunidadesGanadas > 0 ? (valorGanado / oportunidadesGanadas).toFixed(2) : 0
      }
    };

    // Guardar reporte en hoja ReportesVentas
    const reportSheet = ss.getSheetByName('ReportesVentas');
    reportSheet.appendRow([
      generarID(),
      new Date(),
      usuario.id,
      Utilities.formatDate(fechaInicio, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      Utilities.formatDate(fechaFin, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      JSON.stringify(reporte)
    ]);

    Logger.log('✅ Reporte de ventas generado exitosamente');

    return {
      exito: true,
      reporte: reporte
    };

  } catch (error) {
    Logger.log('❌ Error generando reporte: ' + error.message);
    return {
      exito: false,
      error: 'Error generando reporte: ' + error.message
    };
  }
}

/**
 * Obtiene datos para gráficos específicos
 * @param {Object} usuario - Usuario autenticado
 * @param {string} tipo - Tipo de gráfico (pipeline_etapas, ventas_mes, cotizaciones_estado, etc)
 * @returns {Object} Datos del gráfico
 */
function obtenerDatosGraficos(usuario, tipo) {
  try {
    Logger.log('📈 Obteniendo datos para gráfico: ' + tipo);

    if (!usuario.permisos.includes('ver_reportes')) {
      return {
        exito: false,
        error: 'No tienes permiso para ver reportes'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let datos = {};

    switch (tipo) {
      case 'pipeline_etapas':
        // Distribución de oportunidades por etapa
        const pipSheet = ss.getSheetByName('Pipeline');
        const pipData = pipSheet.getDataRange().getValues();

        const etapas = {};
        Object.values(ETAPAS_PIPELINE).forEach(etapa => {
          etapas[etapa] = { cantidad: 0, valor: 0 };
        });

        for (let i = 1; i < pipData.length; i++) {
          const etapa = pipData[i][3];
          const valor = pipData[i][4];

          if (etapas[etapa]) {
            etapas[etapa].cantidad++;
            etapas[etapa].valor += valor;
          }
        }

        datos = {
          labels: Object.keys(etapas),
          cantidades: Object.values(etapas).map(e => e.cantidad),
          valores: Object.values(etapas).map(e => e.valor)
        };
        break;

      case 'ventas_mes':
        // Ventas de los últimos 6 meses
        const cotSheet = ss.getSheetByName('Cotizaciones');
        const cotData = cotSheet.getDataRange().getValues();

        const meses = {};
        const ahora = new Date();

        for (let i = 5; i >= 0; i--) {
          const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
          const mesKey = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM');
          meses[mesKey] = { cantidad: 0, valor: 0 };
        }

        for (let i = 1; i < cotData.length; i++) {
          if (cotData[i][6] === ESTADOS_COTIZACION.APROBADA) {
            const fechaEmision = new Date(cotData[i][4]);
            const mesKey = Utilities.formatDate(fechaEmision, Session.getScriptTimeZone(), 'yyyy-MM');

            if (meses[mesKey]) {
              meses[mesKey].cantidad++;
              meses[mesKey].valor += cotData[i][10];
            }
          }
        }

        datos = {
          labels: Object.keys(meses),
          cantidades: Object.values(meses).map(m => m.cantidad),
          valores: Object.values(meses).map(m => m.valor)
        };
        break;

      case 'cotizaciones_estado':
        // Distribución de cotizaciones por estado
        const cotSheet2 = ss.getSheetByName('Cotizaciones');
        const cotData2 = cotSheet2.getDataRange().getValues();

        const estados = {};
        Object.values(ESTADOS_COTIZACION).forEach(estado => {
          estados[estado] = 0;
        });

        for (let i = 1; i < cotData2.length; i++) {
          const estado = cotData2[i][6];
          if (estados[estado] !== undefined) {
            estados[estado]++;
          }
        }

        datos = {
          labels: Object.keys(estados),
          cantidades: Object.values(estados)
        };
        break;

      case 'tareas_estado':
        // Distribución de tareas por estado
        const tarSheet = ss.getSheetByName('Tareas');
        const tarData = tarSheet.getDataRange().getValues();

        const estadosTareas = {
          [ESTADOS_TAREA.PENDIENTE]: 0,
          [ESTADOS_TAREA.EN_PROGRESO]: 0,
          [ESTADOS_TAREA.COMPLETADA]: 0
        };

        for (let i = 1; i < tarData.length; i++) {
          const estado = tarData[i][5];
          if (estadosTareas[estado] !== undefined) {
            estadosTareas[estado]++;
          }
        }

        datos = {
          labels: Object.keys(estadosTareas),
          cantidades: Object.values(estadosTareas)
        };
        break;

      default:
        return {
          exito: false,
          error: 'Tipo de gráfico no reconocido: ' + tipo
        };
    }

    Logger.log('✅ Datos de gráfico obtenidos exitosamente');

    return {
      exito: true,
      tipo: tipo,
      datos: datos
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo datos de gráfico: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo datos de gráfico: ' + error.message
    };
  }
}

/**
 * Exporta datos de una entidad a formato CSV
 * @param {Object} usuario - Usuario autenticado
 * @param {string} entidad - Nombre de la entidad (reuniones, tareas, contactos, etc)
 * @param {Object} filtros - Filtros opcionales
 * @returns {Object} Datos exportados
 */
function exportarDatos(usuario, entidad, filtros = {}) {
  try {
    Logger.log('💾 Exportando datos de: ' + entidad);

    if (!usuario.permisos.includes('exportar_datos')) {
      return {
        exito: false,
        error: 'No tienes permiso para exportar datos'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet;
    let datos = [];
    let encabezados = [];

    switch (entidad) {
      case 'reuniones':
        sheet = ss.getSheetByName('Reuniones');
        break;
      case 'tareas':
        sheet = ss.getSheetByName('Tareas');
        break;
      case 'contactos':
        sheet = ss.getSheetByName('Contactos');
        break;
      case 'oportunidades':
        sheet = ss.getSheetByName('Pipeline');
        break;
      case 'cotizaciones':
        sheet = ss.getSheetByName('Cotizaciones');
        break;
      default:
        return {
          exito: false,
          error: 'Entidad no válida para exportar: ' + entidad
        };
    }

    const data = sheet.getDataRange().getValues();
    encabezados = data[0];

    // Obtener filas (excepto encabezado)
    for (let i = 1; i < data.length; i++) {
      // Aplicar filtros básicos si existen
      let incluir = true;

      if (filtros.usuarioId && !usuario.permisos.includes('ver_todo')) {
        // Filtrar por usuario propietario dependiendo de la entidad
        const colUsuario = entidad === 'reuniones' ? 6 : (entidad === 'tareas' ? 7 : 11);
        if (data[i][colUsuario] !== usuario.id) {
          incluir = false;
        }
      }

      if (incluir) {
        datos.push(data[i]);
      }
    }

    // Convertir a CSV
    let csv = encabezados.join(',') + '\n';
    datos.forEach(fila => {
      csv += fila.map(celda => {
        // Escapar comillas y comas
        const valor = String(celda).replace(/"/g, '""');
        return celda instanceof Date
          ? Utilities.formatDate(celda, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
          : `"${valor}"`;
      }).join(',') + '\n';
    });

    Logger.log(`✅ ${datos.length} registros exportados`);

    return {
      exito: true,
      entidad: entidad,
      totalRegistros: datos.length,
      csv: csv,
      encabezados: encabezados
    };

  } catch (error) {
    Logger.log('❌ Error exportando datos: ' + error.message);
    return {
      exito: false,
      error: 'Error exportando datos: ' + error.message
    };
  }
}

// ============================================
// CALENDARIO VISUAL AVANZADO
// ============================================

/**
 * Obtiene eventos del calendario para un rango de fechas
 * @param {Object} usuario - Usuario autenticado
 * @param {string} inicio - Fecha inicio (YYYY-MM-DD)
 * @param {string} fin - Fecha fin (YYYY-MM-DD)
 * @returns {Object} Eventos del calendario
 */
function obtenerEventosCalendario(usuario, inicio, fin) {
  try {
    Logger.log('📅 Obteniendo eventos del calendario');

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    // Obtener reuniones del sistema
    const resultado = listarReuniones(usuario, {
      fechaInicio: inicio,
      fechaFin: fin
    });

    if (!resultado.exito) {
      return resultado;
    }

    // Formatear eventos para vista de calendario
    const eventos = resultado.reuniones.map(reunion => {
      const fechaHoraInicio = new Date(reunion.fecha + ' ' + reunion.horaInicio);
      const fechaHoraFin = new Date(reunion.fecha + ' ' + reunion.horaFin);

      return {
        id: reunion.id,
        title: reunion.titulo,
        start: Utilities.formatDate(fechaHoraInicio, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
        end: Utilities.formatDate(fechaHoraFin, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss"),
        tipo: 'reunion',
        ubicacion: reunion.ubicacion || '',
        participantes: reunion.participantes || [],
        estado: reunion.estado,
        color: obtenerColorEvento(reunion.tipoReunion)
      };
    });

    // También incluir tareas con fecha límite
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const tarSheet = ss.getSheetByName('Tareas');
    const tarData = tarSheet.getDataRange().getValues();

    for (let i = 1; i < tarData.length; i++) {
      const fechaVencimiento = tarData[i][4];

      if (fechaVencimiento && fechaVencimiento >= fechaInicio && fechaVencimiento <= fechaFin) {
        // Verificar permisos
        if (!usuario.permisos.includes('ver_todo') && tarData[i][7] !== usuario.id) {
          continue;
        }

        eventos.push({
          id: tarData[i][0],
          title: '📋 ' + tarData[i][1],
          start: Utilities.formatDate(new Date(fechaVencimiento), Session.getScriptTimeZone(), "yyyy-MM-dd'T'09:00:00"),
          end: Utilities.formatDate(new Date(fechaVencimiento), Session.getScriptTimeZone(), "yyyy-MM-dd'T'09:30:00"),
          tipo: 'tarea',
          estado: tarData[i][5],
          color: '#9b59b6',
          allDay: true
        });
      }
    }

    Logger.log(`✅ ${eventos.length} eventos obtenidos`);

    return {
      exito: true,
      eventos: eventos,
      total: eventos.length
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo eventos: ' + error.message);
    return {
      exito: false,
      error: 'Error obteniendo eventos: ' + error.message
    };
  }
}

/**
 * Obtiene la disponibilidad de usuarios para una fecha
 * @param {Object} usuario - Usuario autenticado
 * @param {string} fecha - Fecha a verificar (YYYY-MM-DD)
 * @param {Array} usuarioIds - IDs de usuarios a verificar
 * @returns {Object} Disponibilidad por usuario
 */
function obtenerDisponibilidad(usuario, fecha, usuarioIds = []) {
  try {
    Logger.log('🕐 Verificando disponibilidad para: ' + fecha);

    const fechaObj = new Date(fecha);
    const fechaInicio = Utilities.formatDate(fechaObj, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const fechaFin = fechaInicio;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const reunSheet = ss.getSheetByName('Reuniones');
    const data = reunSheet.getDataRange().getValues();

    const disponibilidad = {};

    // Inicializar disponibilidad para cada usuario
    usuarioIds.forEach(uid => {
      disponibilidad[uid] = {
        usuarioId: uid,
        ocupado: [],
        libre: true
      };
    });

    // Revisar reuniones del día
    for (let i = 1; i < data.length; i++) {
      const fechaReunion = Utilities.formatDate(new Date(data[i][1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');

      if (fechaReunion === fechaInicio) {
        const organizadorId = data[i][6];
        const participantes = data[i][9] ? JSON.parse(data[i][9]) : [];

        const horaInicio = data[i][2];
        const horaFin = data[i][3];

        // Marcar organizador como ocupado
        if (disponibilidad[organizadorId]) {
          disponibilidad[organizadorId].ocupado.push({
            inicio: horaInicio,
            fin: horaFin,
            titulo: data[i][4]
          });
          disponibilidad[organizadorId].libre = false;
        }

        // Marcar participantes como ocupados
        participantes.forEach(partId => {
          if (disponibilidad[partId]) {
            disponibilidad[partId].ocupado.push({
              inicio: horaInicio,
              fin: horaFin,
              titulo: data[i][4]
            });
            disponibilidad[partId].libre = false;
          }
        });
      }
    }

    Logger.log('✅ Disponibilidad verificada');

    return {
      exito: true,
      fecha: fechaInicio,
      disponibilidad: disponibilidad
    };

  } catch (error) {
    Logger.log('❌ Error verificando disponibilidad: ' + error.message);
    return {
      exito: false,
      error: 'Error verificando disponibilidad: ' + error.message
    };
  }
}

/**
 * Obtiene el color para un evento según su tipo
 * @param {string} tipoReunion - Tipo de reunión
 * @returns {string} Color en formato hex
 */
function obtenerColorEvento(tipoReunion) {
  const colores = {
    'Cliente': '#3498db',
    'Interna': '#9b59b6',
    'Prospecto': '#e74c3c',
    'Seguimiento': '#f39c12',
    'Demo': '#1abc9c',
    'Otro': '#95a5a6'
  };

  return colores[tipoReunion] || colores['Otro'];
}

// ============================================
// GESTIÓN AVANZADA DE USUARIOS Y ROLES
// ============================================

/**
 * Lista todos los usuarios del sistema
 * @param {Object} usuario - Usuario autenticado
 * @returns {Object} Lista de usuarios
 */
function listarTodosUsuarios(usuario) {
  try {
    Logger.log('👥 Listando todos los usuarios');

    if (!usuario.permisos.includes('admin')) {
      return {
        exito: false,
        error: 'No tienes permiso para listar usuarios'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName('Usuarios');
    const data = userSheet.getDataRange().getValues();

    const usuarios = [];

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];

      usuarios.push({
        id: fila[0],
        username: fila[1],
        // No incluir password por seguridad
        nombreCompleto: fila[3],
        email: fila[4],
        rol: fila[5],
        permisos: fila[6] ? JSON.parse(fila[6]) : [],
        activo: fila[7],
        ultimoAcceso: fila[8] ? Utilities.formatDate(new Date(fila[8]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : null,
        fechaCreacion: fila[9] ? Utilities.formatDate(new Date(fila[9]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : null
      });
    }

    Logger.log(`✅ ${usuarios.length} usuarios encontrados`);

    return {
      exito: true,
      usuarios: usuarios,
      total: usuarios.length
    };

  } catch (error) {
    Logger.log('❌ Error listando usuarios: ' + error.message);
    return {
      exito: false,
      error: 'Error listando usuarios: ' + error.message
    };
  }
}

/**
 * Crea un nuevo usuario en el sistema
 * @param {Object} usuario - Usuario autenticado (admin)
 * @param {Object} nuevoUsuario - Datos del nuevo usuario
 * @returns {Object} Resultado
 */
function crearUsuarioEndpoint(usuario, nuevoUsuario) {
  try {
    Logger.log('➕ Creando nuevo usuario');

    if (!usuario.permisos.includes('admin')) {
      return {
        exito: false,
        error: 'No tienes permiso para crear usuarios'
      };
    }

    // Validar datos requeridos
    if (!nuevoUsuario.username || !nuevoUsuario.password || !nuevoUsuario.nombreCompleto) {
      return {
        exito: false,
        error: 'username, password y nombreCompleto son requeridos'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName('Usuarios');
    const data = userSheet.getDataRange().getValues();

    // Verificar que el username no exista
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === nuevoUsuario.username) {
        return {
          exito: false,
          error: 'El username ya existe'
        };
      }
    }

    // Preparar datos
    const userId = generarID();
    const passwordHash = hashPassword(nuevoUsuario.password);
    const rol = nuevoUsuario.rol || ROLES.USUARIO;
    const permisos = obtenerPermisosPorRol(rol);
    const email = nuevoUsuario.email || '';
    const activo = nuevoUsuario.activo !== undefined ? nuevoUsuario.activo : 'SI';
    const ahora = new Date();

    // Insertar nuevo usuario
    userSheet.appendRow([
      userId,
      nuevoUsuario.username,
      passwordHash,
      nuevoUsuario.nombreCompleto,
      email,
      rol,
      JSON.stringify(permisos),
      activo,
      null, // ultimoAcceso
      ahora, // fechaCreacion
      ahora, // fechaModificacion
      usuario.id // creadoPorId
    ]);

    Logger.log('✅ Usuario creado exitosamente: ' + userId);

    return {
      exito: true,
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id: userId,
        username: nuevoUsuario.username,
        nombreCompleto: nuevoUsuario.nombreCompleto,
        rol: rol
      }
    };

  } catch (error) {
    Logger.log('❌ Error creando usuario: ' + error.message);
    return {
      exito: false,
      error: 'Error creando usuario: ' + error.message
    };
  }
}

/**
 * Actualiza un usuario existente
 * @param {Object} usuario - Usuario autenticado (admin)
 * @param {string} usuarioId - ID del usuario a actualizar
 * @param {Object} cambios - Cambios a aplicar
 * @returns {Object} Resultado
 */
function actualizarUsuarioEndpoint(usuario, usuarioId, cambios) {
  try {
    Logger.log('✏️ Actualizando usuario: ' + usuarioId);

    if (!usuario.permisos.includes('admin')) {
      return {
        exito: false,
        error: 'No tienes permiso para actualizar usuarios'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName('Usuarios');
    const data = userSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === usuarioId) {
        // Mapeo de campos (sin password ni username por seguridad)
        const mapeo = {
          nombreCompleto: 4,
          email: 5
        };

        let cambiosAplicados = [];
        for (const [campo, valor] of Object.entries(cambios)) {
          if (mapeo[campo]) {
            userSheet.getRange(i + 1, mapeo[campo]).setValue(valor);
            cambiosAplicados.push(campo);
          }
        }

        // Si se cambia el password, hashear
        if (cambios.password) {
          const nuevoHash = hashPassword(cambios.password);
          userSheet.getRange(i + 1, 3).setValue(nuevoHash);
          cambiosAplicados.push('password');
        }

        // Actualizar fecha de modificación
        userSheet.getRange(i + 1, 11).setValue(new Date());

        Logger.log(`✅ Usuario actualizado: ${cambiosAplicados.length} cambios`);

        return {
          exito: true,
          mensaje: 'Usuario actualizado exitosamente',
          cambiosAplicados: cambiosAplicados
        };
      }
    }

    return {
      exito: false,
      error: 'Usuario no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error actualizando usuario: ' + error.message);
    return {
      exito: false,
      error: 'Error actualizando usuario: ' + error.message
    };
  }
}

/**
 * Cambia el rol de un usuario
 * @param {Object} usuario - Usuario autenticado (admin)
 * @param {string} usuarioId - ID del usuario
 * @param {string} nuevoRol - Nuevo rol
 * @returns {Object} Resultado
 */
function cambiarRolUsuario(usuario, usuarioId, nuevoRol) {
  try {
    Logger.log(`🔄 Cambiando rol de usuario ${usuarioId} a: ${nuevoRol}`);

    if (!usuario.permisos.includes('admin')) {
      return {
        exito: false,
        error: 'No tienes permiso para cambiar roles'
      };
    }

    // Validar rol
    const rolesValidos = Object.values(ROLES);
    if (!rolesValidos.includes(nuevoRol)) {
      return {
        exito: false,
        error: 'Rol no válido. Roles permitidos: ' + rolesValidos.join(', ')
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName('Usuarios');
    const data = userSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === usuarioId) {
        // Actualizar rol
        userSheet.getRange(i + 1, 6).setValue(nuevoRol);

        // Actualizar permisos según el nuevo rol
        const nuevosPermisos = obtenerPermisosPorRol(nuevoRol);
        userSheet.getRange(i + 1, 7).setValue(JSON.stringify(nuevosPermisos));

        // Actualizar fecha de modificación
        userSheet.getRange(i + 1, 11).setValue(new Date());

        Logger.log('✅ Rol actualizado exitosamente');

        return {
          exito: true,
          mensaje: `Rol cambiado a: ${nuevoRol}`,
          permisos: nuevosPermisos
        };
      }
    }

    return {
      exito: false,
      error: 'Usuario no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error cambiando rol: ' + error.message);
    return {
      exito: false,
      error: 'Error cambiando rol: ' + error.message
    };
  }
}

/**
 * Activa o desactiva un usuario
 * @param {Object} usuario - Usuario autenticado (admin)
 * @param {string} usuarioId - ID del usuario
 * @param {boolean} activo - true para activar, false para desactivar
 * @returns {Object} Resultado
 */
function activarDesactivarUsuario(usuario, usuarioId, activo) {
  try {
    Logger.log(`🔄 ${activo ? 'Activando' : 'Desactivando'} usuario: ${usuarioId}`);

    if (!usuario.permisos.includes('admin')) {
      return {
        exito: false,
        error: 'No tienes permiso para activar/desactivar usuarios'
      };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName('Usuarios');
    const data = userSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === usuarioId) {
        const estadoNuevo = activo ? 'SI' : 'NO';

        // Actualizar estado
        userSheet.getRange(i + 1, 8).setValue(estadoNuevo);

        // Actualizar fecha de modificación
        userSheet.getRange(i + 1, 11).setValue(new Date());

        // Si se desactiva, cerrar todas sus sesiones
        if (!activo) {
          cerrarSesionesUsuario(usuarioId);
        }

        Logger.log('✅ Usuario ' + (activo ? 'activado' : 'desactivado'));

        return {
          exito: true,
          mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
        };
      }
    }

    return {
      exito: false,
      error: 'Usuario no encontrado'
    };

  } catch (error) {
    Logger.log('❌ Error activando/desactivando usuario: ' + error.message);
    return {
      exito: false,
      error: 'Error activando/desactivando usuario: ' + error.message
    };
  }
}

/**
 * Cierra todas las sesiones de un usuario
 * @param {string} usuarioId - ID del usuario
 */
function cerrarSesionesUsuario(usuarioId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sesSheet = ss.getSheetByName('Sesiones');
    const data = sesSheet.getDataRange().getValues();

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] === usuarioId) {
        sesSheet.deleteRow(i + 1);
      }
    }

    Logger.log('✅ Sesiones del usuario cerradas');

  } catch (error) {
    Logger.log('⚠️ Error cerrando sesiones: ' + error.message);
  }
}

// ============================================
// AUTOMATIZACIONES Y PROCESOS AUTOMÁTICOS
// ============================================

/**
 * Procesa recordatorios pendientes y envía notificaciones
 * Se ejecuta automáticamente cada hora via trigger
 */
function procesarRecordatorios() {
  try {
    Logger.log('⏰ Procesando recordatorios automáticos');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const recSheet = ss.getSheetByName('Recordatorios');
    const data = recSheet.getDataRange().getValues();

    const ahora = new Date();
    let recordatoriosProcesados = 0;

    for (let i = 1; i < data.length; i++) {
      const fila = data[i];
      const fechaHoraRecordatorio = new Date(fila[3]);
      const enviado = fila[4];

      // Si el recordatorio está pendiente y ya llegó la hora
      if (enviado === 'NO' && fechaHoraRecordatorio <= ahora) {
        const usuarioId = fila[2];
        const entidad = fila[5];
        const entidadId = fila[6];
        const mensaje = fila[7];

        // Crear notificación
        crearNotificacion(usuarioId, {
          tipo: 'recordatorio',
          titulo: 'Recordatorio',
          mensaje: mensaje,
          entidad: entidad,
          entidadId: entidadId,
          prioridad: 'media'
        });

        // Marcar como enviado
        recSheet.getRange(i + 1, 5).setValue('SI');
        recSheet.getRange(i + 1, 8).setValue(ahora);

        recordatoriosProcesados++;
      }
    }

    Logger.log(`✅ ${recordatoriosProcesados} recordatorios procesados`);

    return {
      exito: true,
      procesados: recordatoriosProcesados
    };

  } catch (error) {
    Logger.log('❌ Error procesando recordatorios: ' + error.message);
    return {
      exito: false,
      error: 'Error procesando recordatorios: ' + error.message
    };
  }
}

/**
 * Actualiza estados automáticos (tareas vencidas, cotizaciones expiradas, etc)
 * Se ejecuta automáticamente cada 30 minutos via trigger
 */
function actualizarEstadosAutomaticos() {
  try {
    Logger.log('🔄 Actualizando estados automáticos');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ahora = new Date();
    let actualizaciones = 0;

    // 1. Marcar tareas vencidas
    const tarSheet = ss.getSheetByName('Tareas');
    const tarData = tarSheet.getDataRange().getValues();

    for (let i = 1; i < tarData.length; i++) {
      const estado = tarData[i][5];
      const fechaVencimiento = new Date(tarData[i][4]);

      if (estado !== ESTADOS_TAREA.COMPLETADA && fechaVencimiento < ahora) {
        // Crear notificación de tarea vencida
        const usuarioAsignadoId = tarData[i][7];
        crearNotificacion(usuarioAsignadoId, {
          tipo: 'alerta',
          titulo: 'Tarea Vencida',
          mensaje: `La tarea "${tarData[i][1]}" está vencida`,
          entidad: 'tarea',
          entidadId: tarData[i][0],
          prioridad: 'alta'
        });

        actualizaciones++;
      }
    }

    // 2. Marcar cotizaciones expiradas
    const cotSheet = ss.getSheetByName('Cotizaciones');
    const cotData = cotSheet.getDataRange().getValues();

    for (let i = 1; i < cotData.length; i++) {
      const estado = cotData[i][6];
      const fechaVencimiento = new Date(cotData[i][5]);

      if (estado === ESTADOS_COTIZACION.ENVIADA && fechaVencimiento < ahora) {
        // Cambiar estado a expirada
        cotSheet.getRange(i + 1, 7).setValue(ESTADOS_COTIZACION.RECHAZADA);

        // Notificar al creador
        const usuarioCreadorId = cotData[i][14];
        crearNotificacion(usuarioCreadorId, {
          tipo: 'alerta',
          titulo: 'Cotización Expirada',
          mensaje: `La cotización ${cotData[i][1]} ha expirado`,
          entidad: 'cotizacion',
          entidadId: cotData[i][0],
          prioridad: 'media'
        });

        actualizaciones++;
      }
    }

    // 3. Limpiar sesiones expiradas
    const sesSheet = ss.getSheetByName('Sesiones');
    const sesData = sesSheet.getDataRange().getValues();

    for (let i = sesData.length - 1; i >= 1; i--) {
      const fechaExpiracion = new Date(sesData[i][3]);

      if (fechaExpiracion < ahora) {
        sesSheet.deleteRow(i + 1);
        actualizaciones++;
      }
    }

    Logger.log(`✅ ${actualizaciones} estados actualizados`);

    return {
      exito: true,
      actualizaciones: actualizaciones
    };

  } catch (error) {
    Logger.log('❌ Error actualizando estados: ' + error.message);
    return {
      exito: false,
      error: 'Error actualizando estados: ' + error.message
    };
  }
}

/**
 * Genera un reporte diario automático
 * Se ejecuta automáticamente cada día a las 6 PM via trigger
 */
function generarReporteDiario() {
  try {
    Logger.log('📊 Generando reporte diario automático');

    const hoy = new Date();
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Contar actividades del día
    const reunSheet = ss.getSheetByName('Reuniones');
    const tarSheet = ss.getSheetByName('Tareas');
    const cotSheet = ss.getSheetByName('Cotizaciones');
    const pipSheet = ss.getSheetByName('Pipeline');

    const reunData = reunSheet.getDataRange().getValues();
    const tarData = tarSheet.getDataRange().getValues();
    const cotData = cotSheet.getDataRange().getValues();
    const pipData = pipSheet.getDataRange().getValues();

    let reunionesHoy = 0;
    let tareasCompletadasHoy = 0;
    let cotizacionesCreadasHoy = 0;
    let oportunidadesCreadasHoy = 0;

    // Contar reuniones
    for (let i = 1; i < reunData.length; i++) {
      const fecha = new Date(reunData[i][1]);
      if (fecha >= inicioDelDia && fecha <= finDelDia) {
        reunionesHoy++;
      }
    }

    // Contar tareas completadas
    for (let i = 1; i < tarData.length; i++) {
      const fechaCompletado = new Date(tarData[i][11]);
      if (tarData[i][5] === ESTADOS_TAREA.COMPLETADA && fechaCompletado >= inicioDelDia && fechaCompletado <= finDelDia) {
        tareasCompletadasHoy++;
      }
    }

    // Contar cotizaciones creadas
    for (let i = 1; i < cotData.length; i++) {
      const fechaCreacion = new Date(cotData[i][16]);
      if (fechaCreacion >= inicioDelDia && fechaCreacion <= finDelDia) {
        cotizacionesCreadasHoy++;
      }
    }

    // Contar oportunidades creadas
    for (let i = 1; i < pipData.length; i++) {
      const fechaCreacion = new Date(pipData[i][12]);
      if (fechaCreacion >= inicioDelDia && fechaCreacion <= finDelDia) {
        oportunidadesCreadasHoy++;
      }
    }

    const resumen = {
      fecha: Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      reuniones: reunionesHoy,
      tareasCompletadas: tareasCompletadasHoy,
      cotizaciones: cotizacionesCreadasHoy,
      oportunidades: oportunidadesCreadasHoy
    };

    // Guardar resumen
    const reportSheet = ss.getSheetByName('ReportesVentas');
    reportSheet.appendRow([
      generarID(),
      new Date(),
      'SISTEMA',
      Utilities.formatDate(inicioDelDia, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      Utilities.formatDate(finDelDia, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      JSON.stringify(resumen)
    ]);

    Logger.log('✅ Reporte diario generado: ' + JSON.stringify(resumen));

    return {
      exito: true,
      resumen: resumen
    };

  } catch (error) {
    Logger.log('❌ Error generando reporte diario: ' + error.message);
    return {
      exito: false,
      error: 'Error generando reporte diario: ' + error.message
    };
  }
}

// ============================================
// FIN DE CODE_PART3.GS
// ============================================
//
// RESUMEN DE FUNCIONALIDADES IMPLEMENTADAS:
// ✅ Pipeline de ventas completo (CRUD + visual)
// ✅ Sistema de cotizaciones con items
// ✅ Reportes y analíticas avanzadas
// ✅ Calendario visual con disponibilidad
// ✅ Gestión completa de usuarios y roles
// ✅ Automatizaciones y procesos automáticos
// ✅ Exportación de datos a CSV
// ✅ Gráficos y métricas
//
// TOTAL: ~2,000 líneas
//
// PRÓXIMO PASO: Crear Index.html (Frontend completo)
// ============================================
