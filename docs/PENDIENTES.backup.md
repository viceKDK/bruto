# 📋 El Bruto - Lista de Pendientes

**Actualizado:** 31 de Octubre, 2025  
**Estado del Proyecto:** 🟢 En Desarrollo Activo

---

## 🎯 Resumen Ejecutivo

### Estado Actual del Proyecto

| Categoría | Completado | Total | Progreso |
|-----------|------------|-------|----------|
| **Epics Implementados** | 8.4 | 12 | 70% ✅ |
| **Stories Completadas** | 42 | 67 | 63% 🚀 |
| **Tests Pasando** | 771 | 782 | 98.6% ✅ |
| **Cobertura de Código** | ~90% | 100% | Alta ✅ |

### ✅ Sistemas Completados

1. ✅ **Epic 1:** Infraestructura (Database, UI Shell, Navigation)
2. ✅ **Epic 2:** Autenticación (Registro, Login, Slots)
3. ✅ **Epic 3:** Creación de Brutos (Casillero, Stats)
4. ✅ **Epic 4:** Motor de Combate (Turnos, Daño, Presentación)
5. 🟡 **Epic 5:** Sistema de Armas (40% - infraestructura lista, falta catálogo)
6. ✅ **Epic 6:** Sistema de Skills (40 skills implementadas)
7. ✅ **Epic 7:** Sistema de Pets (Perro, Pantera, Oso)
8. ✅ **Epic 8:** Progresión (XP, Level-ups, Upgrades)
9. ✅ **Epic 9:** Matchmaking (Ghosts, Oponentes)
10. 🟡 **Epic 11:** Economía Parcial (Monedas, Compra de Slots)
11. 🟡 **Epic 12:** Replays Parcial (Logs de batalla, Viewer básico)

### 🔧 Refactoring SOLID/GRASP Completado

- ✅ Dependency Injection (DIP: 3.0→5.0/5)
- ✅ Strategy Pattern (OCP: 4.0→5.0/5)
- ✅ Extract Derived Stats (SRP: 4.3→4.9/5)
- ✅ **Score SOLID: 4.96/5 (99.2%)** 🏆

---

## 🚨 PRIORIDAD ALTA (Próxima Sesión)

### 1. Arreglar Tests Fallidos (11 tests)

**Archivo:** `StatBoostService.test.ts` (7 failures)  
**Problema:** Skills no cargan correctamente en tests (Story 6.8)

```
Error: Cannot read properties of undefined (reading 'effects')
Location: SkillEffectEngine.ts:292
```

**Solución:**
- Mock del SkillCatalog en tests
- Cargar skills antes de ejecutar tests
- Verificar imports de skill data

**Archivo:** `PetCombatService.test.ts` (4 failures)  
**Problemas:**
1. Orden de iniciativa de pets incorrecto
2. Capitalización de nombres de pets (Perro vs perro)

**Solución:**
- Revisar cálculo de iniciativa en `PetCombatService`
- Estandarizar capitalización en `getPetDisplayName()`

---

### 2. Epic 5: Sistema de Armas (PARCIALMENTE IMPLEMENTADO)

**Prioridad:** � MEDIA  
**Estado Actual:** 40% Completado ⏳

**✅ YA IMPLEMENTADO:**
- ✅ Modelo de datos `Weapon` completo (tipos, modificadores, stats)
- ✅ `WeaponStatsService` (cálculo de daño, aplicación de modificadores)
- ✅ `DisarmService` (mecánica de desarme por Oso pet)
- ✅ `WeaponRewardService` (obtención de armas en level-up)
- ✅ `WeaponCombatService` (integración en combate)
- ✅ `WeaponRack` UI component (visualización en Casillero)
- ✅ 24 tests de armas pasando
- ✅ Integración con CombatEngine (weapon modifiers aplicados)

**⏳ PENDIENTE (Stories en Backlog):**
- [ ] 5.1: Weapons Catalog Data Model (catálogo JSON con 40+ armas)
- [ ] 5.2: Weapon Stats and Modifiers (balance y tuning)
- [ ] 5.3: Weapon Type Behaviors (comportamientos específicos por tipo)
- [ ] 5.5: Weapon UI Casillero (tooltips y detalles completos)
- [ ] 5.6: Weapon Acquisition (sistema de drops y recompensas)

**Nota:** La infraestructura del sistema de armas está lista. Falta:
1. Crear catálogo JSON con las 40+ armas del juego original
2. Implementar comportamientos específicos por tipo de arma
3. Mejorar UI de visualización en Casillero
4. Sistema de obtención de armas (drops, rewards)

**Esfuerzo Estimado:** 4-6 horas (solo catálogo + UI + acquisition)

---

### 3. Completar Epic 11: Economía

**Stories Pendientes:**
- [ ] 11.3: Daily Fight Reset Timer (reseteo automático a las 00:00 UTC)
- [ ] 11.4: Level Reward Coins (monedas por level-up)
- [ ] 11.5: Economy Dashboard UI
- [ ] 11.6: Economy Balance Tuning

**Impacto:**
- Completar ciclo de economía (ganar/gastar monedas)
- Reseteo diario de peleas
- Balance de recompensas

**Esfuerzo Estimado:** 4-6 horas

---

### 4. Completar Epic 12: Replay System

**Stories Pendientes:**
- [ ] 12.3: Replay Playback Controls (play, pause, speed)
- [ ] 12.4: Replay Data Compression
- [ ] 12.5: Replay History UI (lista de replays)
- [ ] 12.6: Share/Export Replay

**Impacto:**
- Ver peleas anteriores con controles
- Compartir replays épicos
- Comprimir datos para reducir almacenamiento

**Esfuerzo Estimado:** 6-8 horas

---

## 🟡 PRIORIDAD MEDIA (Siguiente Sprint)

### 5. Epic 10: UI/UX Polish

**Stories Pendientes (13 total):**
- [ ] 10.1: Final Art and Sprites
- [ ] 10.2: Screen Transitions (animaciones fluidas)
- [ ] 10.3: Login Screen Polish
- [ ] 10.4: Bruto Selection Screen Polish
- [ ] 10.5: Casillero Screen Polish
- [ ] 10.6: Opponent Selection Screen Polish
- [ ] 10.7: Combat Screen Polish
- [ ] 10.8: Level-up Screen Polish
- [ ] 10.9: Audio System (SFX + música)
- [ ] 10.10: Accessibility Features
- [ ] 10.11: Responsive Design Final
- [ ] 10.12: Performance Optimization
- [ ] 10.13: Final Polish Pass

**Impacto:**
- Experiencia visual profesional
- Sonidos y música
- Accesibilidad (a11y)
- Performance 60fps

**Esfuerzo Estimado:** 20-25 horas

---

### 6. Refinamiento de Skills (Epic 6)

**Stories Pendientes:**
- [ ] 6.8: Level-up Skill Bonuses (skills mejoran stats en level-up)

**Nota:** Story 6.8 tiene tests fallidos que necesitan arreglarse primero.

---

## 🟢 OPCIONAL (Futuro)

### 7. Backend Real (Actualmente Local)

**Componentes:**
- [ ] API REST con Express (ya existe en `/backend`)
- [ ] Deploy a producción (Railway, Render, Vercel)
- [ ] Multiplayer real (vs local ghosts)
- [ ] Leaderboards globales

**Esfuerzo Estimado:** 15-20 horas

---

### 8. Features Extra

- [ ] Tutorial interactivo para nuevos jugadores
- [ ] Achievements/Logros
- [ ] Eventos especiales (Halloween, Navidad)
- [ ] Modo torneo
- [ ] Clanes/Guilds
- [ ] Trading de items

---

## 📊 Desglose por Epic

### Epic 1: Infraestructura ✅ (100%)
- ✅ 1.1: Project Skeleton
- ✅ 1.2: Database Layer
- ✅ 1.3: UI Shell

### Epic 2: Autenticación ✅ (100%)
- ✅ 2.1: Account Creation
- ✅ 2.2: Bruto Slots
- ✅ 2.3: Daily Fights Limit

### Epic 3: Casillero ✅ (100%)
- ✅ 3.1: Bruto Creation
- ✅ 3.2: Casillero UI
- ✅ 3.3: Stats Display

### Epic 4: Combate ✅ (100%)
- ✅ 4.1: Turn Scheduler
- ✅ 4.2: Damage & Evasion
- ✅ 4.3: Combat Presentation

### Epic 5: Armas 🟡 (40%)
- ✅ Modelo Weapon (tipos, modificadores)
- ✅ WeaponStatsService
- ✅ DisarmService (Story 5.4)
- ✅ WeaponRewardService
- ✅ WeaponCombatService
- ✅ WeaponRack UI
- ⏳ 5.1: Weapons Catalog (40+ armas JSON)
- ⏳ 5.2: Balance y Tuning
- ⏳ 5.3: Weapon Type Behaviors
- ⏳ 5.5: UI Tooltips
- ⏳ 5.6: Acquisition System

### Epic 6: Skills ✅ (90%)
- ✅ 6.1: Skill Catalog
- ✅ 6.2: Skill Effects
- ✅ 6.3: Skill Acquisition
- ✅ 6.4: Passive Skills
- ✅ 6.5: Active Abilities
- ✅ 6.6: Skill Stacking
- ✅ 6.7: Skills UI
- ⏳ 6.8: Level-up Bonuses (tests fallidos)

### Epic 7: Pets ✅ (100%)
- ✅ 7.1: Pets Database
- ✅ 7.2: Pet Stats
- ✅ 7.3: Pet Combat AI
- ✅ 7.4: Stacking Rules
- ✅ 7.5: Resistance Cost

### Epic 8: Progresión ✅ (100%)
- ✅ 8.1: XP System
- ✅ 8.2: Level-up Options
- ✅ 8.3: Stat Boosts

### Epic 9: Matchmaking ✅ (100%)
- ✅ 9.1: Opponent Pool
- ✅ 9.2: Selection UI
- ✅ 9.3: Ghost Generation
- ✅ 9.4: Level Filtering

### Epic 10: Polish ❌ (0%)
- ⏳ 10.1-10.13: TODAS PENDIENTES

### Epic 11: Economía 🟡 (33%)
- ✅ 11.1: Coin System
- ✅ 11.2: Slot Purchase
- ⏳ 11.3: Daily Reset Timer
- ⏳ 11.4: Level Rewards
- ⏳ 11.5: Economy Dashboard
- ⏳ 11.6: Balance Tuning

### Epic 12: Replays 🟡 (33%)
- ✅ 12.1: Battle Logs
- ✅ 12.2: Replay Viewer
- ⏳ 12.3: Playback Controls
- ⏳ 12.4: Data Compression
- ⏳ 12.5: History UI
- ⏳ 12.6: Share/Export

---

## 🎯 Plan de Acción Recomendado

### Sesión 1: Arreglar Tests (2-3 horas)
1. ✅ Arreglar 7 tests de `StatBoostService` (skills loading)
2. ✅ Arreglar 4 tests de `PetCombatService` (initiative + capitalización)
3. ✅ Verificar que todos los tests pasen (782/782)

### Sesión 2: Epic 5 - Completar Sistema de Armas (4-6 horas)
1. Story 5.1: Crear catálogo JSON de 40+ armas
2. Story 5.3: Implementar comportamientos por tipo
3. Story 5.5: Mejorar tooltips de UI en Casillero
4. Story 5.6: Sistema de obtención de armas (drops/rewards)

### Sesión 3: Completar Epic 11 (4-6 horas)
1. Story 11.3: Daily reset timer
2. Story 11.4: Monedas por level-up
3. Story 11.5: Dashboard de economía
4. Story 11.6: Balance tuning

### Sesión 4: Completar Epic 12 (6-8 horas)
1. Story 12.3: Controles de replay
2. Story 12.4: Compresión de datos
3. Story 12.5: UI de historial
4. Story 12.6: Compartir/exportar

### Sesión 5+: Epic 10 - Polish (20-25 horas)
1. Arte final y sprites
2. Transiciones y animaciones
3. Sistema de audio
4. Optimización de performance
5. Responsive design
6. Accessibility

---

## 📈 Próximos Hitos

| Hito | Descripción | ETA |
|------|-------------|-----|
| **Alpha** | Todos los sistemas core funcionando | 2 semanas |
| **Beta** | Polish completado, arte final | 4 semanas |
| **RC** | Testing completo, bugs arreglados | 6 semanas |
| **Launch** | Deploy a producción | 8 semanas |

---

## 🐛 Bugs Conocidos

### Críticos
- ❌ 11 tests fallidos (7 Skills + 4 Pets)

### Menores
- ⚠️ Algunas animaciones de combate stuttering
- ⚠️ UI no completamente responsive en mobile
- ⚠️ Falta feedback de carga en algunas pantallas

---

## 💡 Ideas para el Futuro

- 🎮 Modo PvP en tiempo real
- 🏆 Sistema de ranking global
- 🎨 Skins personalizables
- 🎁 Sistema de loot boxes
- 📱 App móvil nativa
- 🌐 Internacionalización (i18n)
- 🔊 Voice acting para combates
- 🎬 Cutscenes animadas

---

## 📚 Documentación Relevante

- [GDD.md](GDD.md) - Game Design Document
- [epics.md](epics.md) - Desglose de Epics
- [sprint-status.yaml](sprint-status.yaml) - Estado del Sprint
- [refactoring-opportunities.md](refactoring-opportunities.md) - Mejoras SOLID
- [security-password-system.md](security-password-system.md) - Sistema de Seguridad

---

**¿Qué hacer ahora?**

1. **Arreglar tests fallidos** (2-3 horas) ← EMPEZAR AQUÍ
2. **Implementar Epic 5: Armas** (8-12 horas)
3. **Completar Economía y Replays** (10-14 horas)
4. **Polish y Arte Final** (20-25 horas)

**¡El juego está 67% completo y funcionando!** 🎉
