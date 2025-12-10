import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import Redis from 'ioredis';

@Injectable()
export class UserService implements OnModuleInit {
  private redisClient: Redis;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    // Conexión a Redis para Idempotencia
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
    });
  }

  async handleReportCreated(payload: any) {
    const { eventId, userId } = payload;
    const idempotencyKey = `processed_event:${eventId}`;

    // 1. Verificar Idempotencia (¿Ya procesé este evento?)
    const isProcessed = await this.redisClient.get(idempotencyKey);
    if (isProcessed) {
      console.log(`Evento ${eventId} ya procesado. Ignorando.`);
      return;
    }

    console.log(`Procesando evento ${eventId} para usuario ${userId}`);

    // 2. Lógica de Negocio (Actualizar contador de reportes)
    // Nota: En un caso real, deberíamos verificar si el usuario existe.
    // Aquí asumimos que existe o lo creamos si no (para simplificar la demo).
    let user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
        // Si no existe (ej. primera vez), lo creamos dummy
        user = this.userRepository.create({ id: userId, name: 'Usuario Demo', reportsCount: 0 });
    }
    
    user.reportsCount += 1;
    await this.userRepository.save(user);

    // 3. Marcar evento como procesado en Redis (TTL 24 horas)
    await this.redisClient.set(idempotencyKey, 'true', 'EX', 86400);
    
    console.log(`Evento ${eventId} procesado exitosamente.`);
  }
  
  async getUser(id: string) {
      return this.userRepository.findOneBy({ id });
  }
}
