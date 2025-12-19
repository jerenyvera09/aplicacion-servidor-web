import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('processed_messages')
export class ProcessedMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, unique: true })
  idempotencyKey: string;

  @Column({ type: 'text' })
  result: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}