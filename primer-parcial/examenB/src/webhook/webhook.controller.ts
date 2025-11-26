import { Body, Controller, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Post('notificaciones')
  recibir(@Body() body: any) {
    // body esperado: { operacion: 'POST'|'PUT', entidad: 'vehiculo'|'conductor'|'cobertura'|'cotizacion', payload: {...} }
    return this.service.procesar(body);
  }
}
