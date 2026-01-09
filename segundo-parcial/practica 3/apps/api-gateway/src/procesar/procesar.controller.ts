import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';

type ChatRequestBody = {
  message?: unknown;
};

@Controller('assistant')
export class AssistantController {
  constructor(private readonly gemini: GeminiService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestBody) {
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) {
      throw new BadRequestException('Body inválido: "message" es requerido.');
    }

    try {
      const result = await this.gemini.chat(message);
      return { response: result.text, toolCalls: result.toolCalls };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error interno';
      if (msg.includes('GEMINI_API_KEY')) {
        throw new BadRequestException(msg);
      }
      throw err;
    }
  }
}
