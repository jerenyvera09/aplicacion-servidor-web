import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UserSeedService implements OnModuleInit {
  private readonly logger = new Logger('UsersSeed');

  constructor(
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
  }

  async seedUsers() {
    const existingUsers = await this.usersService.findAll();

    if (existingUsers.length > 0) {
      this.logger.log('👥 Base de datos ya tiene usuarios, saltando seed');
      return;
    }

    this.logger.log('👥 Poblando base de datos con usuarios de ejemplo...');

    const usersToCreate = [
      {
        name: 'María González',
        email: 'maria.gonzalez@empresa.com',
        phone: '+593987654321',
        role: UserRole.ADMIN,
        department: 'Administración',
      },
      {
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@empresa.com',
        phone: '+593991234567',
        role: UserRole.ANALYST,
        department: 'TI',
      },
      {
        name: 'Ana López',
        email: 'ana.lopez@empresa.com',
        phone: '+593992345678',
        role: UserRole.ANALYST,
        department: 'Soporte Técnico',
      },
      {
        name: 'Jorge Silva',
        email: 'jorge.silva@empresa.com',
        phone: '+593993456789',
        role: UserRole.VIEWER,
        department: 'Operaciones',
      },
      {
        name: 'Laura Pérez',
        email: 'laura.perez@empresa.com',
        phone: '+593994567890',
        role: UserRole.VIEWER,
        department: 'Ventas',
      },
    ];

    for (const userData of usersToCreate) {
      try {
        const user = await this.usersService.create(userData);
        this.logger.log(
          `  ✅ Creado: ${user.name} - ${user.role} (${user.id})`
        );
      } catch (error) {
         const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `  ❌ Error creando ${userData.name}: ${message}`,
        );
      }
    }

    this.logger.log('👥 Seed de usuarios completado');
  }
}
