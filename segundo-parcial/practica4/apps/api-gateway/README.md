# API Gateway (NestJS + Gemini)

## Endpoints clave

- **POST `/assistant/chat`**: recibe `{ "message": string }` y devuelve la respuesta del asistente junto con las herramientas MCP ejecutadas.

## Configuración

- Copiar `.env.example` a `.env` y mantener la `GEMINI_API_KEY` proporcionada por el docente.
- Variables opcionales:
  - `GEMINI_MODEL` (por defecto `gemini-2.0-flash`).
  - `MCP_RPC_URL` (por defecto `http://localhost:3001/rpc`).

## Ejecución

```bash
npm install
npm run start:dev
```

El servidor queda disponible en `http://localhost:3000`.

## Prueba rápida

```bash
curl -s -X POST http://localhost:3000/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Valida si el usuario U-100 existe"}' | jq
```

El atributo `toolCalls` confirmará las invocaciones a MCP.
