# Story 9.3: Opponent Ghost Generation

**Epic:** 9 - Matchmaking & Opponents  
**Status:** Backlog  
**Estimate:** 5 Story Points  
**Priority:** High  
**Dependencies:** Story 8.2 (Level-Up Options), Story 8.3 (Stat Boosts)

---

## User Story

**As a** player,  
**I want** to fight against AI-generated opponents with realistic builds,  
**So that** every battle feels different and challenging, like fighting real players.

---

## Context

El sistema de matchmaking actual devuelve oponentes reales de la base de datos, pero necesitamos un sistema de "ghosts" (oponentes generados por IA) para:

1. **Garantizar disponibilidad**: Siempre hay 5 oponentes disponibles
2. **Variedad de builds**: Cada ghost tiene una progresión única
3. **Fairness**: Todos los ghosts han pasado por el mismo proceso de level-up
4. **Replayabilidad**: Pool infinito de oponentes únicos

Un "ghost" es un bruto generado proceduralmente que simula el historial completo de level-ups que habría hecho un jugador real desde nivel 1 hasta el nivel objetivo.

---

## Acceptance Criteria

### AC 1: Ghost Bruto Generator Service
- [ ] Crear `GhostGenerationService` con método `generateGhost(level, seed?)`
- [ ] Ghost tiene todas las propiedades de un `IBruto` normal
- [ ] Ghost incluye flag `isGhost: true`
- [ ] Generación es determinística con mismo seed

### AC 2: Simulated Level Progression
- [ ] Ghost inicia en nivel 1 con stats base (HP 60, STR 2, Speed 2, Agility 2)
- [ ] Para cada nivel 2 → target level:
  - Generar opciones A/B aleatorias usando `UpgradeGenerator`
  - Seleccionar una opción aleatoriamente
  - Aplicar stat boosts usando `StatBoostService`
- [ ] Guardar historial de decisiones en `upgradeHistory[]`

### AC 3: Realistic Name Generation
- [ ] Pool de 100+ nombres únicos (estilo El Bruto)
- [ ] Selección aleatoria sin repetir en mismo pool
- [ ] Nombres apropiados (sin profanidad)

### AC 4: Appearance Randomization
- [ ] Usar `AppearanceGenerator` para generar diseño aleatorio
- [ ] 10 diseños × 8 colores = 80 combinaciones posibles
- [ ] Distribución uniforme de apariencias

### AC 5: Build Archetype Detection
- [ ] Analizar `upgradeHistory` para determinar arquetipo:
  - **Tank**: >60% upgrades en HP/STR
  - **Agile**: >60% upgrades en Speed/Agility
  - **Balanced**: Distribución ~25% en cada stat
  - **Hybrid**: Especialización en 2 stats
- [ ] Almacenar arquetipo en propiedad `buildArchetype`

### AC 6: Integration with MatchmakingService
- [ ] `MatchmakingService.findOpponents()` usa ghosts cuando no hay brutos reales
- [ ] Genera exactamente el número solicitado de ghosts
- [ ] Filtra por nivel exacto
- [ ] No persiste ghosts en DB (efímeros)

### AC 7: Seeded Randomness for Reproducibility
- [ ] Usar `SeededRandom` service para generación determinística
- [ ] Formato de seed: `ghost-${userId}-${level}-${timestamp}-${index}`
- [ ] Mismo seed produce mismo ghost (útil para debugging)

---

## Technical Design

### Data Model Extension

```typescript
// Extender IBruto con propiedades de ghost
export interface IGhostBruto extends IBruto {
  isGhost: boolean;
  generationSeed: string;
  buildArchetype: 'tank' | 'agile' | 'balanced' | 'hybrid';
  upgradeHistory: IUpgradeChoice[];
}

export interface IUpgradeChoice {
  level: number;
  choiceSelected: 'A' | 'B';
  optionA: IUpgradeOption;
  optionB: IUpgradeOption;
  statBoostsApplied: IStatBoosts;
}
```

### GhostGenerationService

```typescript
export class GhostGenerationService {
  /**
   * Generate a ghost bruto at target level
   */
  static generateGhost(targetLevel: number, seed?: string): IGhostBruto {
    const finalSeed = seed || this.generateSeed();
    const rng = new SeededRandom(finalSeed);
    
    // 1. Generate base bruto
    const ghost = this.createBaseGhost(rng);
    
    // 2. Simulate level progression
    this.simulateLevelProgression(ghost, targetLevel, rng);
    
    // 3. Determine build archetype
    ghost.buildArchetype = this.detectArchetype(ghost.upgradeHistory);
    
    return ghost;
  }

  /**
   * Generate multiple unique ghosts for a pool
   */
  static generateGhostPool(
    level: number,
    count: number,
    userId: string
  ): IGhostBruto[] {
    const timestamp = Date.now();
    return Array.from({ length: count }, (_, index) => {
      const seed = `ghost-${userId}-${level}-${timestamp}-${index}`;
      return this.generateGhost(level, seed);
    });
  }

  private static createBaseGhost(rng: SeededRandom): IGhostBruto {
    return {
      id: `ghost-${rng.randomId()}`,
      userId: 'ghost',
      name: this.generateName(rng),
      level: 1,
      xp: 0,
      hp: 60,
      maxHp: 60,
      str: 2,
      speed: 2,
      agility: 2,
      resistance: 0,
      appearanceId: rng.randomInt(0, 9),
      colorVariant: rng.randomInt(0, 7),
      createdAt: new Date(),
      isGhost: true,
      generationSeed: rng.seed,
      buildArchetype: 'balanced',
      upgradeHistory: [],
    };
  }

  private static simulateLevelProgression(
    ghost: IGhostBruto,
    targetLevel: number,
    rng: SeededRandom
  ): void {
    for (let level = 2; level <= targetLevel; level++) {
      // Generate upgrade options
      const options = UpgradeGenerator.generate(ghost);
      
      // Randomly choose A or B
      const choice = rng.randomBool() ? 'A' : 'B';
      const selectedOption = choice === 'A' ? options.optionA : options.optionB;
      
      // Apply stat boosts
      const boosts = StatBoostService.applyBoosts(ghost, selectedOption);
      
      // Record decision
      ghost.upgradeHistory.push({
        level,
        choiceSelected: choice,
        optionA: options.optionA,
        optionB: options.optionB,
        statBoostsApplied: boosts,
      });
      
      // Level up
      ghost.level = level;
    }
  }

  private static detectArchetype(
    history: IUpgradeChoice[]
  ): 'tank' | 'agile' | 'balanced' | 'hybrid' {
    // Count total boosts per stat category
    const counts = { hp: 0, str: 0, speed: 0, agility: 0 };
    
    history.forEach(choice => {
      const boosts = choice.statBoostsApplied;
      if (boosts.hp) counts.hp++;
      if (boosts.str) counts.str++;
      if (boosts.speed) counts.speed++;
      if (boosts.agility) counts.agility++;
    });
    
    const total = history.length;
    const tankPercent = (counts.hp + counts.str) / (total * 2);
    const agilePercent = (counts.speed + counts.agility) / (total * 2);
    
    if (tankPercent > 0.6) return 'tank';
    if (agilePercent > 0.6) return 'agile';
    if (Math.abs(tankPercent - agilePercent) < 0.2) return 'balanced';
    return 'hybrid';
  }

  private static generateName(rng: SeededRandom): string {
    const names = GHOST_NAMES_POOL; // 100+ names
    return rng.randomElement(names);
  }

  private static generateSeed(): string {
    return `ghost-${Date.now()}-${Math.random()}`;
  }
}
```

### Integration with MatchmakingService

```typescript
// Update MatchmakingService.findOpponents()
export class MatchmakingService {
  static async findOpponents(
    level: number,
    userId: string,
    count: number = 5
  ): Promise<Result<IOpponentPool>> {
    // Try to find real brutos first
    const realBrutos = await BrutoRepository.findByLevel(level, userId);
    
    // If not enough real brutos, fill with ghosts
    const needed = count - realBrutos.length;
    const ghosts = needed > 0 
      ? GhostGenerationService.generateGhostPool(level, needed, userId)
      : [];
    
    const opponents = [...realBrutos, ...ghosts];
    
    return ok({
      opponents,
      level,
      generatedAt: new Date(),
      poolSize: opponents.length,
    });
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Service (Day 1)
- [ ] Crear archivo `src/services/GhostGenerationService.ts`
- [ ] Implementar interfaz `IGhostBruto`
- [ ] Implementar método `generateGhost()`
- [ ] Implementar método `createBaseGhost()`
- [ ] Implementar pool de nombres (100+ nombres)

### Phase 2: Level Simulation (Day 1)
- [ ] Implementar `simulateLevelProgression()`
- [ ] Integrar con `UpgradeGenerator.generate()`
- [ ] Integrar con `StatBoostService.applyBoosts()`
- [ ] Guardar `upgradeHistory` correctamente

### Phase 3: Archetype Detection (Day 2)
- [ ] Implementar `detectArchetype()`
- [ ] Crear lógica de análisis de upgrades
- [ ] Testear distribución de arquetipos

### Phase 4: Integration (Day 2)
- [ ] Modificar `MatchmakingService.findOpponents()`
- [ ] Implementar `generateGhostPool()`
- [ ] Manejar mix de brutos reales + ghosts
- [ ] Asegurar que ghosts no se persisten

### Phase 5: Testing (Day 3)
- [ ] Unit tests para `GhostGenerationService` (15+ tests)
- [ ] Tests de determinismo (mismo seed = mismo ghost)
- [ ] Tests de distribución de arquetipos
- [ ] Integration tests con `MatchmakingService`
- [ ] Tests de performance (generar 100 ghosts < 1s)

---

## Testing Strategy

### Unit Tests

```typescript
describe('GhostGenerationService', () => {
  describe('generateGhost', () => {
    it('generates ghost at target level', () => {
      const ghost = GhostGenerationService.generateGhost(10);
      expect(ghost.level).toBe(10);
      expect(ghost.isGhost).toBe(true);
    });

    it('uses deterministic seeding', () => {
      const seed = 'test-seed-123';
      const ghost1 = GhostGenerationService.generateGhost(10, seed);
      const ghost2 = GhostGenerationService.generateGhost(10, seed);
      
      expect(ghost1).toEqual(ghost2);
    });

    it('creates unique ghosts with different seeds', () => {
      const ghost1 = GhostGenerationService.generateGhost(10);
      const ghost2 = GhostGenerationService.generateGhost(10);
      
      expect(ghost1.id).not.toBe(ghost2.id);
      expect(ghost1.name).not.toBe(ghost2.name);
    });

    it('simulates correct number of level-ups', () => {
      const ghost = GhostGenerationService.generateGhost(5);
      expect(ghost.upgradeHistory).toHaveLength(4); // Levels 2-5
    });

    it('applies stat boosts correctly', () => {
      const ghost = GhostGenerationService.generateGhost(3);
      const baseTotal = 60 + 2 + 2 + 2; // Base stats
      const currentTotal = ghost.hp + ghost.str + ghost.speed + ghost.agility;
      
      expect(currentTotal).toBeGreaterThan(baseTotal);
    });
  });

  describe('detectArchetype', () => {
    it('detects tank archetype', () => {
      // Create ghost with mostly HP/STR upgrades
      const ghost = createTankGhost();
      expect(ghost.buildArchetype).toBe('tank');
    });

    it('detects agile archetype', () => {
      const ghost = createAgileGhost();
      expect(ghost.buildArchetype).toBe('agile');
    });

    it('detects balanced archetype', () => {
      const ghost = createBalancedGhost();
      expect(ghost.buildArchetype).toBe('balanced');
    });
  });

  describe('generateGhostPool', () => {
    it('generates requested number of ghosts', () => {
      const pool = GhostGenerationService.generateGhostPool(10, 5, 'user-1');
      expect(pool).toHaveLength(5);
    });

    it('all ghosts are at same level', () => {
      const pool = GhostGenerationService.generateGhostPool(10, 5, 'user-1');
      expect(pool.every(g => g.level === 10)).toBe(true);
    });

    it('all ghosts have unique names', () => {
      const pool = GhostGenerationService.generateGhostPool(10, 50, 'user-1');
      const names = pool.map(g => g.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(50);
    });
  });
});
```

### Integration Tests

```typescript
describe('MatchmakingService with Ghosts', () => {
  it('returns mix of real brutos and ghosts', async () => {
    // Setup: 2 real brutos at level 5
    await createRealBrutos(2, 5);
    
    const result = await MatchmakingService.findOpponents(5, 'user-1', 5);
    
    expect(result.success).toBe(true);
    expect(result.data.opponents).toHaveLength(5);
    expect(result.data.opponents.filter(o => !o.isGhost)).toHaveLength(2);
    expect(result.data.opponents.filter(o => o.isGhost)).toHaveLength(3);
  });

  it('generates all ghosts when no real brutos available', async () => {
    const result = await MatchmakingService.findOpponents(100, 'user-1', 5);
    
    expect(result.success).toBe(true);
    expect(result.data.opponents).toHaveLength(5);
    expect(result.data.opponents.every(o => o.isGhost)).toBe(true);
  });
});
```

---

## Definition of Done

- [ ] `GhostGenerationService` implementado y funcionando
- [ ] Generación determinística con seeds
- [ ] Simulación correcta de level progression
- [ ] Detección de arquetipos implementada
- [ ] Integración con `MatchmakingService` completa
- [ ] Pool de 100+ nombres únicos
- [ ] 15+ unit tests pasando
- [ ] Integration tests con matchmaking pasando
- [ ] Performance: generar 100 ghosts < 1 segundo
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Story movida a `/implemented`

---

## Notes

- Los ghosts NO se persisten en la base de datos (son efímeros)
- Solo el seed necesita guardarse si queremos reproducir un ghost exacto
- Para debugging: podemos generar el mismo ghost con el mismo seed
- Futuras épicas (5, 6, 7) añadirán weapons/skills/pets a ghosts
