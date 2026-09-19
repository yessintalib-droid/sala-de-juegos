# Sala de Juegos

Aplicación web en React + TypeScript para una colección de juegos de mesa y fiesta de Sant Vicenç de Castellet. La portada permite entrar en Culturín, Ajedrez, Parchís y Monopoly SVC; los demás juegos están preparados como botones para futuras implementaciones.

## Contexto para continuar

La documentación completa para otra IA está en [docs/contexto.md](docs/contexto.md). Incluye la arquitectura, el estado real de cada juego, limitaciones, recursos del tablero y tareas pendientes.

Las reglas y decisiones de Monopoly SVC están en [docs/monopoly-svc-reglas.md](docs/monopoly-svc-reglas.md).

## Ejecutar

```bash
npm install
npm run dev
```

Para comprobar una compilación de producción:

```bash
npm run build
```

## Publicar en Render y usarlo en la APK

El archivo `render.yaml` publica la web Vite en Render. La APK debe cargar la URL pública de Render dentro de un WebView, de modo que no mantiene una copia separada del juego.

La configuración del WebView está documentada en [docs/apk-render.md](docs/apk-render.md).

## Recursos

El tablero de Monopoly SVC está dividido en dos imágenes dentro de `public/`:

- `tablero parte arriba.png`
- `tablero parte abajo.png`

Las imágenes contienen sus propias casillas y deben mantenerse proporcionales. La mitad inferior se gira 180 grados porque el recurso original está invertido.

## Estado actual

La aplicación funciona localmente en el navegador. Las salas por código son todavía simulaciones: no hay servidor ni sincronización entre móviles. La partida local de Monopoly tiene el motor inicial, pero todavía necesita completar varias reglas antes de considerarse una versión definitiva.
