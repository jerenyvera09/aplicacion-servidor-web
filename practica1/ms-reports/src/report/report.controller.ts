import { Controller, Post, Body } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(@Body() body: { description: string; userId: string }) {
    return this.reportService.createReport(body.description, body.userId);
  }
}
