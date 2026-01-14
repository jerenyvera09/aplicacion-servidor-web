import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity';
import { ProcessedMessage } from './entities/processed-message.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { IdempotencyService } from './idempotency.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ProcessedMessage]),
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'users_queue',
          queueOptions: { durable: true },
          socketOptions: {
            heartbeatIntervalInSeconds: 60,
            reconnectTimeInSeconds: 5,
          },
        },
      },
    ]),
    WebhooksModule,
  
  ],
  controllers: [ReportsController],
  providers: [ReportsService, IdempotencyService],
  exports: [ReportsService],
})
export class ReportsModule {}
