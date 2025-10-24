# Arquitectura — Gateway GraphQL

```mermaid
flowchart LR
  A[Cliente (Apollo Sandbox / App Web)] -->|HTTP GraphQL| B[Gateway GraphQL (NestJS + Apollo)]
  B -->|HttpModule (REST)| C[API REST Práctica 4 (NestJS)]
  C -->|TypeORM| D[(Base de Datos)]

  subgraph Gateway GraphQL
    B1[Resolvers + DataLoader] --> B2[ServiceHttp (cache TTL)]
  end

  subgraph API REST
    C1[Controladores] --> C2[Servicios]
    C2 --> C3[Repositorios]
  end
```

Notas:
- El Gateway centraliza consultas y agrega datos de múltiples recursos REST.
- DataLoader reduce N+1 al resolver relaciones (usuario, categoría, área, estado, etc.).
- ServiceHttp aplica caché en memoria para estabilizar y acelerar respuestas.
