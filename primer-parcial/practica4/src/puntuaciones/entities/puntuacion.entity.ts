/*
 Integrante: Cinthia Zambrano
 Tipo de entidad: Transaccional (Registro)
 Entidad: Puntuacion
*/
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Reporte } from '../../reportes/entities/reporte.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('puntuaciones')
export class Puntuacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  valor!: number; // 1-5

  @Column({ nullable: true, length: 150 })
  usuario?: string; // texto simple por simplicidad

  @Column({ nullable: true, type: 'text' })
  comentario?: string;

  @ManyToOne(() => Reporte, { nullable: false, onDelete: 'CASCADE' })
  reporte!: Reporte;

  @ManyToOne(() => Usuario, (u) => u.puntuaciones, { eager: true, nullable: true })
  usuarioRef?: Usuario;
}
