import { IPuntuacion } from "./puntuaciones/puntuacion";
import { DtoCrearPuntuacion } from "./dto/crearPuntuacion.dto";

export interface IPuntuacionServicio {
    crear(nuevaPuntuacion: DtoCrearPuntuacion, callback: (error?: string, result?: IPuntuacion) => void): void;
    actualizar(id: string, nuevaPuntuacion: IPuntuacion): Promise<IPuntuacion>;
    eliminar(id: string): Promise<boolean>;
    consultar(id: string): Promise<IPuntuacion>;
}