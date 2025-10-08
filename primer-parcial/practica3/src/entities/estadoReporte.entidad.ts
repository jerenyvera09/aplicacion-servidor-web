// #hecho por Carlos Delgado
// Clasificación Taller:
// Integrante 2 (Entidad de Negocio / Flujo de Estado) - Carlos Delgado
// Motivo: EstadoReporte regula el ciclo de vida del Reporte.

    import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
    import { Reporte } from "./reporte.entidad";

    @Entity("estados_reporte")
    export class EstadoReporte {
      @PrimaryGeneratedColumn("uuid")
      id!: string;

      @Column()
      nombre!: string;

      @Column({ nullable: true })
      descripcion?: string;

      @Column({ nullable: true })
      color?: string;

      @Column({ type: "int", default: 0 })
      orden!: number;

      @Column({ type: "boolean", default: false })
      es_final!: boolean;

      @OneToMany(() => Reporte, (reporte) => reporte.estado)
      reportes!: Reporte[];
    }
