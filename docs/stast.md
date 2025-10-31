# Stats - El Bruto

## Estadísticas Principales

### Agilidad
Agilidad es uno de los cuatro stats principales de El Bruto. Determina los siguientes aspectos:
- La evasión.
- La precisión.
- El multigolpe.
- El daño con armas arrojadas (especialmente arrojadizas como Shuriken, PioPio y Bol de Ramen).

Agilidad Felina es la única habilidad que aumenta la agilidad de forma directa. Además, existen habilidades que mejoran por separado cada aspecto ligado a la agilidad:
- Tornado de Golpes aumenta el multigolpe.
- Intocable aumenta la evasión.
- Implacable aumenta la precisión.

### Fuerza
Fuerza es uno de los cuatro stats principales de El Bruto. Determina el daño que causan los golpes que realiza tu bruto. Aunque Agilidad determine principalmente el daño de armas arrojadizas, Fuerza también lo determina, pero en un rango mucho más bajo.

Fuerza de Hércules te otorga +3 de Fuerza y +50% de Fuerza cada vez que vuelvas a recibir Fuerza en niveles futuros.

### Velocidad
Velocidad es uno de los cuatro stats principales de El Bruto. Determina la reducción de intervalo entre asaltos. Entre más velocidad, más probabilidad de asaltos dará un bruto durante su turno.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Intervalo entre asaltos

El intervalo entre asaltos es modificado por la Velocidad, como se dijo antes. Cuanta más Velocidad tenga un bruto, menor es el intervalo y, por lo tanto, aumenta la probabilidad de realizar asaltos.

En una pelea, ambos brutos (sin iniciativa) comienzan con 0 de intervalo. Si el bruto con mayor intervalo empieza la pelea primero, el otro bruto, al tener menor intervalo, dará 2 (o más, dependiendo) asaltos. Esto ocurre porque el bruto con mayor intervalo realizó una acción que le tomó más tiempo que la del bruto con menor intervalo. Esto también afecta si ambos brutos (o uno) empiezan con armas.

La cantidad de iniciativa está influenciada por el intervalo. Un bruto con mucha Velocidad puede aprovechar mejor el intervalo de iniciativa que posee.

### Resistencia
Resistencia es uno de los cuatro stats principales de El Bruto. Determina el aumento de vida en un bruto: cada punto de Resistencia equivale a 6 puntos de Vida. Es el único stat principal que solo se puede tener en 0.

Habilidades relacionadas con Resistencia:
- Vitalidad: aumentador principal. Al obtenerla, te otorga +3 de Resistencia y +50% de la Resistencia acumulada; además, aplica +50% en cada mejora de Resistencia que obtengas en niveles futuros.
- Inmortalidad: +250% de Resistencia (con penalizaciones a otros stats, ver habilidades).

Notas:
- Un bruto puede tener Vitalidad y otros 2 aumentadores principales, pero no los 4 a la vez.
- Con Vitalidad en posesión, al obtener mascotas pierdes Resistencia de esta forma: Perro -3, Pantera -9, Oso -12.
 - Con Inmortalidad en posesión, al obtener mascotas pierdes Resistencia de esta forma: Perro -7, Pantera -15, Oso -28.

## Vida
La Vida es la cantidad de daño que un bruto puede recibir antes de ser vencido. Si el daño recibido reduce la Vida a 0, el bruto es derrotado. Con la habilidad Supervivencia, el bruto puede resistir el golpe letal determinado.

Existen dos componentes de la Vida que conviven: Vida Estándar y Vida Complementaria.

### Vida Estándar
No se modifica por habilidades ni por mascotas. Por nivel, aumenta entre 1 y 2 puntos de Vida.

Fórmula aproximada para un bruto de nivel Nv:
- Vida Estándar = floor((Nv - 1) × 1.5) + 50

Nota: se redondea hacia abajo el resultado de la multiplicación.

### Vida Complementaria
Se incrementa por los puntos de Resistencia. Cada punto de Resistencia aporta +6 de Vida. Esta Vida puede modificarse con habilidades y también se reduce con mascotas.

Reducciones de Resistencia al obtener mascotas:
- Perro: -2 Resistencia; -3 con Vitalidad; -7 con Inmortal; -8 con Vitalidad + Inmortal.
- Pantera: -6 Resistencia; -9 con Vitalidad; -15 con Inmortal; -22 con Vitalidad + Inmortal.
- Oso: -8 Resistencia; -12 con Vitalidad; -28 con Inmortal; -42 con Vitalidad + Inmortal.

Cálculo de Resistencia a partir de la Vida:
- Resistencia = (Vida Total - Vida Estándar) / 6

### Perro (Mascota)
- Vida: 14
- Daño: Bajo
- Agilidad: 5
- Velocidad: 3
- Multigolpe: 10%
- Evasión: 0%
- Iniciativa: -10

Detalles:
- Es la única mascota que se puede tener múltiples veces (hasta 3): Perro A, Perro B y Perro C; no hay diferencias entre ellos.
- Se puede tener 3 Perros junto con un Oso o con una Pantera, pero no con ambos a la vez.
- Al obtenerse, reduce la Resistencia según la lista de “Vida Complementaria”.

### Pantera (Mascota)
- Vida: 26
- Daño: Medio
- Agilidad: 16
- Velocidad: 24
- Multigolpe: 60%
- Evasión: 20%
- Iniciativa: -60

Detalles:
- Puede convivir con hasta 3 Perros, pero no con un Oso al mismo tiempo.
- Al obtenerse, reduce la Resistencia: -6; -9 con Vitalidad; -15 con Inmortal; -22 con Vitalidad + Inmortal.

### Oso (Mascota)
- Vida: 110
- Daño: Alto
- Agilidad: 2
- Velocidad: 1
- Multigolpe: -20%
- Evasión: 0%
- Iniciativa: -360

Detalles:
- No puede convivir con una Pantera al mismo tiempo.
- Puede convivir con hasta 3 Perros.
- Rara vez esquiva y es la única mascota que puede desarmar.
- Al obtenerse, reduce la Resistencia: -8; -12 con Vitalidad; -28 con Inmortal; -42 con Vitalidad + Inmortal.

### Calculadora (fórmulas)
Entradas:
- Nv: nivel actual del bruto (entero)
- VT: vida total actual (entero)

Derivadas base:
- VE(Nv) = floor((Nv - 1) × 1.5) + 50   ; Vida Estándar al nivel Nv
- R = (VT - VE(Nv)) / 6                  ; Resistencia actual
- VE(Nv+1) = floor(Nv × 1.5) + 50        ; Vida Estándar al siguiente nivel

Proyecciones de Vida al subir nivel con habilidades:
- Con Vitalidad: V_vit = floor((R + 3) × 1.5) × 6 + VE(Nv+1)
- Con Inmortal: V_inm = ceil(R × 3.5) × 6 + VE(Nv+1)
- Con Vitalidad + Inmortal (debido a redondeos, casos límites):
  - V_vit_inm_cc = ceil(ceil((R + 3) × 1.5) × 3.5) × 6 + VE(Nv+1)
  - V_vit_inm_cf = ceil(floor((R + 3) × 1.5) × 3.5) × 6 + VE(Nv+1)
  - V_vit_inm_fc = floor(ceil((R + 3) × 1.5) × 3.5) × 6 + VE(Nv+1)
  - V_vit_inm_ff = floor(floor((R + 3) × 1.5) × 3.5) × 6 + VE(Nv+1)

Inversas útiles (estimar Resistencia previa a buffs):
- R_sin_vitalidad ≈ round(R / 1.5)
- R_sin_inmortal = floor(R / 3.5)
- R_sin_vit_inm = floor(R / (1.5 × 3.5))

Atajos porcentuales sobre VT:
- 20%: round(VT × 0.20) y floor(VT × 0.20)
- 30%: floor(VT × 0.30)
- 50%: round(VT × 0.50) y floor(VT × 0.50)

Derivadas instantáneas útiles:
- Vida complementaria instantánea (VC): VC = VT - VE(Nv)

Ajustes por mascotas (mismo nivel, sin bajar de 0 Resistencia):
- Con Perro: V_perro_nivel = floor( max( ((VT - VE(Nv))/6 - 2), 0 ) × 6 + VE(Nv) + 1.5 )
- Con Pantera: V_pantera_nivel = floor( max( ((VT - VE(Nv))/6 - 6), 0 ) × 6 + VE(Nv) + 1.5 )
- Con Oso: V_oso_nivel = floor( max( ((VT - VE(Nv))/6 - 8), 0 ) × 6 + VE(Nv) + 1.5 )
- Pantera con Vitalidad + Inmortal: V_pantera_vit_inm_nivel = floor( max( ((VT - VE(Nv))/6 - 22), 0 ) × 6 + VE(Nv) + 1.5 )

Variantes por mascota y habilidades (mismo nivel):
- Perro + Vitalidad: V_perro_vit_nivel = floor( max( ((VT - VE(Nv))/6 - 3), 0 ) × 6 + VE(Nv) + 1.5 )
- Perro + Inmortal: V_perro_inm_nivel = floor( max( ((VT - VE(Nv))/6 - 7), 0 ) × 6 + VE(Nv) + 1.5 )
- Perro + Vitalidad + Inmortal: V_perro_vit_inm_nivel = floor( max( ((VT - VE(Nv))/6 - 8), 0 ) × 6 + VE(Nv) + 1.5 )
- Pantera + Vitalidad: V_pantera_vit_nivel = floor( max( ((VT - VE(Nv))/6 - 9), 0 ) × 6 + VE(Nv) + 1.5 )
- Pantera + Inmortal: V_pantera_inm_nivel = floor( max( ((VT - VE(Nv))/6 - 15), 0 ) × 6 + VE(Nv) + 1.5 )
- Oso + Vitalidad: V_oso_vit_nivel = floor( max( ((VT - VE(Nv))/6 - 12), 0 ) × 6 + VE(Nv) + 1.5 )
- Oso + Inmortal: V_oso_inm_nivel = floor( max( ((VT - VE(Nv))/6 - 28), 0 ) × 6 + VE(Nv) + 1.5 )
- Oso + Vitalidad + Inmortal: V_oso_vit_inm_nivel = floor( max( ((VT - VE(Nv))/6 - 42), 0 ) × 6 + VE(Nv) + 1.5 )

Variantes de redondeo usadas en la calculadora:
- Inmortal (alternativa): V_inm_floor = floor(R × 3.5) × 6 + VE(Nv+1)

Campos de la calculadora (referencia rápida):
- Puntos de Resistencia en total: R = (VT − VE(Nv)) / 6
- Vida Estándar: VE(Nv) = floor((Nv − 1) × 1.5) + 50
- Vida modificable (complementaria): VC = VT − VE(Nv)
- Resistencia sin Vitalidad: ≈ round(R / 1.5)
- Resistencia sin Inmortal: = floor(R / 3.5)
- Resistencia sin ambos: = floor(R / (1.5 × 3.5))
- Vida al obtener Vitalidad: V_vit = floor((R + 3) × 1.5) × 6 + VE(Nv+1)
- Vida al obtener Inmortal: V_inm = ceil(R × 3.5) × 6 + VE(Nv+1) (alternativa con floor arriba)
- Vida al obtener ambos (4 variantes): V_vit_inm_cc, V_vit_inm_cf, V_vit_inm_fc, V_vit_inm_ff
- Poción Trágica: entre 20% y 50% de VT → [round(VT × 0.20), round(VT × 0.50)]
- Cazador (vida recuperada): Perro = floor(VT × 0.20), Pantera = floor(VT × 0.30), Oso = floor(VT × 0.50)
- Inagotable (máximo daño recibido): round(VT / 5)

Grupos de cálculo (etiquetas de la UI):
- Cantidad de vida al obtener mascotas, sin habilidades:
  - Un Perro más → V_perro_nivel
  - Pantera → V_pantera_nivel
  - Oso → V_oso_nivel
- Cantidad de vida al obtener mascotas, con Vitalidad:
  - Un Perro más → V_perro_vit_nivel
  - Pantera → V_pantera_vit_nivel
  - Oso → V_oso_vit_nivel
- Cantidad de vida al obtener mascotas, con Inmortal:
  - Un Perro más → V_perro_inm_nivel
  - Pantera → V_pantera_inm_nivel
  - Oso → V_oso_inm_nivel
- Cantidad de vida al obtener mascotas, con Vitalidad e Inmortal:
  - Un Perro más → V_perro_vit_inm_nivel
  - Pantera → V_pantera_vit_inm_nivel
  - Oso → V_oso_vit_inm_nivel

## Estadísticas Ocultas

### Iniciativa
Iniciativa es un stat oculto en El Bruto. Determina el momento en que tu bruto empieza la pelea. En una pelea, cuando ambos brutos poseen la misma iniciativa, se empieza al azar.

Iniciativa no puede ser aumentada directamente por un stat principal, pero sí puede ser potenciada por la Velocidad. La cantidad de iniciativa se mide por el intervalo; por lo tanto, entre más Velocidad tenga un bruto, mayor será la probabilidad de realizar asaltos, ya que aprovecha el intervalo de la iniciativa ganada.

#### Valores iniciales por arquetipo
- Osos: -360 de Iniciativa.
- Panteras: -60 de Iniciativa.
- Perros: -10 de Iniciativa.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

### Multigolpe
Multigolpe es un stat oculto en El Bruto. Determina la probabilidad de realizar un combo de ataques en un asalto.

A diferencia de lo que muchos piensan, Multigolpe no es influenciado por la Velocidad; la Agilidad sí afecta el multigolpe.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Lista de armas por Multigolpe
Valores de multigolpe por arma individual (modificador base al usar esa arma):
- Abanico: 45
- Alabarda: 0
- Bastón: 10
- Bol de Ramen: 30
- Cimitarra: 15
- Cuchillo: 30
- Espada: 0
- Espadón: 0
- Hacha: 0
- Hueso de Mamut: -10
- Lanza: 0
- Látigo: 35
- Mamporro: 0
- Mangual: 30
- Martillo: -40
- Maza: -60
- PioPio: 0
- Puerro: 200
- Raqueta de Tenis: 0
- Sai: 30
- Sartén: -40
- Shuriken: 30
- Taza: 40
- Teclado: 50
- Tridente: 0
- Trombón: 30

### Contraataque
Contraataque es un stat oculto en El Bruto. Determina la probabilidad de que tu bruto realice un ataque de respuesta después de que el oponente ejecute un asalto. Con 100% de Contraataque, golpeas cada vez que te golpean; si tu oponente lanza tres golpes seguidos, contraatacas a cada golpe.

Armas con 100% de Contraataque: Raqueta de Tenis y Puerro.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Lista de armas por Contraataque
Valores de contraataque por arma individual:
- Abanico: 50%
- Alabarda: 0%
- Bastón: 30%
- Bol de Ramen: 0%
- Cimitarra: 0%
- Cuchillo: 0%
- Espada: 0%
- Espadón: 10%
- Hacha: 0%
- Hueso de Mamut: 0%
- Lanza: -10%
- Látigo: -10%
- Mamporro: 0%
- Mangual: 0%
- Martillo: -20%
- Maza: -30%
- PioPio: 0%
- Puerro: 100%
- Raqueta de Tenis: 100%
- Sai: 0%
- Sartén: 0%
- Shuriken: 0%
- Taza: 0%
- Teclado: 0%
- Tridente: 0%
- Trombón: 20%

### Bloqueo
Bloqueo es un stat oculto en El Bruto. Determina cuánto tu bruto puede bloquear un ataque.

Notas y reglas especiales:
- Varias armas aumentan el Bloqueo, como Bastón, Sai y Sartén.
- Mangual y Puerro tienen suficiente Exactitud como para anular cualquier cantidad de Bloqueo del oponente.
- Cuatro armas (Martillo, Abanico, Mangual y Puerro) solo pueden bloquear cuando se posee tanto Escudo como Contra; aun así, su Bloqueo base será 5% sin considerar la Exactitud del oponente.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Lista de armas por Bloqueo
Valores de bloqueo por arma individual:
- Abanico: -50%
- Alabarda: 0%
- Bastón: 25%
- Bol de Ramen: -10%
- Cimitarra: 10%
- Cuchillo: 0%
- Espada: 0%
- Espadón: 15%
- Hacha: -10%
- Hueso de Mamut: 0%
- Lanza: 0%
- Látigo: -20%
- Mamporro: 0%
- Mangual: -50%
- Martillo: -50%
- Maza: -30%
- PioPio: -10%
- Puerro: -50%
- Raqueta de Tenis: 20%
- Sai: 30%
- Sartén: 40%
- Shuriken: -10%
- Taza: 10%
- Teclado: 0%
- Tridente: 0%
- Trombón: 20%

Curiosidades
- Debido a un error de traducción, 6º Sentido menciona que aumenta el Bloqueo, aunque en realidad aumenta el Anticipo.
- Tridente: 5%
- Trombón: 0%

### Evasión
Evasión es un stat oculto en El Bruto. Determina cuánto tu bruto puede evitar un ataque enemigo esquivándolo. La Evasión aumenta o disminuye dependiendo de la diferencia de Agilidad entre ambos brutos.

Notas y reglas especiales:
- Armas como Abanico aumentan Evasión cuando se tienen en mano; las Armas Pesadas generalmente la disminuyen.
- Algunas armas pueden ignorar total o parcialmente la Evasión (p. ej., Puerro).

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Lista de armas por Evasión
Valores de evasión por arma individual:
- Abanico: 60%
- Alabarda: 0%
- Bastón: 5%
- Bol de Ramen: 10%
- Cimitarra: 0%
- Cuchillo: 10%
- Espada: -20%
- Espadón: 0%
- Hacha: 0%
- Hueso de Mamut: 0%
- Lanza: 0%
- Látigo: 30%
- Mamporro: -10%
- Mangual: -30%
- Martillo: -40%
- Maza: -30%
- PioPio: 0%
- Puerro: 0%
- Raqueta de Tenis: 10%
- Sai: 10%
- Sartén: 0%
- Shuriken: 15%
- Taza: 15%
- Teclado: 10%
- Tridente: 0%
- Trombón: 0%

### Anticipo
Anticipo es un stat oculto en El Bruto. Determina cuánto tu bruto puede atacar antes de que el oponente realice un ataque. En armas, el anticipo está determinado por su alcance: cada 1 punto de alcance equivale a 10% de Anticipo.

La diferencia de alcance entre las armas que portan ambos brutos en una pelea determina el anticipo efectivo para cada uno: el bruto con el arma de mayor alcance obtiene más anticipo. Si no existe diferencia de alcance, ninguno obtiene anticipo adicional.

Nota: El Anticipo no modifica el alcance de las armas; se basa en la diferencia de alcance efectiva entre los combatientes.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Lista de armas por alcance
Valores de alcance por arma individual (1 punto = 10% Anticipo):
- Abanico: 0
- Alabarda: 4
- Bastón: 3
- Bol de Ramen: 0
- Cimitarra: 1
- Cuchillo: 0
- Espada: 2
- Espadón: 1
- Hacha: 1
- Hueso de Mamut: 1
- Lanza: 3
- Látigo: 5
- Mamporro: 1
- Mangual: 1
- Martillo: 1
- Maza: 1
- PioPio: 0
- Puerro: 1
- Raqueta de Tenis: 1
- Sai: 0
- Sartén: 1
- Shuriken: 0
- Taza: 0
- Teclado: 1
- Tridente: 3
- Trombón: [valor por confirmar]

### Armadura (mitigación porcentual)
Armadura es un stat oculto en El Bruto. Determina el porcentaje de daño que absorbe tu bruto de cada golpe recibido.

Ejemplos:
- 10% Armadura: un golpe de 12 se reduce a 10.8 (12 × 0.90).
- 25% Armadura: un golpe de 12 se reduce a 9 (12 × 0.75).

Notas:
- Las fuentes de Armadura de habilidades se expresan en porcentaje (p. ej., 10% o 25%).
- Afecta el daño de: puño limpio, golpes con arma, Martillo, Bruto Feroz y Diluvio.
- No afecta: Bomba ni daño de armas arrojadizas.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

### Desarme
Desarme es un stat oculto en El Bruto. Determina la probabilidad de quitarle el arma o el escudo al oponente.

Notas y reglas especiales:
- Sai siempre desarma el arma del oponente (muy alta efectividad contra arma), pero tiene menos probabilidad de desarmar escudo.
- Látigo, Trombón y Bastón tienen alto desarme.
- Abanico y Shuriken, cuando golpean por Anticipo, Contraataque o Contra, nunca desarman, incluso con Choque.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Lista de armas por Desarme
Valores de desarme por arma individual:
- Abanico: -50%
- Alabarda: 10%
- Bastón: 25%
- Bol de Ramen: 0%
- Cimitarra: 0%
- Cuchillo: 0%
- Espada: 10%
- Espadón: 15%
- Hacha: 0%
- Hueso de Mamut: 0%
- Lanza: 10%
- Látigo: 30%
- Mamporro: 10%
- Mangual: -20%
- Martillo: 10%
- Maza: 10%
- PioPio: 0%
- Puerro: 0%
- Raqueta de Tenis: 5%
- Sai: 100%
 - Sartén: 0%
 - Shuriken: -50%
 - Taza: 0%
 - Teclado: 0%
 - Tridente: 20%
 - Trombón: 50%

### Precisión
Precisión es un stat oculto en El Bruto. Determina el acierto de los ataques al oponente. Está afectado por la diferencia de Agilidad entre ambos brutos, se contrarresta con la Evasión y es potenciado por la habilidad Implacable.

<!-- Sección de habilidades removida para mantener este documento solo con estadísticas -->

#### Lista de armas por Precisión
Valores de precisión por arma individual:
- Abanico: 50%
- Alabarda: -40%
- Bastón: 0%
- Bol de Ramen: 0%
- Cimitarra: 20%
- Cuchillo: 50%
- Espada: -10%
- Espadón: 0%
- Hacha: 0%
- Hueso de Mamut: 0%
- Lanza: 0%
- Látigo: 30%
- Mamporro: -5%
- Mangual: -10%
- Martillo: -30%
- Maza: -35%
- PioPio: 0%
- Puerro: 100%
- Raqueta de Tenis: 0%
- Sai: 25%
- Sartén: 0%
- Shuriken: 0%
- Taza: 30%
- Teclado: 0%
- Tridente: 0%
- Trombón: -10%

### Exactitud
Exactitud es un stat oculto en El Bruto. Determina la probabilidad de que los ataques de tu bruto ignoren el Bloqueo del oponente.

La exactitud de un arma reduce la probabilidad de Bloqueo del oponente; por ejemplo, con 30% de Exactitud, el oponente tendrá 30% menos de probabilidad de bloquear tus ataques. Mangual y Puerro tienen suficiente Exactitud para ignorar cualquier cantidad de Bloqueo. Las armas con Exactitud negativa facilitan que el oponente bloquee.

#### Lista de armas por Exactitud
Valores de exactitud por arma individual:
- Abanico: 0%
- Alabarda: 0%
- Bastón: 0%
- Bol de Ramen: 0%
- Cimitarra: 0%
- Cuchillo: 0%
- Espada: -20%
- Espadón: 0%
- Hacha: 0%
- Hueso de Mamut: 50%
- Lanza: 0%
- Látigo: -20%
- Mamporro: 30%
- Mangual: 150%
- Martillo: 50%
- Maza: 0%
- PioPio: 0%
- Puerro: 200%
- Raqueta de Tenis: 0%
- Sai: 0%
- Sartén: 0%
- Shuriken: 0%
- Taza: 0%
- Teclado: 0%
