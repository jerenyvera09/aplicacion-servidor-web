import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('api')
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  // Endpoint para crear un reporte (Redirige a MS-Reports)
  @Post('reports')
  async createReport(@Body() createReportDto: any) {
    // Usamos variables de entorno o defaults para Docker/Local
    const reportsHost = process.env.REPORTS_HOST || 'localhost';
    const reportsServiceUrl = `http://${reportsHost}:3001/reports`; 
    try {
      const response = await firstValueFrom(
        this.httpService.post(reportsServiceUrl, createReportDto)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Endpoint para ver usuarios (Redirige a MS-Users)
  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const usersHost = process.env.USERS_HOST || 'localhost';
    const usersServiceUrl = `http://${usersHost}:3002/users/${id}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(usersServiceUrl)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
