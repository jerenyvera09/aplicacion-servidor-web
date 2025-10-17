/*
 Integrante: Jereny Vera
 Tipo de entidad: Negocio (Operación core)
 Entidad: Reporte
*/
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Area } from '../../areas/entities/area.entity';
import { EstadoReporte } from '../../estados/entities/estado-reporte.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Etiqueta } from '../../etiquetas/entities/etiqueta.entity';
import { Comentario } from '../../comentarios/entities/comentario.entity';
import { ArchivoAdjunto } from '../../archivos/entities/archivo-adjunto.entity';
import { Puntuacion } from '../../puntuaciones/entities/puntuacion.entity';

@Entity('reportes')
export class Reporte {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ nullable: true, length: 100 })
  ubicacion?: string;

  @Column({ nullable: true, length: 20 })
  prioridad?: string;

  @ManyToOne(() => Categoria, (c) => c.reportes, { eager: true, nullable: true })
  categoria?: Categoria;

  @ManyToOne(() => Area, (a) => a.reportes, { eager: true, nullable: true })
  area?: Area;

  @ManyToOne(() => EstadoReporte, (e) => e.reportes, { eager: true, nullable: true })
  estado?: EstadoReporte;

  @ManyToOne(() => Usuario, (u) => u.reportes, { eager: true, nullable: true })
  usuario?: Usuario;

  @ManyToMany(() => Etiqueta)
  @JoinTable({ name: 'reporte_etiquetas' })
  etiquetas?: Etiqueta[];

  @OneToMany(() => Comentario, (c) => c.reporte)
  comentarios?: Comentario[];

  @OneToMany(() => ArchivoAdjunto, (a) => a.reporte)
  archivos?: ArchivoAdjunto[];

  @OneToMany(() => Puntuacion, (p) => p.reporte)
  puntuaciones?: Puntuacion[];
}
