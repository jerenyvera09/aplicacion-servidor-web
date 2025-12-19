import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  findings?: string;
  status?: 'PENDING' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
}
