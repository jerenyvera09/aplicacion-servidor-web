import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { WebhookService } from '../webhook/webhook.service';
import { VehiculoService } from './vehiculo.service';
import { CreateVehiculoDto } from './dtos/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dtos/update-vehiculo.dto';

@Controller('vehiculo')
export class VehiculoController {
  constructor(private readonly service: VehiculoService, private readonly webhook: WebhookService) {}

  @Post()
  create(@Body() dto: CreateVehiculoDto) {
    const res = this.service.create(dto);
    // Intermediario: WebhookService emite al WS Gateway
    this.webhook.procesar({ operacion: 'POST', entidad: 'vehiculo', payload: dto });
    return res;
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehiculoDto) {
    const res = this.service.update(id, dto);
    this.webhook.procesar({ operacion: 'PUT', entidad: 'vehiculo', payload: { id, ...dto } });
    return res;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
