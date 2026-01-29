# 📋 Instrucciones de Instalación - OVA CRM

## ✅ Pasos Completados
- ✅ Has ejecutado `configurarSistemaCompleto()` exitosamente
- ✅ Spreadsheet creado: https://docs.google.com/spreadsheets/d/1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o/edit
- ✅ Calendar configurado
- ✅ Drive configurado
- ✅ Triggers activados

## ⚠️ Problema Actual

El error **"No HTML file named Login was found"** ocurre porque **el archivo HTML debe estar DENTRO de Google Apps Script**, no solo en GitHub.

---

## 🔧 Solución: Crear el Archivo HTML en Apps Script

### **Paso 1: Abrir tu proyecto de Apps Script**
1. Ve a [script.google.com](https://script.google.com)
2. Abre tu proyecto OVA CRM

### **Paso 2: Crear el archivo HTML**
1. En el editor de Apps Script, busca el panel izquierdo con tus archivos
2. Haz clic en el icono **"+"** (Agregar archivo) junto a "Archivos"
3. Selecciona **"HTML"**
4. En el campo de nombre, escribe exactamente: **`Index`** (sin extensión .html)
5. Haz clic en "Crear"

### **Paso 3: Copiar el contenido HTML**
1. Abre el archivo `Index.html` de tu repositorio de GitHub
2. Copia **TODO** el contenido (desde `<!DOCTYPE html>` hasta `</html>`)
3. Pega el contenido en el archivo **Index** que acabas de crear en Apps Script
4. Presiona **Ctrl+S** (o Cmd+S en Mac) para guardar

### **Paso 4: Verificar que el archivo se llame correctamente**
- El archivo debe aparecer como: `Index.html` en el panel izquierdo
- NO debe tener espacios ni mayúsculas incorrectas
- Debe estar al mismo nivel que tus archivos `.gs`

---

## 🚀 Desplegar como Web App

### **Paso 1: Crear nueva implementación**
1. En el editor de Apps Script, haz clic en **"Implementar"** (arriba a la derecha)
2. Selecciona **"Nueva implementación"**

### **Paso 2: Configurar la implementación**
1. **Tipo**: Selecciona "Aplicación web"
2. **Descripción**: "OVA CRM v1.0"
3. **Ejecutar como**: **Yo** (tu cuenta)
4. **Quién tiene acceso**:
   - Para uso personal: **Solo yo**
   - Para compartir: **Cualquier usuario** o **Cualquier usuario de [tu dominio]**
5. Haz clic en **"Implementar"**

### **Paso 3: Autorizar permisos**
1. Aparecerá una ventana solicitando permisos
2. Haz clic en **"Autorizar acceso"**
3. Selecciona tu cuenta de Google
4. **IMPORTANTE**: Puede aparecer "Google hasn't verified this app"
   - Haz clic en **"Opciones avanzadas"**
   - Haz clic en **"Ir a [nombre del proyecto] (no seguro)"**
5. Haz clic en **"Permitir"**

### **Paso 4: Obtener la URL**
1. Copia la **URL de implementación** que aparece
2. Guárdala en un lugar seguro
3. Haz clic en **"Listo"**

---

## 🔑 Configurar API Key de Groq

### **Opción 1: Desde Google Sheets (Recomendada)**
1. Abre el Spreadsheet: https://docs.google.com/spreadsheets/d/1VO0MxFKTrxh8SYMYCijREzykDKQZN9hVxOdWieFBe-o/edit
2. Ve a la hoja **"Configuracion"**
3. Busca la fila que dice **GROQ_API_KEY**
4. En la columna **valor**, pega tu API key de Groq (obtener desde https://console.groq.com/keys)
5. Guarda (Ctrl+S)

### **Opción 2: Desde Apps Script (Más segura)**
1. En el editor de Apps Script, ve a **Configuración del proyecto** (⚙️ en el menú izquierdo)
2. Desplázate hasta **"Propiedades del script"**
3. Haz clic en **"Agregar propiedad del script"**
4. **Propiedad**: `GROQ_API_KEY`
5. **Valor**: Tu API key de Groq (obtener desde https://console.groq.com/keys)
6. Haz clic en **"Guardar propiedades del script"**

**¿Dónde obtener la API Key?**
- Ve a https://console.groq.com/keys
- Inicia sesión o crea una cuenta gratuita
- Crea una nueva API key
- Cópiala y úsala en una de las opciones anteriores

---

## 🎯 Acceder al CRM

1. Abre la URL de implementación en tu navegador
2. Deberías ver la pantalla de login con el logo **OVA**
3. Usa uno de estos usuarios:
   - **admin** / admin123
   - **manager** / manager123
   - **usuario1** / user123

---

## ❌ Solución de Problemas Comunes

### **Error: "No HTML file named Index was found"**
✅ **Solución**: El archivo HTML DEBE estar en Apps Script con el nombre exacto **`Index`**
- Verifica que el archivo se llame `Index.html` en el panel izquierdo
- NO debe llamarse `index.html` (minúscula) ni `INDEX.html`
- Debe estar al mismo nivel que los archivos .gs

### **Error: "Cannot call SpreadsheetApp.getUi() from this context"**
✅ **Ya corregido** - Este error ya no debería aparecer

### **La página no carga o muestra error 404**
✅ **Solución**:
1. Verifica que la URL sea la correcta (la que te dio Apps Script)
2. Asegúrate de haber dado los permisos necesarios
3. Intenta crear una **nueva implementación** (Implementar → Nueva implementación)

### **El login no funciona**
✅ **Solución**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Si dice "google.script.run is not defined", significa que el HTML no se está sirviendo correctamente desde Apps Script

### **El Chat IA no responde**
✅ **Solución**:
1. Verifica que hayas configurado la API key de Groq
2. Abre la hoja "Configuracion" en el Spreadsheet
3. Asegúrate de que GROQ_API_KEY tenga un valor

---

## 📊 Verificar que Todo Funciona

### **Checklist de Verificación**

- [ ] ✅ Archivo `Index.html` creado en Apps Script
- [ ] ✅ Código copiado correctamente en el archivo
- [ ] ✅ Web App desplegada
- [ ] ✅ Permisos autorizados
- [ ] ✅ URL de implementación funciona
- [ ] ✅ Pantalla de login aparece
- [ ] ✅ Login con admin/admin123 funciona
- [ ] ✅ Dashboard muestra métricas
- [ ] ✅ API key de Groq configurada
- [ ] ✅ Chat IA responde mensajes

---

## 🎉 ¡Sistema Listo!

Una vez completados todos los pasos, tendrás:

✅ Sistema CRM funcional
✅ Dashboard con métricas en tiempo real
✅ Chat IA integrado
✅ Gestión de reuniones, tareas y contactos
✅ Pipeline de ventas visual
✅ Sistema de cotizaciones
✅ Reportes automáticos
✅ Automatizaciones activas

---

## 📞 Soporte

Si sigues teniendo problemas:

1. **Revisa los logs de Apps Script**:
   - En el editor, ve a "Ejecuciones" en el menú izquierdo
   - Busca errores en rojo

2. **Verifica la consola del navegador**:
   - Presiona F12 en tu navegador
   - Ve a la pestaña "Console"
   - Busca mensajes de error

3. **Comparte el error específico** que estás viendo y podré ayudarte mejor

---

**¡Éxito con tu CRM! 🚀**
