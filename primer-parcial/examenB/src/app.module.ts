import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphqlModule } from './graphql/graphql.module';
import { VehiculoModule } from './vehiculo/vehiculo.module';
import { CoberturaModule } from './cobertura/cobertura.module';
import { ConductorModule } from './conductor/conductor.module';
import { CotizacionModule } from './cotizacion/cotizacion.module';
import { WebhookModule } from './webhook/webhook.module';
import { WsModule } from './ws/ws.module';

@Module({
  imports: [
    VehiculoModule,
    CoberturaModule,
    ConductorModule,
    CotizacionModule,
    WsModule,
    WebhookModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      playground: true,
      sortSchema: true,
    }),
    GraphqlModule,
  ],
})
export class AppModule {}
