import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';
import { Report } from './report/report.entity';

@Module({
  imports: [
    // Configuración de Base de Datos (Postgres)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: 'report_db_user',
      password: 'report_db_pass',
      database: 'reports_db',
      entities: [Report],
      autoLoadEntities: true,
      synchronize: true, // Solo para desarrollo
    }),
    TypeOrmModule.forFeature([Report]),
    // Cliente RabbitMQ para emitir eventos
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://guest:guest@${process.env.RABBITMQ_HOST || 'localhost'}:5672`],
          queue: 'reports_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class AppModule {}
