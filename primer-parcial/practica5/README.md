# Práctica 5 – Gateway GraphQL

Este proyecto implementa un gateway GraphQL que consume la API REST de la Práctica 4 (NestJS + TypeORM + SQLite) en `http://localhost:3000/api/v1`.

## Ejecutar (solo Graph)
- Node.js 20+
- API de Práctica 4 corriendo en `http://localhost:3000/api/v1`

## Ejecutar
```powershell
# Práctica 5 – Gateway GraphQL

Gateway GraphQL (NestJS + Apollo) que consume la API REST de la Práctica 4 (NestJS + TypeORM + SQLite) en `http://localhost:3000/api/v1`.

## Requisitos
- Node.js 20+
- Práctica 4 (REST) corriendo en `http://localhost:3000/api/v1`

## Arranque rápido

1) Terminal A – Práctica 4 (REST en 3000)
```powershell
cd "c:\Users\lenovo\Desktop\APLICACIONES_WEB\practica4"
npm install
npm run start
```

2) Terminal B – Práctica 5 (Graph en 3001)
```powershell
cd "c:\Users\lenovo\Desktop\APLICACIONES_WEB\practica5\graph"
npm install
npm run build
npm run start
```

- Apollo Sandbox (GraphQL): http://localhost:3001/graphql

Si ya tenías el Graph corriendo y cambiaste código:
```powershell
cd "c:\Users\lenovo\Desktop\APLICACIONES_WEB\practica5\graph"; npm run build; npm run start
```

Semillas de datos (opcional):
```powershell
cd "c:\Users\lenovo\Desktop\APLICACIONES_WEB\practica4"; npm run seed
```

### Si el puerto 3001 está ocupado
```powershell
netstat -ano | findstr :3001
Stop-Process -Id <PID> -Force
```
Luego vuelve a `npm run start` en `practica5/graph`.

## Esquema y módulos
- Reportes: `reporte(id)`, `reportes(filtro, paginacion)`, `dashboardReportes`, `promedioPuntuacionPorReporte`
- Catálogos: `categorias`, `areas`, `estados`, `etiquetas`
- Usuarios/Roles: `usuarios`, `roles`
- Comentarios/Archivos/Puntuaciones: `comentarios(reporteId?)`, `archivosAdjuntos(reporteId?)`, `puntuaciones(reporteId?)`

## Queries de Analytics (9/9) y autores
- Carlos Delgado:
  1) `topAreasConMasReportes(limite?)`
  2) `tableroEtiquetas(limite?)`
  3) `resumenUsuario(usuarioId!)`
- Jeremy Vera:
  4) `rankingUsuariosPorAportes(limite?, desde?, hasta?)`
  5) `reportesPorEtiquetaConPromedio(etiquetaId!, limite?)`
  6) `etiquetasCoocurrentes(etiquetaId!, limite?)`
- Cinthia Zambrano:
  7) `tendenciasComentariosPorSemana(desde?, hasta?)`
  8) `reportesPorAreaYCategoria(areaId?, categoriaId?)`
  9) `buscadorReportesAvanzado(filtro?, paginacion?)`

Colección para copiar/pegar en Apollo Sandbox:
- `practica5/graph/docs/queries.graphql`

## Ejemplos base
1) Reportes con filtro y paginación
```graphql
query Reportes($f: FiltroReportesInput, $p: PaginacionInput) {
  reportes(filtro: $f, paginacion: $p) {
    total pagina limite
    items { id titulo estado { id nombre } area { id nombre } categoria { id nombre } etiquetas { id nombre } }
  }
}
```
Variables:
```json
{ "f": { "texto": "alumbrado", "estadoId": 1 }, "p": { "pagina": 1, "limite": 10 } }
```

2) Un reporte por id
```graphql
query($id: Int!) { reporte(id: $id) { id titulo descripcion usuario { id nombre } } }
```

## Notas
- El gateway usa `HttpModule.register({ baseURL: 'http://localhost:3000/api/v1' })`.
- Parte de los filtros se aplican en el gateway; pueden moverse al REST si se requiere.
- Las capturas de las 9 queries y el schema generado pueden colocarse en `practica5/graph/docs/`.
</p>
