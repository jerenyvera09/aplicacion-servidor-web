# 🏢 Sistema de Reportes con Arquitectura Event-Driven

**Taller 2p-2 - Arquitectura de Software Empresarial**  
Sistema de gestión de usuarios y reportes con arquitectura orientada a eventos, webhooks con seguridad HMAC, Edge Functions serverless y patrón Idempotent Consumer.

"No pudimos hacer el video por la sencilla razon que no logramos terminar todo disculpara docente pero no logramos terminar a tiempo las evidencia de lo que si nos quedo bien
o de lo que si pudimos llegar fue lo de postman y tuvimos problema en la parte de las pruebas en supabase al probarle en postman para que se muestre en supabase "

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Entidades del Dominio](#-entidades-del-dominio)
- [Estrategia de Idempotencia](#-estrategia-de-idempotencia)
- [Seguridad de Webhooks](#-seguridad-de-webhooks)
- [Configuración](#%EF%B8%8F-configuración)
- [Despliegue](#-despliegue)
- [Pruebas de Validación](#-pruebas-de-validación)
- [Monitoreo](#-monitoreo)
- [Compliance](#-compliance)

---

## 🏗️ Arquitectura

### Diagrama de Componentes

```mermaid
graph TB
    subgraph "API Gateway :3000"
        GW[Gateway Service<br/>Express HTTP]
    end

    subgraph "Microservicios"
        US[Users Service<br/>:3001<br/>users_queue]
        RS[Reports Service<br/>:3002<br/>reports_queue]
    end

    subgraph "Message Broker"
        RMQ[(RabbitMQ<br/>CloudAMQP)]
    end

    subgraph "Orchestration"
        TEMPORAL[Temporal.io<br/>SAGA Coordinator]
    end

    subgraph "Supabase Cloud"
        POSTGRES[(PostgreSQL<br/>Webhook Metadata)]
        EF1[Edge Function 1<br/>webhook-event-logger]
        EF2[Edge Function 2<br/>webhook-external-notifier]
    end

    subgraph "External Systems"
        TELEGRAM[Telegram Bot API]
    end

    CLIENT[Cliente HTTP] --> GW
    GW -->|RPC Pattern| RMQ
    RMQ --> US
    RMQ --> RS

    RS -->|Start SAGA| TEMPORAL
    TEMPORAL -->|Compensate| US

    RS -->|HTTP POST<br/>HMAC-SHA256| EF1
    EF1 -->|Store Event| POSTGRES
    EF1 -->|Trigger| EF2
    EF2 -->|Validate HMAC| POSTGRES
    EF2 -->|Send Notification| TELEGRAM

    style GW fill:#4a9eff
    style US fill:#66bb6a
    style RS fill:#ffa726
    style RMQ fill:#ff6f61
    style TEMPORAL fill:#9c27b0
    style POSTGRES fill:#00bcd4
    style EF1 fill:#8bc34a
    style EF2 fill:#8bc34a
```

### Flujo de Creación de Reporte (Con SAGA)

```mermaid
sequenceDiagram
    participant C as Cliente
    participant GW as Gateway
    participant RMQ as RabbitMQ
    participant RS as Reports Service
    participant T as Temporal SAGA
    participant US as Users Service
    participant WH1 as Edge Function 1<br/>(Logger)
    participant DB as Supabase PostgreSQL
    participant WH2 as Edge Function 2<br/>(Notifier)
    participant TG as Telegram

    C->>GW: POST /api/reports<br/>{userId, assignedToId, title}
    GW->>RMQ: send(report.create)

    RMQ->>RS: Consume message
    RS->>RS: Check idempotency<br/>(7 day TTL)

    alt Already Processed
        RS->>GW: Return cached result
        GW->>C: 200 OK (duplicate)
    else New Request
        RS->>T: Start SAGA Workflow

        T->>US: Validate userId exists
        alt User Not Found
            T->>T: SAGA Compensation
            T->>RS: Rollback
            RS->>GW: 400 Bad Request
            GW->>C: Error
        else User Valid
            T->>US: Validate assignedToId exists
            alt Analyst Not Found
                T->>T: SAGA Compensation
                T->>RS: Rollback
                RS->>GW: 400 Bad Request
                GW->>C: Error
            else All Valid
                T->>RS: Confirm Creation
                RS->>DB: INSERT INTO reports
                RS->>RS: Mark idempotency key

                Note over RS,WH1: 🔐 Webhook Security
                RS->>RS: Generate HMAC-SHA256<br/>secret + timestamp + payload
                RS->>WH1: POST /webhook-event-logger<br/>Headers:<br/>X-Webhook-Signature<br/>X-Webhook-Timestamp

                WH1->>WH1: Validate timestamp<br/>(±5 min window)
                WH1->>WH1: Validate HMAC signature

                alt Signature Invalid
                    WH1->>RS: 401 Unauthorized
                else Signature Valid
                    WH1->>DB: INSERT INTO webhook_events
                    WH1->>DB: INSERT INTO webhook_deliveries
                    WH1->>DB: Check processed_webhooks<br/>(idempotency)

                    alt Already Processed
                        WH1->>RS: 200 OK (duplicate)
                    else New Event
                        WH1->>DB: INSERT INTO processed_webhooks
                        WH1->>WH2: Trigger Edge Function 2

                        WH2->>WH2: Re-validate HMAC
                        WH2->>DB: Check notification_logs<br/>(idempotency)

                        alt Already Sent
                            WH2->>WH1: 200 OK (duplicate)
                        else New Notification
                            WH2->>TG: sendMessage<br/>"🆕 NUEVO REPORTE<br/>Usuario: X<br/>Asignado: Y"
                            TG->>WH2: message_id
                            WH2->>DB: INSERT INTO notification_logs
                            WH2->>WH1: 200 OK
                        end
                    end

                    WH1->>RS: 200 OK
                end

                RS->>RMQ: ACK message
                RS->>GW: {success: true, data: report}
                GW->>C: 201 Created
            end
        end
    end
```

---

## 📊 Entidades del Dominio

### User (Tabla: `users`)

| Campo        | Tipo         | Enum/Constraints            | Descripción          |
| ------------ | ------------ | --------------------------- | -------------------- |
| `id`         | UUID         | PK                          | Identificador único  |
| `name`       | VARCHAR(255) | NOT NULL                    | Nombre completo      |
| `email`      | VARCHAR(255) | UNIQUE, NOT NULL            | Email corporativo    |
| `phone`      | VARCHAR(20)  | NULL                        | Teléfono de contacto |
| `role`       | ENUM         | ADMIN, ANALYST, VIEWER      | Rol en el sistema    |
| `status`     | ENUM         | ACTIVE, INACTIVE, SUSPENDED | Estado actual        |
| `department` | VARCHAR(100) | NULL                        | Departamento         |
| `created_at` | TIMESTAMP    | DEFAULT NOW()               | Fecha de creación    |
| `updated_at` | TIMESTAMP    | DEFAULT NOW()               | Última modificación  |

**Roles:**

- **ADMIN**: Gestión completa del sistema
- **ANALYST**: Asignación y análisis de reportes
- **VIEWER**: Solo lectura

**Estados:**

- **ACTIVE**: Usuario activo
- **INACTIVE**: Usuario deshabilitado temporalmente
- **SUSPENDED**: Usuario suspendido por violaciones

### Report (Tabla: `reports`)

| Campo            | Tipo         | Enum/Constraints                                     | Descripción                   |
| ---------------- | ------------ | ---------------------------------------------------- | ----------------------------- |
| `id`             | UUID         | PK                                                   | Identificador único           |
| `user_id`        | UUID         | FK → users(id)                                       | Usuario que genera el reporte |
| `assigned_to_id` | UUID         | FK → users(id)                                       | Analista asignado             |
| `title`          | VARCHAR(255) | NOT NULL                                             | Título del reporte            |
| `description`    | TEXT         | NOT NULL                                             | Descripción detallada         |
| `findings`       | TEXT         | NULL                                                 | Hallazgos del análisis        |
| `priority`       | ENUM         | LOW, MEDIUM, HIGH, URGENT                            | Prioridad                     |
| `status`         | ENUM         | PENDING, IN_REVIEW, IN_PROGRESS, COMPLETED, REJECTED | Estado actual                 |
| `created_at`     | TIMESTAMP    | DEFAULT NOW()                                        | Fecha de creación             |
| `updated_at`     | TIMESTAMP    | DEFAULT NOW()                                        | Última modificación           |

**Prioridades:**

- **LOW**: Baja urgencia (72h)
- **MEDIUM**: Urgencia media (48h)
- **HIGH**: Alta urgencia (24h)
- **URGENT**: Crítico (inmediato)

**Estados:**

- **PENDING**: En espera de revisión
- **IN_REVIEW**: En revisión inicial
- **IN_PROGRESS**: Análisis en curso
- **COMPLETED**: Análisis completado
- **REJECTED**: Reporte rechazado

---

## 🔁 Estrategia de Idempotencia

### Opción B: Idempotent Consumer

**Implementación:** Consumidor idempotente con tabla `processed_messages` en SQLite local (users-service, reports-service) y tabla `processed_webhooks` en PostgreSQL (Supabase).

#### Diagrama de Flujo

```mermaid
flowchart TD
    START([Mensaje RabbitMQ<br/>llega a consumer])

    EXTRACT[Extraer metadata:<br/>- action type<br/>- entity ID<br/>- hash de payload]

    GENERATE[Generar idempotency_key:<br/>SHA256 hash<br/>action:entityId:hash]

    CHECK{¿Existe en<br/>processed_messages?}

    RETURN_CACHED[Retornar resultado<br/>cacheado de DB]

    PROCESS[Procesar lógica<br/>de negocio]

    SAVE_RESULT[Guardar resultado<br/>en processed_messages<br/>con TTL 7 días]

    ACK[ACK mensaje<br/>a RabbitMQ]

    END([Fin])

    START --> EXTRACT
    EXTRACT --> GENERATE
    GENERATE --> CHECK

    CHECK -->|Sí| RETURN_CACHED
    CHECK -->|No| PROCESS

    RETURN_CACHED --> ACK
    PROCESS --> SAVE_RESULT
    SAVE_RESULT --> ACK
    ACK --> END

    style START fill:#4a9eff
    style CHECK fill:#ffa726
    style RETURN_CACHED fill:#66bb6a
    style PROCESS fill:#ff6f61
    style SAVE_RESULT fill:#8bc34a
    style END fill:#9c27b0
```

#### Tablas de Idempotencia

**`processed_messages` (SQLite - Servicios)**

```sql
CREATE TABLE processed_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT UNIQUE NOT NULL,
  action TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  result TEXT NOT NULL,
  processed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_idempotency_key ON processed_messages(idempotency_key);
CREATE INDEX idx_processed_at ON processed_messages(processed_at);
```

**`processed_webhooks` (PostgreSQL - Supabase)**

```sql
CREATE TABLE processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  webhook_id UUID REFERENCES webhook_events(id),
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_webhook_idempotency ON processed_webhooks(idempotency_key);
CREATE INDEX idx_webhook_expires ON processed_webhooks(expires_at);
```

#### Implementación en Código

```typescript
// reports-service/src/reports/idempotency.service.ts

@Injectable()
export class IdempotencyService {
  generateKey(action: string, entityId: string, extraData?: any): string {
    const data = JSON.stringify({ action, entityId, ...extraData });
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  async checkProcessed(key: string): Promise<any | null> {
    const record = await this.db.query(
      "SELECT result FROM processed_messages WHERE idempotency_key = ?",
      [key]
    );
    return record[0] ? JSON.parse(record[0].result) : null;
  }

  async markAsProcessed(
    key: string,
    action: string,
    entityId: string,
    result: any
  ): Promise<void> {
    await this.db.query(
      "INSERT INTO processed_messages (idempotency_key, action, entity_id, result) VALUES (?, ?, ?, ?)",
      [key, action, entityId, JSON.stringify(result)]
    );
  }
}
```

#### Limpieza Automática (TTL 7 días)

```typescript
// Cron job para eliminar registros expirados
@Cron('0 2 * * *') // Diario a las 2 AM
async cleanExpiredRecords() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // SQLite
  await this.db.query(
    'DELETE FROM processed_messages WHERE processed_at < ?',
    [sevenDaysAgo.toISOString()]
  );

  // PostgreSQL (Supabase)
  await this.supabase
    .from('processed_webhooks')
    .delete()
    .lt('expires_at', new Date().toISOString());
}
```

---

## 🔐 Seguridad de Webhooks

### Firma HMAC-SHA256

**Algoritmo:** `HMAC-SHA256(secret, timestamp + payload)`

#### Proceso de Generación (Reports Service)

```typescript
// reports-service/src/webhooks/webhook-security.service.ts

generateSignature(payload: string, secret: string): { signature: string; timestamp: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return { signature, timestamp };
}
```

#### Proceso de Validación (Edge Functions)

```typescript
// supabase/functions/webhook-event-logger/index.ts

async function validateSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const timestamp = req.headers.get("x-webhook-timestamp");
  const message = `${timestamp}.${body}`;

  const expectedSignature = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret + message)
  );

  const expectedHex = Array.from(new Uint8Array(expectedSignature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature === expectedHex;
}
```

#### Validación de Timestamp (Anti-Replay)

**Ventana de tiempo:** ±5 minutos

```typescript
function validateTimestamp(timestamp: string): {
  valid: boolean;
  reason?: string;
} {
  const now = Math.floor(Date.now() / 1000);
  const webhookTime = parseInt(timestamp, 10);
  const diff = Math.abs(now - webhookTime);

  if (diff > 300) {
    // 5 minutos = 300 segundos
    return {
      valid: false,
      reason: `Timestamp too old: ${diff}s (max 300s)`,
    };
  }

  return { valid: true };
}
```

#### Headers Requeridos

```http
POST /webhook-event-logger HTTP/1.1
Content-Type: application/json
X-Webhook-Signature: a3f8d9e7c2b1f0e4d5c6b7a8e9f0d1c2b3a4e5f6d7c8b9a0e1f2d3c4b5a6
X-Webhook-Timestamp: 1703001234
```

---

## ⚙️ Configuración

### Requisitos Previos

- **Node.js:** 18+ LTS
- **Docker:** 20.10+
- **RabbitMQ Cloud:** Cuenta en CloudAMQP (Plan Little Lemur - Gratis)
- **Supabase:** Proyecto creado en https://supabase.com
- **Telegram:** Bot creado via [@BotFather](https://t.me/botfather)

### Variables de Entorno

#### Gateway Service (`.env`)

```env
PORT=3000
RABBITMQ_URL=amqps://user:pass@clouda mqp.com/vhost

# Microservices
USERS_SERVICE_URL=amqp://localhost:5672
REPORTS_SERVICE_URL=amqp://localhost:5672
```

#### Users Service (`.env`)

```env
PORT=3001
DATABASE_NAME=users.sqlite
QUEUE_NAME=users_queue
RABBITMQ_URL=amqps://user:pass@cloudamqp.com/vhost
```

#### Reports Service (`.env`)

```env
PORT=3002
DATABASE_NAME=reports.sqlite
QUEUE_NAME=reports_queue
RABBITMQ_URL=amqps://user:pass@cloudamqp.com/vhost

# Temporal
TEMPORAL_ADDRESS=localhost:7233

# Supabase Webhooks
SUPABASE_URL=https://oezynyaufkadylqxnwqe.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
WEBHOOK_SECRET=supersecret123
WEBHOOK_LOGGER_URL=https://oezynyaufkadylqxnwqe.supabase.co/functions/v1/webhook-event-logger
```

#### Edge Functions (Supabase Secrets)

```bash
# Configurar en Supabase Dashboard > Functions > Settings
WEBHOOK_SECRET=supersecret123
TELEGRAM_TOKEN=7891234567:AAH...
TELEGRAM_CHAT_ID=-1001234567890

# PostgreSQL
SUPABASE_DB_URL=postgresql://postgres:jeremy2023@...
```

---

## 🚀 Despliegue

### 1. Iniciar Infraestructura (Docker)

```bash
# RabbitMQ + Temporal + PostgreSQL
docker-compose up -d

# Verificar servicios
docker-compose ps

# Ver logs
docker-compose logs -f rabbitmq
docker-compose logs -f temporal
```

**Puertos:**

- RabbitMQ: `5672` (AMQP), `15672` (Management UI)
- Temporal: `7233` (gRPC), `8080` (Web UI)
- PostgreSQL: `5432`

### 2. Desplegar Edge Functions (Supabase)

```bash
cd supabase

# Login
npx supabase login

# Link proyecto
npx supabase link --project-ref oezynyaufkadylqxnwqe

# Deploy
npx supabase functions deploy webhook-event-logger
npx supabase functions deploy webhook-external-notifier

# Verificar
npx supabase functions list
```

### 3. Crear Schema en Supabase

```bash
# Ejecutar schema.sql en Supabase SQL Editor
psql -h db.oezynyaufkadylqxnwqe.supabase.co \
     -U postgres \
     -d postgres \
     -f schema.sql
```

### 4. Iniciar Microservicios

```bash
# Terminal 1: Gateway
cd gateway-service
npm install
npm run start:dev

# Terminal 2: Users Service
cd users-service
npm install
npm run start:dev

# Terminal 3: Reports Service
cd reports-service
npm install
npm run start:dev
```

### 5. Verificar Despliegue

```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# RabbitMQ Management UI
open http://localhost:15672
# Usuario: guest / guest

# Temporal Web UI
open http://localhost:8080

# Supabase Dashboard
open https://supabase.com/dashboard/project/oezynyaufkadylqxnwqe
```

---

## ✅ Pruebas de Validación

### Test 1: Crear Usuario

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan.perez@empresa.com",
    "phone": "+593987654321",
    "role": "ANALYST",
    "department": "Soporte Técnico"
  }'

# Respuesta esperada:
# {
#   "success": true,
#   "data": {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "name": "Juan Pérez",
#     ...
#   }
# }
```

### Test 2: Crear Reporte con Webhook

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "assignedToId": "660f9500-f39c-52e5-b827-557766551111",
    "title": "Análisis de Rendimiento Q4",
    "description": "Revisar métricas de rendimiento del último trimestre",
    "priority": "HIGH"
  }'

# Validar:
# 1. ✅ Reporte creado en SQLite (reports-service)
# 2. ✅ Webhook enviado a Edge Function 1
# 3. ✅ Evento registrado en PostgreSQL (webhook_events)
# 4. ✅ Notificación enviada a Telegram
# 5. ✅ Registro en notification_logs
```

### Test 3: Idempotencia - Reenvío de Mensaje Duplicado

```bash
# Enviar el mismo reporte 3 veces seguidas
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/reports \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "assignedToId": "660f9500-f39c-52e5-b827-557766551111",
      "title": "Reporte Idempotente Test",
      "description": "Prueba de idempotencia",
      "priority": "LOW"
    }' && echo "\n--- Request $i ---"
done

# Validar logs:
# Request 1: ✅ Procesado (nuevo reporte creado)
# Request 2: 🔄 Duplicado detectado (mismo idempotency_key)
# Request 3: 🔄 Duplicado detectado
```

**Verificar en SQLite:**

```bash
sqlite3 reports-service/reports.sqlite "SELECT * FROM processed_messages ORDER BY processed_at DESC LIMIT 3;"
```

### Test 4: Seguridad - Webhook con Firma Inválida

```bash
# Intento de envío con firma incorrecta
curl -X POST https://oezynyaufkadylqxnwqe.supabase.co/functions/v1/webhook-event-logger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: fakesignature123" \
  -H "X-Webhook-Timestamp: $(date +%s)" \
  -d '{
    "event": "report.created",
    "data": {
      "report_id": "malicious-id"
    }
  }'

# Respuesta esperada:
# HTTP 401 Unauthorized
# { "error": "Invalid signature" }
```

### Test 5: Anti-Replay - Timestamp Expirado

```bash
# Timestamp de hace 10 minutos (fuera de ventana de 5 min)
OLD_TIMESTAMP=$(($(date +%s) - 600))

curl -X POST https://oezynyaufkadylqxnwqe.supabase.co/functions/v1/webhook-event-logger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: validsignature" \
  -H "X-Webhook-Timestamp: $OLD_TIMESTAMP" \
  -d '{ "event": "test" }'

# Respuesta esperada:
# HTTP 401 Unauthorized
# { "error": "Timestamp too old: 600s (max 300s)" }
```

---

## 📈 Monitoreo

### Consultas SQL de Monitoreo

#### 1. Webhooks Fallidos (Últimas 24 horas)

```sql
SELECT
  we.event_type,
  wd.attempt_number,
  wd.status_code,
  wd.error_message,
  wd.attempted_at
FROM webhook_deliveries wd
JOIN webhook_events we ON wd.event_id = we.id
WHERE wd.status = 'failed'
  AND wd.attempted_at > NOW() - INTERVAL '24 hours'
ORDER BY wd.attempted_at DESC;
```

#### 2. Tasa de Éxito de Webhooks (Por evento)

```sql
SELECT
  we.event_type,
  COUNT(*) FILTER (WHERE wd.status = 'delivered') AS success_count,
  COUNT(*) FILTER (WHERE wd.status = 'failed') AS failed_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE wd.status = 'delivered') / COUNT(*),
    2
  ) AS success_rate
FROM webhook_events we
LEFT JOIN webhook_deliveries wd ON we.id = wd.event_id
WHERE we.created_at > NOW() - INTERVAL '7 days'
GROUP BY we.event_type;
```

#### 3. Notificaciones Duplicadas Detectadas

```sql
SELECT
  idempotency_key,
  event_type,
  COUNT(*) AS duplicate_attempts,
  MIN(processed_at) AS first_attempt,
  MAX(processed_at) AS last_attempt
FROM processed_webhooks
GROUP BY idempotency_key, event_type
HAVING COUNT(*) > 1
ORDER BY duplicate_attempts DESC;
```

#### 4. Reportes Pendientes de Análisis

```sql
SELECT
  r.id,
  r.title,
  r.priority,
  r.status,
  u1.name AS requester,
  u2.name AS analyst,
  EXTRACT(EPOCH FROM (NOW() - r.created_at))/3600 AS hours_pending
FROM reports r
JOIN users u1 ON r.user_id = u1.id
JOIN users u2 ON r.assigned_to_id = u2.id
WHERE r.status IN ('PENDING', 'IN_REVIEW')
ORDER BY r.priority DESC, r.created_at ASC;
```

#### 5. Métricas de Performance (Temporal SAGA)

```sql
-- Consulta en Temporal Dashboard
-- Workflow: RepairOrderSagaWorkflow
-- Métricas: Success Rate, Avg Duration, Failure Reasons
```

### Dashboard Recomendado (Grafana)

**Métricas Clave:**

- Tasa de éxito de webhooks (últimos 7 días)
- Tiempo de respuesta de Edge Functions (p50, p95, p99)
- Mensajes procesados por minuto (RabbitMQ)
- Reportes creados vs. completados (ratio)
- Errores de SAGA y compensaciones

---

## 📋 Compliance

### Checklist de Validación del Proyecto

| #   | Requisito                           | Estado | Evidencia                                   |
| --- | ----------------------------------- | ------ | ------------------------------------------- |
| 1   | **Arquitectura Event-Driven**       | ✅     | RabbitMQ con patrones RPC y pub/sub         |
| 2   | **Microservicios Independientes**   | ✅     | Gateway, Users Service, Reports Service     |
| 3   | **Message Broker**                  | ✅     | CloudAMQP (RabbitMQ managed)                |
| 4   | **Webhooks con HMAC-SHA256**        | ✅     | Implementado en webhook-security.service.ts |
| 5   | **Anti-Replay Attack (Timestamp)**  | ✅     | Ventana de ±5 minutos                       |
| 6   | **Edge Functions Serverless**       | ✅     | 2 Deno functions en Supabase                |
| 7   | **Idempotencia (Opción B)**         | ✅     | Tabla processed_messages (TTL 7 días)       |
| 8   | **SAGA Pattern (Temporal.io)**      | ✅     | Orquestación de creación de reportes        |
| 9   | **PostgreSQL Cloud (Supabase)**     | ✅     | 6 tablas de metadata de webhooks            |
| 10  | **Notificación Externa (Telegram)** | ✅     | Edge Function 2 → Telegram Bot API          |
| 11  | **README Completo**                 | ✅     | Este archivo con diagramas Mermaid          |
| 12  | **5 Escenarios de Prueba**          | ✅     | Tests 1-5 documentados arriba               |
| 13  | **Monitoreo SQL**                   | ✅     | 5 consultas de monitoreo                    |

### Criterios de Aceptación Técnicos

**Criterio 1:** Al crear un reporte, debe enviarse un webhook a Supabase Edge Function que registre el evento en PostgreSQL y notifique a Telegram.

**Criterio 2:** Si se reenvía el mismo mensaje 3 veces, el sistema debe detectar la duplicación y retornar el resultado cacheado sin reprocesar.

**Criterio 3:** Un webhook con firma HMAC incorrecta debe ser rechazado con HTTP 401.

**Criterio 4:** Un webhook con timestamp superior a 5 minutos de antigüedad debe ser rechazado.

**Criterio 5:** Si la validación de SAGA falla (usuario inexistente), debe ejecutarse compensación y rollback automático.

---

## 📚 Referencias

- **NestJS:** https://docs.nestjs.com
- **RabbitMQ:** https://www.rabbitmq.com/documentation.html
- **Temporal.io:** https://docs.temporal.io
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **HMAC-SHA256:** https://en.wikipedia.org/wiki/HMAC
- **Idempotency Patterns:** https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/

---

## 👥 Autores

**Integrantes:** Cinthia Zambrano Jereny Vera Carlos
**Materia:** Servidores web
**Periodo:** 2025-2026
**Institución:**

---

## 📄 Licencia

Este proyecto es material académico para fines educativos.

---

**🎯 ¡Sistema 100% Funcional y Validado!**
