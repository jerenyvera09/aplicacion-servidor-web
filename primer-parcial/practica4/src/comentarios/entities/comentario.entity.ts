/*
 Integrante: Cinthia Zambrano
 Tipo de entidad: Transaccional (Registro)
 Entidad: Comentario
*/
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Reporte } from '../../reportes/entities/reporte.entity';
import { Etiqueta } from '../../etiquetas/entities/etiqueta.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('comentarios')
export class Comentario {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Reporte, { eager: true, onDelete: 'CASCADE' })
  reporte!: Reporte;

  @Column({ type: 'text' })
  contenido!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha!: Date;

  @ManyToMany(() => Etiqueta, (e) => e.comentarios, { cascade: true })
  @JoinTable({ name: 'comentario_etiquetas' })
  etiquetas?: Etiqueta[];

  @ManyToOne(() => Usuario, (u) => u.comentarios, { eager: true, nullable: true })
  usuario?: Usuario;
}
