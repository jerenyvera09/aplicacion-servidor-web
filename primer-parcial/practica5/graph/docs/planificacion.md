# Planificación del Equipo — Taller 5 (GraphQL Gateway)

## Acta de reunión inicial
- Fecha: 2025-10-23
- Integrantes: Carlos Delgado, Jeremy Vera, Cinthia Zambrano
- Objetivo: Definir 9 consultas (3 por integrante), tipos compartidos, y responsables.
- Acuerdos:
  - Enfoque code-first, Apollo Landing Page habilitado.
  - Reutilizar `ServiceHttp` para centralizar llamadas REST y cache TTL.
  - Implementar DataLoader para relaciones en `reportes` y `comentarios`.

## Distribución de las 9 consultas (3×3)
- Carlos Delgado (Agregación):
  - topAreasConMasReportes(limite)
  - tableroEtiquetas(limite)
  - resumenUsuario(id)
- Jeremy Vera (Análisis):
  - rankingUsuariosPorAportes(limite)
  - reportesPorEtiquetaConPromedio(etiqueta)
  - etiquetasCoocurrentes(etiqueta, limite)
- Cinthia Zambrano (Búsqueda avanzada):
  - tendenciasComentariosPorSemana(desde?, hasta?)
  - reportesPorAreaYCategoria(areaId, categoriaId)
  - buscadorReportesAvanzado(texto, areaId?, categoriaId?, estadoId?)

## Cronograma de trabajo
- 2025-10-23 (1h): Diseño de tipos e inputs, acuerdos y división.
- 2025-10-24 (1h): Implementación de resolvers, DataLoader, pruebas y documentación.

## Evidencia de coordinación
- README con sección 3×3 y enlaces a docs.
- Commits descriptivos por funcionalidad (analytics, resolvers, docs).
- Colección de queries: `docs/queries.graphql`.

> Nota: Si es necesario evidenciar coautoría en commits, utilizar `Co-authored-by:` en mensajes de commit o Pull Requests separados por integrante.
