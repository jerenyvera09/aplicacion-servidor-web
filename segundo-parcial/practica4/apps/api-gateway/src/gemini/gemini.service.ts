import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  McpClientService,
  type McpToolResult,
} from '../mcp-client/mcp-client.service';

type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown> } }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

type GeminiContent = {
  role: 'user' | 'model' | 'function';
  parts: GeminiPart[];
};

type GeminiGenerateContentRequest = {
  systemInstruction?: { role: 'system'; parts: Array<{ text: string }> };
  contents: GeminiContent[];
  tools?: Array<{
    functionDeclarations: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{ content?: GeminiContent }>;
};

function toGeminiFunctionName(mcpToolName: string): string {
  // Gemini function names suelen requerir [a-zA-Z0-9_]. MCP usa nombres con '-'.
  const normalized = mcpToolName.replace(/[^a-zA-Z0-9_]/g, '_');
  return normalized.length > 0 ? normalized : 'tool';
}

function sanitizeSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;

  const stack: unknown[] = [clone];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;

    if ('additionalProperties' in current) {
      delete (current as Record<string, unknown>).additionalProperties;
    }

    const keysToVisit = ['definitions', 'properties', 'items', 'oneOf', 'anyOf', 'allOf'];
    for (const key of keysToVisit) {
      const value = (current as Record<string, unknown>)[key];
      if (!value) continue;

      if (Array.isArray(value)) {
        for (const entry of value) stack.push(entry);
      } else if (typeof value === 'object') {
        if (key === 'properties' || key === 'definitions') {
          for (const entry of Object.values(value as Record<string, unknown>)) {
            stack.push(entry);
          }
        } else {
          stack.push(value);
        }
      }
    }
  }

  return clone;
}

function toolResultToText(result: McpToolResult): string {
  const chunks = (result.content ?? []).map((c) => c.text).filter(Boolean);
  const text = chunks.join('\n');
  return text || '(sin contenido)';
}

type ToolCall = { name: string; args: Record<string, unknown> };

type GeminiSdkModel = {
  generateContent: (
    request: unknown,
  ) => Promise<{ response: GeminiGenerateContentResponse }>;
};

type GeminiSdkClient = {
  getGenerativeModel: (opts: { model: string }) => GeminiSdkModel;
};

function isFunctionCallPart(
  part: GeminiPart,
): part is { functionCall: { name: string; args?: Record<string, unknown> } } {
  return (
    typeof part === 'object' &&
    part !== null &&
    'functionCall' in part &&
    typeof (part as { functionCall?: { name?: unknown } }).functionCall
      ?.name === 'string'
  );
}

@Injectable()
export class GeminiService {
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly mcp: McpClientService,
  ) {
    this.model = this.config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash';
  }

  private getApiKey(): string {
    const key = this.config.get<string>('GEMINI_API_KEY');
    if (!key || !key.trim()) {
      throw new Error(
        'Falta configurar GEMINI_API_KEY (crear .env en apps/api-gateway).',
      );
    }
    return key.trim();
  }

  private async generateContent(
    body: GeminiGenerateContentRequest,
  ): Promise<GeminiGenerateContentResponse> {
    const apiKey = this.getApiKey();

    const GoogleGenerativeAIClient = GoogleGenerativeAI as unknown as new (
      key: string,
    ) => GeminiSdkClient;

    const genAI = new GoogleGenerativeAIClient(apiKey);
    const model = genAI.getGenerativeModel({ model: this.model });

    const result = await model.generateContent({
      systemInstruction: body.systemInstruction,
      contents: body.contents,
      tools: body.tools,
    });

    return result.response;
  }

  async chat(message: string): Promise<{
    text: string;
    toolCalls: ToolCall[];
  }> {
    const { tools } = await this.mcp.listTools();
    const nameMap = new Map<string, string>();

    const functionDeclarations = tools.map((t) => {
      const geminiName = toGeminiFunctionName(t.name);
      nameMap.set(geminiName, t.name);
      return {
        name: geminiName,
        description: t.description,
        parameters: sanitizeSchema(t.inputSchema),
      };
    });

    const systemInstruction = {
      role: 'system' as const,
      parts: [
        {
          text:
            'Eres un asistente. Tienes herramientas (MCP) para consultar/crear datos. ' +
            'Cuando una herramienta sea relevante, úsala. Devuelve la respuesta final en texto claro.',
        },
      ],
    };

    const contents: GeminiContent[] = [
      { role: 'user', parts: [{ text: message }] },
    ];

    const toolCalls: ToolCall[] = [];

    for (let step = 0; step < 8; step++) {
      const resp = await this.generateContent({
        systemInstruction,
        contents,
        tools: [{ functionDeclarations }],
      });

      const modelContent = resp.candidates?.[0]?.content;
      if (!modelContent || !Array.isArray(modelContent.parts)) {
        throw new Error('Gemini no devolvió contenido usable.');
      }

      const functionCallPart = modelContent.parts.find((p) =>
        isFunctionCallPart(p),
      );

      if (!functionCallPart) {
        const text = modelContent.parts
          .map((p) => ('text' in p ? p.text : ''))
          .filter(Boolean)
          .join('\n')
          .trim();

        return { text: text || 'No pude generar una respuesta.', toolCalls };
      }

      // Guardar la intención del modelo (functionCall) en la conversación
      contents.push({ role: 'model', parts: [functionCallPart] });

      const calledGeminiName = functionCallPart.functionCall.name;
      const mcpName = nameMap.get(calledGeminiName) ?? calledGeminiName;
      const args = functionCallPart.functionCall.args ?? {};

      const toolResult = await this.mcp.invokeTool(mcpName, args);
      toolCalls.push({ name: mcpName, args });

      const toolText = toolResultToText(toolResult);

      // Enviar respuesta de la tool a Gemini
      contents.push({
        role: 'function',
        parts: [
          {
            functionResponse: {
              name: calledGeminiName,
              response: {
                text: toolText,
                isError: Boolean(toolResult.isError),
              },
            },
          },
        ],
      });
    }

    return {
      text: 'No pude completar la solicitud (límite de iteraciones alcanzado).',
      toolCalls,
    };
  }
}
