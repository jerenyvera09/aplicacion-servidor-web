// #hecho por Jereny Vera Mero
// Clasificación Taller:
// Integrante 3 (Entidad Transaccional / Marcado flexible) - Jereny Vera Mero
// Motivo: Etiqueta actúa como metadato dinámico asociado a usuarios y comentarios.

    import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
    import { Usuario } from "./usuario.entidad";
    import { Comentario } from "./comentario.entidad";

    @Entity("etiquetas")
    export class Etiqueta {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

      @Column()
      nombre!: string;

      @Column({ nullable: true })
      color?: string;

      @Column({ nullable: true })
      descripcion?: string;

      @Column({ nullable: true })
      slug?: string;

      @ManyToMany(() => Usuario, (usuario) => usuario.etiquetas)
      usuarios!: Usuario[];

      @ManyToMany(() => Comentario, (comentario) => comentario.etiquetas)
      comentarios!: Comentario[];
    }
