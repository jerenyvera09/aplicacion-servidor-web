/*
 Integrante: Carlos Delgado
 Tipo de entidad: Maestra (Catálogo/Configuración)
 Entidad: EstadoReporte
*/
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reporte } from '../../reportes/entities/reporte.entity';

@Entity('estados_reporte')
export class EstadoReporte {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @Column({ nullable: true, length: 20 })
  color?: string;

  @Column({ type: 'int', default: 0 })
  orden!: number;

  @Column({ type: 'boolean', default: false })
  es_final!: boolean;

  @OneToMany(() => Reporte, (r) => r.estado)
  reportes?: Reporte[];
}
