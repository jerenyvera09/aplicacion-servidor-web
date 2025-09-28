import { IPuntuacion, Puntuacion } from "../domain/puntuaciones/puntuacion";
import { DtoCrearPuntuacion } from "../domain/dto/crearPuntuacion.dto";
import { IPuntuacionRepositorio } from "../domain/repositorio";
import { v4 as uuidv4 } from 'uuid';

// Repositorio en memoria con datos de prueba (15 registros con UUIDs)
const puntuaciones: IPuntuacion[] = [
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440001",
        id_usuario: 1001,
        id_reporte: 2001,
        valor: 5,
        fecha: new Date("2024-01-15")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440002",
        id_usuario: 1002,
        id_reporte: 2001,
        valor: 4,
        fecha: new Date("2024-01-16")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440003",
        id_usuario: 1003,
        id_reporte: 2002,
        valor: 3,
        fecha: new Date("2024-01-17")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440004",
        id_usuario: 1004,
        id_reporte: 2002,
        valor: 5,
        fecha: new Date("2024-01-18")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440005",
        id_usuario: 1005,
        id_reporte: 2003,
        valor: 2,
        fecha: new Date("2024-01-19")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440006",
        id_usuario: 1006,
        id_reporte: 2003,
        valor: 4,
        fecha: new Date("2024-01-20")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440007",
        id_usuario: 1007,
        id_reporte: 2004,
        valor: 5,
        fecha: new Date("2024-01-21")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440008",
        id_usuario: 1008,
        id_reporte: 2004,
        valor: 3,
        fecha: new Date("2024-01-22")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-446655440009",
        id_usuario: 1009,
        id_reporte: 2005,
        valor: 4,
        fecha: new Date("2024-01-23")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-44665544000a",
        id_usuario: 1010,
        id_reporte: 2005,
        valor: 5,
        fecha: new Date("2024-01-24")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-44665544000b",
        id_usuario: 1011,
        id_reporte: 2006,
        valor: 4,
        fecha: new Date("2024-01-25")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-44665544000c",
        id_usuario: 1012,
        id_reporte: 2006,
        valor: 3,
        fecha: new Date("2024-01-26")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-44665544000d",
        id_usuario: 1013,
        id_reporte: 2007,
        valor: 5,
        fecha: new Date("2024-01-27")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-44665544000e",
        id_usuario: 1014,
        id_reporte: 2007,
        valor: 2,
        fecha: new Date("2024-01-28")
    },
    {
        id_puntuacion: "550e8400-e29b-41d4-a716-44665544000f",
        id_usuario: 1015,
        id_reporte: 2008,
        valor: 4,
        fecha: new Date("2024-01-29")
    }
];

export class Crud_Puntuacion implements IPuntuacionRepositorio {
    constructor() {
        // Inicialización del repositorio - Implementa IPuntuacionRepositorio para Inyección de Dependencias
    }

    //  CREATE con CALLBACKS - Patrón (error, resultado)
    crear(nuevaPuntuacion: DtoCrearPuntuacion, callback: (error?: string, resultado?: IPuntuacion) => void): void {
        // Simulación de latencia de red
        setTimeout(() => {
            try {
                // Validación de datos antes de insertar
                if (!nuevaPuntuacion.id_usuario || nuevaPuntuacion.id_usuario <= 0) {
                    return callback("Error: ID de usuario inválido");
                }
                
                if (!nuevaPuntuacion.id_reporte || nuevaPuntuacion.id_reporte <= 0) {
                    return callback("Error: ID de reporte inválido");
                }
                
                if (!nuevaPuntuacion.valor || nuevaPuntuacion.valor < 1 || nuevaPuntuacion.valor > 5) {
                    return callback("Error: El valor debe estar entre 1 y 5");
                }

                // Crear nueva puntuación con UUID
                const puntuacion: IPuntuacion = {
                    id_puntuacion: uuidv4(), // Generar UUID único
                    id_usuario: nuevaPuntuacion.id_usuario,
                    id_reporte: nuevaPuntuacion.id_reporte,
                    valor: nuevaPuntuacion.valor,
                    fecha: nuevaPuntuacion.fecha
                };

                // Insertar en el repositorio
                puntuaciones.push(puntuacion);
                
                // Callback exitoso - primer parámetro undefined, segundo el resultado
                callback(undefined, puntuacion);
                
            } catch (error) {
                callback("Error interno al crear puntuación");
            }
        }, 1000); // Simulación de latencia de 1 segundo
    }

    // ✏ UPDATE con PROMISES - Encadenamiento con .then() y .catch()
    actualizar(id: string, nuevaPuntuacion: IPuntuacion): Promise<IPuntuacion> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Validación de existencia del registro
                    const indice = puntuaciones.findIndex((p) => p.id_puntuacion === id);
                    
                    if (indice === -1) {
                        return reject(new Error("Puntuación no encontrada"));
                    }
                    
                    // Validaciones de negocio
                    if (nuevaPuntuacion.valor < 1 || nuevaPuntuacion.valor > 5) {
                        return reject(new Error("El valor debe estar entre 1 y 5"));
                    }
                    
                    // Actualización parcial de campos
                    const puntuacionActualizada: IPuntuacion = {
                        ...puntuaciones[indice],
                        ...nuevaPuntuacion,
                        id_puntuacion: id // Mantener el UUID original
                    };
                    
                    puntuaciones[indice] = puntuacionActualizada;
                    
                    resolve(puntuacionActualizada);
                    
                } catch (error) {
                    reject(new Error("Error interno al actualizar puntuación"));
                }
            }, 1500); // Simulación de latencia de 1.5 segundos
        });
    }

    //  READ con ASYNC/AWAIT - Consultas individuales y listados
    async consultar(id: string): Promise<IPuntuacion> {
        try {
            // Simulación de operación asíncrona
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const puntuacion = puntuaciones.find((p) => p.id_puntuacion === id);
            
            if (!puntuacion) {
                throw new Error("No se encontró la puntuación");
            }
            
            return puntuacion;
            
        } catch (error) {
            throw error;
        }
    }

    //  READ MULTIPLE con ASYNC/AWAIT - Listado completo
    async obtenerTodas(): Promise<IPuntuacion[]> {
        try {
            // Simulación de operación asíncrona
            await new Promise(resolve => setTimeout(resolve, 600));
            
            return [...puntuaciones]; // Retorna copia del array
            
        } catch (error) {
            throw new Error("Error al obtener puntuaciones");
        }
    }

    //  READ BY REPORTE con ASYNC/AWAIT
    async obtenerPorReporte(id_reporte: number): Promise<IPuntuacion[]> {
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            
            return puntuaciones.filter(p => p.id_reporte === id_reporte);
            
        } catch (error) {
            throw new Error("Error al obtener puntuaciones por reporte");
        }
    }

    // 🗑 DELETE con ASYNC/AWAIT - Validación y manejo elegante
    async eliminar(id: string): Promise<boolean> {
        try {
            // Simulación de operación asíncrona
            await new Promise(resolve => setTimeout(resolve, 900));
            
            // Validación de existencia antes de eliminar
            const indice = puntuaciones.findIndex((p) => p.id_puntuacion === id);
            
            if (indice === -1) {
                throw new Error("Puntuación no encontrada para eliminar");
            }
            
            // Eliminación física del registro
            puntuaciones.splice(indice, 1);
            
            return true; // Retorna boolean indicando éxito
            
        } catch (error) {
            throw error; // Manejo elegante de errores
        }
    }

    // Método auxiliar para obtener estadísticas
    async obtenerEstadisticas(): Promise<{ total: number, promedio: number }> {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (puntuaciones.length === 0) {
                return { total: 0, promedio: 0 };
            }
            
            const total = puntuaciones.length;
            const suma = puntuaciones.reduce((acc, p) => acc + p.valor, 0);
            const promedio = suma / total;
            
            return { total, promedio: Math.round(promedio * 100) / 100 };
            
        } catch (error) {
            throw new Error("Error al calcular estadísticas");
        }
    }
}