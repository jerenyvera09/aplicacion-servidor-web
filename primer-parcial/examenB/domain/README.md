# Módulo de Dominio

## Propósito

Este módulo encapsula el núcleo del dominio del examen (selección de vehículo, cobertura y registro de conductor), aislando las **entidades**, **repositorios** (interfaces), **mocks** y **casos de uso**. Su objetivo es modelar la lógica y estructuras del negocio, sin exponer controladores ni lógica web.

## Entidades del dominio

- **Conductor**: Representa a la persona que será asegurada. Propiedades: `id`, `nombreCompleto`, `edad`, `tipoLicencia`.
- **Vehiculo**: Representa el vehículo a asegurar. Propiedades: `id`, `tipo`, `marca`, `modelo`, `anio`.
- **Cobertura**: Representa el tipo de cobertura seleccionada. Propiedades: `id`, `nombre`, `descripcion`, `factorRiesgo`.

## Repositorios e implementaciones mock

- Interfaces en `domain/repositorios/`:
  - `IConductorRepo`, `IVehiculoRepo`, `ICoberturaRepo` definen operaciones básicas de consulta (obtener todos, buscar por id).
- Mocks en `domain/mocks/`:
  - `MockConductorRepo`, `MockVehiculoRepo`, `MockCoberturaRepo` proveen datos en memoria para pruebas y demostración del flujo.

## Casos de uso existentes

- `registrar-conductor.usecase.ts`: Orquesta la consulta de conductores desde el repositorio (simula registro básico retornando el listado disponible).
- `seleccionar-vehiculo.usecase.ts`: Permite seleccionar un vehículo por `id` desde el repositorio.
- `seleccionar-cobertura.usecase.ts`: Permite seleccionar una cobertura por `id` desde el repositorio.
- `generar-cotizacion.usecase.ts`: Consolida el flujo de selección (conductor, vehículo, cobertura) y calcula un precio estimado sencillo basado en la antigüedad del vehículo y el `factorRiesgo` de la cobertura.

## DTOs

Se agregan DTOs simples en `domain/dtos/` (sin decoradores ni validaciones), reflejando las propiedades de cada entidad:

- `ConductorDTO`: `id`, `nombreCompleto`, `edad`, `tipoLicencia`.
- `VehiculoDTO`: `id`, `tipo`, `marca`, `modelo`, `anio`.
- `CoberturaDTO`: `id`, `nombre`, `descripcion`, `factorRiesgo`.

## Justificación del diseño según las imágenes del examen

Las imágenes muestran un flujo de **selección de vehículo**, **selección de cobertura** y **captura de datos del conductor** para posteriormente generar una cotización. El diseño del dominio refleja estas etapas mediante:

- Entidades separadas: vehículo, cobertura y conductor, facilitando la composición del flujo.
- Repositorios con contratos claros y mocks para datos en memoria, permitiendo probar el flujo sin infraestructura.
- Casos de uso orientados a las acciones clave del flujo (seleccionar, consultar/registrar), evitando dependencias con la capa web.
- Un caso de uso final de consolidación (`generar-cotizacion`) que representa la culminación del proceso mostrado (botón de "Generar cotización").

Este enfoque mantiene el dominio **autónomo**, **testable** y alineado con el modelo mental del usuario (pantallas de selección y formulario), sin acoplarse a frameworks o protocolos externos.

## Restricciones de la Pregunta 1

- No se usan controladores.
- No se implementa REST ni HTTP.
- No se usa TypeORM.
- No se implementan casos de uso WEB.
- No se crean nuevos Value Objects.
- No se crean nuevas entidades.
- No se generan módulos externos.

Todo el trabajo se limita al módulo de dominio y a los DTOs requeridos.

## Módulo de dominio

Se provee un módulo de dominio mínimo (`domain.module.ts`) que instancia repositorios mock y expone los casos de uso para facilitar su orquestación en pruebas o demostraciones. No depende de NestJS ni de frameworks web.
