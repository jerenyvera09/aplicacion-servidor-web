/*
 Integrante: Jereny Vera
 Tipo de entidad: Negocio (Core)
 Entidad: Usuario
*/
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';
import { Reporte } from '../../reportes/entities/reporte.entity';
import { Comentario } from '../../comentarios/entities/comentario.entity';
import { Puntuacion } from '../../puntuaciones/entities/puntuacion.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ length: 120 })
  contrasenia!: string;

  @Column({ default: 'activo', length: 20 })
  estado!: string;

  @ManyToOne(() => Rol, (r) => r.usuarios, { eager: true, nullable: true })
  rol?: Rol;

  @OneToMany(() => Reporte, (r) => r.usuario)
  reportes?: Reporte[];

  @OneToMany(() => Comentario, (c) => c.usuario)
  comentarios?: Comentario[];

  @OneToMany(() => Puntuacion, (p) => p.usuario)
  puntuaciones?: Puntuacion[];
}
