import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [WsModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService]
})
export class WebhookModule {}
