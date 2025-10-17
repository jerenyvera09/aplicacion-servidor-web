/*
 Integrante: Carlos Delgado
 Tipo de entidad: Maestra (Configuración)
 Entidad: Rol
*/
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @Column({ nullable: true, type: 'text' })
  permisos?: string;

  @OneToMany(() => Usuario, (u) => u.rol)
  usuarios?: Usuario[];
}
