export class WebhookPayloadDto<T = any> {
  event: string;
  version: string;
  id: string;
  idempotency_key: string;
  timestamp: string;
  data: T;
  metadata: WebhookMetadataDto & Record<string, unknown>;
}

export class WebhookMetadataDto {
  source: string;
  environment: string;
  correlation_id: string;
}

// Payload específico para report.created
export class ReportCreatedDataDto {
  report_id: string;
  user_id: string;
  assigned_to_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

// Payload específico para report.completed
export class ReportCompletedDataDto {
  report_id: string;
  user_id: string;
  assigned_to_id: string;
  findings?: string;
  completed_at: string;
  status: string;
}