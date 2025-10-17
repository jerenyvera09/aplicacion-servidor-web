import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PuntuacionesService } from './puntuaciones.service';
import { CreatePuntuacionDto } from './dto/create-puntuacion.dto';
import { UpdatePuntuacionDto } from './dto/update-puntuacion.dto';

@Controller('puntuaciones')
export class PuntuacionesController {
  constructor(private readonly service: PuntuacionesService) {}

  @Post()
  create(@Body() dto: CreatePuntuacionDto) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePuntuacionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  @Get('promedio/:reporteId')
  promedio(@Param('reporteId', ParseIntPipe) reporteId: number) {
    return this.service.promedioPorReporte(reporteId);
  }
}
