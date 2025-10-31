# Análisis de UI - El Bruto Original

## Pantallas Identificadas

### 1. Pantalla de Creación de Bruto

**Elementos visibles:**
- **Campo de texto:** "ELIGE UN NOMBRE" para ingresar nombre del bruto
- **Selector de apariencia:** 3 opciones mostradas (parece haber más)
  - Opción izquierda: Bruto con aspecto canino/animal
  - Opción centro: Silueta con signo de interrogación (random?)
  - Opción derecha: Bruto con aspecto diferente
- **Botón "Validar"** - Confirmar creación
- **Botón "CONECTAR"** (verde) - Presumiblemente para conectar/continuar

**Texto explicativo:**
"Pon un nombre para crear tu propio Bruto. Enseguida podrás combatir otros Brutos en la arena y reclutar nuevos alumnos. Gana experiencia y hazte con tu lugar en la clasificación para convertirte en... EL BRUTO."

**Sección "... O NO SERLO":**
Sugiere otros juegos más tranquilos si no quieres violencia

---

### 2. Pantalla Principal del Casillero (Vista del Bruto)

**Layout general:**
- Header superior con título "MY BRUTE" / "EL BRUTO"
- Dos personajes animados en el header (izquierda y derecha)
- Timer/reloj visible

#### **Sección Izquierda - Información del Bruto:**

**Nombre y detalles:**
- Nombre del bruto: "KALIFERR"
- Usuario: "VICE ●"
- Ranking: 67830
- Winrate: 62.5%
- Última actividad: "25 days ago"

**Stats principales (visibles):**
- Level: **17**
- Arma equipada: "Padawan" (visible en display)
- Health points: **20** (mostrado con ícono verde)
- Strength: **4** (mostrado con ícono rojo de puño)

**Barras de progresión:**
- 3 barras horizontales amarillas (posiblemente representan stats o progreso)
  - Primera barra: 4 segmentos llenos
  - Segunda barra: aparentemente llena
  - Tercera barra: parcialmente llena

**Indicador especial:**
- Triángulo rojo hacia arriba
- Icono cuadrado vacío
- Texto: "kaliferr is resting."
- "6 new fights will be available tomorrow!"

#### **Sección Central - Arsenal de Armas y Habilidades:**

**Grid superior - Armas disponibles:**
- Cuadrícula de aproximadamente 7 columnas × múltiples filas
- Muestra íconos de armas y objetos
- Algunas celdas vacías (disponibles)
- Algunas celdas con armas/objetos equipados
- Tooltips disponibles al hacer hover

**Característica visual:**
- Fondo de madera
- Algunas armas visibles: espadas, hachas, objetos varios
- Diseño tipo "pizarrón" o "tablero de armas"

#### **Sección Inferior - Grid de Habilidades:**

**Grid grande (7 columnas × múltiples filas):**
- Múltiples íconos de habilidades/poderes
- Algunos espacios vacíos
- Variedad de colores e íconos:
  - Amarillos/dorados
  - Verdes
  - Algunos con personajes
  - Algunos con símbolos/efectos

**Habilidades visibles incluyen:** (basado en íconos)
- Habilidades de combate
- Posiblemente buffs/mejoras
- Efectos especiales

#### **Sección Derecha - Información Adicional:**

**URL/Referral:**
- Link del bruto: "https://brute.eternaltwin.org?ref=kaliferr"

**Botón:**
- "CLAN SLAYERS"

**Imagen/Banner:**
- Imagen de combate oscura (posible screenshot de pelea)

**Historial de Peleas (Fight Log):**
Lista de peleas recientes con colores:
- **Rosa/Rojo:** Derrotas
  - "kaliferr lost some teeth against Bruluxenthetius."
  - "ultimaterunner made kaliferr stub a pinky toe."
  - "disoShisui made kaliferr stub a pinky toe."

- **Verde:** Victorias
  - "ELBABA3 lost some teeth against kaliferr."
  - "kaliferr pet water12 against the fur."
  - "kesicar glorified Bioxtochimah."

**Indicador de puntos:**
- Número con símbolo (parece ser sistema de puntos de combate)

**Botones inferiores:**
- "🎯 TOURNAMENTS"
- "📜 EVENT HISTORY"
- "REPORT"

---

## Elementos de UI Comunes

### Paleta de Colores:
- **Fondo:** Tonos beige/arena/marrón claro
- **Texto:** Marrón oscuro
- **Destacados:** Rojo, verde, amarillo/dorado
- **Paneles:** Tonos crema/amarillo pálido con bordes decorados

### Tipografía:
- Fuente decorativa/medieval para títulos
- Fuente legible para contenido
- Texto en varios idiomas (inglés/español)

### Estilo Visual:
- Temática de arena/gladiador/medieval
- Diseño "sucio" o "desgastado"
- Ilustraciones cartoon/cómic
- Elementos decorativos: madera, pergaminos, texturas

---

## Stats Visibles del Bruto

Basado en la pantalla principal, el bruto muestra:

1. **Level** (17)
2. **Health points** (20) - Ícono verde
3. **Strength** (4) - Ícono rojo de puño
4. **Barras de progresión** (3 barras amarillas)
   - Posiblemente: Speed, Agilidad, otra stat?
5. **Ranking** (67830)
6. **Winrate** (62.5%)

**Nota:** No se ven claramente todos los 4 stats mencionados en la sesión de brainstorming (HP, STR, Speed, Agilidad). Las barras amarillas podrían representar Speed y Agilidad.

---

## Pantallas Faltantes por Analizar

Basado en la sesión de brainstorming, aún faltan capturas de:

- [ ] Pantalla de login/registro
- [ ] Pantalla de selección de brutos (tus 3-4 brutos)
- [ ] **Pantalla de selección de enemigo** (5 opciones)
- [ ] **Pantalla de combate en acción** (batalla animada)
- [ ] **Pantalla de subida de nivel** (elegir entre opciones A/B)
- [ ] Vista detallada de mascotas

---

## Observaciones Importantes

1. **El grid de habilidades es ENORME** - Hay muchas más habilidades de las esperadas
2. **Sistema de descanso** - "kaliferr is resting" sugiere límite de peleas diarias
3. **Torneos y eventos** - Hay sistema de torneos que no habíamos discutido
4. **Clan system** - "CLAN SLAYERS" sugiere sistema de clanes
5. **Referral system** - URLs con referidos para reclutar jugadores

**Decisión pendiente:** ¿Implementarás torneos, clanes, y sistema de referidos en tu versión, o solo las mecánicas core?

---

**Fuente:** Capturas del juego original "El Bruto"
**Fecha análisis:** 2025-10-30
