import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  department?: string;
}