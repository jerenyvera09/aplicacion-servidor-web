import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Report } from './reports/entities/report.entity';
import { ProcessedMessage } from './reports/entities/processed-message.entity';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_NAME || 'reports.sqlite',
      entities: [Report, ProcessedMessage],
      synchronize: true,
      logging: ['error', 'warn'],
    }),

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
    ReportsModule,
    WebhooksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
