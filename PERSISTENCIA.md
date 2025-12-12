# Sistema de Persistencia de Datos

## ¿Cómo funciona?

Este sistema de evaluación utiliza un **adaptador inteligente de almacenamiento** que detecta automáticamente el mejor método para guardar tus datos dependiendo del entorno donde se ejecuta la aplicación.

## Modos de Almacenamiento

### 🟢 Spark KV (Recomendado - Vercel)

**Cuándo se activa**: Automáticamente cuando despliegas en Vercel usando Spark

**Características**:
- ✅ **Persistencia automática**: Los datos se guardan permanentemente
- ✅ **Compartido entre dispositivos**: Todos los usuarios ven los mismos datos en tiempo real
- ✅ **Sin configuración**: Funciona inmediatamente después del despliegue
- ✅ **Ideal para producción**: Sistema robusto y escalable

**¿Qué persiste?**
- Programas (ACELERACIÓN, INCUBACIÓN)
- Bloques de evaluación
- Preguntas con sus puntuaciones
- Equipos/Áreas
- Proyectos participantes
- Jueces y sus tokens
- Todas las evaluaciones realizadas
- Estado de votación (abierta/cerrada)

### 🔵 GitHub Gist (Alternativo)

**Cuándo se activa**: Si configuras manualmente un GitHub Personal Access Token

**Características**:
- ✅ Persistencia entre dispositivos
- ✅ Datos almacenados en tu cuenta de GitHub
- ⚠️ Requiere configuración manual
- ⚠️ Velocidad limitada por la API de GitHub

**Cómo configurar**: Desde el panel de admin, pestaña "Almacenamiento"

### 🟡 localStorage Compartido (Desarrollo Local)

**Cuándo se activa**: Cuando ejecutas la app localmente sin Spark KV

**Características**:
- ✅ Funciona sin internet
- ✅ Perfecto para testing y desarrollo
- ⚠️ Solo persiste en este navegador
- ⚠️ No se comparte entre dispositivos
- ⚠️ Se puede borrar si limpias la caché del navegador

## Despliegue en Vercel

### Paso 1: Push tu código a GitHub
```bash
git add .
git commit -m "Sistema de evaluación listo"
git push origin main
```

### Paso 2: Despliega en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona el proyecto
4. Click en "Deploy"

### Paso 3: Verifica la persistencia
1. Abre tu app desplegada
2. Ve al panel de Admin → pestaña "Almacenamiento"
3. Deberías ver el badge verde **"Spark KV (Vercel)"**
4. El mensaje confirmará: "Los datos persisten automáticamente entre sesiones y dispositivos"

## Verificación de Persistencia

### En el Panel de Admin

Navega a: **Admin → Almacenamiento**

Verás:
- **Badge verde** con ✅ = Spark KV activo (Vercel)
- **Badge azul** con 🌐 = GitHub Gist activo
- **Badge naranja** con ⚠️ = localStorage (solo local)

### Indicadores visuales:
- ✅ **Datos persistentes**: Los datos sobreviven recargas y cierres de sesión
- 🌐 **Compartido entre dispositivos**: Todos ven los mismos datos

## Preguntas Frecuentes

### ¿Necesito configurar algo para que funcione en Vercel?
**No.** Cuando despliegas con Spark en Vercel, la persistencia se activa automáticamente.

### ¿Los datos se comparten entre jueces en tiempo real?
**Sí.** En modo Spark KV (Vercel), todos los cambios son inmediatos y visibles para todos los usuarios.

### ¿Qué pasa si múltiples jueces evalúan al mismo tiempo?
El sistema maneja esto perfectamente. Cada evaluación se guarda independientemente sin conflictos.

### ¿Puedo perder mis datos?
- **En Vercel con Spark KV**: No, los datos están seguros y persistentes
- **En desarrollo local**: Sí, si borras la caché del navegador

### ¿Cómo migro datos de desarrollo a producción?
No necesitas migrar. Cuando despliegues en Vercel:
1. Ve a Admin → pestaña "Datos"
2. Click en "Cargar datos de prueba" para poblar el sistema
3. O crea manualmente tus programas, equipos y proyectos

### ¿Puedo ver qué datos están almacenados?
Sí, en **Admin → Almacenamiento** puedes ver todas las claves almacenadas y eliminarlas si es necesario.

## Troubleshooting

### "Los datos desaparecen al recargar" (desarrollo local)
✅ **Normal**: En desarrollo local usas localStorage. Despliega en Vercel para persistencia real.

### "No veo el badge verde de Spark KV" (en Vercel)
1. Verifica que desplegaste correctamente en Vercel
2. Revisa la consola del navegador para ver mensajes de [KV Adapter]
3. Asegúrate de que la URL sea la de Vercel (no localhost)

### "Quiero empezar de cero"
En **Admin → pestaña Datos**, usa el botón "Limpiar todos los datos" (⚠️ irreversible).

## Resumen

✨ **Para producción**: Despliega en Vercel y olvídate, todo funciona automáticamente
🧪 **Para desarrollo**: Usa localhost, los datos se guardan temporalmente en tu navegador
🔧 **Para casos especiales**: Configura GitHub Gist desde el panel de admin

**Recomendación**: Despliega en Vercel para obtener la mejor experiencia con persistencia automática y datos compartidos entre todos los dispositivos.
