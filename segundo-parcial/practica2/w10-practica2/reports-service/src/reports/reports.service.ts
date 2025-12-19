import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportStatus, Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { WebhooksService } from '../webhooks/webhooks.service';
import { ReportCompletedDataDto, ReportCreatedDataDto } from '../webhooks/dto/webhook-payload.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly webhooksService: WebhooksService
  ) {}

  async create(
    dto: CreateReportDto,
    status: ReportStatus = 'IN_REVIEW',
  ): Promise<Report> {
    const report = this.reportRepository.create({
      ...dto,
      status,
    });

    // Guardar PRIMERO en la base de datos
    const savedReport = await this.reportRepository.save(report);

    // DESPUÉS enviar webhook (solo si se guardó exitosamente)
    const webhookData: ReportCreatedDataDto = {
      report_id: savedReport.id,
      user_id: savedReport.userId,
      assigned_to_id: savedReport.assignedToId,
      title: savedReport.title,
      description: savedReport.description,
      priority: savedReport.priority,
      status: savedReport.status,
      created_at: savedReport.createdAt.toISOString(),
    };

    await this.webhooksService.publishWebhook<ReportCreatedDataDto>(
      'report.created',
      webhookData,
      {
        correlation_id: `report-${savedReport.id}`,
      }
    );

    return savedReport;
  }

  async createPending(dto: CreateReportDto): Promise<Report> {
    return await this.create(dto, 'PENDING');
  }

  async findAll(): Promise<Report[]> {
    return await this.reportRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findActive(): Promise<Report[]> {
    return await this.reportRepository.find({
      where: [
        { status: 'IN_REVIEW' },
        { status: 'IN_PROGRESS' },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findPending(): Promise<Report[]> {
    return await this.reportRepository.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'DESC' },
    });
  }

  async findRejected(): Promise<Report[]> {
    return await this.reportRepository.find({
      where: { status: 'REJECTED' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`Report with ID ${id} not found`);
    return report;
  }

  async update(id: string, dto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);
    Object.assign(report, dto);
    return await this.reportRepository.save(report);
  }

  async updateStatus(id: string, status: ReportStatus, findings?: string): Promise<Report> {
    const report = await this.findOne(id);
    report.status = status;
    if (findings) {
      report.findings = findings;
    }
    return await this.reportRepository.save(report);
  }

  async startProgress(id: string): Promise<Report> {
    return await this.updateStatus(id, 'IN_PROGRESS');
  }

  async rejectReport(id: string, findings: string): Promise<Report> {
    return await this.updateStatus(id, 'REJECTED', findings);
  }

  async completeReport(id: string, findings: string): Promise<Report> {
    // Actualizar PRIMERO el estado en la base de datos
    const updatedReport = await this.updateStatus(id, 'COMPLETED', findings);

    // DESPUÉS enviar webhook (solo si se actualizó exitosamente)
    const webhookData: ReportCompletedDataDto = {
      report_id: updatedReport.id,
      user_id: updatedReport.userId,
      assigned_to_id: updatedReport.assignedToId,
      findings: updatedReport.findings,
      completed_at: new Date().toISOString(),
      status: updatedReport.status,
    };

    await this.webhooksService.publishWebhook<ReportCompletedDataDto>(
      'report.completed',
      webhookData,
      {
        correlation_id: `report-${updatedReport.id}`,
      }
    );

    return updatedReport;
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }
}
