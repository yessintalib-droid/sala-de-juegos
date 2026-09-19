# Tareas pendientes para compilar la APK

## Estado actual

- La aplicación web está publicada en Render:
  - https://sala-de-juegos-6rza.onrender.com
- El proyecto Android está preparado en:
  - `C:\Users\Yessin Talib\Desktop\Cumple Mama`
- La APK se llamará `cumple-mama.apk`.
- La APK abrirá la web de Render dentro de un WebView.

## Herramientas que faltan

- [ ] Instalar Android Studio.
- [ ] Instalar Android SDK.
- [ ] Instalar Android SDK Platform 35.
- [ ] Instalar Android SDK Build-Tools.
- [ ] Instalar JDK 17.
- [ ] Comprobar que Gradle sincroniza correctamente.

## Compilar la APK

1. Abrir con Android Studio la carpeta:

   `C:\Users\Yessin Talib\Desktop\Cumple Mama`

2. Esperar a que termine la sincronización de Gradle.
3. Ejecutar:

   `Build > Build Bundle(s) / APK(s) > Build APK(s)`

4. Localizar el archivo generado:

   `C:\Users\Yessin Talib\Desktop\Cumple Mama\app\build\outputs\apk\debug\app-debug.apk`

5. Copiarlo al Escritorio.
6. Renombrarlo como:

   `C:\Users\Yessin Talib\Desktop\cumple-mama.apk`

## Comprobaciones antes de instalar

- [ ] Confirmar que la APK abre la URL de Render.
- [ ] Comprobar que carga JavaScript.
- [ ] Comprobar que funciona el almacenamiento local/WebView.
- [ ] Probar el tablero y las animaciones.
- [ ] Probar el modo prueba.
- [ ] Probar el historial de dinero.
- [ ] Probar propiedades, casas, hoteles y alquileres.
- [ ] Probar las cartas de Suerte y la lotería.
- [ ] Probar la pantalla en orientación móvil.
- [ ] Confirmar que el botón de volver funciona dentro de la WebView.

## Instalarla en el móvil

1. Transferir `cumple-mama.apk` al móvil.
2. Abrir el archivo desde el móvil.
3. Permitir la instalación desde esa fuente si Android lo solicita.
4. Instalar la aplicación.
5. Abrir **Cumple Mama**.
6. Confirmar que carga:

   `https://sala-de-juegos-6rza.onrender.com`

## Publicación futura

- [ ] Generar una APK firmada para distribuirla.
- [ ] Crear una clave de firma segura.
- [ ] Cambiar `versionCode` y `versionName` en cada actualización.
- [ ] Probar la APK en varios tamaños de pantalla.
- [ ] Publicarla en Google Play si se desea.
