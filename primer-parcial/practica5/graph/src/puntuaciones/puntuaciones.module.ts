import { Module } from '@nestjs/common';
import { PuntuacionesResolver } from './puntuaciones.resolver';
import { RestModule } from '../servicios/rest.module';

@Module({
  imports: [RestModule],
  providers: [PuntuacionesResolver],
})
export class PuntuacionesModule {}
