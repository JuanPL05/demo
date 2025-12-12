# 🚀 Inicio Rápido - Configuración en 3 Minutos

## Desplegaste en Vercel y ves "localStorage"?

**Esto es NORMAL la primera vez.** Solo necesitas configurar GitHub Gist para que los datos se compartan entre dispositivos.

---

## ⚡ Pasos (3 minutos)

### 1️⃣ Crear Token de GitHub (1 minuto)

Abre esta URL en una nueva pestaña:
👉 **https://github.com/settings/tokens/new**

Configura así:
- **Note**: `MeetUp Demo Day`
- **Expiration**: 90 days (o el que prefieras)
- **Select scopes**: Marca SOLO `gist` ✅
- Click en **Generate token** (botón verde al final)
- **COPIA EL TOKEN** (empieza con `ghp_...`) - no podrás verlo de nuevo

### 2️⃣ Configurar en tu App (2 minutos)

1. En tu app desplegada, click en **"Admin"**
2. Ve a la pestaña **"Almacenamiento"** (primera pestaña)
3. Verás un formulario "Configurar GitHub Gist"
4. Pega tu token en **"Token de GitHub"**
5. Deja **"Gist ID"** vacío
6. Click en **"Configurar Almacenamiento Compartido"**
7. La página se recargará automáticamente
8. ✅ Ahora verás un badge azul "GitHub Gist"!

### 3️⃣ Cargar Datos (30 segundos)

1. Ve a la pestaña **"Datos"** (segunda pestaña)
2. Click en **"Cargar datos de prueba"**
3. ✅ Listo! Ya tienes programas, proyectos y jueces de ejemplo

---

## ✅ Verificar que funciona

- El badge cambió de naranja 🟠 a azul 🔵
- En la pestaña "Almacenamiento" dice "GitHub Gist"
- Ahora dice "Compartido entre dispositivos" ✅

---

## 🎯 Siguiente Paso

Ahora puedes:
- **Dashboard**: Ver evaluaciones en tiempo real
- **Jueces**: Generar tokens para jueces
- **Programas, Áreas, Proyectos**: Personalizar según tu evento

---

## 🆘 Problema?

**"Error al configurar"**
→ Verifica que marcaste el scope `gist` al crear el token

**"No cambia a azul"**
→ Recarga la página manualmente (F5)

**Otras dudas**
→ Ver [STORAGE_CONFIG.md](./STORAGE_CONFIG.md) para detalles completos

---

## 💡 Qué acabas de hacer?

Configuraste tu aplicación para usar GitHub Gist como base de datos. Los datos ahora:
- ✅ Se guardan en tu cuenta de GitHub (gratis)
- ✅ Se comparten entre todos los dispositivos
- ✅ Persisten para siempre
- ✅ Todos los jueces ven los mismos datos

**No necesitaste:**
- ❌ Configurar una base de datos
- ❌ Variables de entorno en Vercel
- ❌ Pagar por servicios externos
