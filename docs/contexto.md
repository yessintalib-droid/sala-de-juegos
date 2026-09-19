# Contexto del proyecto: Sala de Juegos / Monopoly SVC

## 1. Qué es la aplicación

Esta es una aplicación web de juegos de mesa y juegos de fiesta para Sant Vicenç de Castellet. La pantalla inicial se llama **Sala de Juegos** y muestra botones para:

- Monopoly SVC.
- UNO.
- Parchís.
- Hipster.
- Mamania.
- Culturin.
- Ajedrez.
- Doble.

La interfaz está en español. El estilo general es editorial, minimalista y colorido. El objetivo es que cualquier persona entienda rápidamente qué puede pulsar y cómo empieza una partida.

## 2. Stack y comandos

- React.
- TypeScript.
- Vite.
- `lucide-react` para iconos.
- `chess.js` para movimientos legales de Ajedrez.
- CSS global en `src/index.css`.
- No hay backend todavía.
- No hay base de datos.
- Las salas y partidas son simulaciones locales dentro del navegador.

Comandos:

```bash
npm install
npm run dev
npm run build
npm run preview
```

El criterio de validación del proyecto es ejecutar `npm run build` después de los cambios.

## 3. Estructura importante

- `src/main.tsx`: punto de entrada de React.
- `src/App.tsx`: portada, catálogo de juegos, Culturín, Parchís y Ajedrez.
- `src/Monopoly.tsx`: componente independiente de Monopoly SVC.
- `src/index.css`: estilos globales de la portada, Culturín, Parchís, Ajedrez y Monopoly.
- `src/vite-env.d.ts`: tipos de Vite.
- `public/tablero parte arriba.png`: mitad superior del tablero real de Monopoly SVC.
- `public/tablero parte abajo.png`: mitad inferior del tablero real de Monopoly SVC.
- `public/tablero.pdf`: recurso anterior del tablero, ya no debe ser la fuente principal si están disponibles las dos imágenes PNG.
- `docs/monopoly-svc-reglas.md`: documento de reglas y decisiones de diseño de Monopoly.
- `docs/contexto.md`: este documento para dar contexto a otra IA.

## 4. Cómo funciona la portada

`App.tsx` mantiene un estado `activeGame`. Al pulsar un juego, se muestra su componente si existe:

- `Culturin` abre la experiencia de Culturín.
- `ChessGame` abre Ajedrez.
- `ParchisGame` abre Parchís.
- `Monopoly` abre `src/Monopoly.tsx`.
- Los demás botones todavía son principalmente entradas visuales sin juego implementado.

No convertir la portada en una pantalla de marketing. Debe seguir siendo directamente utilizable como catálogo de juegos.

## 5. Estado de Culturín

Culturín ahora es multijugador real a través del servidor WebSocket (`server/`):

1. Crear sala (usa el nombre del perfil, ya no pide nombre en el juego).
2. Compartir código y entrar en la sala de espera.
3. La sala de espera muestra a todos los jugadores conectados y quién está listo.
4. La partida no empieza hasta que todos los jugadores conectados pulsan "Listo para jugar". Si alguien pulsa antes que el resto, ve un mensaje "Esperando a X jugadores más...".
5. Cuenta atrás 3, 2, 1 (local) y aparece la misma letra para todos (elegida por el servidor y sincronizada).
6. Cada jugador escribe sus respuestas y las autoevalúa (Único 10 / Repetido 5 / Fallo 0), igual que antes.
7. Al pulsar Continuar, el total de la ronda se envía al servidor. Hay una pantalla de espera hasta que todos los jugadores han enviado su ronda.
8. La pantalla de resumen muestra la ronda propia y el marcador acumulado de todos los jugadores de la sala.
9. Hay 5 rondas; para pasar de ronda todos deben pulsar Listo otra vez (mismo mecanismo de espera).
10. Al acabar la quinta ronda aparece la pantalla de ganador con la clasificación de todos los jugadores por puntos.
11. Desde la pantalla de ganador: botón **Revancha** (si todos los jugadores conectados lo pulsan, la sala reinicia con el mismo código) o **Salir** (si cualquiera pulsa salir, todos los jugadores vuelven automáticamente al dashboard).

Limitación: las respuestas de texto de cada ronda no se sincronizan entre jugadores (solo el total de puntos), así que no hay verificación cruzada de duplicados. La puntuación de "único/repetido/fallo" sigue siendo autoevaluada por cada jugador.

## 5.1 Perfil de jugador

El nombre del jugador ya no se pide dentro de cada juego. Se guarda una sola vez en `localStorage` (clave `sala-de-juegos-profile-name`) desde una pantalla de perfil obligatoria la primera vez que se abre la app, y se puede editar después desde el botón de perfil en la barra superior del dashboard. Ese mismo nombre se usa en Culturín, Ajedrez y Parchís.

Limitación: el nombre vive solo en el navegador/dispositivo actual (no hay cuentas ni login), así que cambiar de navegador o borrar datos del sitio reinicia el nombre.

## 6. Estado de Ajedrez

Ajedrez permite:

- Jugar contra un bot local.
- Crear una sala con código para otra persona.
- Unirse con código.
- Escribir nombre.
- Ver un tablero 8x8.
- Seleccionar piezas y casillas.
- Validar movimientos legales con `chess.js`.
- Promocionar automáticamente a dama.
- Mostrar turno de blancas/negras.
- Mostrar jaque.
- Mostrar jaque mate.
- Mostrar tablas.
- Reiniciar partida.

El bot actual elige un movimiento legal aleatorio. No es una IA estratégica.

Limitación: el modo de código todavía no conecta dos dispositivos. Solo cambia la navegación local.

## 7. Estado de Parchís

Parchís permite elegir:

- 4 jugadores.
- 6 jugadores.
- 8 jugadores.
- 12 jugadores.

También tiene:

- Modo local en una pantalla.
- Crear sala con código.
- Unirse mediante código.
- Nombre del jugador.
- Tablero clásico visual para 4 jugadores.
- Tablero radial visual para 6, 8 y 12.
- Dado local.
- Turno local.
- Lista visual de jugadores.

Limitación importante: el tablero actual es una primera maqueta visual. El dado cambia el turno, pero no hay todavía movimiento real de fichas, reglas completas, barreras, capturas, entrada en meta ni victoria.

## 8. Estado de Monopoly SVC

Monopoly SVC es el módulo más avanzado y está en `src/Monopoly.tsx`.

### Configuración

- Modo Normal.
- Modo Express.
- Entre 2 y 6 jugadores.
- Selección provisional de fichas numeradas.
- Dinero inicial provisional: 1.500 €.
- El modo Express termina después de 30 turnos.

### Tablero

El tablero real se recibió dividido en dos imágenes:

- `public/tablero parte arriba.png`.
- `public/tablero parte abajo.png`.

Estas imágenes contienen sus propias casillas. No se deben dibujar casillas artificiales encima. El objetivo visual es mostrar las dos imágenes completas, proporcionales, sin aplastarlas ni taparlas. La mitad inferior se gira 180 grados porque la imagen original está invertida.

La aplicación conserva algunas estructuras de casillas para la lógica local, pero las casillas visibles deben seguir siendo las de las imágenes originales.

### Casillas y datos provisionales

El código contiene nombres y precios iniciales extraídos de las referencias recibidas, entre ellos:

- Salida.
- La Grangeta: 100 €.
- Cal Soler: 120 €.
- Impuestos: 100 €.
- Cap SVC: 140 €.
- Estación Castellet: 160 €.
- Puigsoler: 180 € o 320 € según aparición.
- Cá la Rosa: 200 €.
- Bazar Chino: 220 €.
- Can Manel: 240 €.
- Pugnató: 260 €.
- Vallhonesta: 280 €.
- Can Soler: 300 €.
- Suerte.
- Banco.
- Cárcel.
- Visitas.
- Descanso.

Estos datos deben confirmarse contra el tablero definitivo antes de considerarlos finales.

### Motor local actual

El módulo permite:

- Tirar un dado de 1 a 4.
- Mover la ficha por el recorrido.
- Comprar una propiedad libre.
- Pagar alquiler básico.
- Cobrar al pasar por Salida.
- Pagar impuestos.
- Acumular dinero en la caja del tablero.
- Recoger el dinero de la casilla Banco.
- Sacar cartas de Suerte aleatorias.
- Mostrar dinero propio.
- Abrir Mis propiedades.
- Terminar turno.
- Clasificación del modo Express.

Las cartas actuales son una muestra local basada en los textos recibidos. La acción de algunas cartas todavía es parcial.

### Animaciones locales implementadas

- Movimiento paso a paso de la ficha después de lanzar los dados.
- Billetes individuales según el importe, por ejemplo 150 € muestra 100 € + 50 €.
- Animación visual de cobros y pagos.
- Animación al cobrar por Salida.
- Animación al pagar impuestos a la caja.
- Animación al recoger dinero del Banco.
- Animación visual de una carta al caer en Suerte.
- Fichas numeradas visibles sobre el tablero cuando la capa del tablero lo permite.

### Checklist para cuando exista servidor

- [ ] Sincronizar la posición de las fichas y el recorrido paso a paso entre todos los clientes.
- [ ] Emitir pagos con origen y destino reales: contador del jugador que paga, ficha del propietario y contador que recibe.
- [ ] Persistir la caja del tablero y sincronizar los billetes que permanecen sobre la casilla hasta que otro jugador los recoge.
- [ ] Sincronizar el cobro de Salida, impuestos, compras, alquileres y cartas para que todos vean la misma animación.
- [ ] Sincronizar la carta aleatoria elegida y su texto, evitando que cada cliente genere una carta distinta.
- [ ] Asociar las animaciones a eventos del servidor con identificadores de turno para evitar duplicados o repeticiones.

### Limitaciones de Monopoly

- No existe servidor.
- Los códigos de sala no conectan dispositivos.
- No hay sincronización entre móviles.
- Las propiedades de los demás jugadores no tienen privacidad real porque todo ocurre en una pestaña local.
- No hay negociación real.
- No hay hipotecas completas.
- No hay venta de propiedades completa.
- No hay edificios.
- No hay eliminación completa por bancarrota.
- No hay todas las acciones de las 12 cartas implementadas.
- La clasificación todavía usa principalmente dinero, no patrimonio completo.
- El tablero real está integrado como imágenes visuales, pero las coordenadas de clic deben mapearse de forma precisa si se quiere hacer clic sobre cada casilla original.

## 9. Cartas de Suerte recibidas

Textos normalizados:

1. Paga 100 € a todos los jugadores.
2. Todos los jugadores te pagan 100 €.
3. Pierdes un turno.
4. Tira otra vez.
5. Ve a la cárcel.
6. Comodín para salir de la cárcel. Se puede vender por 100 €.
7. Paga 100 € de impuestos al banco.
8. Te ha tocado la lotería. Cobra 100 € del banco.
9. Vuelve al principio del tablero sin cobrar la Salida.
10. Dale 100 € al jugador de al lado.
11. Todos los jugadores van a la cárcel menos tú.
12. Todos pagan 100 € al jugador cuyo cumpleaños esté más cerca.

El diseño visual de estas cartas debe ser propio de Monopoly SVC, minimalista, legible y fácil de entender.

## 10. Billetes

Los valores recibidos son:

- 1 €.
- 5 €.
- 10 €.
- 20 €.
- 50 €.
- 100 €.
- 500 €.

Las imágenes de los billetes recibidas sirven como referencia visual. No copiar diseños protegidos literalmente. Para la app se pueden representar como billetes propios con color, valor y estilo de Monopoly SVC.

## 11. Requisitos de servidor pendientes

Cuando se añada backend/websocket/base de datos temporal, implementar:

- Crear sala real.
- Unirse con código real.
- Lista de jugadores sincronizada.
- Selección de fichas sin duplicados.
- Vista privada de dinero y propiedades.
- Estado de turno autoritativo en servidor.
- Dados generados y validados por servidor.
- Movimiento sincronizado para todos.
- Animación del dinero desde el contador del pagador al propietario.
- Animación visible para todos los jugadores.
- Sincronización de caja del tablero.
- Cartas aleatorias decididas por servidor.
- Expulsión de jugadores por el creador.
- Reconexión si se cierra un móvil.
- Validación contra trampas o cambios de estado del cliente.

## 11.1 Servidor en tiempo real (ya existe, en uso por Culturín)

El servidor vive en `server/` (WebSocket + HTTP con la librería `ws`, sin base de datos, todo en memoria).

Comandos:

```bash
npm run server:dev    # desarrollo, con tsx, puerto 8787 por defecto
npm run server:build  # compila a dist-server/
node dist-server/index.js  # ejecutar la versión compilada
```

Endpoints HTTP: `POST /api/rooms` (crear sala), `POST /api/rooms/join` (unirse), `GET /api/rooms/:code`, `GET /health`. WebSocket en `/ws?room=CODE&playerId=ID`.

Actualmente solo el tipo de sala `culturin` tiene lógica de juego real en el servidor (listo/ready, rondas, marcador, revancha). El tipo `monopoly` existe en los tipos pero el motor de Monopoly SVC sigue siendo 100% local en el navegador.

En Render, `render.yaml` despliega dos servicios: `sala-de-juegos-web` (estático) y `sala-de-juegos-server` (Node, este servidor). El frontend recibe la URL del servidor mediante la variable de entorno `VITE_SERVER_URL` (ver `src/App.tsx`, constantes `SERVER_HTTP`/`SERVER_WS`). En desarrollo local, si no está definida, usa `http://localhost:8787` / `ws://localhost:8787`.

## 12. Reglas de edición para otra IA

- Mantener toda la interfaz en español.
- Usar React + TypeScript.
- Ejecutar `npm run build` después de editar.
- No borrar cambios existentes sin comprobar su relación con la tarea.
- No sustituir las imágenes reales del tablero por una cuadrícula inventada.
- No añadir casillas visuales encima de las casillas que ya aparecen en las imágenes del tablero.
- Mantener el diseño claro y minimalista.
- No hacer una refactorización grande si basta un cambio local.
- Actualizar este documento si cambia una funcionalidad importante.
- Si se añade servidor, documentar también cómo arrancarlo.
