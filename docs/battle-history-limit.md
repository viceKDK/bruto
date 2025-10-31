# 🎯 Sistema de Batallas Optimizado - Límite de 7 Peleas

## 📋 Descripción

Para mantener la base de datos liviana y optimizada, **solo se guardan las últimas 7 batallas de cada Bruto**. Las batallas más antiguas se eliminan automáticamente.

## ⚙️ Funcionamiento

### Auto-Limpieza Automática

Cada vez que guardas una batalla:
1. Se guarda la nueva batalla en la BD
2. Se cuentan las batallas del Bruto 1
3. Si hay más de 7, se eliminan las más antiguas
4. Se repite el proceso para el Bruto 2

**Ejemplo:**
```
Bruto "Titan" tiene 7 batallas guardadas
↓
Se guarda batalla #8
↓
Automáticamente se elimina la batalla #1 (más antigua)
↓
Quedan batallas #2 a #8 (últimas 7)
```

## 🔧 Implementación Técnica

### BattleService

Clase que maneja toda la lógica de batallas:

```typescript
// Guardar batalla y auto-limpiar
BattleService.saveBattle({
  bruto1_id: "uuid-1",
  bruto2_id: "uuid-2", 
  winner_id: "uuid-1",
  turn_count: 15,
  battle_log: { turns: [...] }
});

// Obtener últimas 7 batallas
const battles = BattleService.getBattlesForBruto("bruto-id");

// Contar batallas
const count = BattleService.getBattleCount("bruto-id");
```

### Endpoints API

**POST** `/api/battles`
```json
{
  "bruto1_id": "uuid-1",
  "bruto2_id": "uuid-2",
  "winner_id": "uuid-1",
  "turn_count": 15,
  "battle_log": { "turns": [...] }
}
```

Respuesta:
```json
{
  "id": "battle-uuid",
  "message": "Battle saved. Old battles automatically cleaned.",
  "maxBattlesPerBruto": 7
}
```

**GET** `/api/battles/bruto/:brutoId`
- Retorna array con las últimas 7 batallas
- Ordenadas de más reciente a más antigua

**GET** `/api/battles/bruto/:brutoId/count`
```json
{ "count": 7 }
```

## 📊 Optimizaciones de Base de Datos

### Índices Creados

Para mejorar el rendimiento de consultas:

```sql
-- Índice por fecha (descendente)
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);

-- Índice compuesto bruto + fecha
CREATE INDEX idx_battles_bruto1_created ON battles(bruto1_id, created_at DESC);
CREATE INDEX idx_battles_bruto2_created ON battles(bruto2_id, created_at DESC);
```

Estos índices hacen que las consultas sean **mucho más rápidas** al:
- Obtener las últimas batallas
- Contar batallas de un bruto
- Eliminar batallas antiguas

## 💡 Ventajas

✅ **Base de datos ligera** - Máximo ~700 batallas para 100 Brutos
✅ **Consultas rápidas** - Índices optimizados
✅ **Automático** - No requiere mantenimiento manual
✅ **Transparente** - El frontend no necesita cambios
✅ **Escalable** - Funciona con miles de Brutos

## 🎮 Uso en el Frontend

```typescript
import { apiClient } from './services/ApiClient';

// Después de una batalla
async function saveBattleResult(battle) {
  const result = await apiClient.saveBattle({
    bruto1_id: myBruto.id,
    bruto2_id: enemyBruto.id,
    winner_id: winner.id,
    turn_count: battleLog.turns.length,
    battle_log: battleLog
  });
  
  console.log(result.message); 
  // "Battle saved. Old battles automatically cleaned."
}

// Ver historial de batallas
async function showBattleHistory(brutoId) {
  const battles = await apiClient.getBattlesForBruto(brutoId);
  // Array con máximo 7 batallas
  battles.forEach(battle => {
    console.log(`Battle ${battle.id} - Turns: ${battle.turnCount}`);
  });
}

// Verificar cuántas batallas tiene
async function checkBattleCount(brutoId) {
  const { count } = await apiClient.getBattleCount(brutoId);
  console.log(`This bruto has ${count} battles saved`);
}
```

## 🔄 Cambios Realizados

### Nuevos Archivos

1. **backend/src/services/BattleService.ts**
   - Lógica de guardado y limpieza
   - Constante `MAX_BATTLES_PER_BRUTO = 7`

2. **backend/src/routes/battles.ts**
   - Endpoints REST para batallas
   - Verificación de permisos

### Archivos Modificados

1. **backend/src/server.ts**
   - Agregado `import battlesRoutes`
   - Registrado `app.use('/api/battles', battlesRoutes)`

2. **backend/src/database/migrate.ts**
   - Agregados 3 índices nuevos
   - Optimización de consultas

3. **src/services/ApiClient.ts**
   - Métodos `saveBattle()`
   - Métodos `getBattlesForBruto()`
   - Métodos `getBattleCount()`

## 📈 Estadísticas

Con el límite de 7 batallas:

| Brutos | Batallas Máximas | Tamaño Estimado |
|--------|------------------|-----------------|
| 10     | 70               | ~140 KB         |
| 50     | 350              | ~700 KB         |
| 100    | 700              | ~1.4 MB         |
| 500    | 3,500            | ~7 MB           |

Sin límite, con 1000 Brutos peleando 100 veces cada uno:
- **100,000 batallas** → ~200 MB 😱

Con límite de 7:
- **7,000 batallas** → ~14 MB ✅

**¡Reducción de ~93% en espacio! 🎉**

## 🚀 Cómo Probarlo

1. Inicia el backend:
```bash
cd backend
npm run dev
```

2. Crea batallas con Postman/curl:
```bash
curl -X POST http://localhost:3001/api/battles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bruto1_id": "id-1",
    "bruto2_id": "id-2",
    "winner_id": "id-1",
    "turn_count": 10,
    "battle_log": {}
  }'
```

3. Crea 10 batallas seguidas
4. Verifica que solo queden 7:
```bash
curl http://localhost:3001/api/battles/bruto/id-1/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Resultado: `{ "count": 7 }` ✅
