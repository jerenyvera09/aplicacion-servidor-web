import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TemporalWorker implements OnModuleInit {
  private readonly logger = new Logger(TemporalWorker.name);

  async onModuleInit() {
    if (process.env.ENABLE_TEMPORAL !== 'true') {
      this.logger.log('Temporal deshabilitado (ENABLE_TEMPORAL != true).');
      return;
    }

    this.logger.log('Temporal habilitado pero no configurado en este workshop.');
  }
}
