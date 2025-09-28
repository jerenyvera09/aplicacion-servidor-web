export interface IPuntuacion {
    id_puntuacion: string; // UUID como string
    id_usuario: number;
    id_reporte: number;
    valor: number;
    fecha: Date;
}

export class Puntuacion implements IPuntuacion {
    public id_puntuacion: string; // UUID como string
    public id_usuario: number;
    public id_reporte: number;
    public valor: number;
    public fecha: Date;

    constructor(id_puntuacion: string, id_usuario: number, id_reporte: number, valor: number, fecha: Date) {
        this.id_puntuacion = id_puntuacion;
        this.id_usuario = id_usuario;
        this.id_reporte = id_reporte;
        this.valor = valor;
        this.fecha = fecha;
    }

    // Validaciones de negocio
    validarValor(): boolean {
        return this.valor >= 1 && this.valor <= 5;
    }

    validarFecha(): boolean {
        return this.fecha <= new Date();
    }

    esPuntuacionValida(): boolean {
        return this.validarValor() && this.validarFecha() && 
               this.id_usuario > 0 && this.id_reporte > 0;
    }
}