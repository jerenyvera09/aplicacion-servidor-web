import { Module } from '@nestjs/common';
import { WebhookModule } from '../webhook/webhook.module';
import { CoberturaController } from './cobertura.controller';
import { CoberturaService } from './cobertura.service';

@Module({
  imports: [WebhookModule],
  controllers: [CoberturaController],
  providers: [CoberturaService],
  exports: [CoberturaService],
})
export class CoberturaModule {}
