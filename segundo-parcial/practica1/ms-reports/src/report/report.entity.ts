import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  userId: string; // ID del usuario que creó el reporte

  @Column({ default: 'PENDING' })
  status: string;
}
