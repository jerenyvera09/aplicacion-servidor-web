import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSeedService } from './seed-users';
import { ProcessedMessage } from './entities/processed-message.entity';
import { IdempotencyService } from './idempotency.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ProcessedMessage])],
  controllers: [UsersController],
  providers: [UsersService, UserSeedService, IdempotencyService],
  exports: [UsersService],
})
export class UsersModule {}
