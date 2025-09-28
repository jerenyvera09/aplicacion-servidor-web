import { IPuntuacion } from "../domain/puntuaciones/puntuacion";
import { DtoCrearPuntuacion } from "../domain/dto/crearPuntuacion.dto";
import { IPuntuacionRepositorio } from "../domain/repositorio";
import { Crud_Puntuacion } from "./puntuacion";
import chalk from 'chalk';

// Inyección de Dependencias - El repositorio se inyecta en el constructor

// Patrón singleton para el servicio
const dtoPuntuacionServicio: DtoCrearPuntuacion = { 
    id_usuario: 0, 
    id_reporte: 0, 
    valor: 0, 
    fecha: new Date() 
};

const actualizarPuntuacionServicio: IPuntuacion = { 
    id_puntuacion: "00000000-0000-0000-0000-000000000000", // UUID dummy
    id_usuario: 0, 
    id_reporte: 0, 
    valor: 0, 
    fecha: new Date() 
};

// Función para manejar errores de manera consistente
function manejar_error(error?: string, resolve?: (value: any) => void, reject?: (reason?: any) => void) {
    if (error) {
        console.log(`❌ Error: ${error}`);
        if (reject) reject(error);
    } else {
        if (resolve) resolve("Success");
    }
}

export class Crud_PuntuacionServicio {
    // Inyección de Dependencias - El repositorio se inyecta como dependencia
    private repositorio: IPuntuacionRepositorio;

    constructor(repositorio: IPuntuacionRepositorio) {
        this.repositorio = repositorio;
    }

    //  CREATE - Usando CALLBACKS según requerimiento
    crear(nuevaPuntuacion: DtoCrearPuntuacion): Promise<IPuntuacion> {
        return new Promise((resolve, reject) => {
            this.repositorio.crear(nuevaPuntuacion, (error: string | undefined, resultado: IPuntuacion | undefined) => {
                if (error) {
                    console.log(chalk.red(`❌ Error al crear: ${error}`));
                    reject(error);
                } else if (resultado) {
                    console.log(chalk.green(`✅ Puntuación creada exitosamente:`), resultado);
                    resolve(resultado);
                } else {
                    reject("Error desconocido al crear puntuación");
                }
            });
        });
    }

    // ✏ UPDATE - Usando PROMISES según requerimiento
    actualizar(id: string, nuevaPuntuacion: IPuntuacion): Promise<IPuntuacion> {
        return this.repositorio.actualizar(id, nuevaPuntuacion)
            .then((resultado: IPuntuacion) => {
                console.log(chalk.green(`✅ Puntuación actualizada exitosamente:`), resultado);
                return resultado;
            })
            .catch((error: Error) => {
                console.log(chalk.red(`❌ Error al actualizar: ${error.message}`));
                throw error;
            });
    }

    //  READ - Usando ASYNC/AWAIT según requerimiento
    async consultar(id: string): Promise<IPuntuacion> {
        try {
            const puntuacion = await this.repositorio.consultar(id);
            console.log(chalk.green(`✅ Puntuación consultada exitosamente:`), puntuacion);
            return puntuacion;
        } catch (error) {
            console.log(chalk.red(`❌ Error al consultar: ${error}`));
            throw error;
        }
    }

    //  READ ALL - Usando ASYNC/AWAIT
    async obtenerTodas(): Promise<IPuntuacion[]> {
        try {
            const puntuaciones = await this.repositorio.obtenerTodas();
            console.log(`✅ Se obtuvieron ${puntuaciones.length} puntuaciones`);
            return puntuaciones;
        } catch (error) {
            console.log(`❌ Error al obtener puntuaciones: ${error}`);
            throw error;
        }
    }

    //  READ BY REPORTE - Usando ASYNC/AWAIT
    async obtenerPorReporte(id_reporte: number): Promise<IPuntuacion[]> {
        try {
            const puntuaciones = await this.repositorio.obtenerPorReporte(id_reporte);
            console.log(`✅ Se encontraron ${puntuaciones.length} puntuaciones para el reporte ${id_reporte}`);
            return puntuaciones;
        } catch (error) {
            console.log(`❌ Error al obtener puntuaciones por reporte: ${error}`);
            throw error;
        }
    }

    // 🗑 DELETE - Usando ASYNC/AWAIT según requerimiento
    async eliminar(id: string): Promise<boolean> {
        try {
            const resultado = await this.repositorio.eliminar(id);
            console.log(`✅ Puntuación eliminada exitosamente`);
            return resultado;
        } catch (error) {
            console.log(`❌ Error al eliminar: ${error}`);
            throw error;
        }
    }

    // Método adicional para estadísticas
    async obtenerEstadisticas(): Promise<{ total: number, promedio: number }> {
        try {
            const stats = await this.repositorio.obtenerEstadisticas();
            console.log(`📊 Estadísticas: ${stats.total} puntuaciones, promedio: ${stats.promedio}`);
            return stats;
        } catch (error) {
            console.log(`❌ Error al obtener estadísticas: ${error}`);
            throw error;
        }
    }
}