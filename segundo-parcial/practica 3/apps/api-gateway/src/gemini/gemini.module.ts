import { Module } from '@nestjs/common';
import { McpClientModule } from '../mcp-client/mcp-client.module';
import { GeminiService } from './gemini.service';

@Module({
  imports: [McpClientModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
