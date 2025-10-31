# Especificaciones de Armas - El Bruto

## Atributos de Armas (Extraído del Original)

### Sistema de Atributos

Cada arma tiene los siguientes atributos:

#### **Atributos Base:**
- **Types** - Categoría del arma (Sharp, Fast, Heavy, Long)
- **Odds** - Probabilidad de obtener esta arma (%)
- **Hit speed** - Velocidad de golpe (%)
- **Damage** - Daño base (número)
- **Draw Chance** - Probabilidad de sacar el arma en combate (%)
- **Reach** - Alcance del arma (pendiente de confirmar valores)

#### **Modificadores de Stats:**
- **Critical chance** - Aumenta % de crítico (+X%)
- **Evasion** - Aumenta % de evasión (+X%)
- **Dexterity** - Aumenta destreza (+X%)
- **Accuracy** - Aumenta precisión (+X%)
- **Block** - Aumenta % de bloqueo (+X% o -X%)
- **Disarm** - Probabilidad de desarmar al oponente (+X%)

---

## Armas Documentadas

### **Bare hands (Puños - Sin arma equipada)**

**Categoría:** Base (sin arma)

**Stats base:**
- Hit speed: **100%**
- Damage: **5**

**Modificadores:**
- +10% Evasion
- +20% Dexterity
- -25% Block
- +5% Disarm

**Notas:**
- Es el arma por defecto cuando no se tiene ninguna equipada
- Velocidad máxima pero daño mínimo
- Penaliza el bloqueo significativamente

---

### **Sword (Espada)**

**Categoría:** Sharp

**Stats base:**
- Types: **Sharp**
- Odds: **0.39%** (rara)
- Hit speed: **67%**
- Damage: **28**
- Draw Chance: **33%**
- Reach: **[pendiente]**

**Modificadores:**
- +5% Critical chance
- +20% Evasion
- +10% Dexterity
- +20% Accuracy
- +10% Disarm

**Notas:**
- Alta precisión y evasión
- Daño considerable (28 vs 5 de puños)
- Velocidad media (67% vs 100% puños)
- Buen balance entre ofensiva y defensa

---

## Categorías de Armas

### **Sharp (Filosas)**
- Ejemplo: Sword
- Características: Alta precisión, bonus crítico, buena evasión
- Filosofía: Armas cortantes, rápidas y precisas

### **Fast (Rápidas)**
- [Pendiente documentar ejemplos del juego]
- Características esperadas: Alta hit speed, menor daño

### **Heavy (Pesadas)**
- [Pendiente documentar ejemplos del juego]
- Características esperadas: Alto daño, baja hit speed, posible bonus a block

### **Long (Largas)**
- [Pendiente documentar ejemplos del juego]
- Características esperadas: Mayor reach, ventaja en primer golpe

---

## Sistema de Stats en Combate

Basado en los modificadores de armas, estos son los stats que afectan el combate:

1. **Hit speed** - Velocidad de ataque (afecta turnos/velocidad)
2. **Damage** - Daño base del golpe
3. **Evasion** - % de esquivar ataques (relacionado con Agilidad del bruto)
4. **Dexterity** - Destreza (posiblemente afecta precisión y esquiva)
5. **Accuracy** - Precisión del golpe (% de acertar)
6. **Block** - % de bloquear ataques
7. **Critical chance** - % de golpe crítico (x2 daño)
8. **Disarm** - % de desarmar al oponente
9. **Draw Chance** - % de que el arma se use en el turno
10. **Reach** - Alcance (posiblemente afecta quién golpea primero)

---

## Pendientes por Documentar

### Armas faltantes:
- [ ] Resto de armas Sharp
- [ ] Todas las armas Fast
- [ ] Todas las armas Heavy
- [ ] Todas las armas Long

### Información por confirmar:
- [ ] ¿Cómo funciona exactamente "Reach"?
- [ ] ¿Cómo se calcula el daño final? (Damage del arma + STR del bruto?)
- [ ] ¿Los modificadores son aditivos o multiplicativos?
- [ ] ¿Draw Chance es individual por arma o afecta a todas?
- [ ] ¿Hay límite de armas equipadas simultáneamente?

### Otras mecánicas:
- [ ] Habilidades (grid completo)
- [ ] Mascotas (stats y efectos)
- [ ] Fórmulas de combate exactas

---

**Fuente:** Imágenes del juego original "El Bruto" (brute.eternaltwin.org / elbruto.eternaltwin.org)
**Fecha:** 2025-10-30
