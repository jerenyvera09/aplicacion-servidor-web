// #hecho por Carlos Delgado
// Clasificación Taller:
// Integrante 2 (Entidades de Negocio Principal) - Carlos Delgado
// Motivo: Reporte es la entidad núcleo sobre la cual giran las operaciones.

    import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
    import { Usuario } from "./usuario.entidad";
    import { Categoria } from "./categoria.entidad";
    import { ArchivoAdjunto } from "./archivoAdjunto.entidad";
    import { Area } from "./area.entidad";
    import { EstadoReporte } from "./estadoReporte.entidad";
    import { Comentario } from "./comentario.entidad";
    import { Puntuacion } from "./puntuacion.entidad";

    @Entity("reportes")
    export class Reporte {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

      @ManyToOne(() => Usuario, (usuario) => usuario.reportes, { eager: true })
      usuario!: Usuario;

      @Column()
      titulo!: string;

      @Column({ type: "text" })
      descripcion!: string;

      @Column({ nullable: true })
      ubicacion?: string;

  @Column({ nullable: true })
  prioridad?: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion!: Date;

      @ManyToOne(() => Categoria, (categoria) => categoria.reportes, { eager: true })
      categoria!: Categoria;

      @ManyToOne(() => Area, (area) => area.reportes, { eager: true })
      area!: Area;

      @ManyToOne(() => EstadoReporte, (estado) => estado.reportes, { eager: true })
      estado!: EstadoReporte;

      @OneToMany(() => ArchivoAdjunto, (archivo) => archivo.reporte, { cascade: true })
      archivos!: ArchivoAdjunto[];

      @OneToMany(() => Comentario, (comentario) => comentario.reporte)
      comentarios!: Comentario[];

      @OneToMany(() => Puntuacion, (p) => p.reporte)
      puntuaciones!: Puntuacion[];
    }
