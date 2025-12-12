# MeetUp Demo Day - Sistema de Evaluación

## 🔄 Almacenamiento de Datos

Este sistema soporta múltiples modos de almacenamiento dependiendo de dónde se ejecute:

### 1. **GitHub Gist (Producción en Vercel)** ✅ Recomendado para producción
- **Cuándo se usa**: Cuando la aplicación se ejecuta en Vercel u otro hosting
- **Características**:
  - Almacenamiento compartido entre todos los usuarios
  - Los datos persisten entre sesiones
  - Todos ven los mismos datos en tiempo real
  - Compatible con cualquier hosting (Vercel, Netlify, etc.)
- **Requiere configuración**: Ver instrucciones abajo (muy fácil, toma 2 minutos)

### 2. **Spark KV (GitHub Spark)** ✅ Solo en desarrollo con Spark
- **Cuándo se usa**: Automáticamente cuando la aplicación se ejecuta en GitHub Spark
- **Características**: 
  - Almacenamiento persistente automático
  - Los datos se sincronizan entre sesiones
  - No requiere configuración adicional
- **Nota**: NO está disponible en Vercel, necesitas configurar GitHub Gist

### 3. **LocalStorage (Fallback)** ⚠️ Solo para pruebas locales
- **Cuándo se usa**: Si no hay Spark KV ni GitHub Gist configurado
- **Características**:
  - Los datos solo existen en el navegador del usuario
  - Cada usuario ve sus propios datos
  - No hay sincronización entre usuarios

---

## 🚀 Configurar GitHub Gist para Vercel (REQUERIDO)

⚠️ **IMPORTANTE**: Cuando despliegues en Vercel, los datos NO se compartirán automáticamente entre dispositivos. Debes configurar GitHub Gist siguiendo estos pasos:

### Paso 1: Crear un Personal Access Token en GitHub (2 minutos)

1. Ve a GitHub.com e inicia sesión
2. Haz click en tu avatar → **Settings**
3. En el menú lateral, ve a **Developer settings** (al final)
4. Click en **Personal access tokens** → **Tokens (classic)**
5. Click en **Generate new token** → **Generate new token (classic)**
6. Dale un nombre descriptivo, por ejemplo: `MeetUp Demo Day Database`
7. En "Select scopes", marca **solo** la casilla `gist`
8. Click en **Generate token**
9. **¡IMPORTANTE!** Copia el token inmediatamente (empieza con `ghp_`). No podrás verlo de nuevo.

### Paso 2: Configurar en tu aplicación desplegada (1 minuto)

1. Abre tu aplicación desplegada en Vercel
2. Ve al **Panel de Administración** (botón "Admin" en la página principal)
3. En la pestaña **"Almacenamiento"** (primera pestaña)
4. Verás un badge naranja que dice "localStorage" - esto significa que aún no está configurado
5. Expande la sección **"Configurar GitHub Gist"** haciendo click en "Mostrar instrucciones"
6. Pega tu token de GitHub en el campo **"Token de GitHub"**
7. **Opción A - Crear nuevo Gist (recomendado si es tu primera vez):**
   - Deja el campo "Gist ID" vacío
   - Click en **"Configurar Almacenamiento Compartido"**
   - El sistema creará un nuevo Gist y mostrará el ID
   - **GUARDA EL GIST ID** en un lugar seguro (lo necesitarás si borras la caché)
8. **Opción B - Usar Gist existente:**
   - Si ya creaste un Gist antes, pega su ID en el campo "Gist ID"
   - Click en **"Configurar Almacenamiento Compartido"**
9. La página se recargará automáticamente
10. Verifica que ahora el badge sea azul y diga "GitHub Gist" ✅

### Paso 3: Cargar datos de prueba (opcional)

1. Ve a la pestaña **"Datos"**
2. Click en **"Cargar datos de prueba"**
3. Esto creará programas, equipos y proyectos de ejemplo

### Paso 4: Compartir con otros usuarios/dispositivos

Para que otros puedan ver y gestionar los mismos datos:

**Opción 1 - Mismo token (recomendado para administradores):**
1. Comparte el **Gist ID** y el **GitHub Token** con otros administradores (de forma segura)
2. Cada persona debe ir a Admin → Almacenamiento y configurar con los mismos valores
3. Todos verán y podrán modificar los mismos datos

**Opción 2 - Ver el Gist en GitHub:**
1. Ve a https://gist.github.com/[tu-usuario]
2. Encontrarás el Gist llamado "MeetUp Demo Day - Database Storage"
3. Puedes ver los datos almacenados directamente en formato JSON

---

## 🔐 Seguridad

- El token de GitHub se guarda en localStorage del navegador (no en el servidor)
- Nunca compartas tu token públicamente
- El token solo necesita permisos de `gist`, nada más
- Puedes revocar el token en cualquier momento desde GitHub Settings
- Los Gists son privados por defecto (solo tú puedes verlos con el token)

---

## 📊 Verificar que funciona

### En tu aplicación:
1. Configura el almacenamiento con tu token de GitHub
2. El badge debe cambiar de naranja (localStorage) a azul (GitHub Gist)
3. Crea un programa o proyecto de prueba en Admin → Datos
4. Abre la aplicación en otro navegador o dispositivo
5. Configura con el mismo token y Gist ID
6. Verifica que el programa/proyecto aparece automáticamente

### En GitHub:
1. Ve a https://gist.github.com/[tu-usuario]
2. Busca el Gist "MeetUp Demo Day - Database Storage"
3. Ábrelo y verás un archivo `database.json` con todos tus datos

---

## 🆘 Solución de Problemas

### "Veo badge naranja que dice localStorage en Vercel"
✅ **Esto es normal la primera vez**. Significa que necesitas configurar GitHub Gist siguiendo los pasos de arriba. Es un proceso de 3 minutos.

### "Los datos no aparecen en otro navegador/dispositivo"
- Verifica que ambos dispositivos tengan la misma configuración de Gist
- Comprueba que el Gist ID sea exactamente el mismo en ambos
- Verifica que el token tenga permisos de `gist`
- Intenta recargar la página después de configurar

### "Error: Failed to set key" o "Error al configurar el almacenamiento"
- Verifica que el token sea válido y no haya expirado
- Asegúrate de que el token tenga el scope `gist` activado
- Si el token es correcto, intenta sin poner un Gist ID (dejar vacío) para crear uno nuevo
- Verifica tu conexión a internet

### "Error 404 en /_spark/kv" en la consola
✅ **Esto es normal en Vercel**. Significa que Spark KV no está disponible (solo funciona en GitHub Spark). Configura GitHub Gist y este error desaparecerá de tu atención.

### "Perdí mi Gist ID"
1. Ve a https://gist.github.com/[tu-usuario]
2. Busca el Gist llamado "MeetUp Demo Day - Database Storage"
3. El ID está en la URL: `https://gist.github.com/[usuario]/[ESTE-ES-EL-ID]`

---

## 📝 Resumen Rápido

**Para usar en Vercel (o cualquier hosting):**
1. ✅ Despliega tu app en Vercel normalmente
2. ✅ Crea un GitHub token con scope `gist` (toma 1 min)
3. ✅ Abre tu app → Admin → Almacenamiento
4. ✅ Pega el token y click en "Configurar"
5. ✅ Listo! Los datos ahora se comparten entre todos los dispositivos

**No necesitas:**
- ❌ Variables de entorno en Vercel
- ❌ Base de datos externa
- ❌ Configuración adicional del servidor

**Beneficios:**
- ✅ Gratis (usa los Gists de tu cuenta de GitHub)
- ✅ Fácil de configurar (3 minutos)
- ✅ Los datos persisten para siempre
- ✅ Compartido entre todos los usuarios y dispositivos
- ✅ Puedes ver/editar los datos directamente en GitHub

---

## 💡 Preguntas Frecuentes

**¿Por qué no funciona automáticamente en Vercel como dice la documentación?**
La funcionalidad Spark KV solo está disponible en el entorno de GitHub Spark. En Vercel necesitas usar GitHub Gist, que es igual de efectivo y toma solo 3 minutos configurar.

**¿Los datos se comparten en tiempo real?**
Casi en tiempo real. Hay un pequeño delay (1-2 segundos) debido a las llamadas a la API de GitHub, pero es más que suficiente para un sistema de evaluación.

**¿Puedo usar otra base de datos?**
Este sistema está diseñado para usar GitHub Gist por simplicidad. Si necesitas algo más robusto (millones de usuarios concurrentes), considera migrar a una base de datos tradicional.

**¿Qué pasa si múltiples jueces evalúan al mismo tiempo?**
Funciona perfectamente. Cada evaluación se guarda independientemente sin conflictos.

**¿Cuántos datos puedo almacenar?**
GitHub Gist soporta hasta 100MB por archivo, más que suficiente para miles de proyectos y evaluaciones.
