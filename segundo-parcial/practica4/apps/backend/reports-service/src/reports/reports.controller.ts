import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, ClientProxy } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices/ctx-host/rmq.context';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { IdempotencyService } from './idempotency.service';
import { firstValueFrom } from 'rxjs';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(
    private readonly reportsService: ReportsService,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  private acknowledgeMessage(context: RmqContext): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    channel.ack(originalMsg);
  }

  @MessagePattern('report.create')
  async create(
    @Payload() dto: CreateReportDto,
    @Ctx() context: RmqContext,
  ): Promise<ServiceResponse<Report>> {
    this.logger.log(`[report.create] Creando reporte para usuario: ${dto.userId}`);

    try {
      // Idempotencia (se reforzará en Fase 2 con SQLite local)
      const idempotencyKey = this.idempotencyService.generateKey(
        'create_report',
        dto.userId,
        { assignedToId: dto.assignedToId }
      );

      const existing = await this.idempotencyService.checkProcessed(idempotencyKey);
      if (existing) {
        this.logger.warn(`🔄 Mensaje duplicado detectado para usuario ${dto.userId}`);
        this.acknowledgeMessage(context);
        return existing as ServiceResponse<Report>;
      }

      await this.ensureUserActive(dto.userId, 'solicitante');
      await this.ensureUserActive(dto.assignedToId, 'analista asignado');

      const report = await this.reportsService.create(dto);
      const response: ServiceResponse<Report> = { success: true, data: report };

      await this.idempotencyService.markAsProcessed(
        idempotencyKey,
        'create_report',
        dto.userId,
        response
      );

      this.acknowledgeMessage(context);
      return response;
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Create report failed';
      this.logger.error(`[report.create] Error: ${message}`);
      return { success: false, error: message };
    }
  }

  @MessagePattern('report.find.all')
  async findAll(@Ctx() context: RmqContext): Promise<ServiceResponse<Report[]>> {
    this.logger.log('[report.find.all] Solicitud recibida');

    try {
      const reports = await this.reportsService.findAll();
      this.acknowledgeMessage(context);
      return { success: true, data: reports };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  @MessagePattern('report.find.active')
  async findActive(@Ctx() context: RmqContext): Promise<ServiceResponse<Report[]>> {
    this.logger.log('[report.find.active] Solicitud recibida');

    try {
      const reports = await this.reportsService.findActive();
      this.acknowledgeMessage(context);
      return { success: true, data: reports };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  @MessagePattern('report.find.rejected')
  async findRejected(@Ctx() context: RmqContext): Promise<ServiceResponse<Report[]>> {
    this.logger.log('[report.find.rejected] Solicitud recibida');

    try {
      const reports = await this.reportsService.findRejected();
      this.acknowledgeMessage(context);
      return { success: true, data: reports };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  @MessagePattern('report.find.one')
  async findOne(
    @Payload() data: { id: string },
    @Ctx() context: RmqContext,
  ): Promise<ServiceResponse<Report>> {
    this.logger.log(`[report.find.one] ID: ${data.id}`);

    try {
      const report = await this.reportsService.findOne(data.id);
      this.acknowledgeMessage(context);
      return { success: true, data: report };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Report not found';
      return { success: false, error: message };
    }
  }

  @MessagePattern('report.update')
  async update(
    @Payload() payload: { id: string; dto: UpdateReportDto },
    @Ctx() context: RmqContext,
  ): Promise<ServiceResponse<Report>> {
    this.logger.log(`[report.update] ID: ${payload.id}`);

    try {
      const report = await this.reportsService.update(payload.id, payload.dto);
      this.acknowledgeMessage(context);
      return { success: true, data: report };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Update failed';
      return { success: false, error: message };
    }
  }

  @MessagePattern('report.complete')
  async completeReport(
    @Payload() data: { id: string; findings: string },
    @Ctx() context: RmqContext,
  ): Promise<ServiceResponse<Report>> {
    this.logger.log(`[report.complete] ID: ${data.id}`);

    try {
      // 1. Generar clave de idempotencia
      const idempotencyKey = this.idempotencyService.generateKey(
        'complete_report',
        data.id
      );

      // 2. Verificar si ya fue procesado
      const existing = await this.idempotencyService.checkProcessed(idempotencyKey);
      if (existing) {
        this.logger.warn(`🔄 Mensaje duplicado detectado para reporte ${data.id}`);
        this.acknowledgeMessage(context);
        return existing as ServiceResponse<Report>;
      }

      // 3. Procesar mensaje
      const report = await this.reportsService.completeReport(data.id, data.findings);
      
      // Notificar al usuario
      this.logger.log(`[report.complete] Notificando a usuario: ${report.userId}`);
      this.usersClient.emit('user.report.completed', { reportId: report.id, userId: report.userId });
      
      const response: ServiceResponse<Report> = { success: true, data: report };

      // 4. Marcar como procesado
      await this.idempotencyService.markAsProcessed(
        idempotencyKey,
        'complete_report',
        data.id,
        response
      );

      this.acknowledgeMessage(context);
      return response;
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Complete failed';
      return { success: false, error: message };
    }
  }

  @MessagePattern('report.delete')
  async remove(
    @Payload() payload: { id: string },
    @Ctx() context: RmqContext,
  ): Promise<ServiceResponse<void>> {
    this.logger.log(`[report.delete] ID: ${payload.id}`);

    try {
      await this.reportsService.remove(payload.id);
      this.acknowledgeMessage(context);
      return { success: true };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Delete failed';
      return { success: false, error: message };
    }
  }

  private async ensureUserActive(userId: string, roleLabel: string): Promise<void> {
    const result = await firstValueFrom(
      this.usersClient.send<{ success: boolean; exists: boolean; user?: unknown }>('user.check', { userId })
    );

    if (!result.success || !result.exists) {
      const reason = result.success ? 'Usuario inactivo o no encontrado' : 'Error consultando usuario';
      throw new Error(`${roleLabel}: ${reason}`);
    }
  }
}
