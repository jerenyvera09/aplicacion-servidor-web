/*
 Integrante: Carlos Delgado
 Tipo de entidad: Maestra (Catálogo/Clasificación)
 Entidad: Categoria
*/
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reporte } from '../../reportes/entities/reporte.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @Column({ nullable: true, length: 50 })
  prioridad?: string;

  @Column({ default: 'activo', length: 20 })
  estado!: string;

  @OneToMany(() => Reporte, (r) => r.categoria)
  reportes?: Reporte[];
}
