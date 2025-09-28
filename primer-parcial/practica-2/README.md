# 🎯 Práctica 2 - Sistema de Reseñas de Infraestructuras ULEAM

## Entidad: Puntuación

### 👥 Integrante y Contribuciones

- **Estudiante**: [Vera Mero Jereny Jhonnayker]
- **Práctica**: Práctica Complementaria #2
- **Entidad Desarrollada**: Puntuación (Sistema de Reseñas)
- **Contribuciones**: Implementación completa de CRUD con paradigmas asíncronos

### 🏗 Arquitectura del Sistema

#### 📁 Estructura de Capas

```
src/
├── domain/                    # Capa de Dominio
│   ├── dto/
│   │   └── crearPuntuacion.dto.ts
│   ├── puntuaciones/
│   │   └── puntuacion.ts      # Entidad + Interfaz
│   └── servicio.ts            # Interface del servicio
├── service/                   # 🏗️ Capa de INFRASTRUCTURE + APPLICATION
│   ├── puntuacion.ts          # Repositorio CRUD (Infrastructure)
│   └── servicio.ts            # Servicio de aplicación (Application)
└── app.ts                     # Capa de Presentación (Presentation)
```

#### 🎯 Principios Aplicados

- **SOLID**: Single Responsibility, Dependency Inversion
- **Domain-Driven Design**: Separación clara del dominio de negocio
- **Arquitectura en Capas**: Domain, Application, Infrastructure, Presentation
- **Repository Pattern**: Abstracción del acceso a datos

> **📝 Nota Arquitectónica**: El directorio `src/service/` representa las capas de **Infrastructure** (repositorio) y **Application** (servicio) combinadas, siguiendo las convenciones del proyecto académico.

### 📦 Instalación

#### Prerrequisitos

```bash
Node.js >= 18.0.0
TypeScript >= 5.0.0
```

#### Pasos de Instalación

```bash
# 1. Clonar o descargar el proyecto
cd practica2

# 2. Instalar dependencias
npm install

# 3. Compilar TypeScript (opcional)
npm run build
```

### 🚀 Instrucciones de Ejecución

#### Ejecutar Pruebas Principales

```bash
# Opción 1: Ejecución directa con ts-node
npm start

# Opción 2: Modo desarrollo (con watch)
npm run dev

# Opción 3: Ejecutar pruebas
npm test
```

#### Comandos Manuales

```bash
# Ejecutar directamente con ts-node
npx ts-node src/app.ts

# Compilar y ejecutar
npm run build && node dist/app.js
```

### 🛠️ Desarrollo y Contribución

#### Requisitos del Sistema

- **Node.js**: >= 18.0.0
- **NPM**: >= 8.0.0
- **TypeScript**: >= 5.0.0

#### Setup para Desarrolladores

```bash
# 1. Clonar el repositorio
git clone <tu-repositorio>
cd practica2

# 2. Instalar dependencias
npm install

# 3. Verificar funcionamiento
npm start

# 4. Desarrollo en tiempo real
npm run dev
```

#### Estructura de Pruebas

El archivo `src/app.ts` contiene 12 pruebas funcionales que validan:

- ✅ **Paradigmas asíncronos**: Callbacks, Promises (.then/.catch), Async/Await
- ✅ **Operaciones CRUD**: Create, Read, Update, Delete
- ✅ **Validaciones de negocio**: Rangos, tipos de datos, existencia
- ✅ **Manejo de errores**: Try/catch, callbacks con errores, promises rejection
- ✅ **Arquitectura en capas**: Separación de responsabilidades

### 📚 Documentación de APIs

#### 🏛 Entidad Puntuación

```typescript
interface IPuntuacion {
  id_puntuacion: number; // Identificador único
  id_usuario: number; // ID del usuario que califica
  id_reporte: number; // ID del reporte calificado
  valor: number; // Puntuación (1-5 estrellas)
  fecha: Date; // Fecha de la puntuación
}
```

#### 📝 DTO para Creación

```typescript
interface DtoCrearPuntuacion {
  id_usuario: number;
  id_reporte: number;
  valor: number; // Rango: 1-5
  fecha: Date;
}
```

#### 🔧 Operaciones CRUD Disponibles

| Operación       | Método                  | Paradigma       | Descripción                    |
| --------------- | ----------------------- | --------------- | ------------------------------ |
| **CREATE**      | `crear()`               | **Callbacks**   | Crear nueva puntuación         |
| **READ**        | `consultar()`           | **Async/Await** | Obtener puntuación por ID      |
| **READ ALL**    | `obtenerTodas()`        | **Async/Await** | Listar todas las puntuaciones  |
| **READ FILTER** | `obtenerPorReporte()`   | **Async/Await** | Filtrar por reporte            |
| **UPDATE**      | `actualizar()`          | **Promises**    | Modificar puntuación existente |
| **DELETE**      | `eliminar()`            | **Async/Await** | Eliminar puntuación            |
| **STATS**       | `obtenerEstadisticas()` | **Async/Await** | Estadísticas generales         |

### 🔗 APIs Internas del Sistema

#### 📚 Repositorio: `Crud_Puntuacion`

##### 📝 CREATE - `crear(callback)`

```typescript
// Patrón: (error, resultado)
crear(nuevaPuntuacion: DtoCrearPuntuacion, callback: (error?: string, resultado?: IPuntuacion) => void): void

// ✅ Ejemplo de uso:
crud_repositorio.crear(nuevaPuntuacion, (error, resultado) => {
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Puntuación creada:", resultado);
    }
});

// 🎯 Características:
// • Paradigma: Callbacks
// • Validación automática (1-5 estrellas)
// • Generación de UUID automática
// • Simulación de latencia: 1000ms
```

##### 📋 READ - `consultar()`, `obtenerTodas()`, `obtenerPorReporte()`

```typescript
// Async/Await pattern
async consultar(id: string): Promise<IPuntuacion>
async obtenerTodas(): Promise<IPuntuacion[]>
async obtenerPorReporte(idReporte: number): Promise<IPuntuacion[]>

// ✅ Ejemplos de uso:
try {
    const puntuacion = await crud_repositorio.consultar("uuid-aqui");
    const todas = await crud_repositorio.obtenerTodas();
    const porReporte = await crud_repositorio.obtenerPorReporte(2001);
} catch (error) {
    console.error("Error:", error.message);
}

// 🎯 Características:
// • Paradigma: Async/Await con try/catch
// • Búsqueda por UUID o filtros
// • Simulación de latencia: 800ms
```

##### ✏ UPDATE - `actualizar().then().catch()`

```typescript
// Promise pattern con encadenamiento
actualizar(id: string, nuevaPuntuacion: IPuntuacion): Promise<IPuntuacion>

// ✅ Ejemplo de uso REQUERIDO:
crud_repositorio.actualizar("uuid-aqui", nuevaPuntuacion)
    .then((resultado) => {
        console.log("Actualización exitosa:", resultado);
    })
    .catch((error) => {
        console.error("Error en actualización:", error);
    });

// 🎯 Características:
// • Paradigma: Promises con .then().catch()
// • Validación de existencia previa
// • Simulación de latencia: 1500ms
```

##### 🗑 DELETE - `eliminar()`

```typescript
// Async/Await pattern
async eliminar(id: string): Promise<boolean>

// ✅ Ejemplo de uso:
try {
    const eliminado = await crud_repositorio.eliminar("uuid-aqui");
    console.log("Eliminación exitosa:", eliminado);
} catch (error) {
    console.error("Error:", error.message);
}

// 🎯 Características:
// • Paradigma: Async/Await
// • Retorna boolean de confirmación
// • Simulación de latencia: 1200ms
```

##### 📊 STATS - `obtenerEstadisticas()`

```typescript
// Async/Await pattern
async obtenerEstadisticas(): Promise<{total: number, promedio: number}>

// ✅ Ejemplo de uso:
const stats = await crud_repositorio.obtenerEstadisticas();
console.log(`Total: ${stats.total}, Promedio: ${stats.promedio}`);

// 🎯 Características:
// • Cálculo automático de métricas
// • Promedio con 1 decimal de precisión
```

#### 🏛 Servicio: `Crud_PuntuacionServicio`

```typescript
class Crud_PuntuacionServicio implements IServicio {
  constructor(private repositorio: IPuntuacionRepositorio) {}

  // Métodos que encapsulan la lógica de negocio:
  async crear(callback): Promise<void>; // Delegación a repositorio
  async consultar(id): Promise<IPuntuacion>; // + Logging con Chalk
  async obtenerTodas(): Promise<IPuntuacion[]>; // + Validaciones adicionales
  async actualizar(id, data): Promise<IPuntuacion>; // + Manejo de errores
  async eliminar(id): Promise<boolean>; // + Confirmaciones
  async obtenerEstadisticas(): Promise<Stats>; // + Formateo de datos
}

// ✅ Ejemplo de uso con Dependency Injection:
const servicio = new Crud_PuntuacionServicio(repositorio);
const resultado = await servicio.consultar("uuid-aqui");
```

### ⚡ Paradigmas Implementados

#### 📝 CREATE - Callbacks

```typescript
// Patrón (error, resultado)
crear(nuevaPuntuacion: DtoCrearPuntuacion, callback: (error?: string, resultado?: IPuntuacion) => void): void {
    setTimeout(() => {
        // Validaciones
        if (!nuevaPuntuacion.valor || nuevaPuntuacion.valor < 1 || nuevaPuntuacion.valor > 5) {
            return callback("Error: El valor debe estar entre 1 y 5");
        }
        // Inserción exitosa
        callback(null, puntuacionCreada);
    }, 1000); // Simulación de latencia
}
```

#### ✏ UPDATE - Promises

```typescript
// Encadenamiento con .then() y .catch()
actualizar(id: string, nuevaPuntuacion: IPuntuacion): Promise<IPuntuacion> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const indice = puntuaciones.findIndex(p => p.uuid === id);
            if (indice === -1) {
                return reject(new Error("Puntuación no encontrada"));
            }
            // Actualización exitosa
            resolve(puntuacionActualizada);
        }, 1500);
    });
}
```

#### 📋 READ/DELETE - Async/Await

```typescript
// Manejo con try/catch
async consultar(id: string): Promise<IPuntuacion> {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const puntuacion = puntuaciones.find(p => p.uuid === id);
        if (!puntuacion) {
            throw new Error("No se encontró la puntuación");
        }
        return puntuacion;
    } catch (error) {
        throw error;
    }
}
```

### 📊 Evidencias de Funcionamiento

#### 🎬 Salida de Consola Esperada

```
🚀 === SISTEMA DE RESEÑAS DE INFRAESTRUCTURAS ULEAM ===
📊 Entidad: PUNTUACION
🔧 Arquitectura: Domain-Driven Design con paradigmas asíncronos

📋 === CONSULTA INICIAL - LISTADO COMPLETO ===
✅ Se obtuvieron 10 puntuaciones
Total de puntuaciones en el sistema: 10

📊 === ESTADÍSTICAS INICIALES ===
📊 Estadísticas: 10 puntuaciones, promedio: 3.8

📝 === CREACIÓN DE NUEVA PUNTUACIÓN (CALLBACKS) ===
🔄 Creando puntuación con datos: {...}
✅ Puntuación creada exitosamente: {...}

✏ === ACTUALIZACIÓN DE PUNTUACIÓN (PROMISES) ===
🔄 Actualizando puntuación ID 1 con nuevos datos: {...}
✅ Puntuación actualizada exitosamente: {...}

🗑 === ELIMINACIÓN DE PUNTUACIÓN (ASYNC/AWAIT) ===
🔄 Eliminando puntuación con ID 10...
✅ Puntuación eliminada exitosamente
✅ Resultado de eliminación: true

🎉 === TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===
✅ CALLBACKS implementados correctamente en CREATE
✅ PROMISES implementadas correctamente en UPDATE
✅ ASYNC/AWAIT implementado correctamente en READ y DELETE
```

#### 💾 Datos de Prueba Incluidos

- **10 registros realistas** de puntuaciones
- Usuarios del 1001 al 1010
- Reportes del 2001 al 2005
- Puntuaciones del 1 al 5 estrellas
- Fechas realistas de enero 2024

#### 🧪 Validaciones Implementadas

- ✅ Valor entre 1 y 5 estrellas
- ✅ IDs válidos (> 0)
- ✅ Fechas no futuras
- ✅ Existencia de registros antes de modificar/eliminar
- ✅ Manejo elegante de errores

### 🔬 Testing y Validación

#### 📋 Casos de Prueba Cubiertos

1. **Listado inicial** - Verificar datos precargados
2. **Consulta individual** - Buscar por ID específico
3. **Consulta filtrada** - Obtener puntuaciones por reporte
4. **Creación con callbacks** - Insertar nueva puntuación
5. **Actualización con promises** - Modificar puntuación existente
6. **Eliminación con async/await** - Borrar registro
7. **Validaciones de negocio** - Comprobar restricciones
8. **Manejo de errores** - Verificar comportamiento ante fallos
9. **Estadísticas** - Calcular métricas del sistema
10. **Integridad de datos** - Verificar consistencia

### 🎓 Conclusiones Individuales

#### ✅ Logros Alcanzados

1. **Arquitectura Robusta**: Implementación exitosa de arquitectura en 4 capas siguiendo principios SOLID
2. **Paradigmas Asíncronos**: Correcta aplicación de callbacks, promises y async/await según requerimientos específicos
3. **Dominio de Negocio**: Modelado apropiado de la entidad Puntuación con validaciones de negocio
4. **Separación de Responsabilidades**: Clara distinción entre capas de dominio, aplicación e infraestructura
5. **Calidad de Código**: Implementación de manejo de errores, validaciones y logging consistente

#### 📈 Competencias Desarrolladas

- **TypeScript Avanzado**: Uso de interfaces, clases y tipado estático
- **Programación Asíncrona**: Dominio de los 3 paradigmas principales en JavaScript
- **Arquitectura de Software**: Aplicación práctica de patrones de diseño empresariales
- **Testing Funcional**: Implementación de suite de pruebas completa
- **Documentación Técnica**: Creación de documentación clara y completa

#### 🔄 Aspectos Mejorados

- **Entendimiento de Callbacks**: Implementación correcta del patrón (error, resultado)
- **Manejo de Promises**: Uso apropiado de resolve/reject y encadenamiento
- **Async/Await**: Aplicación eficiente con try/catch para manejo de errores
- **Simulación de Latencia**: Recreación realista de operaciones de red
- **Validación de Datos**: Implementación robusta de reglas de negocio

#### 🎯 Aplicación Práctica

Este proyecto sienta las bases sólidas para:

- Desarrollo de APIs REST reales
- Integración con bases de datos
- Implementación de autenticación y autorización
- Escalabilidad hacia microservicios
- Testing automatizado

#### 💡 Reflexión Final

La implementación de esta práctica ha proporcionado una comprensión profunda de los fundamentos de la arquitectura backend moderna, preparando el terreno para desarrollos más complejos en el ámbito empresarial.

---

### 📞 Contacto

**Desarrollador**: [Jereny Vera Mero]  
**Proyecto**: Práctica Complementaria #2 - Arquitectura Backend  
**Institución**: Universidad Laica Eloy Alfaro de Manabí (ULEAM)  
**Fecha**: Septiembre 2025

---

\_Este proyecto cumple con todos los requisitos establecidos en la práctica complementaria, implementando correctamente los paradigmas asíncronos requeridos y siguiendo las mejores prácticas de arquitectura de software mandadas por el docente Jhonn Cevallos.
