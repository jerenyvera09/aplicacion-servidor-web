# GraphQL Gateway — Práctica 5

Este es el gateway GraphQL (NestJS + Apollo) que consume la API REST del Taller 4.

## Requisitos

- Node.js 20+
- REST corriendo en `http://localhost:3000/api/v1`

## Arranque rápido

```bat
REM En la carpeta graph
npm install
npm run build
npm run start
```

- Apollo Sandbox: http://localhost:3001/graphql

Variables de entorno (opcional):

- `PORT` (por defecto 3001)
- `REST_BASE_URL` (por defecto `http://localhost:3000/api/v1`)

## Documentación y recursos

- Queries de ejemplo: `docs/queries.graphql`
- Diagrama de arquitectura: `docs/arquitectura.md`
- Planificación (acta, 3×3, cronograma): `docs/planificacion.md`

> Para más detalles (3×3, ejemplos y notas técnicas), ver `../README.md` en la raíz de la práctica 5.
