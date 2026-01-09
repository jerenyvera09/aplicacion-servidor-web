## Gateway Service (REST + RabbitMQ)

Este microservicio expone los endpoints REST consumidos por el MCP Server y orquesta la comunicación con los servicios de usuarios y reportes a través de RabbitMQ.

### Requisitos

- Node.js 20+
- RabbitMQ en `amqp://admin:admin123@localhost:5672` (o ajusta `RABBITMQ_URL` en `.env`).

### Variables de entorno

| Variable | Valor por defecto |
| --- | --- |
| `PORT` | `3002` |
| `RABBITMQ_URL` | `amqp://admin:admin123@localhost:5672` |
| `USERS_QUEUE` | `users_queue` |
| `REPORTS_QUEUE` | `reports_queue` |

### Comandos útiles

```bash
npm install          # instala dependencias
npm run start:dev    # inicia el gateway en modo watch (http://localhost:3002/api)
```

### Endpoints principales

- `GET /api/users` – Lista usuarios.
- `POST /api/users` – Crea usuarios nuevos (usa idempotencia).
- `GET /api/reports` – Lista reportes.
- `POST /api/reports` – Crea reportes disparando la saga via RabbitMQ.

Para pruebas rápidas puedes usar Thunder Client o `curl`, por ejemplo:

```bash
curl -X POST http://localhost:3002/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Analista 1","email":"analista1@example.com","role":"ANALYST"}'
```

### Flujo de mensajes

1. El API Gateway recibe solicitudes HTTP.
2. Envía eventos a RabbitMQ (`report.create`, `user.create`, etc.).
3. Los microservicios `users-service` y `reports-service` procesan los mensajes e interactúan con SQLite.
4. El gateway devuelve al cliente la respuesta unificada (`{ success, data }`).
