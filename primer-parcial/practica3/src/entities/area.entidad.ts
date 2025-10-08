// #hecho por Carlos Delgado
// Clasificación Taller:
// Integrante 2 (Entidades de Negocio Principal / Contexto) - Carlos Delgado
// Motivo: Área contextualiza dónde ocurre el reporte.

    import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
    import { Reporte } from "./reporte.entidad";

    @Entity("areas")
    export class Area {
      @PrimaryGeneratedColumn("uuid")
      id!: string;

      @Column()
      nombre!: string;

      @Column({ nullable: true })
      responsable?: string;

      @Column({ nullable: true })
      ubicacion?: string;

      @Column({ nullable: true })
      descripcion?: string;

      @OneToMany(() => Reporte, (reporte) => reporte.area)
      reportes!: Reporte[];
    }
