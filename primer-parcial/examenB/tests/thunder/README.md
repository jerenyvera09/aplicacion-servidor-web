# Pruebas Thunder Client — Webhook → WebSocket

Importa la colección y ejecuta las peticiones para ver las notificaciones en el cliente WebSocket (`src/tests/frontend.html`).

## Pasos

1. Arranca la app Nest:
   ```cmd
   npm run start:dev
   ```
2. Abre `src/tests/frontend.html` en el navegador y conecta a `http://localhost:3000`.
3. En VS Code, abre Thunder Client → Collections → Import y selecciona `tests/thunder/webhook-collection.json`.
4. Ejecuta las 3 peticiones (Crear Vehiculo, Actualizar Cobertura, Borrar Conductor).
5. Verifica que en el cliente HTML se muestren eventos `notificacion` con `id`, `operacion`, `entidad`, `payload` y `fecha`.

## Endpoint

- `POST http://localhost:3000/webhook/notificaciones`
- Body JSON requiere:
  - `operacion`: `crear|actualizar|borrar`
  - `entidad`: `vehiculo|cobertura|conductor`
  - `payload`: objeto con datos relevantes

> Nota: El flujo es REST simulado → Webhook → WebSocket → Cliente. El REST NO llama al gateway directamente.
