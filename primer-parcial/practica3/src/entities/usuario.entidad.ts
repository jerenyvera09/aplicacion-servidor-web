// #hecho por Cinthia Zambrano
// Clasificación Taller:
// Integrante 1 (Entidades Maestras / Base) - Cinthia Zambrano
// Rol principal: Definición de entidad base de usuarios y soporte a catálogos.

    import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
    import { Rol } from "./rol.entidad";
    import { Reporte } from "./reporte.entidad";
    import { Comentario } from "./comentario.entidad";
    import { Puntuacion } from "./puntuacion.entidad";
    import { Etiqueta } from "./etiqueta.entidad";

    @Entity("usuarios")
    export class Usuario {
      @PrimaryGeneratedColumn("uuid")
      id!: string;

      @Column()
      nombre!: string;

      @Column({ unique: true })
      correo!: string;

      @Column()
      contraseña!: string;

      @Column({ default: "activo" })
      estado!: string;

      @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true })
      rol!: Rol;

      @OneToMany(() => Reporte, (reporte) => reporte.usuario)
      reportes!: Reporte[];

      @OneToMany(() => Comentario, (comentario) => comentario.usuario)
      comentarios!: Comentario[];

      @OneToMany(() => Puntuacion, (puntuacion) => puntuacion.usuario)
      puntuaciones!: Puntuacion[];

      @ManyToMany(() => Etiqueta, (etiqueta) => etiqueta.usuarios, { cascade: true })
      @JoinTable({ name: "usuario_etiquetas" })
      etiquetas!: Etiqueta[];
    }
