# Práctica 5 – Gateway GraphQL

Gateway GraphQL (NestJS + Apollo) que consume la API REST de la Práctica 4 (NestJS + TypeORM + SQLite) en `http://localhost:3000/api/v1`.

## Requisitos

- Node.js 20+
- API REST (Práctica 4) corriendo en `http://localhost:3000/api/v1`

## Arranque rápido

1. Terminal A – iniciar REST (Taller 4)

```bat
cd ..\practica4
npm install
npm run start
```

2. Terminal B – iniciar Graph (Taller 5)

```bat
cd .\graph
npm install
npm run build
npm run start
```

- Apollo Sandbox (GraphQL): http://localhost:3001/graphql

Si ya tenías el Graph corriendo y cambiaste código:

```bat
cd .\graph
npm run build
npm run start
```

Semillas de datos (opcional):

```bat
cd ..\practica4
npm run seed
```

### Si el puerto 3001 está ocupado

```bat
netstat -ano | findstr :3001
REM Abre el Administrador de Tareas y finaliza el proceso con ese PID, o usa:
REM taskkill /PID <PID> /F
```

## Esquema y módulos

- Reportes: `reporte(id)`, `reportes(filtro, paginacion)`, `dashboardReportes`, `promedioPuntuacionPorReporte`
- Catálogos: `categorias`, `areas`, `estados`, `etiquetas`
- Usuarios/Roles: `usuarios`, `roles`
- Comentarios/Archivos/Puntuaciones: `comentarios(reporteId?)`, `archivosAdjuntos(reporteId?)`, `puntuaciones(reporteId?)`

## Queries de Analytics (9/9) y autores

- Carlos Delgado: `topAreasConMasReportes`, `tableroEtiquetas`, `resumenUsuario`
- Jeremy Vera: `rankingUsuariosPorAportes`, `reportesPorEtiquetaConPromedio`, `etiquetasCoocurrentes`
- Cinthia Zambrano: `tendenciasComentariosPorSemana`, `reportesPorAreaYCategoria`, `buscadorReportesAvanzado`

Colección de queries para Apollo Sandbox:

- `practica5/graph/docs/queries.graphql`

## Ejemplos base

1. Reportes con filtro y paginación

```graphql
query Reportes($f: FiltroReportesInput, $p: PaginacionInput) {
  reportes(filtro: $f, paginacion: $p) {
    total
    pagina
    limite
    items {
      id
      titulo
      estado {
        id
        nombre
      }
      area {
        id
        nombre
      }
      categoria {
        id
        nombre
      }
      etiquetas {
        id
        nombre
      }
    }
  }
}
```

Variables:

```json
{
  "f": { "texto": "alumbrado", "estadoId": 1 },
  "p": { "pagina": 1, "limite": 10 }
}
```

2. Un reporte por id

```graphql
query ($id: Int!) {
  reporte(id: $id) {
    id
    titulo
    descripcion
    usuario {
      id
      nombre
    }
  }
}
```

## Notas

- El gateway usa `HttpModule.register({ baseURL: 'http://localhost:3000/api/v1' })`.
- Parte de los filtros se aplican en el gateway; pueden moverse al REST si se requiere.
- Caché HTTP: configurable con `HTTP_CACHE_TTL_SECONDS` (por defecto 60s en memoria).
- Las capturas de las 9 queries y el schema generado pueden colocarse en `practica5/graph/docs/`.
