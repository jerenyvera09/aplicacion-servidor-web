import { Controller, Get, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Escuchar evento de RabbitMQ
  @EventPattern('report_created')
  async handleReportCreated(@Payload() data: any) {
    await this.userService.handleReportCreated(data);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }
}
