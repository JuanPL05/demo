# MeetUp Demo Day - Sistema de Evaluación

## 🔄 Almacenamiento de Datos

Este sistema soporta múltiples modos de almacenamiento dependiendo de dónde se ejecute:

### 1. **Spark KV (GitHub Spark)** ✅ Recomendado para desarrollo
- **Cuándo se usa**: Automáticamente cuando la aplicación se ejecuta en GitHub Spark
- **Características**: 
  - Almacenamiento persistente automático
  - Los datos se sincronizan entre sesiones
  - No requiere configuración adicional

### 2. **GitHub Gist (Producción en Vercel)** ✅ Recomendado para producción
- **Cuándo se usa**: Cuando la aplicación se ejecuta en Vercel u otro hosting
- **Características**:
  - Almacenamiento compartido entre todos los usuarios
  - Los datos persisten entre sesiones
  - Todos ven los mismos datos en tiempo real
- **Requiere configuración**: Ver instrucciones abajo

### 3. **LocalStorage (Fallback)** ⚠️ Solo para pruebas locales
- **Cuándo se usa**: Si no hay Spark KV ni GitHub Gist configurado
- **Características**:
  - Los datos solo existen en el navegador del usuario
  - Cada usuario ve sus propios datos
  - No hay sincronización entre usuarios

---

## 🚀 Configurar GitHub Gist para Producción en Vercel

Si has desplegado tu aplicación en Vercel y los datos no se comparten entre usuarios, sigue estos pasos:

### Paso 1: Crear un Personal Access Token en GitHub

1. Ve a GitHub.com e inicia sesión
2. Haz click en tu avatar → **Settings**
3. En el menú lateral, ve a **Developer settings** (al final)
4. Click en **Personal access tokens** → **Tokens (classic)**
5. Click en **Generate new token** → **Generate new token (classic)**
6. Dale un nombre descriptivo, por ejemplo: `MeetUp Demo Day Database`
7. En "Select scopes", marca **solo** la casilla `gist`
8. Click en **Generate token**
9. **¡IMPORTANTE!** Copia el token inmediatamente (empieza con `ghp_`). No podrás verlo de nuevo.

### Paso 2: Configurar en el Panel de Administración

1. Abre tu aplicación desplegada en Vercel
2. Ve al **Panel de Administración** (ruta: `/#/admin`)
3. Haz click en la pestaña **"Almacenamiento"** (primera pestaña)
4. Haz click en **"Mostrar instrucciones"** si necesitas ayuda
5. Pega tu token de GitHub en el campo **"GitHub Token"**
6. **Opción A - Crear nuevo Gist:**
   - Deja el campo "Gist ID" vacío
   - Click en **"Configurar Almacenamiento Compartido"**
   - El sistema creará un nuevo Gist y mostrará el ID
   - **Guarda el Gist ID** para futuras configuraciones
7. **Opción B - Usar Gist existente:**
   - Si ya creaste un Gist antes, pega su ID en el campo "Gist ID"
   - Click en **"Configurar Almacenamiento Compartido"**

### Paso 3: Compartir la configuración con tu equipo

Para que otros administradores puedan gestionar los datos:

1. Comparte el **Gist ID** con tu equipo
2. Comparte el **GitHub Token** (de forma segura)
3. Cada administrador debe seguir el **Paso 2**, usando el mismo Gist ID

---

## 🔐 Seguridad

- El token de GitHub se guarda en localStorage del navegador
- Nunca compartas tu token públicamente
- El token solo necesita permisos de `gist`, nada más
- Puedes revocar el token en cualquier momento desde GitHub Settings

---

## 📊 Verificar que funciona

1. Configura el almacenamiento en un navegador
2. Crea un programa o proyecto de prueba
3. Abre la aplicación en otro navegador (o en modo incógnito)
4. Configura el mismo Gist ID y token
5. Verifica que el programa/proyecto aparece

---

## 🆘 Solución de Problemas

### "Los datos no aparecen en otro navegador"
- Verifica que ambos navegadores tengan la misma configuración de Gist
- Comprueba que el Gist ID sea exactamente el mismo
- Verifica que el token tenga permisos de `gist`

### "Error: Failed to set key"
- Verifica que el token sea válido y no haya expirado
- Asegúrate de que el token tenga el scope `gist` activado
- Intenta generar un nuevo token

### "Warning: Missing Description for DialogContent"
- Este es un warning visual y no afecta la funcionalidad
- Puedes ignorarlo de momento

---

## 📝 Notas Adicionales

- Los datos se almacenan en formato JSON en un Gist privado
- Puedes ver y editar el Gist directamente en GitHub si lo necesitas
- El Gist se llama "MeetUp Demo Day - Database Storage"
- Cada vez que guardas datos, el Gist se actualiza automáticamente
