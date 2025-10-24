import { Module } from '@nestjs/common';
import { ArchivosResolver } from './archivos.resolver';
import { RestModule } from '../servicios/rest.module';

@Module({
  imports: [RestModule],
  providers: [ArchivosResolver],
})
export class ArchivosModule {}
