import { Module } from '@nestjs/common';
import { WebhookModule } from '../webhook/webhook.module';
import { VehiculoController } from './vehiculo.controller';
import { VehiculoService } from './vehiculo.service';

@Module({
  imports: [WebhookModule],
  controllers: [VehiculoController],
  providers: [VehiculoService],
  exports: [VehiculoService],
})
export class VehiculoModule {}
