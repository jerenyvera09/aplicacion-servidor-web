import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { WebhookService } from '../webhook/webhook.service';
import { ConductorService } from './conductor.service';
import { CreateConductorDto } from './dtos/create-conductor.dto';
import { UpdateConductorDto } from './dtos/update-conductor.dto';

@Controller('conductor')
export class ConductorController {
  constructor(private readonly service: ConductorService, private readonly webhook: WebhookService) {}

  @Post()
  create(@Body() dto: CreateConductorDto) {
    const res = this.service.create(dto);
    this.webhook.procesar({ operacion: 'POST', entidad: 'conductor', payload: dto });
    return res;
  }
  @Get()
  findAll() { return this.service.findAll(); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConductorDto) {
    const res = this.service.update(id, dto);
    this.webhook.procesar({ operacion: 'PUT', entidad: 'conductor', payload: { id, ...dto } });
    return res;
  }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
