# MeetUp Demo Day - Sistema de Evaluación

Sistema profesional de evaluación de proyectos para eventos Demo Day con 3 vistas distintas: Pública, Admin y Juez.

## Propósito

Plataforma completa para gestionar, evaluar y visualizar puntuaciones de proyectos de startups en tiempo real durante eventos Demo Day.

**Experience Qualities**:
1. **Profesional**: Interfaz limpia y confiable que transmite credibilidad empresarial
2. **Eficiente**: Flujos rápidos de evaluación sin fricción, actualizaciones en tiempo real
3. **Retro-Futurista**: Estética gaming retro (DOOM 64) mezclada con diseño moderno profesional

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
Sistema multi-rol con gestión completa de datos, evaluaciones en tiempo real, cálculo dinámico de rankings y múltiples vistas especializadas.

## Essential Features

### 1. Sistema de Roles y Acceso
- **Functionality**: Tres vistas distintas (Pública, Admin, Juez) con acceso controlado por tokens
- **Purpose**: Separar funcionalidades según el tipo de usuario
- **Trigger**: Navegación por URL (/, /admin, /judge/[token])
- **Progression**: Landing page → Selección de rol → Vista específica → Funcionalidad completa
- **Success criteria**: Cada rol accede solo a su contenido, tokens válidos permiten evaluación

### 2. Gestión Administrativa Completa
- **Functionality**: CRUD completo de programas, bloques, preguntas (con puntuación 0.5-1.2, total 10), equipos, proyectos y jueces
- **Purpose**: Configurar todo el sistema de evaluación antes del evento
- **Trigger**: Admin accede a /admin
- **Progression**: Selecciona tab → Ve listado → Crea/edita entidad → Guarda → Actualización inmediata
- **Success criteria**: Todas las entidades se crean, editan y eliminan correctamente. Suma de puntuación de preguntas = 10

### 3. Evaluación por Jueces
- **Functionality**: Star rating system (1-5 estrellas) para evaluar proyectos por pregunta, vista exclusiva personal
- **Purpose**: Capturar evaluaciones detalladas de múltiples jueces sin acceso a datos generales
- **Trigger**: Juez accede con token único (/judge/[token])
- **Progression**: Validación token → Selecciona proyecto → Ve preguntas por bloque → Evalúa con estrellas → Guardado automático
- **Success criteria**: Evaluaciones se guardan instantáneamente, progreso visible, jueces SOLO ven sus propias evaluaciones (sin acceso a dashboard general o datos de otros jueces)

### 4. Dashboard de Rankings
- **Functionality**: Ranking dinámico con puntuación promedio, gráficos y detalles por proyecto con dialog modal
- **Purpose**: Visualizar resultados en tiempo real durante el evento
- **Trigger**: Cualquier usuario accede a /dashboard (público)
- **Progression**: Carga dashboard → Filtra por programa → Ve rankings → Click en botón "Detalles" → Ve modal con información completa del proyecto
- **Success criteria**: Rankings precisos, modal de detalles muestra evaluaciones por juez y pregunta, sin auto-recargas molestas

### 5. Sistema de Puntuación Dual
- **Functionality**: Escala 1-5 para INCUBACIÓN, 0-10 para ACELERACIÓN
- **Purpose**: Adaptar criterios según etapa de startup
- **Trigger**: Tipo de programa determina escala automáticamente
- **Progression**: Sistema detecta programa → Aplica escala correcta → Calcula promedios → Genera ranking
- **Success criteria**: Cálculos correctos por tipo de programa, rankings precisos

### 6. Sistema de Almacenamiento Adaptativo
- **Functionality**: Detección automática del entorno y configuración de almacenamiento persistente compartido entre dispositivos
- **Purpose**: Garantizar que TODOS los datos (programas, equipos, proyectos, evaluaciones) persistan automáticamente y se compartan entre dispositivos en tiempo real cuando se despliega en Vercel
- **Trigger**: Aplicación se carga en cualquier entorno
- **Progression**: App detecta entorno → Usa Spark KV automáticamente en Vercel (persistencia automática entre sesiones y dispositivos) → En desarrollo local usa localStorage compartido → Panel admin muestra claramente el modo de almacenamiento activo
- **Success criteria**: En Vercel con Spark, todos los datos persisten automáticamente entre sesiones y dispositivos sin configuración adicional. Panel admin muestra badges visuales del estado de persistencia (✅ Spark KV para Vercel, ⚠️ localStorage para local)

## Edge Case Handling

- **Token Inválido**: Mostrar mensaje claro "Token inválido o expirado" y bloquear acceso
- **Votación Cerrada**: Admin puede cerrar evaluación, jueces ven mensaje de finalización
- **Proyecto Sin Evaluaciones**: Mostrar 0% completitud, último en ranking
- **Evaluaciones Parciales**: Calcular promedio solo con evaluaciones existentes
- **Datos Vacíos**: Mostrar estados vacíos con llamados a acción para crear contenido
- **Múltiples Jueces Simultáneos**: Cada evaluación se guarda independientemente sin conflictos
- **Separación de Roles**: Jueces NO tienen acceso al dashboard general, solo ven su panel de evaluación personal
- **Detalles de Proyecto**: Modal muestra evaluaciones desglosadas por juez, pregunta y bloque
- **Persistencia Automática en Vercel**: Cuando se despliega en Vercel, Spark KV activa automáticamente persistencia entre dispositivos y sesiones sin necesidad de configuración adicional
- **Desarrollo Local**: En desarrollo local (sin Spark KV), datos se guardan en localStorage compartido del navegador para testing

## Design Direction

El diseño debe evocar **confianza profesional** mezclada con **energía retro-gaming**. La homepage tiene estética DOOM 64 (oscura, brillante, retro) mientras las vistas de trabajo (admin, dashboard, juez) son limpias, modernas y profesionales con gradientes suaves azul-verde que transmiten innovación y tecnología.

## Color Selection

**Primary Color**: Azul brillante `oklch(0.58 0.22 245)` (#3b82f6) - Representa confianza, profesionalismo y tecnología
**Secondary Colors**: 
- Gris claro `oklch(0.96 0.01 240)` (#f1f5f9) - Fondos suaves y elementos secundarios
- Azul cielo muy claro `oklch(0.98 0.01 240)` (#f8fafc) - Fondos muted
**Accent Color**: Verde vibrante `oklch(0.68 0.17 165)` (#10b981) - Éxito, acción positiva, INCUBACIÓN
**Destructive**: Rojo `oklch(0.63 0.25 27)` (#ef4444) - Alertas, eliminación, cierre de votación

**Foreground/Background Pairings**:
- Background (White #FFFFFF): Foreground dark slate `oklch(0.18 0.02 240)` (#0f172a) - Ratio 16.9:1 ✓
- Primary (Blue #3b82f6): White text (#FFFFFF) - Ratio 4.8:1 ✓
- Accent (Green #10b981): White text (#FFFFFF) - Ratio 4.7:1 ✓
- Destructive (Red #ef4444): White text (#FFFFFF) - Ratio 4.9:1 ✓
- Muted (Slate #f8fafc): Muted foreground `oklch(0.53 0.02 240)` (#64748b) - Ratio 5.2:1 ✓

## Font Selection

Las tipografías deben transmitir **modernidad profesional** con toques de **carácter técnico retro**. Usar **JetBrains Mono** para elementos retro (homepage, tokens) y **Space Grotesk** para el contenido profesional (admin, dashboard, evaluaciones).

**Typographic Hierarchy**:
- H1 (Page Title): Space Grotesk Bold/36px/tight letter-spacing (-0.02em)
- H2 (Section Title): Space Grotesk SemiBold/24px/tight letter-spacing
- H3 (Card Title): Space Grotesk SemiBold/18px/normal letter-spacing
- Body (Regular): Space Grotesk Regular/16px/relaxed line-height (1.6)
- Small (Captions): Space Grotesk Regular/14px/normal line-height
- Mono (Retro/Code): JetBrains Mono Medium/16px/tracking-wide

## Animations

Las animaciones deben ser **sutiles pero satisfactorias**, priorizando feedback instantáneo sobre efectos decorativos. Usar animaciones para confirmar acciones (guardado de evaluación), transiciones de estado (tabs, modals) y momentos de celebración (top 3 en rankings con efectos de trofeo).

- **Star Rating**: Scale bounce al hacer click (duration: 200ms)
- **Cards**: Hover lift subtle con shadow expansion (duration: 300ms)
- **Buttons**: Press effect con scale (0.98) y brightness increase
- **Tabs**: Slide indicator smooth (duration: 250ms)
- **Rankings**: Fade-in stagger para cada fila (delay: 50ms entre filas)
- **Trofeos Top 3**: Subtle pulse continuous en gold/silver/bronze
- **Progress Bars**: Smooth fill animation (duration: 800ms, ease-out)

## Component Selection

**Components**: 
- **Tabs** (Shadcn): Para admin (7 tabs) y dashboard/judge (2-3 tabs)
- **Card** (Shadcn): Contenedor principal de todas las secciones
- **Button** (Shadcn): Acciones primarias, variantes outline/ghost para secundarias
- **Dialog** (Shadcn): Modals para crear/editar entidades, detalles de proyecto
- **Badge** (Shadcn): Tags de programa, equipo, estado
- **Select** (Shadcn): Selección de programa, proyecto, filtros
- **Input/Textarea** (Shadcn): Formularios de admin
- **Progress** (Shadcn): Barras de completitud de evaluación
- **Alert** (Shadcn): Mensajes de error, warnings
- **Separator** (Shadcn): Divisores visuales entre secciones

**Customizations**:
- **Star Rating Component**: Custom component usando Phosphor Star icon, 5 estados clickeables, color amber cuando filled
- **Retro Cards**: Custom border style con box-shadow multicolor y glow effect para homepage
- **Gradient Backgrounds**: Custom Tailwind classes para gradientes azul-verde suaves
- **Trophy Icons**: Custom size y color para top 3 rankings (gold/silver/bronze)

**States**:
- **Buttons**: default → hover (brightness-110) → active (scale-98) → disabled (opacity-50)
- **Inputs**: default → focus (ring-2 ring-primary) → error (ring-destructive) → success (ring-accent)
- **Stars**: empty (text-gray-300) → hover (text-amber-400) → filled (text-amber-500)
- **Cards**: default → hover (border-primary, shadow-lg) → selected (bg-primary/5)

**Icon Selection** (Phosphor Icons):
- Settings: Admin panel
- BarChart: Dashboard
- Trophy: Rankings, evaluación
- Star: Star rating system
- CheckCircle: Completado, éxito
- Eye: Ver detalles
- Plus: Crear nuevo
- Pencil: Editar
- Trash: Eliminar
- Zap: Badge energético en hero

**Spacing**:
- Card padding: p-6
- Section gaps: gap-6
- Form fields: gap-4
- Button padding: px-6 py-3 (large), px-4 py-2 (default)
- Container max-width: max-w-7xl
- Page padding: px-4 sm:px-6 lg:px-8

**Mobile**:
- Tabs: 2-3 visible en mobile, scroll horizontal habilitado
- Rankings: Tabla → Card stack vertical
- Admin forms: Inputs full width en mobile
- Star rating: Tamaño mínimo 40px touch target
- Navigation: Hamburger menu si se añaden más páginas
- Font sizes: Reduce 2-4px en mobile para H1/H2
