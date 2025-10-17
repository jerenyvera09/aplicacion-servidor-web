import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Reporte } from './entities/reporte.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Area } from '../areas/entities/area.entity';
import { EstadoReporte } from '../estados/entities/estado-reporte.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Etiqueta } from '../etiquetas/entities/etiqueta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reporte, Categoria, Area, EstadoReporte, Usuario, Etiqueta])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
