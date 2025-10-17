/*
 Integrante: Carlos Delgado
 Tipo de entidad: Maestra (Clasificación)
 Entidad: Etiqueta
*/
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Comentario } from '../../comentarios/entities/comentario.entity';
import { Reporte } from '../../reportes/entities/reporte.entity';

@Entity('etiquetas')
export class Etiqueta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ nullable: true, length: 20 })
  color?: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @Column({ nullable: true, length: 120 })
  slug?: string;

  @ManyToMany(() => Comentario, (c) => c.etiquetas)
  comentarios?: Comentario[];

  @ManyToMany(() => Reporte, (r) => r.etiquetas)
  reportes?: Reporte[];
}
