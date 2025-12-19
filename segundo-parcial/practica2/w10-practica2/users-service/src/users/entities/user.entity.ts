import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: 'text',
    enum: UserRole,
    default: UserRole.ANALYST,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status!: UserStatus;

  @Column({ nullable: true })
  department?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
