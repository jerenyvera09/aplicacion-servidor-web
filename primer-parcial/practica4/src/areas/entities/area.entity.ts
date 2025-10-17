/*
 Integrante: Carlos Delgado
 Tipo de entidad: Maestra (Catálogo)
 Entidad: Area
*/
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reporte } from '../../reportes/entities/reporte.entity';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ nullable: true, length: 100 })
  responsable?: string;

  @Column({ nullable: true, length: 100 })
  ubicacion?: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @OneToMany(() => Reporte, (r) => r.area)
  reportes?: Reporte[];
}
