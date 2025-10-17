import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivosService } from './archivos.service';
import { ArchivosController } from './archivos.controller';
import { ArchivoAdjunto } from './entities/archivo-adjunto.entity';
import { Reporte } from '../reportes/entities/reporte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArchivoAdjunto, Reporte])],
  controllers: [ArchivosController],
  providers: [ArchivosService],
})
export class ArchivosModule {}
