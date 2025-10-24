import { Module } from '@nestjs/common';
import { ComentariosResolver } from './comentarios.resolver';
import { RestModule } from '../servicios/rest.module';

@Module({
  imports: [RestModule],
  providers: [ComentariosResolver],
})
export class ComentariosModule {}
