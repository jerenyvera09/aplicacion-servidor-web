import { Module } from '@nestjs/common';
import { UsuariosResolver } from './usuarios.resolver';
import { RestModule } from '../servicios/rest.module';

@Module({
  imports: [RestModule],
  providers: [UsuariosResolver],
})
export class UsuariosModule {}
