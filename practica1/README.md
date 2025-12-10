# Taller de Práctica: Arquitectura Híbrida y Resiliencia Avanzada

Este proyecto implementa una arquitectura de microservicios híbrida (HTTP + RabbitMQ) utilizando NestJS, demostrando la estrategia de resiliencia **Idempotent Consumer**.

## Arquitectura

*   **Gateway (Puerto 3000):** Recibe peticiones HTTP del cliente y las redirige a los microservicios correspondientes.
*   **Microservicio Reportes (Service B - Puerto 3001):** Entidad Transaccional. Recibe la creación de reportes, guarda en su BD y emite un evento `report_created` a RabbitMQ.
*   **Microservicio Usuarios (Service A - Puerto 3002):** Entidad Maestra. Consume el evento `report_created` para actualizar las estadísticas del usuario. Implementa **Idempotencia** usando Redis para evitar procesar el mismo mensaje dos veces.

## Estrategia de Resiliencia: Idempotent Consumer (Opción B)

Se utiliza Redis para almacenar las claves de los eventos procesados (`eventId`). Antes de procesar cualquier mensaje, el consumidor verifica si la clave ya existe en Redis. Si existe, el mensaje se descarta, garantizando que la operación de negocio (incrementar contador) se ejecute exactamente una vez.

## Requisitos Previos

*   Docker y Docker Compose
*   Node.js (v16+)

## Instalación y Ejecución

1.  **Levantar Infraestructura (RabbitMQ, Redis, Postgres):**
    ```bash
    docker-compose up -d
    ```

2.  **Instalar Dependencias:**
    Abrir 3 terminales diferentes, una para cada servicio:

    *   Terminal 1 (Gateway):
        ```bash
        cd gateway
        npm install
        npm run start:dev
        ```

    *   Terminal 2 (MS-Reports):
        ```bash
        cd ms-reports
        npm install
        npm run start:dev
        ```

    *   Terminal 3 (MS-Users):
        ```bash
        cd ms-users
        npm install
        npm run start:dev
        ```

## Pruebas

1.  **Crear un Reporte:**
    Hacer una petición POST a `http://localhost:3000/api/reports` con el siguiente body JSON:
    ```json
    {
      "description": "Bache en la calle 10",
      "userId": "user-uuid-123"
    }
    ```

2.  **Verificar Logs:**
    *   En **MS-Reports**, verás que se guardó el reporte y se emitió el evento.
    *   En **MS-Users**, verás "Procesando evento...".

3.  **Prueba de Resiliencia (Simulación):**
    Si RabbitMQ reenvía el mensaje (o si lo reenvías manualmente con el mismo `eventId`), **MS-Users** mostrará: "Evento ... ya procesado. Ignorando.", demostrando la idempotencia.
