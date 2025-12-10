import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Report } from './report.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
  ) {}

  async createReport(description: string, userId: string) {
    // 1. Guardar en Base de Datos Local
    const report = this.reportRepository.create({ description, userId });
    const savedReport = await this.reportRepository.save(report);

    // 2. Emitir Evento a RabbitMQ
    // Generamos un ID de evento único para la idempotencia
    const eventId = uuidv4();
    
    const eventPayload = {
      eventId: eventId,
      reportId: savedReport.id,
      userId: savedReport.userId,
      timestamp: new Date().toISOString(),
    };

    this.client.emit('report_created', eventPayload);

    return savedReport;
  }
}
