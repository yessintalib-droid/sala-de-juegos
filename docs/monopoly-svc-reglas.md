# Monopoly SVC

Documento base de diseño y reglas para la versión digital de Monopoly SVC, inspirado en Sant Vicenç de Castellet.

## Estado del proyecto

- Nombre: Monopoly SVC.
- Jugadores previstos: 2 a 6.
- Fichas provisionales: Jugador 1, Jugador 2, Jugador 3 y Jugador 4.
- Logo: pendiente.
- Diseño visual: minimalista, claro y fácil de entender.
- Cartas disponibles: solo cartas de Suerte.
- Partidas: no se guardan.
- Modos: Normal y Express.
- Juego: una pantalla compartida o dispositivos conectados mediante código.
- Chat: no incluido.
- Dinero y propiedades de otros jugadores: ocultos.
- El creador de la sala puede expulsar jugadores.

## Objetivo

Gana el último jugador que conserve dinero y no haya quedado eliminado. En el modo Express, gana el jugador con mayor patrimonio cuando se cumple la condición de final rápido definida en la sala.

## Preparación de la partida

1. El creador elige Normal o Express.
2. El creador elige el número de jugadores, entre 2 y 6.
3. Cada jugador elige una ficha provisional distinta: Jugador 1, Jugador 2, Jugador 3 o Jugador 4. Se añadirán más fichas si la sala tiene más jugadores.
4. En partidas por dispositivos, se genera un código de sala.
5. Se muestra un resumen de jugadores y todos pulsan Listo.
6. Todos empiezan en la casilla de salida con el dinero inicial.
7. Comienza el jugador elegido por el creador o, si no se elige, se sortea.

## Dinero inicial

Cada jugador empieza con 1.500 euros. La distribución provisional es:

| Billete | Cantidad | Total |
|---:|---:|---:|
| 500 € | 2 | 1.000 € |
| 100 € | 3 | 300 € |
| 50 € | 2 | 100 € |
| 20 € | 2 | 40 € |
| 10 € | 4 | 40 € |
| 5 € | 3 | 15 € |
| 1 € | 5 | 5 € |
| **Total** |  | **1.500 €** |

En la versión digital, el banco tendrá saldo ilimitado para evitar que una partida se bloquee por falta de billetes.

## Turno

1. La pantalla indica claramente quién juega.
2. El jugador pulsa Tirar dados.
3. Se muestran los dos resultados y el total.
4. La ficha se mueve automáticamente por el tablero.
5. Se resuelve la casilla de destino.
6. El jugador puede realizar las acciones disponibles.
7. Pulsa Terminar turno.
8. El turno pasa al siguiente jugador.

El movimiento no se puede modificar manualmente después de tirar. Las acciones posibles aparecerán como botones claros: Comprar, Pagar, Robar carta, Ir a cárcel, Hipotecar, Vender, Intercambiar o Terminar turno.

## Salida

La cantidad que se cobra al pasar por Salida será la indicada en el tablero recibido. Si una carta devuelve al jugador al principio sin cobrar, se aplicará la regla de la carta y no se pagará la cantidad de Salida.

## Propiedades

- Una propiedad libre puede comprarse por el precio indicado en el tablero.
- Si el jugador no quiere comprarla, se aplicará la regla definida para esa casilla.
- Si la propiedad pertenece a otro jugador, se pagará el alquiler correspondiente.
- Las propiedades propias estarán dentro de Mis propiedades.
- El propietario podrá consultar precio, alquiler, estado e hipoteca.
- Los demás jugadores no podrán ver el dinero ni el inventario de propiedades ajeno.

## Ventas, hipotecas e intercambios

- El jugador podrá vender una propiedad al banco desde Mis propiedades.
- El precio de venta será el precio final configurado para esa propiedad.
- Una propiedad hipotecada no cobrará alquiler hasta que se levante la hipoteca.
- Se podrán intercambiar propiedades entre jugadores.
- También se podrán incluir cantidades de dinero en un intercambio.
- Los intercambios se harán mediante una pantalla de propuesta y aceptación.
- Un intercambio solo se completa cuando todas las partes lo aceptan.
- No se permitirá modificar un intercambio ya confirmado.

## Cárcel

Un jugador puede entrar en la cárcel por una casilla o por una carta de Suerte.

Mientras está en la cárcel:

- No avanzará normalmente por el tablero.
- Podrá usar una carta de salida si la tiene.
- Podrá pagar la cantidad de salida definida por la partida.
- Si la regla de la sala lo permite, podrá intentar salir tirando dados.
- La interfaz mostrará siempre el motivo y las acciones disponibles.

## Cartas de Suerte

Las cartas se diseñarán con identidad propia de Monopoly SVC. Textos normalizados:

1. Paga 100 € a todos los jugadores.
2. Todos los jugadores te pagan 100 €.
3. Pierdes un turno.
4. Tira otra vez.
5. Ve a la cárcel.
6. Comodín para salir de la cárcel. Se puede vender por 100 €.
7. Paga 100 € de impuestos al banco.
8. Te ha tocado la lotería. Cobra 100 € del banco.
9. Vuelve al principio del tablero sin cobrar la Salida.
10. Dale 100 € al jugador de tu lado.
11. Todos los jugadores van a la cárcel menos tú.
12. Todos pagan 100 € al jugador cuyo cumpleaños esté más cerca.

Si una carta requiere elegir jugadores, la interfaz mostrará una lista y evitará seleccionar al propio jugador cuando no corresponda.

## Sin parking gratuito

No habrá casilla de Parking gratuito. Si aparece en el diseño del tablero, se tratará como una casilla informativa o se sustituirá por la regla que indique el tablero definitivo.

## Eliminación

Un jugador pierde cuando no puede pagar una deuda y no dispone de dinero, propiedades vendibles ni propiedades hipotecables suficientes.

Al ser eliminado:

- Se detiene su participación.
- Sus propiedades pasan al banco, salvo que una regla de intercambio pendiente indique otra cosa.
- Sus jugadores conectados reciben una notificación.
- La partida continúa mientras queden al menos dos jugadores.

## Modo Normal

La partida continúa hasta que solo queda un jugador solvente. Ese jugador gana.

## Modo Express

El modo Express busca partidas cortas:

- La sala tendrá un límite de turnos configurable.
- Al alcanzar el límite, se detiene el movimiento y comienza la clasificación.
- Se suma dinero disponible, valor de compra de propiedades y valor de edificios.
- Las propiedades hipotecadas descuentan su deuda.
- Gana quien tenga mayor patrimonio total.
- En caso de empate, gana quien tenga más dinero disponible.

El límite exacto de turnos se podrá configurar antes de empezar. Valor provisional: 30 turnos por jugador.

## Clasificación final

La clasificación mostrará:

1. Posición.
2. Nombre del jugador.
3. Dinero disponible.
4. Valor de propiedades.
5. Deuda hipotecaria.
6. Patrimonio total.
7. Motivo del resultado: victoria, eliminación o final Express.

## Interfaz mínima necesaria

- Pantalla de crear o unirse a sala.
- Selección de modo Normal o Express.
- Selección de jugadores.
- Selección de ficha.
- Sala de espera.
- Tablero.
- Indicador de turno.
- Dados y movimiento animado.
- Panel Mis propiedades.
- Panel de dinero propio.
- Cartas de Suerte diseñadas.
- Modales de compra, pago, venta, hipoteca e intercambio.
- Vista privada para cada jugador conectado.
- Panel del creador para expulsar jugadores y reiniciar la partida.
- Clasificación final.

## Checklist de animaciones

### Implementado en local

- [x] La ficha avanza visualmente una casilla cada vez después de tirar los dados.
- [x] Se muestran billetes individuales según la cantidad cobrada o pagada.
- [x] El paso por Salida muestra el cobro de 100 €.
- [x] El pago de impuestos muestra billetes que van a la caja del tablero.
- [x] Al caer en Banco se recoge el dinero acumulado en la caja.
- [x] Las cartas de Suerte aparecen con una animación y se eligen aleatoriamente.
- [x] Los pagos entre jugadores muestran origen y destino en la animación local.

### Pendiente para servidor y varios dispositivos

- [ ] Animar el dinero desde el contador privado del jugador que paga al contador del propietario.
- [ ] Sincronizar el movimiento de cada ficha para todos los móviles conectados.
- [ ] Mostrar la animación de pago a todos los jugadores de la sala al mismo tiempo.
- [ ] Mantener la caja del tablero sincronizada entre dispositivos.
- [ ] Sincronizar la carta aleatoria y su resolución en todos los clientes.
- [ ] Evitar dobles animaciones cuando una acción llegue repetida desde el servidor.

## Pendientes del tablero

Estos datos se extraerán del tablero definitivo y no se inventarán hasta confirmar la lectura:

- Orden exacto de todas las casillas.
- Nombres de propiedades.
- Precio de compra.
- Precio de alquiler.
- Colores de grupos.
- Precio de hipoteca y venta.
- Coste de edificios, si existen.
- Cantidad exacta de Salida.
- Casillas especiales.
- Posición definitiva de las cartas de Suerte.

## Pendientes de recursos

- Fichas definitivas. De momento se usan números.
- Logo de Monopoly SVC.
- Diseños finales de billetes.
- Imágenes o ilustraciones de personajes.
- Confirmación de nombres y precios del tablero.
