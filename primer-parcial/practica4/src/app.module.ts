import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasModule } from './categorias/categorias.module';
import { ReportesModule } from './reportes/reportes.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { AreasModule } from './areas/areas.module';
import { EstadosModule } from './estados/estados.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { ArchivosModule } from './archivos/archivos.module';
import { PuntuacionesModule } from './puntuaciones/puntuaciones.module';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'practica4.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    CategoriasModule,
    ReportesModule,
  ComentariosModule,
  AreasModule,
  EstadosModule,
  EtiquetasModule,
  ArchivosModule,
  PuntuacionesModule,
  RolesModule,
  UsuariosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
