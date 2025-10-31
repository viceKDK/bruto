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
- Types: **None**
- Odds: **N/A** (arma por defecto)
- Hit speed: **100%**
- Damage: **5**
- Draw Chance: **100%** (siempre disponible)
- Reach: **1** (alcance mínimo)

**Modificadores:**
- +10% Evasion
- +20% Dexterity
- -25% Block
- +5% Disarm

**Notas:**
- Es el arma por defecto cuando no se tiene ninguna equipada
- Velocidad máxima (100%) pero daño mínimo (5)
- Penaliza el bloqueo significativamente (-25%)
- Bonus moderado a evasión y destreza
- Alcance muy corto (Reach 1)

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

## **5. Sai**
- **Tipos**: Fast
- **Odds**: 0.58%
- **Hit speed**: 200%
- **Damage**: 8
- **Draw Chance**: 8%
- **Reach**: 0

**Modificadores**:
- +10% Evasion
- +25% Dexterity
- +30% Block
- +75% Disarm
- +30% Combo
- +25% Deflect

**Notas**:
- Arma más rápida documentada (200% hit speed - el doble de velocidad normal)
- Máximo disarm del catálogo (75%)
- Máximo combo del catálogo (30%)
- Reach 0 indica combate cuerpo a cuerpo extremo
- Perfil defensivo excepcional: Block + Deflect + Evasion
- Baja daño (8) compensada por velocidad extrema y control
- Arma técnica que prioriza desarme y defensa sobre daño bruto

---

## **6. Sartén (Frying Pan)**
- **Tipos**: Heavy + Blunt
- **Odds**: 0.04%
- **Hit speed**: 100%
- **Damage**: 17
- **Draw Chance**: 17%
- **Reach**: 1

**Modificadores**:
- +40% Block
- -40% Combo
- +40% Deflect

**Notas**:
- Arma más rara del catálogo (0.04% odds - 1 en 2,500)
- Híbrido Heavy + Blunt: combina peso con daño contundente
- Máximo deflect del catálogo (40% - empate con Block)
- Penalización severa a combo (-40%) - arma lenta para encadenar
- Perfil puramente defensivo: Block + Deflect sin bonos ofensivos
- Reach 1: rango corto pero no cuerpo a cuerpo extremo
- Daño medio (17) - entre Bare hands (5) y Sword (28)
- Primera arma "Blunt" (contundente) del catálogo
- Draw Chance = Damage (17%) - patrón común en armas balanceadas

---

## **7. Hueso de Mamut (Mammoth Bone)**
- **Tipos**: Heavy + Blunt
- **Odds**: 1.96%
- **Hit speed**: 75%
- **Damage**: 14
- **Draw Chance**: 33%
- **Reach**: 1

**Modificadores**:
- +15% Critical chance
- -50% Dexterity
- +50% Accuracy
- +10% Disarm
- -10% Combo

---

## **8. Tridente (Trident)**
- **Tipos**: Long
- **Odds**: 0.97%
- **Hit speed**: 86%
- **Damage**: 14
- **Reach**: 3

**Modificadores**:
- +5% Critical chance
- +5% Reversal
- +20% Disarm

---

## **9. Boleadora (Flail)**
- **Tipos**: Heavy + Blunt
- **Odds**: 0.39%
- **Hit speed**: 55%
- **Damage**: 36
- **Draw Chance**: 33%
- **Reach**: 1

**Modificadores**:
- -20% Critical chance
- -30% Evasion
- -160% Dexterity
- -50% Block
- +150% Accuracy
- -20% Disarm
- +30% Combo

---

## **10. Maza (Mace)**
- **Tipos**: Heavy + Blunt
- **Odds**: 4.86%
- **Hit speed**: 60%
- **Damage**: 30
- **Draw Chance**: 33%
- **Reach**: 1

**Modificadores**:
- +20% Critical chance
- -30% Reversal
- -30% Evasion
- -65% Dexterity
- -30% Block
- +30% Accuracy
- +10% Disarm
- -60% Combo

---

## **11. Látigo (Whip)**
- **Tipos**: Long
- **Odds**: 0.29%
- **Hit speed**: 80%
- **Damage**: 10
- **Draw Chance**: 33%
- **Reach**: 5

**Modificadores**:
- -10% Reversal
- +30% Evasion
- +50% Dexterity
- -20% Block
- -20% Accuracy
- +30% Disarm
- +35% Combo

---

## **12. Hammer (Martillo)**
- **Tipos**: Heavy + Blunt
- **Odds**: 0.29%
- **Hit speed**: 52%
- **Damage**: 55
- **Draw Chance**: 33%
- **Reach**: 1

**Modificadores**:
- -20% Reversal
- -40% Evasion
- -80% Dexterity
- -40% Block
- +50% Accuracy
- +10% Disarm
- -40% Combo

---

## **13. Axe de 1 mano (One-handed Axe)**
- **Tipos**: Sharp
- **Odds**: 3.89%
- **Hit speed**: 80%
- **Damage**: 17
- **Draw Chance**: 23%
- **Reach**: 1

**Modificadores**:
- +15% Critical chance
- -10% Block

---

## **14. Morning Star (Maza de Acero)**
- **Tipos**: Heavy + Blunt
- **Odds**: 0.58%
- **Hit speed**: 80%
- **Damage**: 20
- **Draw Chance**: 33%
- **Reach**: 1

**Modificadores**:
- +5% Critical chance
- -10% Evasion
- -35% Dexterity
- +30% Accuracy
- +10% Disarm

---

## **15. Espadón (Broadsword)**
- **Tipos**: Sharp
- **Odds**: 9.72%
- **Hit speed**: 100%
- **Damage**: 10
- **Draw Chance**: 33%
- **Reach**: 1

**Modificadores**:
- +30% Critical chance
- +10% Reversal
- +15% Block
- +15% Disarm

---

## **16. Knife (Cuchillo)**
- **Tipos**: Fast + Sharp
- **Odds**: 7.78%
- **Hit speed**: 200%
- **Damage**: 7
- **Draw Chance**: 33%
- **Reach**: 0

**Modificadores**:
- +25% Critical chance
- +10% Evasion
- +50% Dexterity
- +30% Combo

---

## **17. Cimitarra (Scimitar)**
- **Tipos**: Sharp
- **Odds**: 0.58%
- **Hit speed**: 150%
- **Damage**: 10
- **Draw Chance**: 23%
- **Reach**: 1

**Modificadores**:
- +5% Critical chance
- +20% Dexterity
- +15% Combo
- +10% Block

---

## **18. Bastón (Staff)**
- **Tipos**: Long
- **Odds**: 6.80%
- **Hit speed**: 120%
- **Damage**: 6
- **Draw Chance**: 23%
- **Reach**: 3

**Modificadores**:
- +20% Critical chance
- +30% Reversal
- +5% Evasion
- +25% Block
- +25% Disarm
- +10% Combo

---

## **19. Shuriken**
- **Tipos**: Thrown
- **Odds**: 0.78%
- **Hit speed**: 1000%
- **Damage**: 3
- **Draw Chance**: 33%
- **Reach**: 0

**Modificadores**:
- +15% Evasion
- +30% Combo
- -10% Block
- -50% Disarm

---

## **20. Hacha 2 Manos (Two-handed Axe)**
- **Tipos**: Sharp + Heavy
- **Odds**: 0.97%
- **Hit speed**: 65%
- **Damage**: 32
- **Draw Chance**: 33%
- **Reach**: 2

**Modificadores**:
- +25% Critical chance
- -30% Evasion
- -45% Dexterity
- -15% Block
- +20% Accuracy
- +15% Disarm

---

---

### **Halberd (Alabarda)**

**Categoría:** Long + Heavy + Sharp (híbrida triple)

**Stats base:**
- Types: **Long, Heavy, Sharp**
- Odds: **0.19%** (muy rara)
- Hit speed: **67%**
- Damage: **24**
- Draw Chance: **17%**
- Reach: **4** (alcance máximo documentado)

**Modificadores:**
- -40% Dexterity (penalización muy fuerte)
- +10% Disarm
- +10% Combo

**Notas:**
- Arma **híbrida triple** - combina Long, Heavy y Sharp
- **Extremadamente rara** (0.19% odds - más rara que espada)
- **Alcance máximo** (Reach 4 - la más larga documentada)
- Alto daño (24, casi como espada 28)
- Velocidad reducida (67%, igual que espada)
- Trade-off severo: -40% Dexterity
- Primera arma con bonus **Combo** (+10%)
- Draw chance bajo (17%, igual que lanza)

---

### **Spear (Lanza)**

**Categoría:** Long

**Stats base:**
- Types: **Long**
- Odds: **3.89%**
- Hit speed: **100%**
- Damage: **12**
- Draw Chance: **17%**
- Reach: **3**

**Modificadores:**
- +15% Critical chance
- -10% Reversal (menos probabilidad de reversa/contraataque)
- +10% Disarm

**Notas:**
- Velocidad máxima (100% como puños)
- Daño medio (12, entre puños y espada)
- Alcance largo (Reach 3) - ventaja en distancia
- Excelente bonus crítico (+15%)
- Penaliza la capacidad de contraatacar (-10% reversal)
- Buena probabilidad de desarmar (+10%)
- Draw chance relativamente bajo (17%)

---

## Categorías de Armas

### **Sharp (Filosas)**
- Ejemplo: Sword
- Características: Alta precisión, bonus crítico, buena evasión
- Filosofía: Armas cortantes, rápidas y precisas

### **Fast (Rápidas)**
- Ejemplo: Sai
- Características: Velocidad extrema (200%), baja daño, excelente defensa (block/deflect/evasion), máximo disarm y combo
- Filosofía: Armas técnicas que priorizan velocidad, defensa y desarme sobre daño bruto

### **Heavy (Pesadas)**
- Ejemplos: Halberd (Alabarda - híbrida Long+Heavy+Sharp), Sartén (híbrida Heavy+Blunt)
- Características: Daño alto/medio, velocidad reducida, penaliza dexterity, bonus/penaliza combo según tipo
- Filosofía: Armas poderosas que sacrifican agilidad por fuerza bruta o defensa

### **Blunt (Contundentes)**
- Ejemplo: Sartén (Heavy + Blunt)
- Características: Daño contundente (17), máxima defensa (block/deflect 40%), penalización severa a combo (-40%), ultra rara (0.04%)
- Filosofía: Armas de control defensivo que neutralizan ataques pero no encadenan bien

### **Long (Largas)**
- Ejemplos: Spear (Lanza), Halberd (Alabarda - híbrida)
- Características: Mayor reach, alta velocidad (lanza) o medio (alabarda), bonus crítico/combo, penaliza reversal
- Filosofía: Armas de alcance que mantienen distancia del enemigo

### **Híbridas**
- **Halberd (Alabarda)**: Long + Heavy + Sharp
  - Combina alcance, poder y precisión
  - Trade-off: Penalización severa a dexterity (-40%)
  - Ventaja: Alcance máximo (Reach 4)

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
11. **Reversal** - % de contraatacar cuando recibes daño
12. **Combo** - Bonus a combos/ataques múltiples (+X%)

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
