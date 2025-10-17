import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoReporte } from './entities/estado-reporte.entity';
import { EstadosService } from './estados.service';
import { EstadosController } from './estados.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoReporte])],
  controllers: [EstadosController],
  providers: [EstadosService],
  exports: [EstadosService],
})
export class EstadosModule {}
