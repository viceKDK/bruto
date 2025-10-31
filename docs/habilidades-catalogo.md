# Catálogo de Habilidades - El Bruto

Nota: Las estadísticas principales ahora están documentadas en `docs/stast.md`.

## Grid de Habilidades (Extraído del Original)

**Observaciones del grid:**
- Grid de aproximadamente 7 columnas × 7-8 filas = ~49-56 espacios totales
- Algunas celdas vacías (espacios disponibles)
- Habilidades representadas por íconos distintivos
- Colores variados: amarillos, verdes, marrones, algunos con personajes

---

### **Fuerza Bruta**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva/Activa híbrida - Crítico y Golpe Potenciado

**Efecto:**
- +10% cirtical chance
- Obtienes 1 acción especial por combate que inflige el doble de daño (x2) cuando se activa.
- Por cada 30 puntos de Fuerza (STR), ganas 1 uso extra de esta acción especial en la misma batalla.

**Notas:**
- Los usos se calculan a partir de la Fuerza actual al inicio del combate (p. ej., 0–29 STR: 1 uso; 30–59 STR: 2 usos; 60–89 STR: 3 usos, etc.).
- El golpe potenciado respeta las reglas normales de impacto y mitigaciones; el multiplicador x2 se aplica al daño final del golpe que impacta.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

## Habilidades Documentadas

### **Categoría: Buffs de Stats Permanentes**

Estas habilidades aumentan stats base del bruto de forma permanente y modifican las subidas de nivel futuras.

---

### **Fuerza Hércules**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff Permanente - STR

**Efecto inmediato:**
- +3 STR
- +50% STR actual

**Ejemplo:** si tienes 7 de Fuerza y obtienes la habilidad, primero suma +3 (queda en 10) y luego aplica +50%, quedando en 15 de Fuerza.

**Efecto en subidas de nivel:**
- Al subir nivel y elegir aumentar STR, da **3 STR** en vez de 2

**Odds:** 5.83%

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Toughened Skin** (Piel Dura)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Mitigación de daño porcentual

**Efecto:**
- +10% Armadura (absorbe el 10% del daño de cada golpe recibido).
- Se acumula con Armadura: juntas mitigan hasta 35% (10% + 25%).

**Odds:** [Pendiente]

**Estrategia:**
- Mitigación liviana sin penalizar Velocidad.
- Buena base que, combinada con Armadura, ofrece reducción notable sin depender solo de HP.

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Esqueleto de Plomo**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Mitigación/Evasión

**Efecto:**
- +15% Armadura (absorbe el 15% del daño de cada golpe recibido).
- -15% daño recibido específicamente de armas contundentes (blunt).
- -15% Evasión.

**Notas:**
- “Armas contundentes (blunt)” se refiere a armas de impacto (p. ej., martillos, mazas, etc.).
- La reducción de daño por “blunt” se aplica adicionalmente a la Armadura general.

**Odds:** [Pendiente]

**Estrategia:**
- Trade-off defensivo: más mitigación a costa de menor evasión.
- Útil contra builds centrados en armas contundentes; menos efectivo contra builds de filo o arrojadizas.

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Resistente** (Inagotable)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Límite de daño

**Efecto:**
- Limita el daño recibido por golpe al 20% de tu HP máximo. Ningún impacto individual puede superar ese umbral.

**Notas:**
- Se aplica por golpe después de otras mitigaciones (p. ej., Armadura) y modificadores; luego se trunca al 20% del HP máximo si lo excede.
- No afecta daño acumulado por múltiples golpes; cada golpe evalúa su propio límite.

**Odds:** [Pendiente]

**Estrategia:**
- Fuerte contra golpes explosivos o súper habilidades; sinergiza con Armadura/Piel Dura y HP alto.
- Menos efecto frente a muchos golpes pequeños (multigolpe).

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Poción Trágica** (Tragic Potion)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Activa - Curación única

**Efecto:**
- Ganas 1 acción por combate: curas entre el 25% y el 50% de tu HP máximo.
- Cura el envenenamiento aplicado por la habilidad Chef.

**Notas:**
- La cantidad curada se determina en un rango entre 25% y 50% del HP máximo.
- No otorga usos adicionales; una vez utilizada, no vuelve a estar disponible en ese combate.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Agilidad Felina**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff Permanente - Agilidad

Agilidad Felina es un aumentador en El Bruto. Te otorga +3 de Agilidad y +50% de Agilidad al ser obtenido. También otorga un +50% de aumento en cada mejora de Agilidad que obtengas en niveles futuros.

**Efecto inmediato:**
- +3 Agilidad
- +50% Agilidad actual

**Ejemplo:** si tienes 7 de Agilidad y obtienes la habilidad, primero suma +3 (queda en 10) y luego aplica +50%, quedando en 15 de Agilidad.

**Efecto en subidas de nivel:**
- Al subir nivel y elegir aumentar Agilidad, da **3 Agilidad** en vez de 2

**Odds:** 5.83%

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Golpe de Trueno** (Speed)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff Permanente - Speed

Golpe del Rayo es un aumentador en El Bruto. Te otorga +3 de Velocidad y +50% de Velocidad al ser obtenido. También otorga un +50% en cada aumento de Velocidad que obtengas en niveles futuros.

**Efecto inmediato:**
- +3 Speed
- +50% Speed actual

**Ejemplo:** si tienes 7 de Velocidad y obtienes la habilidad, primero suma +3 (queda en 10) y luego aplica +50%, quedando en 15 de Velocidad.

**Efecto en subidas de nivel:**
- Al subir nivel y elegir aumentar Speed, da **3 Speed** en vez de 2

**Odds:** 5.83%

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Meditación**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Aumentador - Velocidad y daño crítico (con penalización de Iniciativa)

**Efecto inmediato:**
- +5 Speed
- +150% Speed actual
- +50% Daño crítico
- -200 Iniciativa

**Efecto en subidas de nivel:**
- Velocidad: +150% en cada mejora futura de Velocidad.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Vitalidad**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff Permanente - HP

Vitalidad es un aumentador en El Bruto. Te otorga +3 de Resistencia y +50% de la Resistencia acumulada al ser obtenido. También otorga un +50% de aumento en cada mejora de Resistencia que obtengas en niveles futuros. Un bruto puede tener este y otros 2 aumentadores principales, pero no los 4.
Nota: dado que 1 punto de Resistencia equivale a 6 puntos de Vida, este aumentador se refleja en incrementos de HP (+18 HP por los +3 de Resistencia y +50% de la Vida/Resistencia acumulada).

Con Vitalidad en posesión, al obtener mascotas perderás Resistencia de esta forma:
- Perro: -3
- Pantera: -9
- Oso: -12

**Efecto inmediato:**
- +18 HP
- +50% HP actual

**Efecto en subidas de nivel:**
- Sin Vitalidad: +12 HP (completo) o +6 HP (dividido)
- Con Vitalidad: +18 HP (completo) o +9 HP (dividido)
- Es decir: +50% más HP en cada subida

**Odds:** 5.83%

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Inmortalidad**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Aumentador - Resistencia masiva con penalizaciones

Inmortal es un aumentador en El Bruto. Aumenta tu Resistencia en un 250% y reduce tu Fuerza, Agilidad y Velocidad en un 25%. También aplica +250% a cada mejora de Resistencia que recibas en niveles futuros. Es la habilidad menos común de todo el juego.

**Efecto inmediato:**
- +250% Resistencia acumulada
- -25% Fuerza actual
- -25% Agilidad actual
- -25% Velocidad actual

**Efecto en subidas de nivel:**
- Resistencia: +250% en cada mejora futura de Resistencia
- Fuerza/Agilidad/Velocidad: -25% en cada subida de esos stats

Con Inmortalidad en posesión, al obtener mascotas perderás Resistencia de esta forma:
- Perro: -7
- Pantera: -15
- Oso: -28

**Odds:** [0.01]

**Estrategia:**
- Build de "tank" extremo: muchísima vida efectiva vía Resistencia, con penalización de daño/precisión/turnos
- Trade-off significativo: sobrevives más pero atacas menos

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)



---

### **Categoría: Habilidades de Armas**

---

### **Weapon Master**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff - Especialización de Armas Sharp

**Efecto:**
- +50% daño con armas de categoría Sharp.
- Armas Sharp (lista proporcionada):
  - Espada
  - Espadón
  - Cimitarra
  - Cuchillo
  - Alabarda
- La habilidad no cambia tus armas; solo potencia si empuñas un arma Sharp.

**Odds:** [0.97]

**Estrategia:**
- Sinergiza con builds que priorizan armas Sharp (Espada, Espadón, Cimitarra, Cuchillo, Alabarda).
- Enfoca en precisión/daño crítico típicos de filo.
- Maximiza el daño cuando tu arsenal incluye una o varias armas Sharp.

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

**Notas:**
- Requiere empuñar un arma Sharp para ser útil.




**Odds:** [Pendiente]

**Estrategia:**
- Esencial si tenés armas poderosas
- Protege inversión en arsenal
- Contrarresta builds de "disarm"

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

**Notas:**
- Habilidad defensiva/utilitaria
- Más valiosa en niveles altos con armas raras

---

### **Artes Marciales**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva – Mejora puños y Taza

**Efecto:**
- +100% daño con puños (duplica el daño base de los puños).
- +100% daño con Taza.
- No se aplica cuando golpeas con puños teniendo un arma arrojadiza equipada en la mano.

**Odds:** [0.97]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

**Notas:**
- Alternativa viable a armas.
- Sinergiza con Velocidad alta (más golpes = más daño total).
- Los puños mantienen sus modificadores (+10% Evasión, +20% Destreza, -25% Bloqueo, +5% Desarme).

---

### **Categoría: Habilidades de Combate**

---

### **6º Sentido** (Sexto Sentido)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Anticipo

**Efecto:**
- +10% Anticipo.
- No modifica el alcance de las armas, solo la probabilidad de anticipar.

**Información extra:**
- El efecto de 6º Sentido no se debe confundir con el alcance de las armas. Si el arma del oponente tiene más alcance que la tuya, 6º Sentido no permitirá adelantar tu ataque por alcance; solo agrega un 10% de probabilidad de anticipar cuando el alcance no te desfavorece.

**Odds:** [1.94]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Hostilidad** (Hostility / Belicoso)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Contraataque

**Efecto:**
- +30% probabilidad de contraataque al recibir un golpe.

**Notas:**
- No supera el 100% de probabilidad. Puerro y Raqueta de Tenis ya tienen 100% de contraataque, por lo que no se ven afectadas por esta habilidad.
- No habilita contraataque en armas que lo imposibilitan por penalización: por ejemplo, Maza tiene -30% de contraataque y, aunque tengas Hostilidad, no podrá realizar contraataques.

**Odds:** [0.39]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Fist of Fury** (Tornado de golpes)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Combos

**Efecto:**
- +20% probabilidad de **combo**
- Permite encadenar múltiples ataques seguidos

**Odds:** [0.97]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Determinación**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Seguimiento tras evasión/bloqueo

**Efecto:**
- Si tu oponente esquiva o bloquea tu golpe, tienes un 70% de probabilidad de lanzar inmediatamente otro golpe.

**Notas:**
- Se activa únicamente cuando el evento previo fue una evasión o un bloqueo del oponente.
- No garantiza impacto; aplica las reglas normales de precisión/evitación del nuevo golpe.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Primer Golpe**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Iniciativa

**Efecto:**
- +200 de Iniciativa al inicio de la pelea.

**Notas:**
- Aumenta el valor de Iniciativa pero no el alcance del arma; no sustituye ventajas de alcance para Anticipo.
- Sinergiza con Velocidad (menor intervalo) y habilidades que aprovechan turnos tempranos.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Categoría: Habilidades Defensivas**

---

### **Shield** (Escudo)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff/Debuff - Defensa alta

**Efecto:**
- +45% block (bloqueo)
- -25% daño (penalización ofensiva)

**Odds:** [0.97]

**Estrategia:**
- Build defensivo extremo
- Trade-off: sobrevivir más pero hacer menos daño
- Sinergiza con HP alto

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Contra** (Counter)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Bloqueo/Respuesta

**Efecto:**
- +10% Bloqueo.
- +90% Reversal inmediatamente después de bloquear (alta probabilidad de responder con un golpe tras un bloqueo exitoso).

**Notas:**
- El efecto de Reversal solo se evalúa cuando hubo un bloqueo previo en ese intercambio.
- No garantiza impacto del contraataque; aplica reglas normales de Precisión/Evasión.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Armor** (Armadura)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Mitigación de daño porcentual

**Efecto:**
- +25% Armadura (absorbe el 25% del daño de cada golpe recibido).
- -25% Velocidad (penalización a velocidad).

**Odds:** [0.39]

**Estrategia:**
- Build tipo tanque: mitigación alta a costa de turnos (Velocidad)
- Sinergiza con otras fuentes de Armadura (p. ej., Piel Dura)
- Mejor para brutos con HP alto

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Toughened Skin** (Piel Dura)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Mitigación de daño porcentual

**Efecto:**
- +10% Armadura (absorbe el 10% del daño de cada golpe recibido).
- Sin penalización de Velocidad.

**Odds:** [Pendiente]

**Estrategia:**
- Mitigación liviana sin penalizar Velocidad.
- Buena base que, combinada con Armadura, ofrece reducción notable sin depender solo de HP.

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Untouchable** (Intocable)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff - Evasión alta

**Efecto:**
- +30% evasion (esquivar)
- Gran aumento de esquiva

**Odds:** [0.10]

**Estrategia:**
- Build de evasión extrema
- Sinergiza con Agilidad alta
- "Glass cannon" evasivo

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Hide Away**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Defensa vs arrojadizas / lanzamiento

**Efecto:**
- +25% Bloqueo específicamente contra armas arrojadizas.
- 50% de probabilidad de lanzar tu arma; el arma no desaparece de tu mano (no se consume al lanzarla).

**Notas:**
- El bloqueo adicional solo aplica frente a golpes de armas arrojadizas (no afecta golpes cuerpo a cuerpo ni supers).
- El lanzamiento de tu arma se considera una acción adicional de ataque con el arma equipada, sin perderla del inventario/mano.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Monk**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Contraataque/Iniciativa/Velocidad

**Efecto:**
- +40% Contraataque.
- -200 Iniciativa.
- -100% Velocidad de golpe (hit speed): anula los beneficios de Velocidad para generar asaltos.

**Notas:**
- El aumento de contraataque no supera el 100% total si ya se alcanzó por armas u otras fuentes.
- La penalización de Velocidad de golpe implica que no obtienes turnos adicionales por Velocidad (efecto equivalente a neutralizar tu Speed en cálculo de asaltos).

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Categoría: Habilidades de Desarme**

---

### **Sabotaje** (Saboteador)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Talento persistente - Desarme/Iniciativa (preparación)

**Activación y duración:**
- Al activarse, recibes inmediatamente una herida (penalización persistente).
- Permanece activo hasta el reinicio del servidor.

**Efecto en combate (entrenamiento):**
- Existe una probabilidad de que, en una pelea de entrenamiento, tu oponente pierda un arma al intentar sacarla.
- Cuando se activa, aparece la palabra “SABOTAGE” sobre el oponente y éste pierde 100 de Iniciativa, terminando el ataque antes de empezar.

**Notas:**
- El disparador ocurre al sacar el arma (no durante el golpe).
- Afecta la Iniciativa del oponente en ese intercambio específico (-100).

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Cabeza de Acero**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Desarme reactivo

**Efecto:**
- Cada vez que te golpean, hay un 50% de probabilidad de que el oponente pierda su arma actual.

**Notas:**
- Afecta el arma en mano del atacante en ese impacto; no desarma escudo a menos que sea el “arma” activa del golpe.
- No depende del valor de Desarme de tu arma; es un chequeo reactivo independiente.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Ladrón**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Robo de arma

**Efecto:**
- Robas el arma actual de tu enemigo y continúas tu turno.

**Notas:**
- Requiere que el oponente esté empuñando un arma; si combate a puño limpio no hay robo.
- El arma robada pasa a tu mano activa de inmediato (comportamiento exacto a confirmar si ya empuñas otra arma).
- No roba escudo salvo que sea el “arma” activa del golpe.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Espía**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Debuff/Utilidad - Manipulación de armas (pre‑combate)

**Efecto:**
- Se aplica antes del combate (fase de preparación): cambia las armas del enemigo por versiones más débiles y reduce en un 25% el daño que infligen con dichas armas mientras dure el efecto.

**Notas:**
- Pre‑combate: no se activa durante el intercambio de golpes.
- Afecta solo armas empuñadas por el oponente; no impacta puños ni súper habilidades.
- Si el enemigo queda a puño limpio, el debuff no aplica.
- No altera tus armas ni su daño.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Red**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Activa - Control/Inmovilización

**Efecto:**
- Al lanzar la red, atrapas a tu enemigo y a sus mascotas; mientras están atrapados quedan incapaces de evadir.
- La red se rompe tras ser “forzada” dos veces (dos impactos dirigidos al atrapado). Una vez rota, los lanzamientos posteriores solo atrapan a un único enemigo.

**Notas:**
- Mientras dure la red, la Evasión no se aplica sobre los objetivos atrapados. Otras mecánicas (Bloqueo, Armadura, etc.) se evalúan normalmente.
- El estado atrapado finaliza cuando se rompe la red (tras dos “rompimientos”) o al finalizar su duración si aplica.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Bomba**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Activa - Daño en área

**Efecto:**
- 2 acciones por combate: lanzas una bomba que inflige entre 15 y 25 de daño a todos los enemigos.

**Notas:**
- Daño en área (afecta a múltiples objetivos a la vez).
- No depende de Precisión/Evasión ni de Bloqueo; se considera daño especial de área.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Regeneración**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Progresión/Metajuego

**Efecto:**
- Aumenta tu límite de peleas diarias a 8 en lugar de 6.

**Notas:**
- No afecta el combate directo; modifica la cantidad de intentos por día.
- Se reinicia con el ciclo diario del juego.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Refuerzos**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Activa - Apoyo temporal / Metajuego

**Efecto:**
- Invoca a tu bruto de nivel inferior para que entre a la batalla y ayude a tu bruto principal durante un tiempo limitado.

**Condiciones y límites:**
- Requiere tener al menos un bruto de nivel inferior disponible en tu cuenta.
- Duración limitada (tiempo/acciones exactas por confirmar).
- Usable una vez por pelea.

**Notas:**
- El bruto de refuerzo utiliza sus propios stats, habilidades y armas (con posibles ajustes de balance si aplican).
- No otorga experiencia al refuerzo; se retira al finalizar la duración o si es derrotado.
- No puede ser invocado si ya está fuera de combate.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Chef**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Veneno

**Efecto:**
- El enemigo pierde 2% de su vida máxima al final de cada uno de sus turnos (daño por veneno al finalizar sus acciones).

**Notas:**
- La Poción Trágica elimina este efecto de envenenamiento.
- Se evalúa al cierre del turno del objetivo envenenado.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Vampirism**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Activa - Robo de vida

**Efecto:**
- 1 acción por combate: infliges daño al enemigo equivalente al 25% de tu Vida restante en el momento de activar la habilidad.
- Te curas el doble de la cantidad de daño infligido por esta habilidad (curación = 2 × daño de Vampirism).

**Notas:**
- La Vida restante se toma al instante de la activación. Si tu Vida cambia antes de impactar, no altera el valor ya calculado.
- La curación no puede exceder tu Vida máxima (no hay overheal).
- Suele usarse de manera óptima cuando estás por debajo del 50% de Vida.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Chaining**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Control (Aturdimiento)

**Efecto:**
- Cada 3er golpe consecutivo cuerpo a cuerpo, aturdes a tu oponente.

**Notas:**
- “Consecutivo” se refiere a golpes cuerpo a cuerpo sin interrupción (fallo, lanzamiento de arma, cambio de objetivo o recibir control pueden reiniciar la cadena).
- Duración del aturdimiento: 1 acción/turno del objetivo (por confirmar).

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Haste**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Híbrida — Pasiva/Activa (Crítico y Embestida)

**Efecto:**
- Pasivo: +5% Daño chance.
- Activo (1 acción por combate): te lanzas rápidamente hacia el enemigo y le infliges daño que escala con tu Velocidad (Speed).

**Notas:**
- La embestida considera tu Speed para calcular el daño; las mitigaciones del objetivo (p. ej., Armadura) se aplican normalmente.
- El desplazamiento es instantáneo para el ataque; no consume ni cambia tu arma equipada.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Treat**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Activa - Soporte de mascotas

**Efecto:**
- Obtienes 4 acciones por combate. Cada uso cura el 50% de la Vida máxima de una mascota aliada, la vuelve inmune al siguiente ataque que reciba y la obliga a atacar inmediatamente.

**Notas:**
- Objetivo: solo mascotas aliadas vivas (no revive mascotas derrotadas).
- Inmunidad: se consume en el próximo golpe dirigido a esa mascota (no dura más de un impacto).
- Forzar ataque: la mascota actúa de inmediato tras recibir el efecto (prioridad de ejecución a confirmar según motor).
- Cada activación consume 1 de las 4 acciones disponibles del combate.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Repulse**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Desvío/Crítico

**Efecto:**
- +30% Deflect (probabilidad de desviar ataques).
- +5% cirtiical chance.

**Notas:**
- El desvío (Deflect) se aplica como una comprobación defensiva adicional al recibir un ataque; la mecánica exacta puede variar según el tipo de ataque (a confirmar si afecta arrojadizas y cuerpo a cuerpo por igual).

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Fast Metabolism** (Metabolismo Rápido)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva – Velocidad de golpe/Crit y Regeneración condicional

**Efecto:**
- -50% Velocidad de golpe (hit speed).
- -5% probabilidad de crítico.
- Al caer al 50% de tu HP o menos, te regeneras de forma inmediata y consecutiva: hasta 10 ticks seguidos del 5% de tu HP máximo cada uno (máximo 50% total), siempre que no recibas daño durante la ráfaga.

**Notas:**
- La penalización de Velocidad de golpe reduce la frecuencia de asaltos obtenida por Speed.
- La regeneración ocurre en ráfaga (no por turno/acción). Si recibes daño, la ráfaga se detiene en ese instante; los ticks no usados no se consumen.
- Límite total por activación: 10 ticks (máximo 50% de la vida máxima si no sufres daño).

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Martillo**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Súper - Llave basada en Fuerza

**Efecto:**
- Permite realizar una llave al oponente o a su mascota.
- El daño infligido por la llave escala con tu Fuerza (STR).
- Usable una sola vez por pelea.

**Notas:**
- Tratado como "súper": no puede ser bloqueado, esquivado ni contraatacado.
- Puede dirigirse a la mascota del oponente como objetivo válido.
- Interacciones de daño:
  - Bruto Feroz puede duplicar el daño de Martillo cuando se activa.
  - La mitigación por Armadura (antes llamada Blindaje) reduce el daño de Martillo y puede afectar más que un golpe normal.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Grito Maldito** (Grito de los Condenados)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Súper - Control de mascotas

**Efecto:**
- Asusta a las mascotas del oponente, provocándolas a huir del combate y quedar indisponibles por el resto de la pelea.
- Si hay más de una mascota en el lado del oponente, tiene 50% de probabilidad de asustar a cada una (chequeo independiente por mascota).
- Se puede activar hasta 2 veces por pelea.
- Adicionalmente, si estás aturdido, tienes 50% de probabilidad de despertarte al activarlo.

**Notas:**
- Afecta solo a mascotas enemigas; no afecta directamente al bruto enemigo.
- Las mascotas que huyen no regresan durante ese combate.
- La recuperación de aturdimiento solo aplica si el estado está activo al momento de usar el súper.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Hipnosis**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Súper - Control de mascotas

**Efecto:**
- 90% de probabilidad (por mascota) de robar las mascotas del enemigo; las mascotas robadas pasan a pelear de tu lado durante el resto del combate.

**Notas:**
- El chequeo se realiza de forma independiente para cada mascota enemiga.
- Si el oponente no tiene mascotas, no tiene efecto.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Diluvio**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Súper - Lluvia de armas

**Efecto:**
- Al activarse, el bruto salta y lanza la mitad de sus armas hacia el oponente.
- La cantidad de armas lanzadas se redondea hacia abajo. Ejemplo: con 7 armas en inventario, lanza 3.
- Requisito: debe tener al menos 3 armas en el inventario para poder activarlo. El arma en mano no cuenta como inventario para este requisito.
- Uso: se puede activar una sola vez por pelea.

**Interacciones de daño:**
- No es afectado por Bruto Feroz (no duplica su daño).
- Sí es mitigado por Armadura (antes “Blindaje”).
- El daño de los proyectiles está influenciado por la Agilidad.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Cazador**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Súper - Consumo de mascota / Curación

**Efecto:**
- Al activarse, el bruto come una mascota derrotada (propia o del oponente) y recupera parte de su vida perdida.
- Se puede activar hasta 4 veces por pelea (requiere mascotas derrotadas disponibles para consumir).

**Notas:**
- La cantidad de vida recuperada depende de la mascota consumida (según el cuerpo encontrado):
  - Perro: 20% de la vida máxima
  - Pantera: 30% de la vida máxima
  - Oso: 50% de la vida máxima
- No revive mascotas; solo consume aquellas ya derrotadas.

**Odds:** [Pendiente]

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Shock** (Shock)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Ofensiva - Desarme temporal

**Efecto:**
- 50% probabilidad de hacer que el enemigo **suelte su arma** al goleparlo


**Odds:** [0.39]



**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Categoría: Habilidades Especializadas por Tipo de Arma**

---

### **Bodybuilder**

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff - Especialización Heavy

**Efecto:**
- +40% hit speed para armas **Heavy**
- +10% dexterity para armas **Heavy**

**Odds:** [0.49]

**Estrategia:**
- Contrarresta la lentitud natural de armas Heavy
- Build de daño alto con velocidad mejorada
- Similar a "Weapon Master" pero para Heavy

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Relentless** (Implacable)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Buff - Precisión

**Efecto:**
- +30% accuracy (precisión)
- Mayor probabilidad de acertar golpes

**Odds:** [0.39]

**Estrategia:**
- Asegurar que los ataques conecten
- Importante contra enemigos con alta evasión
- Sinergiza con armas de alto daño

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

---

### **Survival** (Supervivencia)

**Ícono:** [Pendiente identificar en grid]
**Categoría:** Pasiva - Clutch defensivo

**Efecto en combate normal:**
- Cuando estás a **1 HP:**
  - +20% block
  - +20% evasion

**Efecto especial:**
- El **primer ataque que te mataría** te deja a **1 HP** en vez de morir
- Solo funciona una vez por combate (primer golpe letal)

**Odds:** [0.39]

**Estrategia:**
- Habilidad "clutch" extrema
- Segunda oportunidad garantizada
- Permite comeback épicos
- Especialmente potente con HP bajo y evasión/block aumentado

**Implementación:**
- [x] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

**Notas:**
- Una de las habilidades más valiosas
- El efecto "sobrevivir con 1 HP" solo funciona una vez
- Después de activarse, los buffs de block/evasion siguen activos mientras estés a 1 HP

---

## Habilidades Identificadas (Por Posición en Grid)

### **Fila 1 (Superior):**

**Posición [1,1]:** Ícono amarillo con cruz/símbolo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [1,2]:** Ícono beige/crema con figura
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [1,3]:** Ícono con espirales o patrón circular
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [1,4]:** Ícono destacado con borde (parece ser una habilidad activa/equipada)
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [1,5]:** Ícono beige/crema
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [1,6]:** Ícono amarillo con símbolo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [1,7]:** Ícono con personajes o figuras
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

---

### **Fila 2:**

**Posición [2,1]:** Ícono marrón/beige
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [2,2]:** Ícono con patrón de cuadros o mosaico
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [2,3]:** Ícono beige claro
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [2,4]:** Ícono con espiral o patrón circular
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [2,5]:** Ícono beige con símbolo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [2,6]:** Ícono destacado con borde grueso (habilidad equipada/especial)
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [2,7]:** Ícono amarillo/dorado
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

---

### **Fila 3:**

**Posición [3,1]:** Ícono amarillo brillante
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [3,2]:** Ícono amarillo/verde con símbolo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [3,3]:** Ícono beige/amarillo claro
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [3,4]:** Ícono beige con patrón
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [3,5]:** Ícono con símbolo o figura
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [3,6]:** Ícono amarillo/dorado
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [3,7]:** Ícono amarillo brillante
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

---

### **Fila 4:**

**Posición [4,1]:** Ícono marrón oscuro con figura
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [4,2]:** Ícono beige claro
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [4,3]:** Ícono amarillo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [4,4]:** Ícono beige con símbolo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [4,5]:** Ícono con patrón
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [4,6]:** Ícono amarillo/dorado
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [4,7]:** Ícono amarillo/beige
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

---

### **Fila 5:**

**Posición [5,1]:** Ícono amarillo brillante
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [5,2]:** Ícono con patrón o símbolo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [5,3]:** Ícono amarillo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [5,4]:** Ícono con diseño especial
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [5,5]:** Ícono beige/amarillo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [5,6]:** Ícono amarillo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [5,7]:** Ícono amarillo/dorado
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

---

### **Fila 6:**

**Posición [6,1]:** Ícono con espiral o símbolo circular
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [6,2]:** Ícono destacado/brillante (posiblemente habilidad especial)
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]
- **Nota:** Tiene borde/destacado especial

**Posición [6,3]:** Ícono beige con líneas
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [6,4]:** Ícono amarillo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [6,5]:** Ícono beige/amarillo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [6,6]:** Ícono amarillo con símbolo
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

**Posición [6,7]:** Ícono beige/crema
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente]

---

### **Fila 7 (Inferior visible):**

**Posición [7,1]:** Ícono con corazón o símbolo especial
- Categoría: [Pendiente identificar]
- Efecto: [Pendiente - posiblemente relacionado con vida/curación]

---

## Categorías Estimadas

Basado en los colores y patrones visibles, las habilidades podrían clasificarse en:

### **Categorías posibles:**
1. **Habilidades Ofensivas** (ataques especiales, combos)
2. **Habilidades Defensivas** (escudos, bloqueos, counter)
3. **Buffs** (mejoras temporales de stats)
4. **Debuffs** (reducir stats del enemigo)
5. **Habilidades Pasivas** (efectos permanentes)
6. **Habilidades de Utilidad** (efectos especiales, modificadores)

---

## Necesitamos Más Información

Para completar este catálogo necesitamos:

### **Método 1: Tooltips individuales**
- Hacer hover sobre cada ícono en el juego original
- Capturar tooltips con nombre y descripción
- Documentar efectos exactos

### **Método 2: Wiki o documentación oficial**
- Buscar wiki de "El Bruto" / "My Brute"
- Lista completa de habilidades con descripciones

### **Método 3: Ingeniería inversa**
- Jugar el original y documentar cada habilidad al desbloquearla
- Anotar efectos observados en combate

---

## Template para Documentar Cada Habilidad

```markdown
### **[Nombre de la Habilidad]**

**Ícono:** [Descripción visual]
**Categoría:** Ofensiva / Defensiva / Buff / Debuff / Pasiva / Utilidad


**Efecto:**
[Descripción detallada del efecto en combate]

**Stats modificados:**
- [Stat 1]: +X%
- [Stat 2]: +X

**Mecánica:**
[Cómo funciona exactamente: ¿se activa cada turno? ¿tiene probabilidad? ¿es permanente?]

**Implementación:**
- [ ] Documentada
- [ ] Diseñada (lógica definida)
- [ ] Implementada (funcional en código)

**Notas:**
[Cualquier observación adicional]
```

---

## Próximos Pasos

1. **Conseguir tooltips** - Necesitamos capturas con nombres y descripciones
2. **Buscar wiki oficial** - Puede haber documentación existente
3. **Priorizar implementación:**
   - Fase 1: Habilidades básicas/comunes (10-15)
   - Fase 2: Habilidades intermedias (15-20)
   - Fase 3: Habilidades avanzadas/raras (resto)

---

**Total identificado visualmente:** ~45-49 espacios en el grid
**Documentados con nombre/efecto:** 0 (pendiente tooltips)

**Fuente:** Imagen del casillero de "KALIFERR" (Level 17)
**Fecha:** 2025-10-30
