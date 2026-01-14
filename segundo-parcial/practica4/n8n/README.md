# Práctica 4 — n8n (Automatización Event-Driven)

## Levantar n8n

Desde la raíz del repo:

```bash
cd practica4/n8n
docker compose up -d
```

- URL: http://localhost:5678
- Usuario/Password (Basic Auth): `admin` / `uleam2025`

## Importar workflows

1. Entra a n8n → **Workflows** → **Import from File**.
2. Importa los JSON en `workflows/` en este orden:
   - `01-notificacion-tiempo-real.json`
   - `02-sincronizacion-sheets.json`
   - `03-alerta-critica.json`
3. Abre cada workflow y actívalo con el toggle **Active** (arriba a la derecha).
  - Importante: si el workflow NO está activo, el endpoint `/webhook/...` responde **404**.
  - En modo prueba, n8n usa `/webhook-test/...`.
4. Configura credenciales en cada nodo (Telegram/Google Sheets).

### Validación rápida (sin backend)

Cuando los 3 workflows estén activos, estos endpoints deberían responder 200 al hacer POST:

- `http://localhost:5678/webhook/reports-event`
- `http://localhost:5678/webhook/reports-sheets`
- `http://localhost:5678/webhook/reports-alerts`

## Conectar Backend → n8n

El Backend (gateway-service, puerto 3002) emite un POST al webhook de n8n cuando ocurren operaciones CRUD.

- Si ejecutas el backend **local** con `npm run start:dev`:
  - Recomendado (3 workflows):
    - `N8N_WEBHOOK_URLS=http://localhost:5678/webhook/reports-event,http://localhost:5678/webhook/reports-sheets,http://localhost:5678/webhook/reports-alerts`
  - Alternativa (solo 1 webhook):
    - `N8N_WEBHOOK_URL=http://localhost:5678/webhook/reports-event`

- Si ejecutas el backend **en Docker** (`practica4/apps/backend/docker-compose.yml`):
  - En Windows suele funcionar `http://host.docker.internal:5678/...`
  - Recomendado (3 workflows):
    - `N8N_WEBHOOK_URLS=http://host.docker.internal:5678/webhook/reports-event,http://host.docker.internal:5678/webhook/reports-sheets,http://host.docker.internal:5678/webhook/reports-alerts`

> Nota: cada workflow tiene su propio path en el nodo Webhook: `reports-event`, `reports-sheets`, `reports-alerts`.

## Variables sugeridas (no subir credenciales)

- `GEMINI_API_KEY` (para el nodo HTTP Request a Gemini)
- `GEMINI_MODEL` (por defecto `gemini-2.0-flash`)
- Credenciales de Telegram y Google Sheets se configuran dentro de n8n.
