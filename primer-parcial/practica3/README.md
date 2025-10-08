# Práctica 3 - Sistema de Reseñas de Infraestructura

Proyecto con **TypeORM + SQLite + TypeScript** (TypeORM puro).

## Estructura

- `src/data-source.ts` — Conexión a SQLite (#hecho por Cinthia Zambrano)
- `src/entities/` — Entidades y relaciones (archivos/clases en español, carpetas en inglés)
- `src/services/` — Servicios CRUD (cinco métodos por entidad)
- `src/utils/datosPrueba.ts` — Seeding (#hecho por Jereny Vera Mero)
- `src/main.ts` — Script principal con pruebas y mensajes de colores (#hecho por Jereny Vera Mero)

## Ejecutar

```bash
npm install
npm run start
```

Se creará automáticamente `database.sqlite` y se imprimirán mensajes de CRUD en consola.

## Entidades y relaciones (resumen)

Breve lista de entidades con sus columnas principales y relaciones clave:

- Usuario (`usuarios`): id, nombre, correo, contraseña, estado, rolId (ManyToOne -> Rol). Relaciones: reportes, comentarios, puntuaciones, etiquetas (ManyToMany).
- Rol (`roles`): id, nombre, descripcion, permisos, fecha_creacion. Relaciones: usuarios (OneToMany).
- Reporte (`reportes`): id, titulo, descripcion, ubicacion, prioridad, fecha_creacion. Relaciones: usuario (ManyToOne), categoria, area, estado, archivos, comentarios, puntuaciones.
- Categoria (`categorias`): id, nombre, descripcion, prioridad, estado. Relaciones: reportes.
- ArchivoAdjunto (`archivos_adjuntos`): id, nombre_archivo, tipo, url, tamano_kb. Relaciones: reporte (ManyToOne).
- Area (`areas`): id, nombre, responsable, ubicacion, descripcion. Relaciones: reportes.
- EstadoReporte (`estados_reporte`): id, nombre, descripcion, color, orden, es_final. Relaciones: reportes.
- Comentario (`comentarios`): id, contenido, fecha, titulo, es_publico. Relaciones: usuario, reporte, etiquetas (ManyToMany).
- Puntuacion (`puntuaciones`): id, valor, fecha, comentario, origen. Relaciones: usuario, reporte.
- Etiqueta (`etiquetas`): id, nombre, color, descripcion, slug. Relaciones: usuarios, comentarios.

## Diagrama Entidad-Relación (DER)

Se incluyó un DER simple generado a partir del modelo TypeORM en `docs/der.svg`.

## Cómo demostramos (dos enfoques)

Este proyecto incluye dos formas de interactuar con la persistencia, para mostrar tanto la API básica de TypeORM (como lo mostró el docente) como una capa de servicios más estructurada:

- Enfoque A (repo directo - estilo docente): uso directo de `AppDataSource.getRepository(<Entidad>)` y llamadas `create()`/`save()`/`find()` para demostrar el uso básico del repositorio. Hay un ejemplo en `src/main.ts` que crea y lista un `Usuario` de demostración antes de ejecutar el seed.
- Enfoque B (Service layer - recomendado): cada entidad tiene su servicio en `src/services/` que encapsula las operaciones CRUD (create, findAll, findOne, update, remove). `src/main.ts` también usa estos servicios para realizar el seeding y las pruebas CRUD.

Ambos enfoques se ejecutan con `npm run start` (el `main.ts` primero ejecuta el demo directo y luego el seeding/servicios).

## Notas técnicas importantes

- IDs: Las entidades usan UUIDs para la clave primaria (`@PrimaryGeneratedColumn("uuid")`) — los `id` son cadenas. Esto sigue la práctica recomendada vista en clase.
- AppDataSource: La configuración se encuentra en `src/data-source.ts` (importa `reflect-metadata`, lista todas las entidades y configura SQLite con `synchronize: true`).
- DER: `docs/der.svg` contiene un diagrama simplificado; si necesitas una versión PNG más detallada puedo generarla.

## Comandos útiles

```bash
npm install
npm run start    # ejecuta demo + seed + pruebas CRUD
# (opcional) si deseas un demo separado crearé src/demo/app.ts y un script "npm run demo"
```

## Notas

- Las relaciones clave están definidas en las entidades (decoradores TypeORM). Algunas relaciones usan `eager: true` para simplificar los ejemplos en `main.ts`.
- `synchronize: true` en `AppDataSource` permite sincronizar cambios de esquema durante desarrollo. No usar en producción.

## Ejecutar (Windows - cmd.exe)

```
npm install
npm run start
```

Esto inicializa la base de datos `database.sqlite`, ejecuta el seeding y realiza pruebas CRUD desde `src/main.ts`.

## Contribución por Integrante (Clasificación Taller)

De acuerdo al esquema del Taller (Integrante 1: Entidades Maestras / Catálogos; Integrante 2: Entidades de Negocio Principal; Integrante 3: Entidades Transaccionales), se asignó de la siguiente manera:

| Integrante | Rol en Taller | Entidades / Archivos Clave | Foco Principal |
|------------|---------------|-----------------------------|----------------|
| Cinthia Zambrano | Integrante 1 (Maestras / Base) | `Usuario`, `Rol`, conexión en `data-source.ts` | Definición de estructuras base y soporte a catálogos de roles / usuarios. |
| Carlos Delgado | Integrante 2 (Negocio Principal) | `Reporte`, `Categoria`, `Area`, `EstadoReporte`, `ArchivoAdjunto` | Modelado del núcleo funcional: ciclo de vida del reporte, clasificación y contexto. |
| Jereny Vera Mero | Integrante 3 (Transaccionales / Dinámicas) | `Comentario`, `Puntuacion`, `Etiqueta`, `utils/datosPrueba.ts`, `main.ts` | Interacciones dinámicas (feedback, métricas, metadatos) y seeding/demostración. |

Notas:
- Las etiquetas de autor en cada entidad (`// #hecho por ...`) y nuevos comentarios de clasificación documentan la responsabilidad.
- Las entidades se agrupan conceptualmente: Reporte y sus componentes (categoría, estado, área, adjuntos) constituyen el núcleo; Comentario/Puntuación/Etiqueta son transacciones y metadatos dinámicos; Usuario/Rol sirven como base de identidad y permisos.

## Decisiones de Diseño Relevantes

- Identificadores: Se optó por UUID para flexibilidad y evitar exposición incremental. Si el requerimiento académico exige entero autoincremental, se puede reemplazar `@PrimaryGeneratedColumn("uuid")` por `@PrimaryGeneratedColumn()` y regenerar la base eliminando `database.sqlite`.
- Uso de `eager: true` en algunas relaciones para simplificar la demostración rápida en consola. En un entorno productivo se recomendaría cargar relaciones de manera selectiva.
- Seeding idempotente: El script en `utils/datosPrueba.ts` verifica existencia antes de crear para permitir múltiples ejecuciones sin datos duplicados.

## Posibles Mejoras Futuras (No obligatorias en el Taller)

- Hash de contraseñas (bcrypt) y exclusión de campo sensible en respuestas.
- Migraciones en lugar de `synchronize: true`.
- Paginación y filtros en métodos `findAll()`.
- Validación de entrada con DTOs y `class-validator`.

