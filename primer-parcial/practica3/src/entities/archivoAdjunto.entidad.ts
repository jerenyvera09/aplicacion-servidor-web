// #hecho por Carlos Delgado
// Clasificación Taller:
// Integrante 2 (Entidades de Negocio Principal - Soporte) - Carlos Delgado
// Motivo: ArchivoAdjunto complementa al Reporte como parte del núcleo funcional.

    import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
    import { Reporte } from "./reporte.entidad";

    @Entity("archivos_adjuntos")
    export class ArchivoAdjunto {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

      @ManyToOne(() => Reporte, (reporte) => reporte.archivos, { onDelete: "CASCADE" })
      reporte!: Reporte;

      @Column()
      nombre_archivo!: string;

      @Column()
      tipo!: string;

      @Column()
      url!: string;

      @Column({ type: 'int', nullable: true })
      tamano_kb?: number;
    }
