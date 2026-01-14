# Práctica 4 — Backend Event-Driven + n8n

Esta práctica agrega **n8n** como 4ta capa (automatización) sobre el backend de microservicios (NestJS + RabbitMQ).

## Servicios

- Backend (API Gateway de microservicios): `http://localhost:3002/api`
- n8n: `http://localhost:5678`

## Levantar todo (Docker)

### 1) Levantar n8n

```bash
cd practica4/n8n
docker compose up -d
```

Luego entra a `http://localhost:5678` (Basic Auth: `admin` / `uleam2025`).

Importa y **activa** los workflows descritos en [n8n/README.md](n8n/README.md).

### 2) Levantar backend

```bash
cd practica4/apps/backend
docker compose up -d --build
```

## Pruebas rápidas

- Crear usuario (emite `usuario.creado`): POST `http://localhost:3002/api/users`
- Crear reporte (emite `reporte.creado` y si aplica `reporte.critico`): POST `http://localhost:3002/api/reports`

Si n8n devuelve 404 en `/webhook/...`, normalmente es porque el workflow no está activo o el path no coincide.
