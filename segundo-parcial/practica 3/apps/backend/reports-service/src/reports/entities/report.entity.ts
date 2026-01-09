import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ReportStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'varchar', length: 36 })
  assignedToId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  findings?: string;

  @Column({ type: 'varchar', length: 20, default: 'MEDIUM' })
  priority: ReportPriority;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: ReportStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
