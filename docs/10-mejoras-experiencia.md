# 10 mejoras para el viaje — Criaturas del Reino v2

Cada una con **por qué funciona para tu caso concreto** (regalo para amigos que no necesariamente juegan RPG) y **costo real**.

---

## 1. Créditos narrativos, no una lista de nombres ⭐ *la más importante*
En vez de una pantalla de texto, usar el sistema de retratos que ya existe (`trainer-big-sprites.js`, `npc-sprites.js`): los 20+ amigos aparecen uno por uno en orden de aparición en la historia, cada uno con **una línea suya real** sacada de sus diálogos actuales (Nicole con el techo, Alessandro con Brandcut, Oscar con las órdenes). Al final, el grupo entero en una sola pantalla y "Gracias por jugar".
- **Por qué pega:** revivir un chiste interno delante de quien lo inventó vale más que 500 horas de gameplay. Es el momento en que el regalo se vuelve personal.
- **Costo:** bajo. Todo el arte y todos los textos ya existen; es composición y timing.

## 2. "Última Toma" como conflicto central explícito ⭐
Hoy el jugador no entiende qué está en juego. La propuesta de la otra IA es buena: el miedo al final de ciclo y a separarse. Se puede anclar en **Pachi y la Feria Última Toma** (que ya existe): la feria se cierra, los grupos se dispersan, y la última toma es la foto del grupo completo. El Villano/Rey no tiene que ser malvado: puede ser *el que se niega a que las cosas terminen*.
- **Por qué pega:** le da sentido emocional a un juego lleno de grupos que se separan (Outsiders, Monas, CTM). El final se escribe solo.
- **Costo:** medio. Diálogos nuevos en 3–4 puntos, no sistemas nuevos.

## 3. Un arco de 3 estados por amigo importante
Hoy sólo Nicole y los Proas tienen `dlg` / `postDlg`. Extender a los 6–8 amigos con más presencia: **inicio** (presentación), **tras su evento**, **post-game**. Y que **su muletilla y su equipo cambien** según el estado (un compañero con `fixedTeam` distinto después de la feria).
- **Por qué pega:** el mundo se siente vivo sin escribir contenido nuevo de mapa. Releer a alguien te devuelve algo distinto.
- **Costo:** medio. Sólo datos en `src/data/npcs.js`.

## 4. El techo de Nicole como misión secundaria
Ella lo pide tres veces en sus diálogos: el gancho ya está escrito. Reunir a Dayana y Deyna (las Monas), traer herramientas, y un final cómico — el techo sigue goteando, pero ahora con otras dos personas discutiendo adentro.
- **Por qué pega:** convierte al personaje más querido del juego en recompensa opcional. Pura narrativa, cero sistemas nuevos.
- **Costo:** bajo-medio. Es una cadena de diálogos + 1 flag.

## 5. Viaje rápido a pueblos ya visitados
Mapa de 120×300 tiles: cruzar el reino a pie es tedioso y desanima a quien juega casual. Con el sistema de mapa que ya existe (`map-screen.js`), permitir marcar pueblos visitados y viajar escribiendo desde la Posada / Proa.
- **Por qué pega:** reduce el tiempo muerto, que es lo que hace que un amigo abandone un RPG en la hora 2.
- **Costo:** medio. Requiere lista de destinos desbloqueados en el save.

## 6. Modo relajado (sin farmeo)
Toggle en el título o en el menú: XP ×1.4, encuentros salvajes −40%, criaturas del equipo no mueren del todo (vuelven con 1 HP una vez por combate). No toca la historia ni los diplomas.
- **Por qué pega:** no todos tus amigos juegan RPG ni quieren grindear niveles hasta 58 en la Torre.
- **Costo:** medio-bajo. Los multiplicadores ya están centralizados en `battle.js`→`game.js`.

## 7. Un personaje disruptivo por pueblo, siempre opcional
El humor "pícaro" funciona mejor en la acera que en el camino. Nicole ya lo demuestra: su gracia está en que **no es obligatoria**. Darle a cada pueblo un vecino así (uno amargado, uno exagerado, uno que no cree que seas el héroe) con diálogos que roten.
- **Por qué pega:** el jugador busca el chiste en vez de tragárselo. Sube muchísimo la rejugabilidad.
- **Costo:** bajo. Datos en `npcs.js`, patrón ya establecido.

## 8. Sonido que acompañe la emoción
`music.js` tiene `SONGS` pero sin transiciones. Añadir: crossfade mundo↔batalla, ducking de SFX durante diálogo, y **una pista nueva y simple para los créditos** (aunque sea un arpegio de 8 compases).
- **Por qué pega:** los créditos sin cambio de música se sienten a "pantalla de texto". Es el 20% de esfuerzo que da el 80% de la emoción del cierre.
- **Costo:** bajo. El motor de audio ya existe (`audio.js`, WebAudio).

## 9. Accesibilidad de lectura
`Press Start 2P` a 5–6 px es ilegible en pantallas chicas, y hay amarillo sobre blanco en el HUD. Opción "texto grande" que use 8–10 px y ajuste las cajas, más contraste corregido en `battle-hud.js`.
- **Por qué pega:** alguien de tus amigos probablemente va a jugarlo en el celular. Los controles táctiles ya están (PR #1); esto completa la experiencia móvil.
- **Costo:** bajo-medio. Requiere revisar las cajas de diálogo (ya son adaptativas con `dDialogAdaptive`).

## 10. Diario de amigos (opcional, el más ambicioso)
Una pantalla nueva en el menú: por cada amigo, su retrato, su orden/subgrupo (los datos ya están en las crónicas de Oscar y Piero), su muletilla y cuántas veces hablaste con él. Se llena solo jugando.
- **Por qué pega:** convierte el "quién es quién" del reino — que es el mejor lore del juego — en algo que el jugador colecciona. Es el equivalente a la Dex, pero de personas.
- **Costo:** alto. Pantalla nueva + flags de conversación.

---

## Si sólo pudieras hacer tres

1. **#1 Créditos narrativos** — es el regalo.
2. **#2 Última Toma** — le da un clímax a lo anterior.
3. **#4 Techo de Nicole** — el mejor contenido por hora invertida del repo.

Las demás son mejoras de calidad de vida que se pueden soltar de a una sin tocar la historia.

## Advertencia de diseño
**#7 y el humor sobre personas reales:** la Nicole "crucificada" post-game (`npc-sprites.js:127`, `npcs.js:255`) es lo más filoso del juego. Antes de repartirlo, conviene preguntarle a Nicole (y a quien aparezca "amargado") si le hace gracia. Un chiste interno funciona con consentimiento; sin él, se lee como un ataque. Es el único punto de esta lista que puede arruinar el regalo.
