# 🥊 El Bruto - Remake

Un remake fiel del clásico juego de navegador **El Bruto**, construido con tecnologías modernas.

---

## 🎮 Sobre el Proyecto

**El Bruto** es una recreación del legendario juego de peleas por turnos donde creas y entrenas tu propio luchador (bruto), subes de nivel eligiendo mejoras estratégicas, y combates contra oponentes del mismo nivel en batallas automáticas llenas de acción.

Este remake preserva fielmente la mecánica, el balanceo y la experiencia del juego original mientras implementa una arquitectura moderna, offline-first y completamente testeada.

---

## ✨ Características Principales

### 🎯 Core Gameplay (Implementado)
- ✅ Sistema de cuentas local con autenticación
- ✅ Creación de brutos con apariencia aleatoria (10 diseños × colores)
- ✅ Gestión de hasta 4 slots de brutos (1 bloqueado por coins)
- ✅ Motor de combate por turnos con stats auténticos
- ✅ Sistema de progresión: XP, niveles y mejoras aleatorias A/B
- ✅ Matchmaking: pool de 5 oponentes del mismo nivel
- ✅ Economía de coins y compra de slots
- ✅ Límite de 6 peleas diarias con reset automático
- ✅ Sistema de replays: últimas 8 peleas grabadas
- ✅ Casillero (HUD detallado) con stats, historial y equipamiento

### 🚧 En Desarrollo
- 🔄 Epic 6: Sistema de Skills (~40-50 habilidades)
- 🔄 Epic 7: Sistema de Pets con stats y AI
- 🔄 Epic 9: Generación de oponentes ghost
- 🔄 Epic 10: Polish de UI/UX y audio
- 🔄 Epic 5: Sistema de Armas (25+ armas)

---

## 🛠️ Stack Tecnológico

### Frontend
- **Phaser 3** - Motor de juego HTML5
- **TypeScript** - Type safety y developer experience
- **Vite** - Build tool y dev server ultrarrápido
- **Zustand** - State management global

### Persistencia
- **sql.js** - Base de datos SQLite en el navegador
- **IndexedDB** - Storage para partidas y replays

### Testing
- **Vitest** - Test runner moderno
- **223 tests** pasando (100% coverage en servicios críticos)

### Arquitectura
- Clean Architecture con capas separadas
- Services pattern para lógica de negocio
- Repository pattern para acceso a datos
- State machine para combate
- Seeded RNG para replays determinísticos

---

## 📂 Estructura del Proyecto

```
bruto/
├── src/
│   ├── scenes/          # Pantallas del juego (Phaser)
│   ├── services/        # Lógica de negocio
│   ├── engine/          # Motor de combate y sistemas core
│   ├── models/          # Interfaces TypeScript
│   ├── database/        # Repositorios y migraciones SQL
│   ├── ui/              # Componentes reutilizables
│   ├── state/           # Zustand store
│   └── utils/           # Helpers y utilidades
├── docs/
│   ├── stories/         # User stories organizadas
│   │   ├── implemented/ # 21 stories completadas
│   │   └── backlog/     # 39 stories pendientes
│   ├── GDD.md           # Game Design Document
│   └── epics.md         # Breakdown de épicas
└── tests/               # 223 unit + integration tests
```

---

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+ 
- npm 9+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/viceKDK/bruto.git
cd bruto

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El juego estará disponible en `http://localhost:5173`

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción
npm run preview      # Preview del build de producción
npm test             # Ejecutar tests (223 tests)
npm run test:ui      # UI interactiva de Vitest
npm run lint         # Linter TypeScript
```

---

## 🎯 Progreso de Desarrollo

| Epic | Nombre | Completado | Pendiente | % |
|------|--------|------------|-----------|---|
| 1 | Infrastructure | 3/3 | - | 100% |
| 2 | Account System | 3/3 | - | 100% |
| 3 | Character Creation | 3/3 | - | 100% |
| 4 | Combat Engine | 3/3 | - | 100% |
| 8 | Progression & Leveling | 3/3 | - | 100% |
| 9 | Matchmaking | 2/5 | 3 | 40% |
| 11 | Economy & Daily Limits | 2/5 | 3 | 40% |
| 12 | Battle Replay System | 2/6 | 4 | 33% |
| 6 | Skills System | 0/9 | 9 | 0% |
| 7 | Pets System | 0/8 | 8 | 0% |
| 10 | UI/UX Polish | 0/12 | 12 | 0% |
| 5 | Weapons System | 0/TBD | TBD | 0% |
| **TOTAL** | | **21** | **39** | **35%** |

---

## 🧪 Testing

El proyecto cuenta con **223 tests** que cubren:
- ✅ Lógica de combate (CombatEngine, DamageCalculator)
- ✅ Servicios de negocio (CoinService, MatchmakingService)
- ✅ Sistema de progresión (ProgressionService, StatBoostService)
- ✅ Persistencia (BattleLogger, ReplayService)
- ✅ Generadores (BrutoFactory, AppearanceGenerator)

```bash
# Ejecutar todos los tests
npm test

# Tests con UI interactiva
npm run test:ui

# Tests en modo watch
npm run test:watch
```

---

## 📖 Documentación

### Documentos Principales
- [Game Design Document](./docs/GDD.md) - Diseño completo del juego
- [Epic Breakdown](./docs/epics.md) - Desglose de épicas en stories
- [Stories Index](./docs/stories/README.md) - Índice de user stories
- [Architecture](./docs/architecture.md) - Decisiones arquitectónicas

### Recursos de Referencia
- [Catálogo de Habilidades](./docs/habilidades-catalogo.md)
- [Especificaciones de Armas](./docs/armas-especificaciones.md)
- [Sistema de Stats](./docs/stast.md)

---

## 🎨 Filosofía de Diseño

### Fidelidad al Original
- Mismas fórmulas de stats y daño
- Mismo sistema de mejoras A/B por nivel
- Mismo límite de 6 peleas diarias
- Misma progresión de XP y niveles
- Misma aleatoriedad (seedeada para replays)

### Mejoras Modernas
- ✨ Arquitectura limpia y testeada
- ✨ Offline-first (sin servidor)
- ✨ TypeScript para type safety
- ✨ Tests automatizados (223 tests)
- ✨ UI responsive y moderna
- ✨ Replays determinísticos

---

## 🤝 Contribuir

Este es un proyecto de remake fiel, por lo que los cambios al gameplay deben respetar las mecánicas originales. Sin embargo, contribuciones en las siguientes áreas son bienvenidas:

- 🐛 Bug fixes
- ✨ Implementación de épicas pendientes
- 🧪 Más tests
- 📝 Documentación
- 🎨 Mejoras visuales (respetando la estética)
- ♿ Accesibilidad

---

## 📝 Licencia

Este proyecto es un remake educativo y de homenaje al juego original "El Bruto". No tiene fines comerciales.

---

## 🙏 Créditos

- **Juego Original:** El Bruto (MyBrute.com)
- **Remake por:** [@viceKDK](https://github.com/viceKDK)
- **Tecnologías:** Phaser, TypeScript, Vite, sql.js

---

## 📧 Contacto

- GitHub: [@viceKDK](https://github.com/viceKDK)
- Proyecto: [bruto](https://github.com/viceKDK/bruto)

---

**Hecho con 🥊 y nostalgia por los días de El Bruto**
