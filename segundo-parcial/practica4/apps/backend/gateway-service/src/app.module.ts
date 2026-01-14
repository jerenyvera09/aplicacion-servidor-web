import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { IdempotencyService } from './common/idempotency.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    UsersModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [IdempotencyService],
})
export class AppModule {}
