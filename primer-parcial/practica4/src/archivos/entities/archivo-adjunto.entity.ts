/*
 Integrante: Cinthia Zambrano
 Tipo de entidad: Transaccional (Registro)
 Entidad: ArchivoAdjunto
*/
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Reporte } from '../../reportes/entities/reporte.entity';

@Entity('archivos_adjuntos')
export class ArchivoAdjunto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ length: 500 })
  ruta!: string; // URL o ruta local

  @Column({ nullable: true, length: 100 })
  mimeType?: string;

  @Column({ nullable: true, type: 'int' })
  tamanoBytes?: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaSubida!: Date;

  @ManyToOne(() => Reporte, { nullable: false, onDelete: 'CASCADE' })
  reporte!: Reporte;
}
