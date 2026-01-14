import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ProcessedMessage } from './users/entities/processed-message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_NAME || 'users.sqlite',
      entities: [User, ProcessedMessage],
      synchronize: true, // Solo en desarrollo
      logging: ['error', 'warn'],
    }),
    UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
