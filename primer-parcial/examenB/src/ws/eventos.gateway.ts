import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventosGateway {
  @WebSocketServer()
  server: Server;

  enviarEvento(evento: any) {
    // Emite evento global sin rooms ni namespaces
    this.server.emit('notificacion', evento);
  }
}
