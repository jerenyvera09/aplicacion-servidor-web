import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { WebhookService } from '../webhook/webhook.service';
import { CoberturaService } from './cobertura.service';
import { CreateCoberturaDto } from './dtos/create-cobertura.dto';
import { UpdateCoberturaDto } from './dtos/update-cobertura.dto';

@Controller('cobertura')
export class CoberturaController {
  constructor(private readonly service: CoberturaService, private readonly webhook: WebhookService) {}

  @Post()
  create(@Body() dto: CreateCoberturaDto) {
    const res = this.service.create(dto);
    this.webhook.procesar({ operacion: 'POST', entidad: 'cobertura', payload: dto });
    return res;
  }
  @Get()
  findAll() { return this.service.findAll(); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCoberturaDto) {
    const res = this.service.update(id, dto);
    this.webhook.procesar({ operacion: 'PUT', entidad: 'cobertura', payload: { id, ...dto } });
    return res;
  }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
