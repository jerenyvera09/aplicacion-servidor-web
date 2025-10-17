import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ArchivosService } from './archivos.service';
import { CreateArchivoAdjuntoDto } from './dto/create-archivo-adjunto.dto';
import { UpdateArchivoAdjuntoDto } from './dto/update-archivo-adjunto.dto';

@Controller('archivos')
export class ArchivosController {
  constructor(private readonly service: ArchivosService) {}

  @Post()
  create(@Body() dto: CreateArchivoAdjuntoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArchivoAdjuntoDto,
  ) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
