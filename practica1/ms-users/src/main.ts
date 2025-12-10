import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crear la aplicación híbrida (HTTP + Microservicio)
  const app = await NestFactory.create(AppModule);
  
  // Configurar RabbitMQ Consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://guest:guest@${process.env.RABBITMQ_HOST || 'localhost'}:5672`],
      queue: 'reports_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002);
  console.log('Microservicio de Usuarios ejecutándose en el puerto 3002 (HTTP) y consumiendo RabbitMQ');
}
bootstrap();
