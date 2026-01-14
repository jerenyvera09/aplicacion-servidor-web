import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { IdempotencyService } from '../common/idempotency.service';
import { WebhookEmitterService } from '../common/webhook-emitter.service';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  department?: string;
}

type ReportStatus = 'PENDING' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

interface Report {
  id: string;
  userId: string;
  assignedToId: string;
  title: string;
  description: string;
  findings?: string;
  priority: string;
  status: ReportStatus;
  createdAt: Date;
}

interface UserWithReports extends User {
  reports: Report[];
}

@Controller('users')
export class UsersController {
  private readonly logger = new Logger('UsersProxy');

  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('REPORTS_SERVICE') private readonly reportsClient: ClientProxy,
    private readonly idempotency: IdempotencyService,
    private readonly webhookEmitter: WebhookEmitterService,
  ) {}

  /**
   * GET /api/users - Listar todos los usuarios
   */
  @Get()
  async findAll(): Promise<ServiceResponse<User[]>> {
    this.logger.log('👥 GET /api/users → users-service [user.find.all]');
    
    try {
      const response = await firstValueFrom(
        this.usersClient.send<ServiceResponse<User[]>>('user.find.all', {}).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'users-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`👥 Respuesta: ${response.data?.length || 0} usuarios`);
      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/users/active - Listar usuarios activos
   */
  @Get('active')
  async findActive(): Promise<ServiceResponse<User[]>> {
    this.logger.log('👥 GET /api/users/active → users-service [user.find.active]');
    
    try {
      const response = await firstValueFrom(
        this.usersClient.send<ServiceResponse<User[]>>('user.find.active', {}).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'users-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`👥 Respuesta: ${response.data?.length || 0} usuarios activos`);
      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/users/:id - Obtener un usuario por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponse<User>> {
    this.logger.log(`👥 GET /api/users/${id} → users-service [user.find.one]`);
    
    try {
      const response = await firstValueFrom(
        this.usersClient.send<ServiceResponse<User>>('user.find.one', { id }).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'users-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(
          response.error || 'Usuario no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api/users - Crear un nuevo usuario
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<ServiceResponse<User>> {
    this.logger.log(`👥 POST /api/users → users-service [user.create]`);
    this.logger.log(`👥 Usuario: ${createUserDto.name}`);
    
    try {
      const idempotencyKey = this.idempotency.generateKey('user.create', createUserDto.email ?? createUserDto.name);
      const cached = this.idempotency.get(idempotencyKey) as ServiceResponse<User> | null;
      if (cached) {
        this.logger.warn('🔄 Respuesta idempotente (gateway)');
        return cached;
      }

      const response = await firstValueFrom(
        this.usersClient.send<ServiceResponse<User>>('user.create', createUserDto).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'users-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!response.success) {
        throw new HttpException(response.error || 'Error', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`👥 Usuario creado: ${response.data?.id}`);

      // NUEVO: Emitir evento a n8n (no bloquea la respuesta)
      if (response.data) {
        this.webhookEmitter
          .emit('usuario.creado', { user: response.data, request: createUserDto })
          .catch(() => undefined);
      }

      this.idempotency.store(idempotencyKey, response);
      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * GET /api/users/:id/reports - Obtener usuario con todos sus reportes
   */
  @Get(':id/reports')
  async getUserWithReports(@Param('id') id: string): Promise<ServiceResponse<UserWithReports>> {
    this.logger.log(`🔍 GET /api/users/${id}/reports → Combinando datos de ambos servicios`);
    
    try {
      // 1. Obtener el usuario
      this.logger.log(`📡 Consultando usuario: ${id}`);
      const userResponse = await firstValueFrom(
        this.usersClient.send<ServiceResponse<User>>('user.find.one', { id }).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'users-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!userResponse.success || !userResponse.data) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      // 2. Obtener todos los reportes
      this.logger.log(`📡 Consultando reportes`);
      const reportsResponse = await firstValueFrom(
        this.reportsClient.send<ServiceResponse<Report[]>>('report.find.all', {}).pipe(
          timeout(5000),
          catchError(() => {
            throw new HttpException(
              'reports-service no disponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      if (!reportsResponse.success) {
        throw new HttpException('Error al obtener reportes', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 3. Filtrar reportes por userId
      const userReports = (reportsResponse.data || []).filter(
        report => report.userId === id
      );

      // 4. Combinar datos
      const combinedData: UserWithReports = {
        ...userResponse.data,
        reports: userReports,
      };

      this.logger.log(`✅ Usuario encontrado con ${userReports.length} reportes`);
      
      return {
        success: true,
        data: combinedData,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Error interno';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}