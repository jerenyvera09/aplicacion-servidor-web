import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportsController } from './reports.controller';
import { IdempotencyService } from '../common/idempotency.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REPORTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'reports_queue',
          queueOptions: { durable: true },
          socketOptions: {
            heartbeatIntervalInSeconds: 60,
            reconnectTimeInSeconds: 5,
          },
        },
      },
    ]),
  ],
  controllers: [ReportsController],
  providers: [IdempotencyService],
})
export class ReportsModule {}