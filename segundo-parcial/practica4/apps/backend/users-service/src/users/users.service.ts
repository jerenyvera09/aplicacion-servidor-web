import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating a new user ${createUserDto.name}`);
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({order: { createdAt: 'DESC' }});
  }

  async findActive(): Promise<User[]> {
    return await this.userRepository.find({ where: { status: 'ACTIVE' }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) return null;
    user.status = status;
    return await this.userRepository.save(user);
  }

  async markAsInactive(id: string): Promise<User | null> {
    return await this.updateStatus(id, 'INACTIVE');
  }

  async markAsSuspended(id: string): Promise<User | null> {
    return await this.updateStatus(id, 'SUSPENDED');
  }

  async markAsActive(id: string): Promise<User | null> {
    return await this.updateStatus(id, 'ACTIVE');
  }
}
