import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuntuacionesService } from './puntuaciones.service';
import { PuntuacionesController } from './puntuaciones.controller';
import { Puntuacion } from './entities/puntuacion.entity';
import { Reporte } from '../reportes/entities/reporte.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Puntuacion, Reporte, Usuario])],
  controllers: [PuntuacionesController],
  providers: [PuntuacionesService],
})
export class PuntuacionesModule {}
