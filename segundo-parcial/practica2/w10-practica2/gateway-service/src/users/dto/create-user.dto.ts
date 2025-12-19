export class CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  role?: 'ADMIN' | 'ANALYST' | 'VIEWER';
  department?: string;
}