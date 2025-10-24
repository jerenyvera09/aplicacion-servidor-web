import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { HttpModule } from '@nestjs/axios';
import { ReportesModule } from './reportes/reportes.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { ArchivosModule } from './archivos/archivos.module';
import { PuntuacionesModule } from './puntuaciones/puntuaciones.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { join } from 'path';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://localhost:3000/api/v1',
      timeout: 5000,
      maxRedirects: 5,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      introspection: true,
      sortSchema: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    ReportesModule,
    CatalogosModule,
    UsuariosModule,
    ComentariosModule,
    ArchivosModule,
    PuntuacionesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
