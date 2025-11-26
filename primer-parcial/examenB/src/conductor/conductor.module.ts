import { Module } from '@nestjs/common';
import { WebhookModule } from '../webhook/webhook.module';
import { ConductorController } from './conductor.controller';
import { ConductorService } from './conductor.service';

@Module({
  imports: [WebhookModule],
  controllers: [ConductorController],
  providers: [ConductorService],
  exports: [ConductorService],
})
export class ConductorModule {}
