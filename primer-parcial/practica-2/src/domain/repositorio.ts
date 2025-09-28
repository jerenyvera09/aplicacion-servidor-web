import { IPuntuacion } from "./puntuaciones/puntuacion";
import { DtoCrearPuntuacion } from "./dto/crearPuntuacion.dto";

// Interfaz para Inyección de Dependencias - Repository Pattern
export interface IPuntuacionRepositorio {
    crear(nuevaPuntuacion: DtoCrearPuntuacion, callback: (error?: string, resultado?: IPuntuacion) => void): void;
    actualizar(id: string, nuevaPuntuacion: IPuntuacion): Promise<IPuntuacion>;
    consultar(id: string): Promise<IPuntuacion>;
    obtenerTodas(): Promise<IPuntuacion[]>;
    obtenerPorReporte(id_reporte: number): Promise<IPuntuacion[]>;
    eliminar(id: string): Promise<boolean>;
    obtenerEstadisticas(): Promise<{ total: number, promedio: number }>;
}