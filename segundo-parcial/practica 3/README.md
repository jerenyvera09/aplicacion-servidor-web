# Práctica 3 — MCP + Integración IA

UNIVERSIDAD LAICA ELOY ALFARO DE MANABÍ  
Facultad de Ciencias Informáticas  
Carrera de Software  
Asignatura: Aplicación para el Servidor Web  
Docente: Ing. John Cevallos  
Período: 2025–2026 (2)
Autores: Jereny Vera Cinthia zambrano y carlos 

---

## Descripción General

En esta práctica se integra **Model Context Protocol (MCP)** a una arquitectura de microservicios desarrollada en talleres anteriores, permitiendo que un modelo de Inteligencia Artificial (Gemini) tome decisiones inteligentes sobre qué operaciones ejecutar en el backend, en función de la intención del usuario.

A diferencia de un flujo REST tradicional, en MCP el **modelo de IA decide qué herramientas (Tools) ejecutar**, orquestando de forma automática los servicios existentes.

---

## Arquitectura del Proyecto (3 capas)

Usuario
↓
API Gateway (NestJS, puerto 3000)
↓ └─ Gemini 2.0 Flash (Function Calling)
MCP Server (Express + JSON-RPC 2.0, puerto 3001)
↓ └─ tools.list / tools.invoke
Backend Microservicios (NestJS + Docker, puerto 3002 /api)


### Flujo General

- El usuario envía una solicitud en lenguaje natural.
- El API Gateway consulta al MCP Server las herramientas disponibles.
- Gemini analiza la intención del usuario y decide qué Tools ejecutar.
- El MCP Server ejecuta las Tools llamando al backend REST existente.
- El sistema retorna una respuesta consolidada al usuario.

---

## Objetivos de Aprendizaje

- Comprender el uso de MCP para orquestar servicios mediante IA.
- Diseñar Tools con JSON Schema bien definido.
- Implementar comunicación JSON-RPC 2.0.
- Integrar Gemini con Function Calling.
- Reutilizar microservicios desarrollados en talleres anteriores.

---

## Base del Proyecto (Talleres Anteriores)

El backend reutiliza los microservicios desarrollados previamente, cumpliendo con:

- Al menos dos entidades relacionadas (maestro–movimiento).
- Endpoints REST funcionales (CRUD).
- Base de datos SQLite operativa.
- Arquitectura basada en NestJS y Docker Compose.

---

## Documentación de Tools (MCP)

El MCP Server expone **tres herramientas** conectadas al dominio de reportes. Cada una está registrada en `apps/mcp-server/src/tools/registry.ts` y documentada con JSON Schema.

| Tool | Descripción | Parámetros principales | Ejemplo de uso |
| --- | --- | --- | --- |
| `buscar_reportes` | Busca reportes por palabra clave, con opción de filtrar solo los activos. | `keyword` (string, requerido), `onlyActive` (boolean, opcional). | “Busca reportes activos que mencionen *fallo*”. |
| `validar_usuario` | Confirma que un usuario exista y esté en estado `ACTIVE`. | `userId` (string, requerido). | “Valida si el usuario U-100 está activo”. |
| `crear_reporte` | Crea un nuevo reporte. Si no se envía `assignedToId`, el MCP selecciona automáticamente un analista activo distinto al solicitante. | `userId`, `title`, `description` (requeridos); `priority` y `assignedToId` (opcionales). | “Crea un reporte crítico para el usuario U-101 por un incidente de phishing”. |

## Variables de entorno

Todos los valores están documentados en los archivos `.env.example`; copiar cada uno a `.env` antes de ejecutar.

### API Gateway (`apps/api-gateway`)

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `GEMINI_API_KEY` | Sí | API key provista por el docente (usar tu propia credencial, **no** la de ejemplo). |
| `GEMINI_MODEL` | No | Modelo de Gemini, por defecto `gemini-2.0-flash`. |
| `MCP_RPC_URL` | No | URL del servidor MCP, por defecto `http://localhost:3001/rpc`. |

### MCP Server (`apps/mcp-server`)

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del servidor JSON-RPC (3001 por defecto). |
| `BACKEND_BASE_URL` | URL base del gateway REST (`http://localhost:3002/api`). |

### Backend (`apps/backend`)

Variables propias de cada microservicio (`RABBITMQ_URL`, `DATABASE_NAME`, etc.). El archivo `apps/backend/.env.example` resume las opciones comunes.

## Preparación de datos para la demo

1. Levanta RabbitMQ y los microservicios con Docker Compose:
  ```bash
  cd apps/backend
  docker compose up -d
  ```
2. Crea usuarios base (al menos un solicitante y dos analistas) enviando `POST http://localhost:3002/api/users` desde Thunder Client, Postman o `curl`.
3. Anota los IDs de usuarios activos; el MCP utilizará esos datos para asignar reportes automáticamente.

## Puesta en marcha local

1. **Backend (puerto 3002)**
  ```bash
  cd apps/backend/gateway-service
  npm install
  npm run start:dev
  ```
  > Alternativa: `cd apps/backend && docker compose up -d` para usar los contenedores.

2. **MCP Server (puerto 3001)**
  ```bash
  cd apps/mcp-server
  npm install
  npm run dev
  ```

3. **API Gateway + Gemini (puerto 3000)**
  ```bash
  cd apps/api-gateway
  npm install
  npm run start:dev
  ```

4. Envía peticiones al asistente:
  ```bash
  curl -X POST http://localhost:3000/assistant/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Crea un reporte urgente para el usuario U-100 por phishing"}'
  ```
  El atributo `toolCalls` mostrará las herramientas ejecutadas.

---

## Notas para la entrega

- El video demostrativo y las capturas de Postman se presentarán de forma presencial con el docente, según la pauta indicada en clase.
- Este repositorio concentra el código, la documentación de tools y los pasos de ejecución requeridos por la rúbrica.
Endpoints Principales
POST /assistant/chat
Recibe el mensaje del usuario y orquesta la ejecución Gemini → MCP → Backend.

Ejemplo:

curl -X POST http://localhost:3000/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Busca reportes activos donde aparezca la palabra fallo"}'
La respuesta incluye:

Texto final generado por Gemini.

Registro de herramientas ejecutadas (toolCalls).

Tecnologías Utilizadas
Componente	Tecnología	Puerto
Backend	NestJS + SQLite + Docker	3002
MCP Server	TypeScript + Express + JSON-RPC	3001
API Gateway	NestJS + Gemini	3000
IA	Gemini 2.0 Flash	Cloud

Conclusión
Este proyecto demuestra cómo MCP permite que un modelo de IA orqueste microservicios existentes de forma inteligente, reutilizando código previo y aplicando buenas prácticas de arquitectura, tipado y validación.

“La IA no reemplaza al desarrollador, lo potencia. MCP es el puente.”

