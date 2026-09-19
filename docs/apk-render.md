# APK conectada a Render

La APK no duplica la aplicacion. Solo abre la misma web publicada en Render dentro de un WebView.

## Flujo

1. Render construye el proyecto con `npm install && npm run build`.
2. Render publica la carpeta `dist`.
3. La APK carga la URL publica, por ejemplo `https://sala-de-juegos-web.onrender.com`.
4. Los cambios publicados en la web aparecen tambien en la APK.

## WebView Android

La aplicacion Android debe abrir la URL de Render como pagina inicial. Hay que sustituir `RENDER_URL` por la URL real:

```kotlin
webView.settings.javaScriptEnabled = true
webView.settings.domStorageEnabled = true
webView.loadUrl("RENDER_URL")
```

La APK necesitara permiso de Internet:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Si mas adelante el backend usa WebSocket, la URL del servidor se configurara aparte; la APK seguira mostrando la web de Render.
