// #hecho por Jereny Vera Mero
// Clasificación Taller:
// Integrante 3 (Entidad Transaccional / Métrica) - Jereny Vera Mero
// Motivo: Puntuación representa interacción dinámica cuantitativa.

    import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
    import { Usuario } from "./usuario.entidad";
    import { Reporte } from "./reporte.entidad";

    @Entity("puntuaciones")
    export class Puntuacion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

      @ManyToOne(() => Usuario, (usuario) => usuario.puntuaciones, { eager: true })
      usuario!: Usuario;

      @ManyToOne(() => Reporte, (reporte) => reporte.puntuaciones, { onDelete: "CASCADE", eager: true })
      reporte!: Reporte;

      @Column({ type: "int" })
      valor!: number;

      @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
      fecha!: Date;

      @Column({ nullable: true })
      comentario?: string;

      @Column({ nullable: true })
      origen?: string;
    }
