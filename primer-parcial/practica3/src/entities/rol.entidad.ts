// #hecho por Cinthia Zambrano
// Clasificación Taller:
// Integrante 1 (Entidades Maestras / Catálogos) - Cinthia Zambrano
// Motivo: Rol funciona como catálogo de permisos y perfil base.

    import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
    import { Usuario } from "./usuario.entidad";

    @Entity("roles")
    export class Rol {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

      @Column()
      nombre!: string;

      @Column({ nullable: true })
      descripcion?: string;

      @Column({ nullable: true })
      permisos?: string;

      @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
      fecha_creacion!: Date;

      @OneToMany(() => Usuario, (usuario) => usuario.rol)
      usuarios!: Usuario[];
    }
