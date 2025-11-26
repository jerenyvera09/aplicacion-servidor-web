import { Injectable } from '@nestjs/common';
import { EventosGateway } from '../ws/eventos.gateway';

type WebhookBody = {
  operacion: 'POST' | 'PUT';
  entidad: 'vehiculo' | 'conductor' | 'cobertura' | 'cotizacion';
  payload: Record<string, any>;
};

@Injectable()
export class WebhookService {
  constructor(private readonly gateway: EventosGateway) {}

  procesar(body: WebhookBody) {
    const notificacion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      operacion: body.operacion,
      entidad: body.entidad,
      payload: body.payload,
      fecha: new Date().toISOString(),
    };

    // Lógica mínima: aquí podría agregarse reglas simples si aplica
    this.gateway.enviarEvento(notificacion);
    return { ok: true, notificacion };
  }
}
