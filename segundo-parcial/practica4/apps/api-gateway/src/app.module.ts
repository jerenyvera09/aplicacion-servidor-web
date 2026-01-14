import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssistantModule } from './procesar/procesar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AssistantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
