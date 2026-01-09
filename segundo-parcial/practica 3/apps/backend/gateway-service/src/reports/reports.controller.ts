import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
  Patch,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { IdempotencyService } from '../common/idempotency.service';

type ReportStatus = 'PENDING' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

interface Report {
  id: string;
  userId: string;
  assignedToId: string;
  title: string;
  description: string;
  findings?: string;
  priority: string;
  status: ReportStatus;
  createdAt: Date;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger('ReportsProxy');

  constructor(
    @Inject('REPORTS_SERVICE') private readonly reportsClient: ClientProxy,
    private readonly idempotency: IdempotencyService,
  ) {}

  /**
   * GET /api/reports - Listar todos los reportes
   */
  @Get()
  async findAll(): Promise<ServiceResponse<Report[]>> {
    this.logger.log('📖 GET /api/reports → reports-service [report.find.all]');
    
    try {
      const response = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<Report[]>>('report.find.all', {}).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error desconocido', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/reports/active - Listar reportes activos (IN_REVIEW, IN_PROGRESS)
   */
  @Get('active')
  async findActive(): Promise<ServiceResponse<Report[]>> {
    this.logger.log('📖 GET /api/reports/active → reports-service [report.find.active]');
    
    try {
      const response = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<Report[]>>('report.find.active', {}).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error desconocido', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/reports/:id - Obtener un reporte por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponse<Report>> {
    this.logger.log(`📖 GET /api/reports/${id} → reports-service [report.find.one]`);
    
    try {
      const response = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<Report>>('report.find.one', { id }).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Reporte no encontrado', HttpStatus.NOT_FOUND);
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/reports - Crear reporte con SAGA orquestada (Temporal)
   */
  @Post()
  async create(@Body() dto: CreateReportDto): Promise<ServiceResponse<Report>> {
    this.logger.log('🎭 POST /api/reports → reports-service [report.create]');
    this.logger.log(`📖 Usuario: ${dto.userId}, Asignado a: ${dto.assignedToId}`);
    
    try {
      const idempotencyKey = this.idempotency.generateKey('report.create', dto.userId, {
        assignedToId: dto.assignedToId,
        title: dto.title,
      });
      const cached = this.idempotency.get(idempotencyKey) as ServiceResponse<Report> | null;
      if (cached) {
        this.logger.warn('🔄 Respuesta idempotente (gateway)');
        return cached;
      }

      const response = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<Report>>('report.create', dto).pipe(
          timeout(15000), // Más tiempo para la saga completa
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        this.logger.error(`❌ Error en saga: ${response.error}`);
        throw new HttpException(response.error || 'Error en saga', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`✅ Reporte creado: ${response.data?.id}`);
      this.idempotency.store(idempotencyKey, response);
      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * PUT /api/reports/:id - Actualizar reporte
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateReportDto,
  ): Promise<ServiceResponse<Report>> {
    this.logger.log(`🔧 PATCH /api/reports/${id} → reports-service [report.update]`);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = { id, dto: updateDto };
      const response = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<Report>>('report.update', payload).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error actualizando reporte', HttpStatus.BAD_REQUEST);
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * PATCH /api/reports/:id/complete - Completar análisis de reporte
   */
  @Patch(':id/complete')
  async completeReport(
    @Param('id') id: string,
    @Body() body: { findings: string }
  ): Promise<ServiceResponse<Report>> {
    this.logger.log(`📖 PATCH /api/reports/${id}/complete → reports-service [report.complete]`);
    
    try {
      const response = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<Report>>('report.complete', { id, findings: body.findings }).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error completando reporte', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`✅ Reporte completado correctamente`);
      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * DELETE /api/reports/:id - Eliminar reporte
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ServiceResponse<void>> {
    this.logger.log(`🗑️ DELETE /api/reports/${id} → reports-service [report.delete]`);
    
    try {
      const response = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<void>>('report.delete', { id }).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error eliminando reporte', HttpStatus.BAD_REQUEST);
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}