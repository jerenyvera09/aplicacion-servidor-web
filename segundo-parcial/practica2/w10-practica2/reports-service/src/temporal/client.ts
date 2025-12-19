import { Injectable } from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';
import { CreateReportDto } from '../reports/dto/create-report.dto';

interface SagaResult {
  success: boolean;
  reportId: string;
}

@Injectable()
export class TemporalClient {
  private client: Client | undefined;

  async init(): Promise<Client> {
    if (!this.client) {
      const connection = await Connection.connect({ address: 'localhost:7233' });
      this.client = new Client({ connection });
    }
    return this.client;
  }

  async startSaga(input: CreateReportDto): Promise<SagaResult> {
    const client = await this.init();
    const handle = await client.workflow.start('createReportSaga', {
      taskQueue: 'reports-saga',
      args: [input],
      workflowId: `report-${Date.now()}`,
    });
    
    try {
      return (await handle.result()) as SagaResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown saga error';
      throw new Error(`Error en saga: ${errorMessage}`);
    }
  }
}
