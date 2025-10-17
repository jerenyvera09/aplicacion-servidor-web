# Práctica 4 - API REST con NestJS, TypeORM y SQLite

API para el Taller 4. Arquitectura en capas (Controller, Service, DTO, Entity) con NestJS + TypeORM + SQLite. Incluye validación global (`ValidationPipe`) y versionado de rutas (`/api/v1`).

## Requisitos
- Node.js LTS
- (Opcional) Postman / Thunder Client

## Instalación
```powershell
cd practica4
npm install
```

## Ejecutar en desarrollo
```powershell
npm run start:dev
```
API: http://localhost:3000/api/v1

## Configuración de BD
- SQLite en `practica4.sqlite`
- `synchronize: true` sólo para desarrollo.

## Entidades implementadas
- Maestras: `Categoria`, `EstadoReporte`, `Area`, `Etiqueta`, `Rol`
- Negocio: `Usuario`, `Reporte`
- Transaccionales: `Comentario`, `ArchivoAdjunto`, `Puntuacion`

Relaciones principales
- Reporte N:1 Categoria, Area, EstadoReporte, Usuario
- Reporte N:M Etiqueta; 1:N Comentario, ArchivoAdjunto, Puntuacion
- Comentario N:M Etiqueta; N:1 Reporte, Usuario
- Puntuacion N:1 Reporte, Usuario (opcional)

## Contribución por integrante
- Carlos Delgado (Entidades Maestras)
	- Categoria, EstadoReporte, Area, Etiqueta, Rol
- Jereny Vera (Entidades de Negocio)
	- Usuario, Reporte
- Cinthia Zambrano (Entidades Transaccionales)
	- Comentario, ArchivoAdjunto, Puntuacion

En cada archivo de entidad se añadió un comentario al inicio indicando el integrante y tipo de entidad.

## Endpoints base (GET)
- `/api/v1/roles`
- `/api/v1/usuarios`
- `/api/v1/categorias`
- `/api/v1/areas`
- `/api/v1/estados`
- `/api/v1/etiquetas`
- `/api/v1/reportes`
- `/api/v1/comentarios`
- `/api/v1/archivos`
- `/api/v1/puntuaciones`

## Ejemplos de uso rápido
1. Crear categoría
```json
POST /api/v1/categorias
{ "nombre": "Infraestructura", "descripcion": "Vías, alumbrado" }
```
2. Crear reporte (con relaciones)
```json
POST /api/v1/reportes
{
	"titulo": "Bache en la avenida",
	"descripcion": "Hueco grande a la altura del parque.",
	"categoriaId": 1,
	"areaId": 1,
	"estadoId": 1,
	"usuarioId": 1,
	"etiquetasIds": [1,2]
}
```
3. Crear comentario con etiquetas
```json
POST /api/v1/comentarios
{
	"reporteId": 1,
	"contenido": "Confirmo que el bache sigue allí.",
	"usuarioId": 1,
	"etiquetasIds": [2]
}
```

## Notas
- `synchronize: true` está habilitado solo para desarrollo.
- La validación de DTOs está activa; asegúrate de enviar tipos/IDs válidos.
