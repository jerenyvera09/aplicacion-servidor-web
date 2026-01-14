import { Controller, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RmqContext } from '@nestjs/microservices/ctx-host/rmq.context';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { IdempotencyService } from './idempotency.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  private acknowledgeMessage(context: RmqContext): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    channel.ack(originalMsg);
  }

  @MessagePattern('user.create')
  async create(
    @Payload() data: CreateUserDto,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`[user.create] Creando usuario: ${data.name}`);

    try {
      const idempotencyKey = this.idempotencyService.generateKey('user.create', data.email ?? data.name);
      const existing = await this.idempotencyService.checkProcessed(idempotencyKey);
      if (existing) {
        this.acknowledgeMessage(context);
        return existing;
      }

      const user = await this.usersService.create(data);
      this.acknowledgeMessage(context);
      const response = { success: true, data: user };
      await this.idempotencyService.markAsProcessed(idempotencyKey, response);
      return response;
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  @MessagePattern('user.find.all')
  async findAll(@Ctx() context: RmqContext) {
    this.logger.log('[user.find.all] Solicitud recibida');
    try {
      const users = await this.usersService.findAll();
      this.acknowledgeMessage(context);
      return { success: true, data: users };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
  
  @MessagePattern('user.find.active')
  async findActive(@Ctx() context: RmqContext) {
    this.logger.log('[user.find.active] Solicitud recibida');
    try {
      const users = await this.usersService.findActive();
      this.acknowledgeMessage(context);
      return { success: true, data: users };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  @MessagePattern('user.find.one')
  async findOne(@Payload() data: { id: string }, @Ctx() context: RmqContext) {
    this.logger.log(`[user.find.one] Buscando usuario: ${data.id}`);

    try {
      const user = await this.usersService.findOne(data.id);
      this.acknowledgeMessage(context);

      if (!user) {
        this.logger.warn(`📨 [user.find.one] Usuario no encontrado: ${data.id}`);
        return { success: false, error: 'User not found' };
      }
      return { success: true, data: user };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  @MessagePattern('user.check')
  async checkUser(
    @Payload() data: { userId: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(
      `[user.check] Verificando: ${data.userId}`,
    );

    try {
      const user = await this.usersService.findOne(data.userId);
      this.acknowledgeMessage(context);

      if (!user) {
        return {
          success: false,
          exists: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        exists: user.status === 'ACTIVE',
        user,
      };
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, exists: false, error: message };
    }
  }

  @EventPattern('user.report.assigned')
  async handleReportAssigned(
    @Payload() data: { userId: string; reportId?: string },
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`[user.report.assigned] Usuario: ${data.userId}`);

    try {
      const user = await this.usersService.findOne(data.userId);
      this.acknowledgeMessage(context);
      if (user) {
        this.logger.log(`✅ [user.report.assigned] Reporte asignado a usuario ${data.userId}`);
      } else {
        this.logger.warn(`⚠️ [user.report.assigned] Usuario ${data.userId} no encontrado`);
      }
    } catch (error) {
      this.acknowledgeMessage(context);
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error: ${message}`);
    }
  }
}
