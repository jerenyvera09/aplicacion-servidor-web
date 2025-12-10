import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @Column({ primary: true })
  id: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  reportsCount: number; // Contador de reportes creados por el usuario
}
