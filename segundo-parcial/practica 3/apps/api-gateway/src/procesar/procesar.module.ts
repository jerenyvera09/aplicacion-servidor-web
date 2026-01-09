import { Module } from '@nestjs/common';
import { GeminiModule } from '../gemini/gemini.module';
import { AssistantController } from './procesar.controller';

@Module({
  imports: [GeminiModule],
  controllers: [AssistantController],
})
export class AssistantModule {}
