// #hecho por Jereny Vera Mero
// Clasificación Taller:
// Integrante 3 (Entidades Transaccionales) - Jereny Vera Mero
// Motivo: Comentario es interacción dinámica sobre los reportes.

    import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
    import { Usuario } from "./usuario.entidad";
    import { Reporte } from "./reporte.entidad";
    import { Etiqueta } from "./etiqueta.entidad";

    @Entity("comentarios")
    export class Comentario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

      @ManyToOne(() => Usuario, (usuario) => usuario.comentarios, { eager: true })
      usuario!: Usuario;

      @ManyToOne(() => Reporte, (reporte) => reporte.comentarios, { onDelete: "CASCADE", eager: true })
      reporte!: Reporte;

      @Column({ type: "text" })
      contenido!: string;

      @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
      fecha!: Date;

  @Column({ nullable: true })
  titulo?: string;

  @Column({ type: 'boolean', default: true })
  es_publico!: boolean;

      @ManyToMany(() => Etiqueta, (etiqueta) => etiqueta.comentarios, { cascade: true })
      @JoinTable({ name: "comentario_etiquetas" })
      etiquetas!: Etiqueta[];
    }
