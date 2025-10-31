# Brainstorming Session Results

**Session Date:** 2025-10-30
**Facilitator:** Business Analyst Mary
**Participant:** vice

## Executive Summary

**Topic:** Recrear "El Bruto" - Un juego web de peleas automáticas entre personajes con mecánicas de progresión (XP, nivel, atributos)

**Session Goals:**
- Diseñar y conceptualizar una versión personal del juego "El Bruto"
- Crear peleas automáticas animadas entre personajes
- Implementar lógica simple de progresión: XP, nivel, atributos (fuerza, agilidad, vida)
- Planificar posibles expansiones futuras: armas, mascotas, sistema de IA
- Desarrollo offline/local para uso personal usando Godot Engine

**Techniques Used:**
1. Mind Mapping (Structured) - 25 min
2. SCAMPER Method (Structured) - 20 min

**Total Ideas Generated:** 65+ elementos (50+ del Mind Map + 15+ evaluados en SCAMPER)

### Key Themes Identified:

1. **Fidelidad al original** - Mantener mecánicas core de "El Bruto" original
2. **Simplicidad intencional** - Rechazar features que complican (combos, clases, evoluciones)
3. **Randomización como core gameplay** - Apariencias random, subidas random, combate probabilístico
4. **Progresión infinita** - Sin nivel máximo, jugabilidad sin fin
5. **Local-first architecture** - Base de datos local, guardado local, no requiere conexión
6. **Complejidad emergente** - Sistema simple + RNG = batallas únicas
7. **Enfoque "todo-en-uno"** - No MVP, implementar juego completo desde el inicio

## Technique Sessions

### Técnica #1: Mind Mapping (Structured) - 25 min

**Objetivo:** Visualizar todos los sistemas del juego y sus conexiones

**Mapa Mental Completo:**

```
                           EL BRUTO (RECREACIÓN)
                                    |
        ____________________________________________________________
        |              |              |              |              |
    CUENTAS      PERSONAJES     PROGRESIÓN      COMBATE         UI/UX
        |              |              |              |              |
```

#### **RAMA 1: SISTEMA DE CUENTAS**
- Login/registro (usuario + contraseña)
- Max 3 brutos por defecto
- Eliminar brutos permitido
- Sistema de monedas:
  - Nivel 10 = 100 monedas
  - 500 monedas = +1 slot de bruto (máx 4 total)
- Guardado automático de progreso

#### **RAMA 2: SISTEMA DE PERSONAJES**
- **Creación:**
  - Nombre único obligatorio
  - Apariencia random: 10 diseños base × variaciones de color
  - Apariencia = puramente estética (sin bonus)

- **Stats iniciales (pre-nivel 1):**
  - HP: 60
  - STR: 2
  - Speed: 2
  - Agilidad: 2
  - Sistema aplica 1 subida de nivel random automática

- **Visual (Casillero del Bruto):**
  - Sprite del personaje
  - Pizarrón superior: armas equipadas
  - Sección media: 4 stats (HP/STR/Speed/Agilidad)
  - Sección inferior: habilidades
  - Historial de peleas (abajo)

#### **RAMA 3: SISTEMA DE PROGRESIÓN**
- **Ganancia de XP:**
  - Perder pelea = +1 XP
  - Ganar pelea = +2 XP
  - Matchmaking: oponentes del mismo nivel
  - No hay bonus por victorias consecutivas

- **Subida de nivel:**
  - Sin nivel máximo
  - 2 opciones random (A o B) al subir:
    - Opción 1: Habilidad nueva
    - Opción 2: Arma nueva
    - Opción 3: +1 stat completo (STR +2, Speed +2, Agilidad +2, HP +12)
    - Opción 4: +2 stats dividido (cada stat mitad: +1/+1 o +6 HP + stat)

- **Elementos desbloqueables:**
  - Armas (4 categorías): Fast, Heavy, Sharp, Long
  - Habilidades (copiar del original)
  - Mascotas (4 tipos): Perro, Lobo, Pantera, Oso

#### **RAMA 4: SISTEMA DE COMBATE**
- **Función de stats en batalla:**
  - **STR:** Daño base directo (STR 5 = 5 de daño)
  - **Agilidad:** % de esquivar ataques enemigos
  - **Speed:** Probabilidad de golpe extra (más turnos)
  - **HP:** Puntos de vida

- **Mecánicas de combate:**
  - Algoritmo predeterminado con randomización
  - Cada turno: ataque base + chance usar arma + chance usar habilidad
  - Sistema de críticos (doble daño)
  - Habilidades pueden aumentar % crítico
  - Armas tienen % crítico + características propias
  - Batallas siempre diferentes (probabilidades)

- **Armas (4 categorías):**
  - Fast / Heavy / Sharp / Long
  - Cada categoría: probabilidad aparición + características generales
  - Cada arma individual: características específicas + % crítico

- **Mascotas (4 tipos):**
  - Perro, Lobo, Pantera, Oso
  - [Características por definir]

- **Condición de victoria:**
  - Primero en llegar a 0 HP pierde

#### **RAMA 5: UI/INTERFAZ**
- **Pantallas principales:**
  1. Login/Registro
  2. Selección de tus brutos (3-4 slots)
  3. Casillero del bruto individual (stats detallados)
  4. Selección de enemigo (5 random del mismo nivel)
  5. Pantalla de combate (animaciones de pelea)
  6. Pantalla de subida de nivel (elegir opción A o B)

- **NO incluye:**
  - Ranking/Leaderboard
  - Tienda de monedas
  - Multijugador

**IDEAS GENERADAS:** 50+ elementos mapeados

---

### Técnica #2: SCAMPER Method (Structured) - 20 min

**Objetivo:** Innovar sobre el diseño original de "El Bruto" usando 7 lentes de creatividad

**Proceso SCAMPER:**

#### **S - SUBSTITUTE (Sustituir)**
✅ **Innovación clave:** Peleas contra brutos de otros usuarios
- Base de datos local con pool de brutos
- Matchmaking por nivel (muestra 5 aleatorios del mismo nivel)
- Sistema de "fantasmas" offline (no requiere conexión)

✅ Mascotas se integran en batalla cuando las tienes
✅ Efectos visuales simples (partículas solo en habilidades especiales)
✅ Mantener 4 categorías de armas: Fast/Heavy/Sharp/Long

#### **C - COMBINE (Combinar)**
❌ Sin combos especiales arma+mascota
❌ Sin combinación de habilidades
❌ Sin sistema de clases emergentes
❌ Sin evolución visual por nivel

**Decisión:** Mantener sistemas separados y simples

#### **A - ADAPT (Adaptar)**
✅ **Innovación clave:** Sistema de replay de peleas
- Guarda las últimas 8 peleas en el historial del bruto
- Visible en casillero (abajo de habilidades)
- Permite revisar batallas anteriores

❌ Sin logros/achievements
❌ Sin entrenamiento vs dummy
❌ Sin daily rewards
❌ Sin múltiples arenas/escenarios

#### **M - MODIFY (Modificar)**
✅ Mascotas con stats fijos (no evolucionan)
✅ Monedas exclusivamente para slots de brutos
✅ Matchmaking estricto: mismo nivel únicamente
✅ Sistema A/B de subida se mantiene como está

**Decisión:** No modificar mecánicas core del original

#### **P - PUT TO OTHER USES (Poner en otros usos)**
❌ Sin usos alternativos para sistemas existentes
❌ Monedas solo para slots
❌ Historial solo muestra replays (sin estadísticas)
❌ Mascotas solo en combate

#### **E - ELIMINATE (Eliminar)**
✅ **Decisión:** NO eliminar nada
- Sistema de login se mantiene
- 4 stats se mantienen separadas
- Mascotas se mantienen
- División de stats al subir se mantiene
- Animaciones se mantienen

#### **R - REVERSE/REARRANGE (Revertir/Reorganizar)**
❌ Sin inversiones de sistemas
❌ Flujo de XP se mantiene
❌ Selección de enemigo se mantiene (jugador elige entre 5)
❌ UI del casillero se mantiene (diseño original)

**RESUMEN SCAMPER:**
- **Innovaciones adoptadas:** 2
  1. Sistema de peleas contra brutos de otros usuarios (local)
  2. Sistema de replay (últimas 8 peleas)
- **Fidelidad al original:** Alta - se mantienen mecánicas core
- **Filosofía de diseño:** Mejorar sin complicar

**IDEAS GENERADAS:** 15+ opciones evaluadas, 2 innovaciones adoptadas

## Idea Categorization

### Alcance del Proyecto: TODO ES CORE

**Decisión de diseño:** No hay fases ni priorización - todos los sistemas definidos son parte del producto completo.

**Features Core (Todo va en v1.0):**

**Sistema de Cuentas:**
- Login/registro (usuario + contraseña)
- Max 3 brutos por defecto, expandible a 4 con monedas
- Sistema de monedas (nivel 10 = 100 monedas, 500 = +1 slot)
- Eliminar brutos permitido

**Sistema de Personajes:**
- 10 apariencias base × variaciones de color
- 4 stats: HP (60), STR (2), Speed (2), Agilidad (2)
- Subida nivel automática inicial (random)
- Mascotas: Perro, Lobo, Pantera, Oso
- Armas: Fast, Heavy, Sharp, Long (cada una con características propias)
- **Habilidades:** Documentar TODAS (~40+) del original, implementar progresivamente (algunas funcionales primero, otras como "stub" para después)

**Sistema de Progresión:**
- XP por peleas (perder +1, ganar +2)
- Niveles infinitos
- Opciones A/B al subir (habilidad/arma/stats/stats dividido)
- **Límite de 6 peleas diarias** - Sistema de descanso (resets cada 24h)

**Sistema de Combate:**
- Stats afectan combate (STR=daño, Agilidad=esquivar, Speed=golpes extra)
- Críticos (doble daño)
- Algoritmo probabilístico (armas/habilidades/mascotas)
- Matchmaking estricto: mismo nivel

**Innovaciones sobre el original:**
- ✅ Peleas vs brutos de otros usuarios (base de datos local)
- ✅ Sistema de replay (últimas 8 peleas guardadas)

**UI Completa:**
- 6 pantallas principales (Login, Selección brutos, Casillero, Selección enemigo, Combate, Subida nivel)

**NO incluye (expansiones futuras):**
- Torneos
- Clanes
- Ranking global
- Sistema de referidos

**Filosofía:** "Todo o nada" - implementar el juego completo sin fases intermedias, pero dejando espacio para expansiones futuras

### Insights and Learnings

_Key realizations from the session_

**Temas Recurrentes:**
1. **Fidelidad al original** - Mantener mecánicas core de "El Bruto" original
2. **Simplicidad intencional** - Rechazar features que complican (combos, clases, evoluciones)
3. **Randomización como core gameplay** - Apariencias random, subidas random, combate probabilístico
4. **Progresión infinita** - Sin nivel máximo, jugabilidad sin fin
5. **Local-first architecture** - Base de datos local, guardado local, no requiere conexión

**Insights Clave:**

**🎯 Insight #1: Recreación Fiel > Reinvención**
- La visión es recrear fielmente el original, no reinventarlo
- Las únicas innovaciones son técnicas (brutos de usuarios, replays), no de gameplay
- Filosofía: "Mejorar sin complicar"

**🎯 Insight #2: Complejidad Emergente**
- Se prioriza complejidad emergente (sistema simple + RNG = batallas únicas)
- Sobre complejidad diseñada (combos, sinergias, sistemas interconectados)
- Resultado: Cada batalla es diferente sin necesidad de 100 reglas

**🎯 Insight #3: Enfoque "Todo-en-Uno"**
- No hay MVP ni fases intermedias
- El proyecto es todo o nada: implementar el juego completo
- Alcance claro desde el inicio evita scope creep

## Action Planning

### Orden de Implementación Completo

1. **UI/UX** - Diseño de las 6 pantallas
2. **Apariencias del bruto** - 10 diseños base + variaciones
3. **Base de datos** - SQLite local
4. **Armas y habilidades** - Definir todas con características
5. **Sistema de progresión** - XP, niveles, recompensas
6. **Sistema de combate** - Algoritmo probabilístico

---

### Top 3 Priority Ideas

#### #1 Priority: UI/UX - Diseñar las 6 pantallas principales

- **Rationale:** Necesito tener claro cómo se ve el juego antes de programar la lógica. Definir todas las pantallas (Login, Selección brutos, Casillero, Selección enemigo, Combate, Subida nivel) establece la estructura visual completa.

- **Next steps:**
  1. Conseguir capturas/screenshots del "El Bruto" original como referencia
  2. Recrear diseño en Godot usando las capturas como guía
  3. Crear escenas para cada una de las 6 pantallas
  4. Definir navegación entre pantallas
  5. Implementar layout responsive básico

- **Resources needed:**
  - Screenshots del juego original
  - Godot Engine 4.x instalado
  - Conocimiento básico de UI nodes en Godot (Control, Panel, Button, Label)

- **Timeline:** Por definir (depende de complejidad de replicar el diseño original)

#### #2 Priority: Apariencias del Bruto - Sprites y variaciones

- **Rationale:** Necesito los sprites para visualizar en las pantallas de UI. Los personajes son el elemento visual central del juego. Tener las 10 apariencias base + sistema de variaciones de color permite poblar el juego con brutos diversos.

- **Next steps:**
  1. Extraer/copiar sprites del bruto original
  2. Organizar 10 diseños base
  3. Implementar sistema de variación de color en Godot (shader o sprite variants)
  4. Crear animaciones básicas: idle, ataque, golpeado, derrota
  5. Testear combinaciones de apariencia × color

- **Resources needed:**
  - Sprites del juego original (extraídos o recreados)
  - Software de edición de sprites (Aseprite, GIMP, Photoshop)
  - Sistema de shaders en Godot para variaciones de color

- **Timeline:** Por definir (depende de si se extraen o recrean los sprites)

#### #3 Priority: Base de Datos (SQLite) - Estructura de datos

- **Rationale:** Necesito definir cómo se guardan usuarios, brutos, stats, armas, habilidades, mascotas, historial de peleas. La BD es la columna vertebral que sostiene todo el progreso del jugador. Tener UI + sprites permite visualizar qué datos necesito persistir.

- **Next steps:**
  1. Diseñar schema de BD (tablas: usuarios, brutos, stats, armas, habilidades, mascotas, peleas, replays)
  2. Implementar SQLite en Godot (usando plugin o GDScript nativo)
  3. Crear funciones CRUD (Create, Read, Update, Delete) para cada tabla
  4. Implementar sistema de guardado automático
  5. Crear pool de brutos de otros usuarios para matchmaking
  6. Implementar sistema de replay (guardar últimas 8 peleas)

- **Resources needed:**
  - SQLite plugin para Godot o implementación GDScript
  - Conocimiento de SQL básico
  - Diseño de schema de base de datos

- **Timeline:** Por definir (depende de complejidad del schema y familiaridad con SQLite)

## Reflection and Follow-up

### What Worked Well

**Técnicas efectivas:**
- ✅ **Mind Mapping** fue excelente para estructurar los 5 sistemas principales (Cuentas, Personajes, Progresión, Combate, UI)
- ✅ **SCAMPER** ayudó a evaluar sistemáticamente qué cambiar y qué mantener del original
- ✅ Definición de alcance completo muy rápida (evita scope creep futuro)
- ✅ Visión clara establecida: "Recreación fiel del original con 2 mejoras técnicas"

**Fortalezas de la sesión:**
- Claridad absoluta en el alcance: no hay ambigüedad sobre qué implementar
- Enfoque "todo-en-uno" elimina debates sobre MVP vs features completas
- Orden de implementación lógico establecido (UI → Sprites → BD → Armas → Progresión → Combate)

### Areas for Further Exploration

Temas identificados que requieren trabajo posterior:

1. **Algoritmo de combate específico**
   - Fórmulas exactas de cálculo de daño
   - ¿Cómo se calcula % de esquivar basado en Agilidad?
   - ¿Cómo Speed determina probabilidad de golpe extra?
   - ¿% de crítico base y cómo se modifica?

2. **Características específicas de armas**
   - **PENDIENTE:** vice compartirá imágenes del original
   - Atributos: reach, odds, hit, speed, damage, crit chance
   - Diferencias entre categorías: Fast/Heavy/Sharp/Long
   - Características individuales de cada arma
   - Stats de "puños" (sin arma equipada)

3. **Características de mascotas**
   - Stats de cada mascota: Perro, Lobo, Pantera, Oso
   - ¿Cómo participan en combate?
   - ¿Tienen ataques propios o modifican stats del bruto?

4. **Lista completa de habilidades**
   - Copiar todas las habilidades del original
   - Efectos de cada una
   - Categorización (ofensivas, defensivas, buffs, etc.)

5. **Fórmulas de balanceo**
   - ¿Cuánto XP se necesita por nivel? (¿Crece exponencial o lineal?)
   - Curva de progresión de stats
   - Cómo escala dificultad de brutos enemigos según nivel

### Recommended Follow-up Techniques

Para próximas sesiones de trabajo:

1. **First Principles Thinking** - Para diseñar el algoritmo de combate desde sus fundamentos
2. **Morphological Analysis** - Para mapear todas las combinaciones de armas × stats × habilidades
3. **Deep dive session** - Analizar imágenes del original y documentar todos los valores exactos

### Questions That Emerged

**Preguntas técnicas pendientes:**

1. **Sistema de combate:**
   - ¿Cómo se calcula exactamente el daño? (STR × modificadores de arma?)
   - ¿Fórmula de esquivar? (Agilidad / constante?)
   - ¿Speed afecta orden de turnos o probabilidad de turno extra?
   - ¿Los críticos siempre son x2 o pueden variar?

2. **Armas y características:**
   - ¿Qué significa cada atributo exactamente? (reach, odds, hit)
   - ¿Cómo interactúan entre sí los atributos?
   - ¿Hay armas únicas o legendarias?

3. **Mascotas:**
   - ¿Atacan en su propio turno o modifican el ataque del bruto?
   - ¿Tienen HP separado?
   - ¿Pueden morir en combate o son permanentes?

4. **Base de datos:**
   - ¿Cómo se comparten brutos entre "usuarios" si es local?
   - ¿Pool de brutos NPC pre-generados o se guardan brutos de sesiones anteriores?

5. **Implementación técnica:**
   - ¿Exportar a .exe, HTML5, o ambos?
   - ¿Resolución objetivo del juego?
   - ¿Mobile responsive o solo desktop?

**Estas preguntas se resolverán con las imágenes del original que vice compartirá.**

### Next Session Planning

- **Suggested topics:**
  1. Análisis detallado de imágenes del original (armas, habilidades, UI)
  2. Documentación de todas las mecánicas exactas
  3. Diseño del algoritmo de combate
  4. Schema detallado de base de datos SQLite

- **Recommended timeframe:** Próxima sesión cuando tengas las imágenes del juego original listas

- **Preparation needed:**
  - Recopilar capturas/imágenes del "El Bruto" original mostrando:
    - Todas las pantallas de UI
    - Panel de armas con stats visibles
    - Panel de habilidades
    - Pantalla de combate en acción
    - Sistema de mascotas
    - Casillero del bruto completo
  - Instalar Godot Engine 4.x
  - Investigar plugin SQLite para Godot

---

_Session facilitated using the BMAD CIS brainstorming framework_
