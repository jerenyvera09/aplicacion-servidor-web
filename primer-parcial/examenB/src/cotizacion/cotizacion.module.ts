import { Module } from '@nestjs/common';
import { CotizacionController } from './cotizacion.controller';

@Module({
  controllers: [CotizacionController],
})
export class CotizacionModule {}
